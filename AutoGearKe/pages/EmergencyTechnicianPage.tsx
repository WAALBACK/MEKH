import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getSession, getMyClientProfile } from '../src/lib/auth';
import { createEmergencyBooking, buildEmergencyWhatsAppMessage } from '../src/lib/api';
import { supabase } from '../src/lib/supabase';
import type { Technician } from '../types';

export default function EmergencyTechnicianPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get emergency data from location state
  const emergencyData = location.state as {
    situation: string;
    location: string;
    locationLat: number;
    locationLng: number;
    vehicleMake: string;
    transmission: string;
    fuelType: string;
    description: string;
    mobility: string;
    eta_minutes?: number;
  } | null;

  const [technician, setTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [error, setError] = useState('');
  const [bookingComplete, setBookingComplete] = useState(false);
  const [isTechnician, setIsTechnician] = useState(false);

  // Filter services based on emergency context
  const getRelevantServices = () => {
    if (!technician?.technician_services || !emergencyData) return [];

    const searchTerms = [
      emergencyData.situation.toLowerCase(),
      emergencyData.description.toLowerCase(),
      emergencyData.vehicleMake.toLowerCase(),
      emergencyData.mobility.toLowerCase()
    ].join(' ');

    // Helper function to check if text matches search terms
    const matchesSearch = (text: string): number => {
      if (!text) return 0;
      const lowerText = text.toLowerCase();
      let score = 0;

      // Split search terms into words
      const words = searchTerms.split(/\s+/).filter(w => w.length > 2);

      words.forEach(word => {
        if (lowerText.includes(word)) {
          score += 2; // Exact word match
        } else {
          // Check for partial character matches (at least 3 consecutive chars)
          for (let i = 0; i <= word.length - 3; i++) {
            const substring = word.substring(i, i + 3);
            if (lowerText.includes(substring)) {
              score += 0.5;
              break;
            }
          }
        }
      });

      return score;
    };

    // Score and filter services
    const scoredServices = technician.technician_services.map((service: any) => {
      let serviceScore = matchesSearch(service.service_name);

      // Score variants
      const relevantVariants = service.service_variants?.map((variant: any) => ({
        ...variant,
        score: matchesSearch(variant.variant_name)
      })).filter((v: any) => v.score > 0) || [];

      // Add variant scores to service score
      serviceScore += relevantVariants.reduce((sum: number, v: any) => sum + v.score, 0);

      return {
        ...service,
        score: serviceScore,
        relevantVariants
      };
    });

    // Filter services with score > 0 and sort by score
    const relevantServices = scoredServices
      .filter((s: any) => s.score > 0)
      .sort((a: any, b: any) => b.score - a.score);

    // If no matches found, return primary services or top 3 services
    if (relevantServices.length === 0) {
      const primaryServices = technician.technician_services.filter((s: any) => s.is_primary);
      if (primaryServices.length > 0) return primaryServices;
      return technician.technician_services.slice(0, 3);
    }

    return relevantServices;
  };

  useEffect(() => {
    if (!emergencyData) {
      navigate('/roadside-emergency');
      return;
    }

    const fetchTechnician = async () => {
      try {
        const { data, error } = await supabase
          .from('technicians')
          .select(`
            *,
            avg_rating,
            review_count,
            technician_services (
              id,
              service_name,
              is_primary,
              service_variants (
                id,
                variant_name,
                price,
                is_negotiable
              )
            )
          `)
          .eq('slug', slug)
          .eq('status', 'live')
          .single();

        if (error) throw error;
        setTechnician(data);
      } catch (err) {
        console.error('Error fetching technician:', err);
        setError('Failed to load technician details');
      } finally {
        setLoading(false);
      }
    };

    const checkIfTechnician = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: techProfile } = await supabase
            .from('technicians')
            .select('id')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          setIsTechnician(!!techProfile);
        }
      } catch (err) {
        console.error('Error checking technician status:', err);
      }
    };

    fetchTechnician();
    checkIfTechnician();
  }, [slug, emergencyData, navigate]);

  const handleBookNow = async () => {
    if (!technician || !emergencyData) return;

    // Check if user is authenticated
    const session = await getSession();
    if (!session) {
      navigate('/auth?redirect=' + encodeURIComponent(location.pathname));
      return;
    }

    setBookingInProgress(true);
    setError('');

    try {
      const client = await getMyClientProfile();
      if (!client) {
        setError('Unable to load your profile. Please try again.');
        setBookingInProgress(false);
        return;
      }

      // Create emergency booking
      await createEmergencyBooking({
        technicianId: technician.id,
        clientId: client.id,
        clientName: client.name,
        clientEmail: session.user.email || '',
        clientPhone: client.phone,
        situation: emergencyData.situation,
        location: emergencyData.location,
        lat: emergencyData.locationLat,
        lng: emergencyData.locationLng,
        vehicleMake: emergencyData.vehicleMake,
        transmission: emergencyData.transmission,
        fuelType: emergencyData.fuelType,
        description: emergencyData.description,
        mobilityStatus: emergencyData.mobility,
        etaMinutes: emergencyData.eta_minutes || 0,
        towTruckPlate: technician.tow_truck_number_plate || undefined
      });

      setBookingComplete(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setBookingInProgress(false);
    }
  };

  const handleCall = () => {
    if (technician) {
      window.location.href = `tel:${technician.phone}`;
    }
  };

  const handleWhatsApp = () => {
    if (!technician || !emergencyData) return;

    const message = buildEmergencyWhatsAppMessage({
      clientName: 'Emergency Client', // Will be replaced with actual name after booking
      situation: emergencyData.situation,
      location: emergencyData.location,
      vehicleMake: emergencyData.vehicleMake,
      transmission: emergencyData.transmission,
      fuelType: emergencyData.fuelType,
      description: emergencyData.description,
      mobilityStatus: emergencyData.mobility
    });

    const formatPhoneForWhatsApp = (phone: string) => {
      if (phone.startsWith('0')) return '254' + phone.slice(1);
      if (phone.startsWith('254')) return phone;
      return '254' + phone;
    };

    const whatsappPhone = formatPhoneForWhatsApp(technician.phone);
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${whatsappPhone}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!technician || !emergencyData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Technician not found</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Emergency Booking - {technician.business_name} | Mekh</title>
        <meta name="description" content={`Book emergency roadside assistance with ${technician.business_name}`} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-white pb-20">
        {/* Header */}
        <div className="bg-slate-900 py-4 px-4 border-b border-slate-800">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button
              onClick={() => navigate('/roadside-emergency')}
              className="text-slate-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-red-500">Emergency Booking</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Technician Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-6">
            {/* Cover Photo */}
            {technician.cover_photo && (
              <div className="h-48 overflow-hidden">
                <img
                  src={technician.cover_photo}
                  alt={technician.business_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                {technician.profile_image && (
                  <img
                    src={technician.profile_image}
                    alt={technician.business_name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-[#ffff]"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-xs font-bold text-blue-500 mb-1">{technician.business_name}</h2>
                  <p className="text-slate-300 text-sm mb-1">{technician.first_name} {technician.last_name}</p>
                  <p className="text-slate-400 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    {technician.area}
                  </p>
                  {emergencyData.eta_minutes && (
                    <p className="text-green-400 font-bold mt-2">
                      ETA: {emergencyData.eta_minutes} minutes
                    </p>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-500 text-xl">★</span>
                {technician.review_count && technician.review_count > 0 ? (
                  <>
                    <span className="text-white font-bold">{technician.avg_rating?.toFixed(1)}</span>
                    <span className="text-slate-400">({technician.review_count} {technician.review_count === 1 ? 'review' : 'reviews'})</span>
                  </>
                ) : (
                  <span className="text-slate-400">No reviews yet</span>
                )}
              </div>

              {/* Services & Pricing */}
              {(() => {
                const relevantServices = getRelevantServices();
                return relevantServices.length > 0 && (
                  <div className="border-t border-slate-800 pt-4">
                    <h3 className="text-lg font-bold text-blue-500 mb-2">Relevant Services & Pricing</h3>
                    <p className="text-xs text-slate-400 mb-3">Based on your emergency situation</p>
                    <div className="space-y-4">
                      {relevantServices.map((service: any) => (
                        <div key={service.id} className="space-y-2">
                          <h4 className="text-blue-500 font-semibold flex items-center gap-2">
                            {service.service_name}
                            {service.is_primary && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Primary</span>
                            )}
                          </h4>
                          {service.relevantVariants && service.relevantVariants.length > 0 ? (
                            <div className="pl-4 space-y-1">
                              {service.relevantVariants.map((variant: any) => (
                                <div key={variant.id} className="flex justify-between items-center text-sm">
                                  <span className="text-slate-300">{variant.variant_name}</span>
                                  <span className="text-green-400 font-semibold">
                                    KSh {variant.price?.toLocaleString()}
                                    {variant.is_negotiable && (
                                      <span className="text-xs text-slate-400 ml-1">(Negotiable)</span>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : service.service_variants && service.service_variants.length > 0 && (
                            <div className="pl-4 space-y-1">
                              {service.service_variants.map((variant: any) => (
                                <div key={variant.id} className="flex justify-between items-center text-sm">
                                  <span className="text-slate-300">{variant.variant_name}</span>
                                  <span className="text-green-400 font-semibold">
                                    KSh {variant.price?.toLocaleString()}
                                    {variant.is_negotiable && (
                                      <span className="text-xs text-slate-400 ml-1">(Negotiable)</span>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Emergency Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-blue-500 mb-4">Emergency Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-500">Situation</span>
                <span className="text-white font-bold">{emergencyData.situation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-500">Location</span>
                <span className="text-white font-bold">{emergencyData.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-500">Vehicle</span>
                <span className="text-white font-bold">{emergencyData.vehicleMake}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-500">Transmission</span>
                <span className="text-white font-bold">{emergencyData.transmission}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-500">Fuel Type</span>
                <span className="text-white font-bold">{emergencyData.fuelType}</span>
              </div>
              {emergencyData.description && (
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-blue-500 block mb-2">Description</span>
                  <p className="text-slate-300 text-sm leading-relaxed">{emergencyData.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 mb-6 text-red-500">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          {isTechnician ? (
            <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4 mb-4">
              <p className="text-yellow-500 font-bold mb-1">⚠️ Booking Not Available</p>
              <p className="text-slate-400 text-sm">Technicians cannot book other technicians. This feature is only available for clients.</p>
            </div>
          ) : !bookingComplete ? (
            <button
              onClick={handleBookNow}
              disabled={bookingInProgress}
              className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-lg rounded-lg transition-colors disabled:opacity-50 mb-4"
            >
              {bookingInProgress ? 'Booking...' : 'Book Now'}
            </button>
          ) : (
            <>
              <div className="bg-green-900/20 border border-green-600 rounded-lg p-4 mb-6">
                <p className="text-green-500 font-bold mb-1">✓ Booking Confirmed!</p>
                <p className="text-slate-400 text-sm">The technician has been notified. Contact them now:</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleCall}
                  className="py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Now
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
