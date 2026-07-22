import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Technician } from '../types';
import { getPublicTechniciansLite, findNearbyTechnicians } from '../src/lib/api';
import { TechnicianCard, TechnicianCardSkeleton } from '../src/components/TechnicianCard';
import { reverseGeocode } from '../src/lib/location';

interface Section {
  id: string;
  title: string;
  technicians: Technician[];
  showSeeAll: boolean;
  isVisible: boolean;
}

const CarMechanicsNearMePage: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Location states
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string>('');
  const [detectedLat, setDetectedLat] = useState<number | null>(null);
  const [detectedLng, setDetectedLng] = useState<number | null>(null);
  const [county, setCountyState] = useState('');

  useEffect(() => {
    // Initial fetch of all technicians or trigger location request
    const fetchTechnicians = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              // Location access granted
              setLocationEnabled(true);
              try {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                setDetectedLat(lat);
                setDetectedLng(lng);
                
                // Get area name
                const areaName = await reverseGeocode(lat, lng);
                setDetectedLocation(areaName);
                
                // Fetch nearby technicians
                const nearbyData = await findNearbyTechnicians(lat, lng);
                setTechnicians(nearbyData);
              } catch (err) {
                console.error("Error fetching nearby technicians:", err);
                // Fallback to all technicians
                const data = await getPublicTechniciansLite();
                setTechnicians(data);
              } finally {
                setLoading(false);
              }
            },
            async (err) => {
              // Location access denied or error
              console.warn("Location access denied or failed:", err);
              setLocationEnabled(false);
              
              try {
                const data = await getPublicTechniciansLite();
                setTechnicians(data);
              } catch (fetchErr) {
                console.error("Error fetching all technicians:", fetchErr);
                setError("Failed to load technicians. Please try again later.");
              } finally {
                setLoading(false);
              }
            },
            { enableHighAccuracy: true, timeout: 10000 }
          );
        } else {
          // Geolocation not supported by browser
          const data = await getPublicTechniciansLite();
          setTechnicians(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Unexpected error during fetch:', err);
        setError("An unexpected error occurred.");
        setLoading(false);
      }
    };

    fetchTechnicians();
  }, []);

  // Filter for live technicians and ensure valid schema data
  const liveTechnicians = technicians.filter(t => t.status === 'live');

  // Build sections identical to HomePage.tsx
  const sections = useMemo<Section[]>(() => {
    // Near You - sorted by proximity (when location is available)
    let nearYouTechs: Technician[] = [];
    const hasLocation = (detectedLat && detectedLng) || (detectedLocation && county);
    
    if (hasLocation) {
      if (detectedLat && detectedLng) {
        // Use coordinates if available (already sorted by backend)
        nearYouTechs = liveTechnicians
          .filter(t => t.distance !== undefined)
          .slice(0, 8);
        
        // If no technicians with coordinates, fall back to county/area
        if (nearYouTechs.length === 0 && county) {
          const areaMatch = liveTechnicians.filter(t => 
            t.area?.toLowerCase() === detectedLocation.toLowerCase() ||
            t.area?.toLowerCase().includes(detectedLocation.toLowerCase())
          );
          
          if (areaMatch.length > 0) {
            nearYouTechs = areaMatch.slice(0, 8);
          } else {
            const countyMatch = liveTechnicians.filter(t => 
              t.county?.toLowerCase() === county.toLowerCase()
            );
            nearYouTechs = countyMatch.slice(0, 8);
          }
        }
      } else if (county) {
        // Use county/area as fallback
        const areaMatch = liveTechnicians.filter(t => 
          t.area?.toLowerCase() === detectedLocation.toLowerCase() ||
          t.area?.toLowerCase().includes(detectedLocation.toLowerCase())
        );
        
        if (areaMatch.length > 0) {
          nearYouTechs = areaMatch.slice(0, 8);
        } else {
          const countyMatch = liveTechnicians.filter(t => 
            t.county?.toLowerCase() === county.toLowerCase()
          );
          nearYouTechs = countyMatch.slice(0, 8);
        }
      }
    }

    // Top Rated - highest ratings with at least 1 review
    const topRatedTechs = [...liveTechnicians]
      .filter(t => (t.review_count || 0) >= 1)
      .sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0))
      .slice(0, 8);

    // New category-based sections
    const bodyExteriorTechs = liveTechnicians.filter(t =>
      t.technician_services?.some(s => s.category === 'body_exterior')
    ).slice(0, 8);

    const electricalsTechs = liveTechnicians.filter(t =>
      t.technician_services?.some(s => s.category === 'car_electricals_security')
    ).slice(0, 8);

    const mechanicalTechs = liveTechnicians.filter(t =>
      t.technician_services?.some(s => s.category === 'mechanical_repair')
    ).slice(0, 8);

    const interiorTechs = liveTechnicians.filter(t =>
      t.technician_services?.some(s => s.category === 'interior_detailing')
    ).slice(0, 8);

    const towingTechs = liveTechnicians.filter(t =>
      t.technician_services?.some(s => s.category === 'towing')
    ).slice(0, 8);

    // They Come To You - mobile technicians
    const mobileTechs = liveTechnicians
      .filter(t => t.mobile_service === 'yes' || t.mobile_service === 'both')
      .slice(0, 8);

    // New on Mekh - newly approved
    const newTechs = [...liveTechnicians]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);

    return [
      {
        id: 'near-you',
        title: 'Near You',
        technicians: nearYouTechs,
        showSeeAll: nearYouTechs.length >= 8,
        isVisible: Boolean(hasLocation && nearYouTechs.length > 0)
      },
      {
        id: 'top-rated',
        title: 'Top Rated',
        technicians: topRatedTechs,
        showSeeAll: topRatedTechs.length >= 8,
        isVisible: Boolean(topRatedTechs.length >= 1)
      },
      {
        id: 'body_exterior',
        title: 'Body & Exterior',
        technicians: bodyExteriorTechs,
        showSeeAll: bodyExteriorTechs.length >= 8,
        isVisible: Boolean(bodyExteriorTechs.length > 0)
      },
      {
        id: 'car_electricals_security',
        title: 'Car Electricals & Security',
        technicians: electricalsTechs,
        showSeeAll: electricalsTechs.length >= 8,
        isVisible: Boolean(electricalsTechs.length > 0)
      },
      {
        id: 'mechanical_repair',
        title: 'Mechanical & Repair',
        technicians: mechanicalTechs,
        showSeeAll: mechanicalTechs.length >= 8,
        isVisible: Boolean(mechanicalTechs.length > 0)
      },
      {
        id: 'interior_detailing',
        title: 'Interior & Detailing',
        technicians: interiorTechs,
        showSeeAll: interiorTechs.length >= 8,
        isVisible: Boolean(interiorTechs.length > 0)
      },
      {
        id: 'towing',
        title: 'Towing',
        technicians: towingTechs,
        showSeeAll: towingTechs.length >= 8,
        isVisible: Boolean(towingTechs.length > 0)
      },
      {
        id: 'mobile',
        title: 'They Come To You',
        technicians: mobileTechs,
        showSeeAll: mobileTechs.length >= 8,
        isVisible: Boolean(mobileTechs.length > 0)
      },
      {
        id: 'new',
        title: 'New on Mekh',
        technicians: newTechs,
        showSeeAll: newTechs.length >= 8,
        isVisible: Boolean(newTechs.length > 0)
      }
    ];
  }, [technicians, detectedLat, detectedLng, detectedLocation, county]);

  // Generate JSON-LD Schema for LocalBusiness/AutoRepair
  const schemaData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Car Mechanic near me | Mekh",
      "description": "car mechanics near me in nairobi. Find verified car mechanics near me within Nairobi in Mekh. Compare car mechanics near me prices, find cheap car mechanics near me, 24 hour car mechanics near me, and mobile car mechanics near me open now.",
      "keywords": "car mechanics near me, car mechanics near nairobi, car mechanics near me open now, car mechanics near me prices, cheap car mechanics near me, mobile car mechanics near me, 24 hour car mechanics near me, auto express near me, best car mechanics near me, Karen, Ngong-Road, Kilimani, Thika-Road, westlands, Nairobi, Mekh"
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": liveTechnicians.slice(0, 50).map((tech, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "AutoRepair",
          "name": tech.business_name,
          "image": tech.thumbnail_image || tech.cover_photo || "https://mekh.co.ke/assets/180.png",
          "telephone": tech.phone,
          "url": `https://mekh.co.ke/technician/${tech.slug}`,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": tech.area,
            "addressRegion": tech.county,
            "addressCountry": "KE"
          },
          "aggregateRating": tech.review_count > 0 ? {
            "@type": "AggregateRating",
            "ratingValue": tech.avg_rating || 5,
            "reviewCount": tech.review_count
          } : undefined
        }
      }))
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 pt-16 md:pt-20">
      <Helmet>
        <title>Car Mechanic near me | Mekh</title>
        <meta
          name="description"
          content={detectedLocation 
            ? `Find cheap, mobile, and 24 hour car mechanics near me open now around ${detectedLocation}. Book the best car mechanics near me on Mekh.`
            : "car mechanics near me in nairobi. Find verified car mechanics near me within Nairobi in Mekh. Book cheap, mobile, and 24 hour car mechanics near me open now."}
        />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <link rel="canonical" href="https://mekh.co.ke/car-mechanics-near-me" />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <div className="max-w-6xl mx-auto px-1 py-0 pb-10">
        {/* Header Section */}
        <div className="mb-4 px-3 md:px-3">
          <h1 className="text-2xl md:text-4xl font-black text-blue-500 mb-2">
            Car Mechanic Near Me
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
            <p className="text-slate-400">
              {liveTechnicians.length} {liveTechnicians.length === 1 ? 'technician' : 'technicians'} available 
              {detectedLocation ? ` around ${detectedLocation}` : ''}
            </p>
            
            {/* Location Prompt / Status */}
            {!locationEnabled && (
              <div className="bg-slate-900 border border-blue-600 px-4 py-3 rounded-lg flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-7 text-blue-600 shrink-0">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-slate-300 font-medium">
                  For Better Results Kindly Turn on Your Device's Location
                </p>
              </div>
            )}
          </div>
          


        </div>

        {/* Loading State */}
        {loading ? (
          <section className="pb-6">
            <div className="px-4 pb-3">
              <div className="h-5 bg-slate-800 rounded w-32 animate-pulse" />
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900" style={{ scrollBehavior: 'smooth', paddingBottom: '4px', touchAction: 'pan-x pan-y pinch-zoom' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="snap-start flex-shrink-0 w-[80vw] md:w-[44vw] lg:w-[30vw] max-w-[300px]">
                  <TechnicianCardSkeleton />
                </div>
              ))}
            </div>
          </section>
        ) : error ? (
          <div className="text-center py-16 bg-slate-900 rounded-xl border border-slate-800 mx-3">
            <p className="text-red-400 font-medium mb-2">Oops!</p>
            <p className="text-slate-400">{error}</p>
          </div>
        ) : liveTechnicians.length > 0 ? (
          /* Sections matching homepage */
          sections.filter(s => s.isVisible).map(section => (
            <section key={section.id} className="pb-6">
              {/* Section Header */}
              <div className="px-4 pb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold text-blue-500">{section.title}</h2>
              </div>
              
              {/* Horizontal Scrollable Cards */}
              <div 
                className="flex gap-3 overflow-x-auto px-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
                style={{ 
                  scrollBehavior: 'smooth',
                  paddingBottom: '4px',
                  touchAction: 'pan-x pan-y pinch-zoom'
                }}
              >
                {section.technicians.map((technician) => (
                  <div 
                    key={technician.id} 
                    className="snap-start flex-shrink-0 w-[80vw] md:w-[44vw] lg:w-[30vw] max-w-[300px]"
                  >
                    <TechnicianCard
                      technician={technician}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-16 bg-slate-900 rounded-xl border border-slate-800 mx-3">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">No mechanics found</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              We couldn't find any active technicians at the moment. Please try again later.
            </p>
          </div>
        )}

        {/* SEO Content Block */}
        <div className="px-4 mt-8 mb-2 text-xs text-slate-500 leading-relaxed text-justify">
          <p>
            <strong>Car mechanics near me in nairobi. Find verified Car mechanics near me within Nairobi in Mekh</strong>. 
            
            Whether you need <strong>Verified car mechanics near me</strong>, <strong>Best car mechanics near me</strong>, or <strong>24 hour car mechanics near me open now</strong>, We have the best alternatives to <strong>auto express near me</strong> in <strong>Karen</strong>, <strong>Ngong-Road</strong>, <strong>Kilimani</strong>, <strong>Thika-Road</strong>, and <strong>westlands</strong>. <strong>Book car mechanics near you in Mekh</strong> and easily compare <strong>Car mechanics near me prices</strong>.
          </p>
        </div>

        {/* Quick Links (Moved to bottom) */}
        <div className="grid grid-cols-2 gap-3 mt-8 px-3">
          <Link 
            to="/estimate" 
            className="bg-slate-900 border border-blue-500/30 hover:border-blue-600 transition-colors rounded-lg py-3 px-4 flex flex-col items-center justify-center text-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600 mb-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="text-sm font-semibold text-slate-400">Get Estimate</span>
          </Link>
          <Link 
            to="/roadside-emergency" 
            className="bg-slate-900 border border-red-500/30 hover:border-red-500 transition-colors rounded-lg py-3 px-4 flex flex-col items-center justify-center text-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500 mb-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-semibold text-slate-400">Emergency</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarMechanicsNearMePage;
