import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../src/lib/supabase';
import { Technician } from '../types';
import { TechnicianCard } from '../src/components/TechnicianCard';

const POPULAR_SERVICES = [
  'Window Tinting', 
  'AC Refilling', 
  'Car Audio Installation', 
  'Ceramic Coating', 
  'Car Security', 
  'Key Programming'
];

const STATIC_POPULAR_SERVICES = [
  { name: 'Window Tinting', price: 'KSh 2,000 – KSh 35,000', url: '/services/window-tinting/nairobi' },
  { name: 'Car Wrapping', price: 'KSh 80,000 – KSh 200,000' },
  { name: 'Car Audio Installation', price: 'KSh 3,000 – KSh 40,000' },
  { name: 'ECU Programming', price: 'KSh 5,000 – KSh 25,000' },
  { name: 'Ceramic Coating', price: 'KSh 3,500 – KSh 25,000', url: '/services/ceramic-coating/nairobi' },
  { name: 'PPF Installation', price: 'KSh 75,000 – KSh 300,000', url: '/services/ppf/nairobi' },
  { name: 'Car Security (Trackers/Alarms)', price: 'KSh 5,000 – KSh 20,000' },
  { name: 'AC Refilling', price: 'KSh 2,500 – KSh 5,000' },
  { name: 'Headlight Restoration', price: 'KSh 1,500 – KSh 5,000', url: '/services/headlight-restoration/nairobi' },
  { name: 'Car Detailing', price: 'KSh 3,000 – KSh 15,000', url: '/services/car-detailing/nairobi' },
];

// ----------------------------------------------------------------------
// Types & Interfaces
// ----------------------------------------------------------------------

interface TechnicianService {
  id: string;
  technician_id: string;
  service_name: string;
  price: number | null;
  negotiable: boolean | null;
  notes: string | null;
}

interface ServiceVariant {
  service_id: string;
  variant_name: string;
  price: number;
  is_negotiable: boolean;
}

interface ProcessedVariant {
  variant_name: string;
  price: number;
  is_negotiable: boolean;
}

interface AggregatedService {
  service_name: string;
  slug: string;
  minPrice: number;
  maxPrice: number;
  technicianCount: number;
  hasVariants: boolean;
  variants: ProcessedVariant[];
  negotiableTypes: Set<boolean>;
  notes: string[];
  technicianIds: Set<string>;
}

// ----------------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------------

