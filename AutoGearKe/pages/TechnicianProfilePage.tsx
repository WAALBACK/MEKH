import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Technician, TechnicianVideo, ServiceVariant, WINDOW_TINT_TYPES } from '../types';
import { getPublicTechnicianBySlug, createWhatsAppLead, canClientReviewTechnician, submitReview, getTikTokThumbnail, getTechnicianBusinessHours } from '../src/lib/api';
import { getSession } from '../src/lib/auth';
import { supabase } from '../src/lib/supabase';
import LazyMap from '../src/components/LazyMap';
import { BookingModal } from '../src/components/BookingModal';
import { coverBanner, portfolioThumb, portfolioFull, profileFull, cardThumbnail } from '../src/lib/cloudinary';
import { Avatar } from '../src/components/Avatar';
import { BusinessHoursDisplay } from '../src/components/BusinessHoursEditor';
import { VideoThumbnail } from '../src/components/VideoThumbnail';
import { isVerified } from '../src/lib/verificationEngine';
import { isNative } from '../src/lib/platform';

// Map service names to URL slugs
const SERVICE_TO_SLUG: Record<string, string> = {
  'Window Tinting': 'window-tinting',
  'Car Wrapping': 'car-wrapping',
  'PPF Installation': 'ppf',
  'Ceramic Coating': 'ceramic-coating',
  'Car Buffing': 'car-buffing',
  'Car Detailing': 'car-detailing',
  'Headlight Restoration': 'headlight-restoration',
  'Headlight Tinting': 'headlight-restoration',
  'Car Tuning': 'car-tuning',
  'Car Riveting': 'car-riveting',
  'Car Identity': 'car-identity',
  'Chrome Deleting': 'car-detailing',
  'Rim Customization': 'car-detailing',
  'FaceLifting': 'car-tuning',
};

// Convert service name to slug
const getServiceSlug = (serviceName: string): string => {
  return SERVICE_TO_SLUG[serviceName] || serviceName.toLowerCase().replace(/\s+/g, '-');
};

// Convert area/county to slug
const getLocationSlug = (location: string): string => {
  return location.toLowerCase().replace(/\s+/g, '-');
};

