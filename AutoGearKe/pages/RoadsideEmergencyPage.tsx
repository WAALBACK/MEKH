import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { TechnicianCard } from '../src/components/TechnicianCard';
import { getSession, getMyClientProfile } from '../src/lib/auth';
import { findNearbyEmergencyTechnicians, createEmergencyBooking, buildEmergencyWhatsAppMessage } from '../src/lib/api';
import type { Technician } from '../types';

const SITUATIONS = [
  "Won't start",
  "Tyre puncture",
  "Overheating",
  "Strange Noise or Smoke",
  "Accident",
  "Battery issue",
  "Fuel",
  "Locked out",
  "Stuck",
  "❓ Other Problem"
];

const TRANSMISSION_OPTIONS = ['Automatic', 'Manual'];
const FUEL_OPTIONS = ['Petrol', 'Diesel', 'Hybrid'];
const MOBILITY_OPTIONS = [
  { value: 'yes', label: '✅ Yes, it can move' },
  { value: 'barely', label: '⚠️ Barely / risky to drive' },
  { value: 'no', label: '❌ No, completely stuck' }
];

export default function RoadsideEmergencyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'results' | 'confirmation'>('form');
  
  // Form state
  const [situation, setSituation] = useState('');
  const [location, setLocation] = useState('');
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [vehicleMake, setVehicleMake] = useState('');
  const [transmission, setTransmission] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [description, setDescription] = useState('');
  const [mobility, setMobility] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [isHighway, setIsHighway] = useState(false);
  
  // Results state
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Confirmation state
  const [confirmation, setConfirmation] = useState<any>(null);

  // Auto-detect location on mount
  useEffect(() => {
    handleDetectLocation();
  }, []);

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      setLocationLat(latitude);
      setLocationLng(longitude);

      // Reverse geocode to get location name
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        const locationName = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setLocation(locationName);
        
        // Check if on highway
        const road = data.address?.road || '';
        if (road.toLowerCase().includes('highway') || road.toLowerCase().includes('thika')) {
          setIsHighway(true);
        }
      } catch {
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (err) {
      console.error('Location detection failed:', err);
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!situation || !location || !vehicleMake || !transmission || !fuelType || !mobility) {
      setError('Please fill in all required fields');
      return;
    }

    if (!locationLat || !locationLng) {
      setError('Unable to determine your location. Please enable location services or enter manually.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call API to get nearby technicians
      const data = await findNearbyEmergencyTechnicians({
        lat: locationLat,
        lng: locationLng,
        mobilityStatus: mobility as 'yes' | 'barely' | 'no'
      });

      setTechnicians(data || []);
      setStep('results');
    } catch (err: any) {
      setError(err.message || 'Failed to find technicians. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (technician: Technician) => {
    // Navigate to dedicated emergency technician page with emergency data
    navigate(`/roadside-emergency/technician/${technician.slug}`, {
      state: {
        situation,
        location,
        locationLat,
        locationLng,
        vehicleMake,
        transmission,
        fuelType,
        description,
        mobility,
        eta_minutes: technician.eta_minutes
      }
    });
  };

  const handleBookTechnician = async (technician: Technician) => {
    // Check if user is authenticated
    const session = await getSession();
    if (!session) {
      // Redirect to auth page
      navigate('/auth?redirect=/roadside-emergency');
      return;
    }

    try {
      // Get client profile
      const client = await getMyClientProfile();
      if (!client) {
        setError('Unable to load your profile. Please try again.');
        return;
      }

      // Create emergency booking
      const booking = await createEmergencyBooking({
        technicianId: technician.id,
        clientId: client.id,
        clientName: client.name,
        clientEmail: session.user.email || '',
        clientPhone: client.phone,
        situation,
        location,
        lat: locationLat,
        lng: locationLng,
        vehicleMake,
        transmission,
        fuelType,
        description,
        mobilityStatus: mobility,
        etaMinutes: technician.eta_minutes || 0,
        towTruckPlate: technician.tow_truck_number_plate || undefined
      });

      // Build WhatsApp message
      const message = buildEmergencyWhatsAppMessage({
        clientName: client.name,
        situation,
        location,
        vehicleMake,
        transmission,
        fuelType,
        description,
        mobilityStatus: mobility
      });

      // Format phone for WhatsApp
      const formatPhoneForWhatsApp = (phone: string) => {
        if (phone.startsWith('0')) return '254' + phone.slice(1);
        if (phone.startsWith('254')) return phone;
        return '254' + phone;
      };

      const whatsappPhone = formatPhoneForWhatsApp(technician.phone);
      const whatsappUrl = `https://api.whatsapp.com/send/?phone=${whatsappPhone}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;

      // Set confirmation data
      setConfirmation({
        technicianName: `${technician.first_name} ${technician.last_name}`,
        businessName: technician.business_name,
        phone: technician.phone,
        situation,
        eta: technician.eta_minutes || 'Calculating...',
        towTruckPlate: technician.tow_truck_number_plate,
        whatsappUrl,
        callUrl: `tel:${technician.phone}`
      });

      setStep('confirmation');
    } catch (err: any) {
      setError(err.message || 'Failed to create booking. Please try again.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Roadside Emergency - Get Help Fast | Mekh</title>
        <meta name="description" content="Car stuck? Get verified roadside help fast. Connect with nearby mechanics and towing services in Kenya." />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />

        {/* Structured Data: Service */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: 'Roadside Emergency Assistance',
            description: 'Get verified roadside help fast. Connect with nearby mechanics and towing services in Kenya through Mekh.',
            provider: {
              '@type': 'Organization',
              name: 'Mekh',
              url: 'https://mekh.app'
            },
            areaServed: {
              '@type': 'Country',
              name: 'Kenya'
            },
            serviceType: 'Roadside Assistance',
            category: 'Emergency Automotive Service',
            offers: {
              '@type': 'Service',
              availability: 'https://schema.org/InStock',
              description: 'Emergency roadside assistance available 24/7'
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-white">
        {/* Hero Section */}
        <div className="bg-slate-900 py-4 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-black text-red-500 mb-1">
              Car Stuck? Get Help Fast.
            </h1>
            <p className="text-slate-400 text-lg mb-1">
              Connect with nearby verified technicians in minutes
            </p>
          </div>
        </div>

        {/* Highway Alert */}
        {isHighway && (
          <div className="max-w-4xl mx-auto px-4 mb-2">
            <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-yellow-500 font-bold">Highway Safety Alert</p>
                <p className="text-slate-300 text-sm">
                  Stay visible and avoid standing near moving traffic.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Section */}
        {step === 'form' && (
          <div className="max-w-4xl mx-auto px-4 pb-12">
            <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              {/* Situation Selector */}
              <div>
                <label className="block text-blue-500 font-bold mb-2">
                  1. What's Happening? *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SITUATIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSituation(s)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        situation === s
                          ? 'border-blue-500 bg-blue-500/20 text-blue-500'
                          : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-blue-500 font-bold mb-3">
                  2. Your Location *
                </label>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detectingLocation}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {detectingLocation ? 'Detecting...' : 'Detect My Location'}
                  </button>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Or type your location manually"
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Vehicle Details */}
              <div>
                <label className="block text-blue-500 font-bold mb-3">
                  3. Tell Us About the Car
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={vehicleMake}
                    onChange={(e) => setVehicleMake(e.target.value)}
                    placeholder="Vehicle Make/Model (e.g., Toyota Noah, BMW X5)"
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-1">
                    <select
                      value={transmission}
                      onChange={(e) => setTransmission(e.target.value)}
                      required
                      className="px-1 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Transmission</option>
                      {TRANSMISSION_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                      required
                      className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Fuel Type</option>
                      {FUEL_OPTIONS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What happened? Describe the situation..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* Mobility Status */}
              <div>
                <label className="block text-blue-500 font-bold mb-3">
                  4. Can the car still drive safely? *
                </label>
                <div className="space-y-2">
                  {MOBILITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMobility(option.value)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        mobility === option.value
                          ? 'border-blue-500 bg-blue-500/20 text-blue-500'
                          : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 text-red-500">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-lg rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Finding Help...' : 'Get Help Now'}
              </button>
            </form>
          </div>
        )}

        {/* Results Section */}
        {step === 'results' && (
          <div className="max-w-4xl mx-auto px-4 pb-6">
            <div className="mb-4">
              <h2 className="text-3xl font-black text-blue-500 mb-2">Nearby Help</h2>
              <p className="text-slate-400">Help is already being arranged.</p>
            </div>

            {technicians.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
                <p className="text-slate-400 mb-4">No technicians found nearby. Try expanding your search area.</p>
                <button
                  onClick={() => setStep('form')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                >
                  Back to Form
                </button>
              </div>
            ) : (
              <>
                {/* Mobile: Horizontal scroll */}
                <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
                  <div className="flex gap-4 pb-4" style={{ scrollSnapType: 'x mandatory' }}>
                    {technicians.map((tech) => (
                      <div 
                        key={tech.id} 
                        className="relative cursor-pointer shrink-0 w-[280px]"
                        style={{ scrollSnapAlign: 'start' }}
                        onClick={() => handleCardClick(tech)}
                      >
                        <TechnicianCard technician={tech} />
                        {tech.eta_minutes && (
                          <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold pointer-events-none">
                            ETA: {tech.eta_minutes} min
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tablet & Desktop: Grid */}
                <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {technicians.map((tech) => (
                    <div 
                      key={tech.id} 
                      className="relative cursor-pointer"
                      onClick={() => handleCardClick(tech)}
                    >
                      <TechnicianCard technician={tech} />
                      {tech.eta_minutes && (
                        <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold pointer-events-none">
                          ETA: {tech.eta_minutes} min
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Confirmation Section */}
        {step === 'confirmation' && confirmation && (
          <div className="max-w-4xl mx-auto px-4 pb-12">
            <div className="bg-slate-900 border border-green-600 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-black text-green-500 mb-2">Help is on the Way!</h2>
                <p className="text-slate-400">Your emergency booking has been confirmed</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-slate-800">
                  <span className="text-slate-400">Technician</span>
                  <span className="text-white font-bold">{confirmation.technicianName}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-800">
                  <span className="text-slate-400">Business</span>
                  <span className="text-white font-bold">{confirmation.businessName}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-800">
                  <span className="text-slate-400">Phone</span>
                  <a href={confirmation.callUrl} className="text-blue-500 font-bold hover:underline">{confirmation.phone}</a>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-800">
                  <span className="text-slate-400">Situation</span>
                  <span className="text-white font-bold">{confirmation.situation}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-800">
                  <span className="text-slate-400">Estimated Arrival</span>
                  <span className="text-green-400 font-bold">{confirmation.eta} minutes</span>
                </div>
                {confirmation.towTruckPlate && (
                  <div className="flex justify-between items-center py-3 border-b border-slate-800">
                    <span className="text-slate-400">Tow Truck Plate</span>
                    <span className="text-white font-bold">{confirmation.towTruckPlate}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
                  <p className="text-blue-500 font-bold mb-1">Status: Request Received</p>
                  <p className="text-slate-400 text-sm">The technician has been notified of your emergency</p>
                </div>
                <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
                  <p className="text-green-500 font-bold mb-1">Next: Arriving Soon</p>
                  <p className="text-slate-400 text-sm">The technician will contact you shortly</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <a
                  href={confirmation.callUrl}
                  className="py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Now
                </a>
                <a
                  href={confirmation.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>

              <button
                onClick={() => navigate('/bookings')}
                className="w-full mt-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors"
              >
                View My Bookings
              </button>
            </div>
          </div>
        )}

        {/* Information Sections */}
        <div className="max-w-4xl mx-auto px-4 pb-12 space-y-12">
          {/* Pricing */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-2xl font-black text-blue-500 mb-4">Emergency Service Pricing</h3>
            <div className="space-y-3">
              {[
                { service: 'Jumpstart', range: 'KSh 1,500 – 3,000' },
                { service: 'Tyre Repair', range: 'KSh 1,000 – 2,500' },
                { service: 'Fuel Delivery', range: 'KSh 1,500 + fuel' },
                { service: 'Diagnosis', range: 'KSh 2,000 – 5,000' },
                { service: 'Towing', range: 'KSh 3,000 – 15,000' }
              ].map((item) => (
                <div key={item.service} className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-slate-300">{item.service}</span>
                  <span className="text-green-400 font-bold">{item.range}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-4">
              <strong>Disclaimer:</strong> Final pricing depends on: location, vehicle type, time of day, and issue severity.
            </p>
          </div>

          {/* Safety Tips */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-2xl font-black text-blue-500 mb-4">Stay Safe</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Turn on hazard lights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Move off the road if safe</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Place warning triangle behind the vehicle</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Stay inside the car at night or in unsafe areas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Avoid accepting random roadside towing offers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Share your location with someone you trust</span>
              </li>
            </ul>
          </div>

          {/* Why Mekh */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-2xl font-black text-blue-500 mb-4">Why Drivers Use Mekh?</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Verified technicians only</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>No random roadside referrals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Support via phone and WhatsApp</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Upfront pricing guidance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">•</span>
                <span>Towing and mobile mechanic support</span>
              </li>
            </ul>
          </div>

          {/* Emergency Contacts */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-2xl font-black text-red-500 mb-4">Emergency Contacts</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Police</span>
                <a href="tel:999" className="text-blue-500 font-bold hover:underline">999 / 112</a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Kenya Red Cross</span>
                <a href="tel:1199" className="text-blue-500 font-bold hover:underline">1199</a>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">AA Kenya</span>
                <span className="text-slate-400">Contact via website</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Mekh Support Line</span>
                <a href="tel:0112493733" className="text-blue-500 font-bold hover:underline">0112493733</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