const createSlug = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('KES', 'KSh');
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export default function EstimatePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [servicesData, setServicesData] = useState<TechnicianService[]>([]);
  const [variantsData, setVariantsData] = useState<ServiceVariant[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<AggregatedService | null>(null);

  const [relatedTechnicians, setRelatedTechnicians] = useState<Technician[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);

  // ----------------------------------------------------------------------
  // Data Fetching
  // ----------------------------------------------------------------------
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [servicesResponse, variantsResponse] = await Promise.all([
          supabase.from('technician_services').select('*'),
          supabase.from('service_variants').select('*'),
        ]);

        if (servicesResponse.error) throw servicesResponse.error;
        if (variantsResponse.error) throw variantsResponse.error;

        setServicesData(servicesResponse.data || []);
        setVariantsData(variantsResponse.data || []);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError("Couldn't load pricing right now, try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ----------------------------------------------------------------------
  // Data Processing
  // ----------------------------------------------------------------------

  const aggregatedServices = useMemo(() => {
    const map = new Map<string, AggregatedService>();

    servicesData.forEach((serviceRow) => {
      if (!serviceRow.service_name) return;
      // Split comma-separated service names
      const individualServices = serviceRow.service_name
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      individualServices.forEach((serviceName) => {
        const key = serviceName.toLowerCase();
        
        if (!map.has(key)) {
          map.set(key, {
            service_name: serviceName,
            slug: createSlug(serviceName),
            minPrice: Infinity,
            maxPrice: -Infinity,
            technicianCount: 0,
            hasVariants: false,
            variants: [],
            negotiableTypes: new Set(),
            notes: [],
            technicianIds: new Set<string>(),
          });
        }

        const agg = map.get(key)!;
        if (serviceRow.technician_id) agg.technicianIds.add(serviceRow.technician_id);

        if (serviceRow.notes && !agg.notes.includes(serviceRow.notes)) {
          agg.notes.push(serviceRow.notes);
        }

        if (serviceRow.price !== null) {
          // Flat rate
          if (serviceRow.price < agg.minPrice) agg.minPrice = serviceRow.price;
          if (serviceRow.price > agg.maxPrice) agg.maxPrice = serviceRow.price;
          if (serviceRow.negotiable !== null) agg.negotiableTypes.add(serviceRow.negotiable);
        } else {
          // Look for variants
          const relatedVariants = variantsData.filter(v => v.service_id === serviceRow.id);
          if (relatedVariants.length > 0) {
            agg.hasVariants = true;
            relatedVariants.forEach(variant => {
              if (variant.price < agg.minPrice) agg.minPrice = Number(variant.price);
              if (variant.price > agg.maxPrice) agg.maxPrice = Number(variant.price);
              agg.negotiableTypes.add(variant.is_negotiable);
              
              // Only add unique variants for display
              if (!agg.variants.some(v => v.variant_name === variant.variant_name)) {
                agg.variants.push({
                  variant_name: variant.variant_name,
                  price: Number(variant.price),
                  is_negotiable: variant.is_negotiable
                });
              }
            });
          }
        }
      });
    });

    // Clean up Infinity values for items with no valid price data
    const results = Array.from(map.values()).map(agg => {
      if (agg.minPrice === Infinity) agg.minPrice = 0;
      if (agg.maxPrice === -Infinity) agg.maxPrice = 0;
      // Sort variants by price
      agg.variants.sort((a, b) => a.price - b.price);
      agg.technicianCount = agg.technicianIds.size;
      return agg;
    });

    return results;
  }, [servicesData, variantsData]);

  // ----------------------------------------------------------------------
  // Routing & Selection
  // ----------------------------------------------------------------------

  useEffect(() => {
    if (!loading && slug && aggregatedServices.length > 0) {
      const match = aggregatedServices.find(s => s.slug === slug);
      if (match) {
        setSelectedService(match);
        setSearchQuery(match.service_name);
      } else {
        setSelectedService(null);
      }
    }
  }, [loading, slug, aggregatedServices]);

  useEffect(() => {
    const fetchRelatedTechnicians = async () => {
      if (!selectedService || selectedService.technicianIds.size === 0) {
        setRelatedTechnicians([]);
        return;
      }
      
      setLoadingTechnicians(true);
      try {
        const { data, error } = await supabase
          .from('technicians')
          .select(`
            *,
            technician_services(
              id, technician_id, service_name, category, price, negotiable, notes,
              service_variants(id, service_id, variant_name, price, is_negotiable)
            ),
            technician_photos(id, technician_id, photo_url, service, caption, alt_text, sort_order),
            technician_videos(id, technician_id, platform, video_url, video_id, service, alt_text, sort_order, created_at, thumbnail_url),
            technician_payments(id, method),
            reviews(id, technician_id, lead_id, client_id, client_name, rating, comment, would_rebook, is_visible, status, admin_notes, approved_by, updated_at, created_at)
          `)
          .in('id', Array.from(selectedService.technicianIds))
          .eq('status', 'live');
          
        if (error) throw error;
        setRelatedTechnicians(data || []);
      } catch (err) {
        console.error('Error fetching technicians:', err);
      } finally {
        setLoadingTechnicians(false);
      }
    };
    
    fetchRelatedTechnicians();
  }, [selectedService]);

  const filteredServices = useMemo(() => {
    if (!searchQuery) return [];
    return aggregatedServices.filter(s => 
      s.service_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, aggregatedServices]);

  const handleSelectService = (service: AggregatedService) => {
    setSelectedService(service);
    setSearchQuery(service.service_name);
    setIsDropdownOpen(false);
    navigate(`/estimate/${service.slug}`, { replace: true });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
    if (e.target.value === '') {
      setSelectedService(null);
      navigate('/estimate', { replace: true });
    }
  };

  // ----------------------------------------------------------------------
  // Render Helpers
  // ----------------------------------------------------------------------

  const getNegotiableText = (types: Set<boolean>) => {
    if (types.size === 0) return "Not specified";
    if (types.has(true) && types.has(false)) return "Varies";
    if (types.has(true)) return "Yes";
    return "No";
  };

  // ----------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------

  return (
    <div className="min-h-screen text-slate-600 p-4 md:p-8 font-sans">
      <Helmet>
        <title>Car Services Price Estimator – Real Mechanic Prices in Nairobi | Mekh</title>
        <meta name="description" content="Check real prices for car repairs and services in Nairobi — window tinting, brake pads, AC refilling, and more. Free tool based on actual technician pricing on Mekh." />
        <link rel="canonical" href="https://mekh.app/estimate" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Popular Car Services & Estimated Prices in Nairobi",
            "description": "A list of popular car services and their estimated price ranges in Nairobi, Kenya.",
            "itemListElement": STATIC_POPULAR_SERVICES.map((s, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "Service",
                "name": s.name,
                "offers": {
                  "@type": "AggregateOffer",
                  "priceCurrency": "KES",
                  "description": s.price
                }
              }
            }))
          })}
        </script>
      </Helmet>
      
      <div className="max-w-2xl mx-auto mt-12">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl text-blue-600 font-bold mb-4"> Car Services Price Estimator</h1>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-2xl mx-auto text-center">
          Wondering how much a car service should cost in Nairobi? This free tool shows real prices from verified technicians on Mekh — no guesswork, no inflated quotes. Search any service below...
          </p>
        </div>
      </div>

        {/* Search Input */}
        <div className="relative mb-6 z-50">
          <div className="relative">
            <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Search for a service (e.g. Window Tinting)"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsDropdownOpen(true)}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
            />
          </div>

          {/* Dropdown Suggestions */}
          {isDropdownOpen && searchQuery && (
            <div className="absolute bg-blue-100 w-full mt-2 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
              {filteredServices.length > 0 ? (
                filteredServices.map(service => (
                  <button
                    key={service.slug}
                    className="w-full text-left px-4 py-3 hover:bg-slate-100 transition-colors border-b border-slate-100 last:border-0"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectService(service);
                    }}
                  >
                    <div className="font-medium">{service.service_name}</div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-slate-500">
                  No matching service found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {POPULAR_SERVICES.map(service => (
            <button 
              key={service}
              onClick={() => {
                setSearchQuery(service);
                const match = aggregatedServices.find(s => s.service_name.toLowerCase() === service.toLowerCase());
                if (match) handleSelectService(match);
              }}
              className="text-xs font-medium bg-blue-50 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors border border-blue-100"
            >
              {service}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl p-4 text-center">
            {error}
          </div>
        ) : selectedService ? (
          <>
            <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-2xl text-gray-900 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 md:p-8">
              <h2 className="text-xl : md: text-2xl font-bold text-gray-900 mb-2">
                {selectedService.service_name}
              </h2>
              
              <div className="mb-6">
                <div className="text-xl : md: text-3xl font-extrabold text-blue-600 mb-1">
                  {selectedService.minPrice === selectedService.maxPrice
                    ? formatCurrency(selectedService.minPrice)
                    : `${formatCurrency(selectedService.minPrice)} – ${formatCurrency(selectedService.maxPrice)}`
                  }
                </div>
                <div className="text-sm text-slate-300 font-medium">
                  (based on {selectedService.technicianCount} technician{selectedService.technicianCount !== 1 && 's'} on Mekh)
                </div>
              </div>

              {/* Variants List */}
              {selectedService.hasVariants && selectedService.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">Options</h3>
                  <div className="space-y-3">
                    {selectedService.variants.map((variant, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="font-medium text-gray-800">{variant.variant_name}</span>
                        <div className="text-right">
                          <div className="font-bold text-blue-500">{formatCurrency(variant.price)}</div>
                          <div className="text-xs text-gray-500">
                            {variant.is_negotiable ? 'Negotiable' : 'Fixed price'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Flat Rate Meta (if no variants) */}
              {!selectedService.hasVariants && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100 w-fit">
                  <span className="font-medium">Negotiable:</span>
                  <span>{getNegotiableText(selectedService.negotiableTypes)}</span>
                </div>
              )}

              {/* Notes */}
              {selectedService.notes.length > 0 && (
                <div className="mb-6 text-sm italic text-gray-600 border-l-2 border-blue-500 pl-3">
                  Note: {selectedService.notes.join('; ')}
                </div>
              )}

              {/* Disclaimer */}
              <div className="flex items-start space-x-3 bg-orange-50 text-orange-800 p-4 rounded-xl text-sm mb-8">
                <span className="text-orange-500 shrink-0">⚠️</span>
                <p>Price varies depending on your vehicle's make, model, and size.</p>
              </div>

              </div>
            </div>

            {/* Technicians List */}
            <div className="mt-8 mb-12">
              <h3 className="text-lg font-bold text-blue-500 mb-4">
                Technicians offering {selectedService.service_name}
              </h3>
              {loadingTechnicians ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : relatedTechnicians.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedTechnicians.map(tech => (
                    <TechnicianCard key={tech.id} technician={tech} />
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-6 bg-gray-50 rounded-xl">
                  No verified technicians found for this service.
                </div>
              )}
            </div>
          </>
        ) : searchQuery && !isDropdownOpen ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-gray-300">
            <div className="mb-4 text-4xl">🔍</div>
            <p className="mb-4 text-slate-500">No matching service found. Try a different search term, or get a custom quote.</p>
            <button 
              onClick={() => window.location.href = `/menu`}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-xl transition-colors"
            >
              Book a technician
            </button>
          </div>
        ) : null}

        {/* Trust Line */}
        {!selectedService && (
          <p className="text-center text-xs md:text-sm text-slate-500 mt-8 mb-16">
            Prices shown are based on real listings from technicians verified on Mekh. We don't set these prices — technicians do, based on the work involved.
          </p>
        )}

        {/* SEO Sections */}
        <div className="mt-16 space-y-12 border-t border-slate-200 pt-12">
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-blue-500 mb-4">How It Works</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <div className="text-blue-500 font-bold text-lg mb-2">1. Search a Service</div>
                <p className="text-sm text-slate-500">Type what you need, like "Window Tinting" or "Brake Pads".</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <div className="text-blue-500 font-bold text-lg mb-2">2. Get Real Prices</div>
                <p className="text-sm text-slate-500">See the exact price ranges that verified Nairobi technicians charge.</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                <div className="text-blue-500 font-bold text-lg mb-2">3. Book a Tech</div>
                <p className="text-sm text-slate-500">Choose a professional that fits your budget and location.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl md:text-2xl font-bold text-blue-500 mb-4">Why Prices Vary</h2>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              Car servicing in Kenya isn't a one-size-fits-all market. The cost of a service depends heavily on your vehicle's make, model, and size. For example, installing parts on a luxury European SUV requires different expertise and materials than a standard Japanese sedan. The prices you see here are accurate ranges from real workshops and mobile mechanics on Mekh, but you'll get the most accurate quote by discussing your specific car with a technician.
            </p>
          </section>

          <section className="pb-16">
            <h2 className="text-xl md:text-2xl font-bold text-blue-500 mb-6">Popular Car Services & Estimated Prices in Nairobi</h2>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-sm text-slate-500 uppercase tracking-wider">
                    <th className="p-4 font-semibold">Service</th>
                    <th className="p-4 font-semibold text-right">Estimated Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm md:text-base text-slate-700">
                  {STATIC_POPULAR_SERVICES.map((s, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium">
                        {s.url ? (
                          <Link to={s.url} className="text-blue-600 hover:text-blue-800 underline-offset-4 hover:underline">
                            {s.name}
                          </Link>
                        ) : (
                          s.name
                        )}
                      </td>
                      <td className="p-4 text-right text-blue-600 font-semibold">{s.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

      </div>
  );
}