const TechnicianProfilePage: React.FC = () => {
  const { slug, serviceSlug } = useParams<{ slug: string; serviceSlug?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [technician, setTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [selectedService, setSelectedService] = useState<string>('');
  const [bookingOpen, setBookingOpen] = useState(false);
  
  // Lightbox state for portfolio
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Review form state
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // TikTok thumbnails
  const [tiktokThumbnails, setTiktokThumbnails] = useState<Record<string, string>>({});
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewWouldRebook, setReviewWouldRebook] = useState<'yes' | 'no'>('yes');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');
  
  // Business hours state
  const [businessHours, setBusinessHours] = useState<{
    day_of_week: number;
    is_open: boolean;
    open_time: string | null;
    close_time: string | null;
    available_on_request: boolean;
  }[]>([]);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Expanded variant names (mobile only)
  const [expandedVariants, setExpandedVariants] = useState<Set<string>>(new Set());

  const toggleVariantName = (variantId: string) => {
    setExpandedVariants(prev => {
      const next = new Set(prev);
      if (next.has(variantId)) {
        next.delete(variantId);
      } else {
        next.add(variantId);
      }
      return next;
    });
  };

  // Check if technician is verified using the same logic as TechnicianCard
  const verified = useMemo(() => {
    if (!technician) return false;
    // Cast businessHours to the expected type since we only need the scheduling fields for verification
    return isVerified(technician, businessHours as any);
  }, [technician, businessHours]);

  // Video link management state
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<TechnicianVideo | null>(null);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [videoUrlError, setVideoUrlError] = useState('');
  const [videoSaving, setVideoSaving] = useState(false);
  const [videoSuccess, setVideoSuccess] = useState('');

  useEffect(() => {
    const fetchTechnician = async () => {
      if (!slug) return;

      try {

        const data = await getPublicTechnicianBySlug(slug);
        setTechnician(data);

        // Check if current user is the owner
        const session = await getSession();
        if (session && data) {
          setUser(session);
          // Get user_id from the technician to compare
          if (data.user_id === session.user?.id) {
            setIsCurrentUser(true);
          }
        }

        // Use cached thumbnail_url from DB; fall back to edge function only if missing
        if (data?.technician_videos) {
          const thumbnails: Record<string, string> = {};
          for (const video of data.technician_videos) {
            if (video.platform === 'tiktok') {
              if (video.thumbnail_url) {
                // Use cached thumbnail directly (works for both our storage and TikTok CDN URLs)
                thumbnails[video.id] = video.thumbnail_url;
              } else {
                // No cached thumbnail — fetch via edge function
                const thumb = await getTikTokThumbnail(video.video_url);
                if (thumb) thumbnails[video.id] = thumb;
              }
            }
          }
          setTiktokThumbnails(thumbnails);
        }

        // Service variants are now included in the main query join

        // Fetch business hours
        if (data?.id) {
          try {
            const hours = await getTechnicianBusinessHours(data.id);
            setBusinessHours(hours || []);
          } catch (e) {
            console.error('Failed to fetch business hours:', e);
          }
        }
      } catch (err) {
        setError('Technician not found');
      } finally {
        setLoading(false);
      }
    };

    fetchTechnician();
  }, [slug, location.pathname]); // Add location.pathname to force re-fetch on navigation

  // Redirect to canonical URL if accessed via service-specific URL
  useEffect(() => {
    if (serviceSlug && slug && technician) {
      navigate(`/technician/${slug}`, { replace: true });
    }
  }, [technician, serviceSlug, slug, navigate]);

  // Check if logged in client can review this technician
  useEffect(() => {
    const checkCanReview = async () => {
      if (!technician) return;
      
      try {
        const session = await getSession();
        if (session) {
          const canReviewNow = await canClientReviewTechnician(technician.id, session.user.id);
          setCanReview(canReviewNow);
        }
      } catch (e) {
        console.error('Error checking review eligibility:', e);
      }
    };
    
    checkCanReview();
  }, [technician]);

  // Check for pending booking after returning from auth
  useEffect(() => {
    const checkPendingBooking = async () => {
      const pendingService = sessionStorage.getItem('pendingBookService');
      const pendingSlug = sessionStorage.getItem('pendingBookTechnicianSlug');
      
      if (pendingService && pendingSlug === slug) {
        try {
          const session = await getSession();
          if (session) {
            // User is now logged in, open booking modal
            setSelectedService(pendingService);
            setBookingOpen(true);
          }
          // Clear the pending booking
          sessionStorage.removeItem('pendingBookService');
          sessionStorage.removeItem('pendingBookTechnicianSlug');
        } catch (e) {
          console.error('Error checking pending booking:', e);
          sessionStorage.removeItem('pendingBookService');
          sessionStorage.removeItem('pendingBookTechnicianSlug');
        }
      }
    };
    checkPendingBooking();
  }, [slug]);

  const handleBookService = async (serviceName: string) => {
    const session = await getSession();
    if (!session) {
      setSelectedService(serviceName);
      // Store pending booking in sessionStorage
      sessionStorage.setItem('pendingBookService', serviceName);
      sessionStorage.setItem('pendingBookTechnicianSlug', slug || '');
      navigate('/auth', { state: { redirectMessage: 'Sign in to book this technician', returnTo: `/technician/${slug}` } });
    } else {
      setSelectedService(serviceName);
      setBookingOpen(true);
    }
  };

  // Handle WhatsApp click - creates lead and redirects to WhatsApp
  const handleWhatsAppClick = async () => {
    if (!technician) return;
    
    const service = technician.technician_services?.[0]?.service_name || 'General Inquiry';
    
    try {
      // Create lead (this also sends notification to technician)
      const session = await getSession();
      if (session) {
        const { data: client } = await supabase
          .from('clients')
          .select('name, phone')
          .eq('user_id', session.user.id)
          .maybeSingle();
        
        if (client) {
          // createWhatsAppLead only expects 2 args: technicianId and serviceName
          // It resolves client internally from session
          await createWhatsAppLead(technician.id, service);
        }
      }
    } catch (error) {
      console.error('Failed to create lead:', error);
      // Continue anyway to allow WhatsApp redirect
    }
    
    // Redirect to WhatsApp with technician's phone number
    const phoneNumber = technician.phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi ${technician.business_name}, I'm interested in your services. Could you please provide more information?`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  // Handle submit review
  const handleSubmitReview = async () => {
    if (!technician) return;
    if (reviewRating === 0) {
      setReviewError('Please select a rating');
      return;
    }
    
    try {
      setReviewSubmitting(true);
      setReviewError('');
      
      const session = await getSession();
      if (!session) {
        setReviewError('Please sign in to submit a review');
        setReviewSubmitting(false);
        return;
      }
      
      await submitReview(technician.id, reviewRating, reviewComment, reviewWouldRebook);
      
      setReviewSuccess('Thank you for your review!');
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewComment('');
      
      // Refresh technician data to show new review
      const data = await getPublicTechnicianBySlug(slug!);
      setTechnician(data);
    } catch (e: any) {
      setReviewError(e.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Extract YouTube video ID
  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  // Extract TikTok video ID
  const getTiktokId = (url: string) => {
    const match = url.match(/(?:tiktok\.com\/@[\w.]+\/video\/|tiktok\.com\/v\/|vm\.tiktok\.com\/)([\da-zA-Z_-]+)/);
    return match ? match[1] : null;
  };

  // Extract Instagram post ID
  const getInstagramId = (url: string) => {
    const match = url.match(/(?:instagram\.com\/reel\/|instagram\.com\/tv\/)([\da-zA-Z_-]+)/);
    return match ? match[1] : null;
  };

  // Get embed URL for video
  const getVideoEmbedUrl = (video: TechnicianVideo) => {
    if (video.platform === 'youtube') {
      return `https://www.youtube.com/embed/${video.video_id}`;
    } else if (video.platform === 'tiktok') {
      return `https://www.tiktok.com/embed/v2/${video.video_id}`;
    } else if (video.platform === 'instagram') {
      return `https://www.instagram.com/p/${video.video_id}/embed`;
    }
    return '';
  };

  // Get service name for video
  const getVideoServiceName = (video: TechnicianVideo) => {
    return video.service || 'Demo';
  };

  // Extract TikTok video ID from URL
  const extractVideoId = (url: string): string | null => {
    if (!url) return null;
    try {
      const patterns = [
        /tiktok\.com\/@[\w.]+\/video\/(\d+)/,
        /tiktok\.com\/v\/(\d+)/,
        /vm\.tiktok\.com\/([a-zA-Z0-9_-]+)/
      ];
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
      }
    } catch (e) {
      console.error('Error extracting video ID:', e);
    }
    return null;
  };

  // Validate TikTok URL
  const isValidTikTokUrl = (url: string): boolean => {
    return extractVideoId(url) !== null;
  };

  // Handle add/edit/remove video links
  const handleSaveVideo = async () => {
    if (!technician || !newVideoUrl.trim()) {
      setVideoUrlError('Please enter a TikTok video URL');
      return;
    }

    const videoId = extractVideoId(newVideoUrl);
    if (!videoId) {
      setVideoUrlError('Invalid TikTok URL. Please enter a valid TikTok video link.');
      return;
    }

    setVideoSaving(true);
    setVideoUrlError('');

    try {
      if (editingVideo) {
        // Update existing video
        const { error: updateError } = await supabase
          .from('technician_videos')
          .update({
            video_url: newVideoUrl,
            video_id: videoId,
          })
          .eq('id', editingVideo.id);

        if (updateError) throw updateError;
        setVideoSuccess('Video link updated successfully!');
      } else {
        // Add new video - check if already at max
        const currentVideos = technician.technician_videos || [];
        if (currentVideos.length >= 3) {
          setVideoUrlError('Maximum of 3 video links allowed');
          setVideoSaving(false);
          return;
        }

        // Check for duplicates
        if (currentVideos.some(v => v.video_url === newVideoUrl)) {
          setVideoUrlError('This video link already exists');
          setVideoSaving(false);
          return;
        }

        const { error: insertError } = await supabase
          .from('technician_videos')
          .insert({
            technician_id: technician.id,
            platform: 'tiktok',
            video_url: newVideoUrl,
            video_id: videoId,
            service: 'TikTok',
          });

        if (insertError) throw insertError;
        setVideoSuccess('Video link added successfully!');
      }

      // Refresh technician data
      const updatedData = await getPublicTechnicianBySlug(slug!);
      setTechnician(updatedData);

      // Reset and close modal
      setTimeout(() => {
        setShowVideoModal(false);
        setEditingVideo(null);
        setNewVideoUrl('');
        setVideoSuccess('');
      }, 1500);
    } catch (err: any) {
      console.error('Error saving video:', err);
      setVideoUrlError(err.message || 'Failed to save video link');
    } finally {
      setVideoSaving(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!technician) return;

    if (!confirm('Are you sure you want to remove this video link?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('technician_videos')
        .delete()
        .eq('id', videoId);

      if (deleteError) throw deleteError;

      // Refresh technician data
      const updatedData = await getPublicTechnicianBySlug(slug!);
      setTechnician(updatedData);
    } catch (err: any) {
      console.error('Error deleting video:', err);
      setError(err.message || 'Failed to delete video link');
    }
  };

  const openAddVideoModal = () => {
    setEditingVideo(null);
    setNewVideoUrl('');
    setVideoUrlError('');
    setVideoSuccess('');
    setShowVideoModal(true);
  };

  const openEditVideoModal = (video: TechnicianVideo) => {
    setEditingVideo(video);
    setNewVideoUrl(video.video_url);
    setVideoUrlError('');
    setVideoSuccess('');
    setShowVideoModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !technician) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-black text-white mb-4">404</h1>
        <p className="text-slate-400 mb-8">{error || 'Technician not found'}</p>
        <Link 
          to="/"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold text-sm uppercase tracking-widest transition-all"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  // Get all portfolio photos for the grid
  const portfolioPhotos = technician.technician_photos || [];

  // Get videos sorted by sort_order
  const videos = (technician.technician_videos || [])
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .slice(0, 4);

  // Resolve focused service from serviceSlug
  const focusedService = serviceSlug
    ? technician.technician_services?.find(
        s => s.service_name.toLowerCase().replace(/\s+/g, '-') === serviceSlug
      )
    : null;

  // Build dynamic meta strings
  const pageTitle = focusedService
    ? `${technician.business_name} - ${focusedService.service_name} in ${technician.area} | Mekh`
    : `${technician.business_name} - ${technician.technician_services?.[0]?.service_name || 'Car Services'} in ${technician.area || 'Nairobi'} | Mekh`;

  const pageDescription = focusedService
    ? `Book ${focusedService.service_name} with ${technician.business_name} in ${technician.area}. ${technician.bio?.slice(0, 100)}...`
    : `${technician.business_name} offers professional ${technician.technician_services?.[0]?.service_name || 'car services'} in ${technician.area || 'Nairobi'}, Nairobi. Ceramic tint, 3M & Llumar options available. View portfolio & book on Mekh.`;

  const handleShare = async () => {
    const url = `https://mekh.app/technician/${technician.slug}`;
    const ratingText = technician.review_count > 0
      ? (technician.avg_rating || 0).toFixed(1)
      : 'New';
    const text = `Check out ${technician.business_name}'s profile on Mekh! ⭐ ${ratingText} (${technician.review_count || 0} reviews) ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${technician.business_name} - Mekh`,
          text,
          url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to WhatsApp
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-0 md:pt-0">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <link rel="canonical" href={`https://mekh.app/technician/${technician.slug}`} />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={technician.profile_image ? profileFull(technician.profile_image) : undefined} />
        <meta property="og:url" content={`https://mekh.app/technician/${technician.slug}`} />

        {/* Structured Data: LocalBusiness + AutoRepair */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': ['LocalBusiness', 'AutoRepair'],
            name: technician.business_name,
            description: technician.bio,
            url: `https://mekh.app/technician/${technician.slug}`,
            telephone: technician.phone,
            address: {
              '@type': 'PostalAddress',
              addressLocality: technician.area,
              addressRegion: technician.county,
              addressCountry: 'KE'
            },
            ...(technician.latitude && technician.longitude && {
              geo: {
                '@type': 'GeoCoordinates',
                latitude: technician.latitude,
                longitude: technician.longitude
              }
            }),
            ...(technician.review_count > 0 && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: technician.avg_rating,
                reviewCount: technician.review_count,
                bestRating: 5,
                worstRating: 1
              }
            }),
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Automotive Services',
              itemListElement: technician.technician_services?.map((service, index) => ({
                '@type': 'Offer',
                position: index + 1,
                itemOffered: {
                  '@type': 'Service',
                  name: service.service_name,
                  description: service.notes || `${service.service_name} service offered by ${technician.business_name}`
                },
                ...(service.price && {
                  priceSpecification: {
                    '@type': 'PriceSpecification',
                    price: service.price,
                    priceCurrency: 'KES'
                  }
                }),
                availability: 'https://schema.org/InStock',
                seller: {
                  '@type': 'LocalBusiness',
                  name: technician.business_name
                }
              })) || []
            },
            ...(businessHours.length > 0 && {
              openingHours: businessHours.map(hour => {
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const dayName = days[hour.day_of_week];
                if (!hour.is_open) return null;
                const openTime = hour.open_time?.slice(0, 5) || '09:00';
                const closeTime = hour.close_time?.slice(0, 5) || '17:00';
                return `${dayName} ${openTime}-${closeTime}`;
              }).filter(Boolean)
            }),
            image: technician.profile_image ? profileFull(technician.profile_image) : undefined,
            sameAs: [] // Could add social media links if available
          })}
        </script>
      </Helmet>

      {/* Profile Header */}
      <section className="relative pb-4">
          {/* Cover Image - using thumbnail_image as cover */}
          {technician.thumbnail_image && (
            <div className="w-full h-32 md:h-60 overflow-hidden">
              <img
                src={cardThumbnail(technician.thumbnail_image)}
                alt={`${technician.business_name} cover`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="px-2 md:px-38">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
        <Link
      to="/"
      className="hidden md:flex absolute top-[4.5rem] md:top-[5.5rem] left-4 z-10 
                 text-white text-sm font-medium flex items-center gap-1 
                 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full
                 hover:bg-black/60 transition-colors"
    >
      ← Back
    </Link>
            {/* Avatar */}
            <div className="shrink-0 -mt-10 md:-mt-14">
              <div className="rounded-full ring-4 ring-white w-fit">
              <Avatar 
                imageUrl={profileFull(technician.profile_image || '')} 
                name={technician.business_name} 
                size="md" 
              />
            </div>
            </div>
            </div>
            {/* Identity */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-xl md:text-3xl font-black text-Slate-500">
                    {technician.business_name}
                  </h1>
                  {verified && (
                    <div className="inline-flex items-center" title="Mekh Verified">
                      <svg
                       width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 md:w-8 md:h-10"
                        >
                     {/* Smooth 12-bump seal shape — inner points become bezier control points */}
                       <path d="M50 6 Q59.84 13.29 72 11.9 Q76.87 23.13 88.1 28 Q86.71 40.16 94 50 Q86.71 59.84 88.1 72
                               Q76.87 76.87 72 88.1 Q59.84 86.71 50 94 Q40.16 86.71 28 88.1 Q23.13 76.87 11.9 72 Q13.29 59.84 6 50
                               Q13.29 40.16 11.9 28 Q23.13 23.13 28 11.9 Q40.16 13.29 50 6 Z" fill="#1877F2"
                         />
                  {/* White checkmark */}
                         <path d="M30 52 L44 65 L70 35" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"
                          />
                       </svg>
                       <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap -top-8 left-1/2 -translate-x-1/2">
                        Mekh Verfied
                      </div>
                    </div>
                  )}
                </div>
                {/* Buttons - Edit for owner, Share for all */}
                <div className="flex flex-col items-end gap-1">
                  {isCurrentUser && (
                    <button
                      onClick={() => navigate('/technician-dashboard?tab=profile')}
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Edit Profile
                    </button>
                  )}
                  <button
                    onClick={handleShare}
                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                    aria-label="Share profile on WhatsApp"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {/* Real name hidden from public - only shown in admin */}
                {technician.experience_years && (
                  <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded">
                    {technician.experience_years}
                  </span>
                )}
                {technician.mobile_service === 'yes' && (
                  <span className="bg-green-200 text-green-500 text-xs px-2 py-1 rounded border border-green-800">
                    Mobile Service
                  </span>
                )}
                {technician.mobile_service === 'no' && (
                  <span className="bg-blue-200 text-blue-500 text-xs px-2 py-1 rounded border border-blue-800">
                    Studio Based
                  </span>
                )}
                {technician.mobile_service === 'both' && (
                  <span className="bg-purple-200 text-purple-500 text-xs px-2 py-1 rounded border border-purple-800">
                    Mobile & Studio
                  </span>
                )}
              </div>

               {/* Rating - Always show */}
               <div className="flex items-center gap-2 mb-2">
                 <div className="flex items-center gap-1">
                   <span className="text-yellow-500 text-lg">★</span>
                   <span className="text-blue-500 font-bold">
                     {technician.review_count > 0
                       ? (technician.avg_rating || 0).toFixed(1)
                       : 'New'
                     }
                   </span>
                   <span className="text-slate-400">
                     ({technician.review_count || 0} {technician.review_count === 1 ? 'review' : 'reviews'})
                   </span>
                 </div>
               </div>

              <p className="text-blue-500 text-sm flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                {technician.area}, {technician.county}
              </p>
            </div>

          </div>
      </section>

      {/* Portfolio - Uniform Photo Grid */}
      {portfolioPhotos.length > 0 && (
        <section className="px-4 md:px-8 pb-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-blue-500 mb-3">Portfolio</h2>
            
            {/* Uniform grid - 2 columns on mobile, 3 columns on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {portfolioPhotos.slice(0, 6).map((photo, idx) => (
                <div 
                  key={photo.id} 
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => { setLightboxIndex(idx); setLightboxOpen(true); }}
                >
                  <img
                    src={portfolioFull(photo.photo_url)}
                    alt={photo.alt_text || photo.caption || 'Portfolio'}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Videos Section - 9:16 ratio, responsive */}
      {videos.length > 0 && (
        <section className="px-4 md:px-8 pb-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-blue-500 mb-3">Videos</h2>
            
            {/* Mobile: horizontal scroll, 75% width each */}
            <div className="md:hidden flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
              {videos.map((video) => (
                <div 
                  key={video.id} 
                  className="snap-start flex-shrink-0 w-[75%]"
                >
                  <div className="relative w-full" style={{ paddingBottom: '177.78%' /* 9:16 = 177.78% */ }}>
                    {video.platform === 'tiktok' ? (
                      <a 
                        href={video.video_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="absolute inset-0 group"
                      >
                        <VideoThumbnail
                          thumbnailUrl={tiktokThumbnails[video.id]}
                          platform="tiktok"
                          alt={video.service || 'TikTok video'}
                          className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                        />
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors rounded-lg">
                          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      </a>
                    ) : (
                      <iframe
                        src={getVideoEmbedUrl(video)}
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`${video.platform} video`}
                      />
                    )}
                  </div>
                  {video.service && (
                    <p className="text-slate-400 text-xs mt-1 text-center">{getVideoServiceName(video)}</p>
                  )}
                </div>
              ))}
            </div>
            
            {/* Tablet: 3 columns (smaller), Desktop: 4 columns */}
            <div className="hidden md:flex md:flex-wrap gap-2 md:gap-3 lg:gap-4">
              {videos.map((video) => (
                <div key={video.id} className="md:w-[150px] lg:w-[180px]">
                  <div 
                    className="relative w-full overflow-hidden"
                    style={{ 
                      paddingBottom: '177.78%' /* 9:16 ratio */
                    }}
                  >
                    {video.platform === 'tiktok' ? (
                      <a 
                        href={video.video_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="absolute inset-0 group"
                      >
                        <VideoThumbnail
                          thumbnailUrl={tiktokThumbnails[video.id]}
                          platform="tiktok"
                          alt={video.service || 'TikTok video'}
                          className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                        />
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors rounded-lg">
                          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        </div>
                      </a>
                    ) : (
                      <iframe
                        src={getVideoEmbedUrl(video)}
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`${video.platform} video`}
                      />
                    )}
                  </div>
                  {video.service && (
                    <p className="text-slate-400 text-xs mt-1 text-center">{getVideoServiceName(video)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About */}
      {technician.bio && (
        <section className="px-4 md:px-8 pb-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-blue-500 mb-2">About</h2>
            <p className="text-slate-500 text-sm leading-relaxed">{technician.bio}</p>
          </div>
        </section>
      )}

      {/* Announcements / Notes */}
      {technician.pricing_notes && technician.pricing_notes.trim() !== '' && (
        <section className="px-4 md:px-8 pb-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-blue-500 mb-2">Announcements</h2>
            <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-line">{technician.pricing_notes}</p>
          </div>
        </section>
      )}

      {/* Services - Point form without containers */}
      {technician.technician_services && technician.technician_services.length > 0 && (
        <section className="px-4 md:px-8 pb-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-blue-500 mb-3">Services <span className="text-xs font-normal text-slate-400 ml-2">The Pricing of each service highly depends on the vehicle size and the Model</span></h2>
            <ul className="space-y-2">
              {/* Sort services to show primary service first */}
              {[...technician.technician_services]
                .sort((a, b) => {
                  if (a.is_primary) return -1;
                  if (b.is_primary) return 1;
                  return 0;
                })
                .map((service) => {
        const variants = service.service_variants || [];
        const isPrimary = service.is_primary;

        return (
          <li key={service.id} className="space-y-2">

    {/* ── Service name + price/book row ── */}
    {/* Mobile: two rows (name on top, price+book below). md+: single row inline */}
    <div className="flex items-start md:items-center justify-between gap-2">
      <div className="flex items-start md:items-center gap-2 min-w-0">
        <span className="text-blue-500 mt-0.5 md:mt-0 shrink-0">•</span>
        <span className={`text-blue-500 break-words md:truncate ${isPrimary ? 'font-bold text-base' : 'font-medium'}`}>
          {service.service_name}
        </span>
        {/* Desktop/tablet: price + negotiable inline with name (original behaviour) */}
        {variants.length === 0 && service.price && (
          <span className="hidden md:inline text-green-500 font-medium">
            Ksh {service.price.toLocaleString()}
          </span>
        )}
        {variants.length === 0 && service.negotiable && (
          <span className="hidden md:inline bg-white text-yellow-500 text-xs px-2 py-0.5 rounded border border-yellow-600">
            Negotiable
          </span>
        )}
      </div>

      {/* Desktop/tablet: Book button inline on the right (original behaviour) */}
      {variants.length === 0 && (
        <Link
          to={`#book-${service.id}`}
          onClick={() => handleBookService(service.service_name)}
          className="hidden md:inline text-blue-500 hover:text-blue-300 text-sm font-medium transition-colors shrink-0"
        >
          Book →
        </Link>
      )}
    </div>

    {/* Mobile only: price + negotiable + book on second row */}
    {variants.length === 0 && (
      <div className="flex md:hidden items-center gap-2 ml-6">
        {service.price && (
          <span className="text-green-500 font-medium text-sm">
            Ksh {service.price.toLocaleString()}
          </span>
        )}
        {service.negotiable && (
          <span className="bg-white text-yellow-500 text-xs px-1.5 py-0.5 rounded border border-yellow-600 whitespace-nowrap">
            Negotiable
          </span>
        )}
        <Link
          to={`#book-${service.id}`}
          onClick={() => handleBookService(service.service_name)}
          className="text-blue-500 hover:text-blue-300 text-sm font-medium transition-colors whitespace-nowrap"
        >
          Book →
        </Link>
      </div>
    )}

    {/* ── Variants ── */}
    {variants.length > 0 && (
      <ul className="ml-6 space-y-1">
        {variants.map((variant: ServiceVariant) => (
          <li key={variant.id} className="space-y-0.5">

            {/* Desktop/tablet: original single row layout */}
            <div className="hidden md:flex items-center gap-2 min-w-0">
              <span className="text-blue-500 shrink-0">◦</span>
              <span className={`text-slate-300 flex-1 min-w-0 truncate md:cursor-default cursor-pointer`}>
                {variant.variant_name}
              </span>
              {variant.price && (
                <span className="text-green-500 font-medium shrink-0">
                  Ksh {variant.price.toLocaleString()}
                </span>
              )}
              {variant.is_negotiable && (
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded border border-yellow-600 shrink-0">
                  Negotiable
                </span>
              )}
              <Link
                to={`#book-${service.id}`}
                onClick={() => handleBookService(`${service.service_name} - ${variant.variant_name}`)}
                className="text-blue-500 hover:text-blue-300 text-sm font-medium transition-colors shrink-0"
              >
                Book →
              </Link>
            </div>

            {/* Mobile only: name on top, price+book below */}
            <div className="flex md:hidden items-start gap-1.5 min-w-0">
              <span className="text-blue-500 shrink-0 mt-0.5">◦</span>
              <span className="text-slate-300 text-sm break-words flex-1">
                {variant.variant_name}
              </span>
            </div>
            <div className="flex md:hidden items-center gap-2 ml-4">
              {variant.price && (
                <span className="text-green-500 font-medium text-sm">
                  Ksh {variant.price.toLocaleString()}
                </span>
              )}
              {variant.is_negotiable && (
                <span className="bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded border border-yellow-600 whitespace-nowrap">
                  Negotiable
                </span>
              )}
              <Link
                to={`#book-${service.id}`}
                onClick={() => handleBookService(`${service.service_name} - ${variant.variant_name}`)}
                className="text-blue-500 hover:text-blue-300 text-sm font-medium transition-colors whitespace-nowrap"
              >
                Book →
              </Link>
            </div>

          </li>
        ))}
      </ul>
    )}

    {/* Service note */}
    {service.notes && (
      <p className="ml-6 text-slate-500 text-xs italic leading-relaxed">
        {service.notes}
      </p>
    )}
  </li>
        );
              })}
            </ul>
            
            {/* Link to nearby technicians — web only (hidden in native app) */}
            {!isNative && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <Link 
                  to={`/nearby/${technician.slug}`}
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  View other technicians near {technician.area}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Trusted Brands Used */}
      {technician.trusted_brands_used && technician.trusted_brands_used.trim() && (
        <section className="px-4 md:px-8 pb-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-blue-500 mb-3">Trusted Brands Used</h2>
            <p className="text-slate-300 leading-relaxed">{technician.trusted_brands_used}</p>
          </div>
        </section>
      )}

      {/* Service Guarantee */}
      {technician.service_guarantee && technician.service_guarantee.trim() && (
        <section className="px-4 md:px-8 pb-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-blue-500 mb-3">Service Guarantee</h2>
            <ul className="space-y-2">
              {technician.service_guarantee.split('\n').filter(line => line.trim()).map((guarantee, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="text-slate-300 leading-relaxed">{guarantee.trim()}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Map */}
      {(technician.area || technician.google_maps_link || (technician.latitude && technician.longitude)) && (
        <section className="px-4 md:px-8 pb-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-blue-500 mb-3">Location</h2>
            {technician.latitude && technician.longitude ? (
              <LazyMap
                area={technician.area}
                county={technician.county}
                lat={technician.latitude}
                lng={technician.longitude}
              />
            ) : technician.google_maps_link ? (
              <a
                href={technician.google_maps_link}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 p-4 text-center transition-colors"
              >
                <p className="text-slate-300 font-medium mb-2">
                   {technician.area || 'View Location'}
                </p>
                <p className="text-blue-400 text-sm hover:text-blue-300">Open in Google Maps →</p>
              </a>
            ) : (
              <div className="bg-slate-800 rounded border border-slate-700 p-4 text-center">
                <p className="text-slate-400">
                   {technician.area}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Payment Methods */}
      {technician.technician_payments && technician.technician_payments.length > 0 && (
        <section className="px-4 md:px-8 pb-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-white mb-3">Payment Methods</h2>
            <div className="flex flex-wrap gap-2">
              {technician.technician_payments.map((payment) => (
                <span
                  key={payment.id}
                  className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-sm"
                >
                  {payment.method}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Business Hours */}
      {businessHours.length > 0 && (
        <section className="px-4 md:px-8 pb-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-blue-500 mb-3">Business Hours</h2>
            <BusinessHoursDisplay hours={businessHours} />
          </div>
        </section>
      )}

      {/* Reviews - Always show the section */}
      <section className="px-4 md:px-8 pb-24">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-blue-500 mb-3">Reviews</h2>
            
            {/* Rating Summary */}
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-black text-blue-500">
                {technician.review_count > 0 ? (technician.avg_rating || 0).toFixed(1) : '-'}
              </div>
              <div>
                <div className="flex text-yellow-500">
                  {technician.review_count > 0 
                    ? '★'.repeat(Math.round(technician.avg_rating || 0))
                    : null
                  }
                </div>
                {technician.review_count === 0 && (
                  <p className="text-slate-400 text-sm">No ratings yet</p>
                )}
                {technician.review_count > 0 && (
                  <p className="text-slate-400 text-sm">
                    {technician.review_count} {technician.review_count === 1 ? 'review' : 'reviews'}
                  </p>
                )}
              </div>
            </div>

            {/* Write Review Button - Only for clients who have booked and job is confirmed by technician and admin */}
            {canReview && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                Write a Review
              </button>
            )}

            {/* Review Form */}
            {showReviewForm && (
              <div className="mb-6 bg-blue-500 border border-blue-500 p-4 rounded-lg">
                <h3 className="text-white font-bold mb-3">Your Review</h3>
                
                {reviewError && (
                  <div className="mb-3 p-2 bg-red-500 border border-red-600 text-red-400 text-sm rounded">
                    {reviewError}
                  </div>
                )}
                
                {reviewSuccess && (
                  <div className="mb-3 p-2 bg-green-900/50 border border-green-800 text-green-400 text-sm rounded">
                    {reviewSuccess}
                  </div>
                )}
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className={`text-2xl ${star <= reviewRating ? 'text-yellow-400' : 'text-slate-600'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Your Review</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    placeholder="Share your experience with this technician..."
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Would you book again?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-white">
                      <input
                        type="radio"
                        name="wouldRebook"
                        value="yes"
                        checked={reviewWouldRebook === 'yes'}
                        onChange={() => setReviewWouldRebook('yes')}
                        className="text-blue-600"
                      />
                      Yes
                    </label>
                    <label className="flex items-center gap-2 text-white">
                      <input
                        type="radio"
                        name="wouldRebook"
                        value="no"
                        checked={reviewWouldRebook === 'no'}
                        onChange={() => setReviewWouldRebook('no')}
                        className="text-blue-600"
                      />
                      No
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSubmitReview}
                    disabled={reviewSubmitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewError('');
                      setReviewSuccess('');
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Review List */}
            <div className="space-y-3">
              {technician.reviews && technician.reviews.length > 0 ? (
                technician.reviews.map((review) => (
                  <div key={review.id} className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-blue-500 font-medium">{review.client_name}</p>
                        <p className="text-slate-400 text-xs">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">{'★'.repeat(review.rating)}</span>
                        {review.would_rebook === 'yes' && (
                          <span className="ml-2 text-green-500 text-xs">↻ Would rebook</span>
                        )}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-slate-300 text-sm">{review.comment}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-sm">No reviews yet. Be the first to review this technician!</p>
              )}
            </div>

            {/* Book Button - Below Reviews */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <h3 className="text-lg font-bold text-blue-500 mb-3">Book This Technician</h3>
              <button
                onClick={() => handleBookService(technician.technician_services?.[0]?.service_name || '')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
              >
                Book Now →
              </button>
            </div>
          </div>
        </section>


      {/* Booking Modal */}
      {technician && (
        <BookingModal
          technician={technician}
          isOpen={bookingOpen}
          onClose={() => setBookingOpen(false)}
          onNeedAuth={() => { 
            setBookingOpen(false);
            sessionStorage.setItem('pendingBookService', selectedService);
            sessionStorage.setItem('pendingBookTechnicianSlug', slug || '');
            navigate('/auth', { state: { redirectMessage: 'Sign in to book this technician', returnTo: `/technician/${slug}` } });
          }}
          preSelectedService={selectedService}
        />
      )}

      {/* Video Management Modal */}
      {showVideoModal && technician && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingVideo ? 'Edit Video Link' : 'Add Video Link'}
            </h3>
            
            {/* Current Videos List */}
            {!editingVideo && technician.technician_videos && technician.technician_videos.length > 0 && (
              <div className="mb-4">
                <p className="text-slate-400 text-sm mb-2">Current videos ({technician.technician_videos.length}/3):</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {technician.technician_videos.map((video) => (
                    <div key={video.id} className="flex items-center justify-between bg-slate-800 p-2 rounded">
                      <span className="text-slate-300 text-sm truncate flex-1">{video.video_url}</span>
                      <div className="flex gap-2 ml-2">
                        <button
                          onClick={() => openEditVideoModal(video)}
                          className="text-blue-400 hover:text-blue-300 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(video.id)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add/Edit Form */}
            {!editingVideo && technician.technician_videos && technician.technician_videos.length >= 3 ? (
              <p className="text-yellow-500 text-sm">Maximum of 3 video links reached. Please remove a video to add a new one.</p>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-slate-300 text-sm mb-2">TikTok Video URL</label>
                  <input
                    type="url"
                    value={newVideoUrl}
                    onChange={(e) => {
                      setNewVideoUrl(e.target.value);
                      setVideoUrlError('');
                    }}
                    placeholder="Paste TikTok video URL here"
                    className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:outline-none focus:border-blue-500 ${videoUrlError ? 'border-red-500' : 'border-slate-600'}`}
                  />
                  {videoUrlError && (
                    <p className="text-red-400 text-xs mt-1">{videoUrlError}</p>
                  )}
                  {newVideoUrl && !videoUrlError && isValidTikTokUrl(newVideoUrl) && (
                    <p className="text-green-400 text-xs mt-1">✓ Valid TikTok URL</p>
                  )}
                </div>

                {videoSuccess && (
                  <p className="text-green-400 text-sm mb-4">{videoSuccess}</p>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowVideoModal(false);
                      setEditingVideo(null);
                      setNewVideoUrl('');
                      setVideoUrlError('');
                      setVideoSuccess('');
                    }}
                    className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveVideo}
                    disabled={videoSaving || !newVideoUrl.trim()}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {videoSaving ? 'Saving...' : editingVideo ? 'Update' : 'Add'}
                  </button>
                </div>
              </>
            )}

            {/* Close only when not editing */}
            {editingVideo && (
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  setEditingVideo(null);
                  setNewVideoUrl('');
                  setVideoUrlError('');
                  setVideoSuccess('');
                }}
                className="mt-3 w-full py-2 text-slate-400 hover:text-white text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lightbox for portfolio photos */}
      {lightboxOpen && portfolioPhotos.length > 0 && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white text-2xl p-2 hover:bg-white/10 rounded"
            onClick={() => setLightboxOpen(false)}
          >
            ×
          </button>
          
          {/* Previous button */}
          {lightboxIndex > 0 && (
            <button 
              className="absolute left-4 text-white text-3xl p-2 hover:bg-white/10 rounded"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
            >
              ‹
            </button>
          )}
          
          {/* Next button */}
          {lightboxIndex < portfolioPhotos.length - 1 && (
            <button 
              className="absolute right-4 text-white text-3xl p-2 hover:bg-white/10 rounded"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
            >
              ›
            </button>
          )}
          
          <img
            src={portfolioFull(portfolioPhotos[lightboxIndex].photo_url)}
            alt={portfolioPhotos[lightboxIndex].alt_text || portfolioPhotos[lightboxIndex].caption || 'Portfolio'}
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          
          {portfolioPhotos[lightboxIndex].caption && (
            <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
              {portfolioPhotos[lightboxIndex].caption}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TechnicianProfilePage;