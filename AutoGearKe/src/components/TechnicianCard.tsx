import React, { useCallback, memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Technician } from '../../types';
import { cardThumbnail } from '../lib/cloudinary';
import { createWhatsAppLead } from '../lib/api';
import { getConnectionQuality } from '../lib/connectionQuality';

interface TechnicianCardProps {
  technician: Technician;
  onBookNow?: (technician: Technician) => void;
}

const TechnicianCardComponent: React.FC<TechnicianCardProps> = ({ technician, onBookNow }) => {
  // Use thumbnail_image if available, otherwise fall back to cover_photo or first photo
  const coverPhoto = technician.thumbnail_image || technician.cover_photo || technician.technician_photos?.[0]?.photo_url;
  
  // Connection-aware image URL: smaller images on slow connections (~8KB vs ~30KB)
  const connectionQuality = useMemo(() => getConnectionQuality().quality, []);
  const isSlow = connectionQuality === 'slow' || connectionQuality === 'offline';

  // Check if technician is verified using computed column
  // Fallback to verification engine if is_verified is undefined (migration not run yet)
  const verified = useMemo(() => {
    if (technician.is_verified !== undefined) {
      return technician.is_verified === true;
    }
    // Fallback: use verification engine (requires business_hours)
    // This won't work perfectly without business_hours data, but prevents errors
    return false;
  }, [technician]);

  const optimizedCoverPhoto = useMemo(() => {
    if (!coverPhoto) return '';
    if (isSlow) {
      // Serve smaller image on slow connections
      if (coverPhoto.includes('cloudinary.com')) {
        return coverPhoto.replace('/upload/', '/upload/w_200,h_125,c_fill,q_auto:low,f_auto/');
      }
    }
    return cardThumbnail(coverPhoto);
  }, [coverPhoto, isSlow]);

  // Optimize profile image for slow connections (~2KB vs ~20KB)
  const optimizedProfileImage = useMemo(() => {
    const url = technician.profile_image;
    if (!url) return '';
    if (isSlow && url.includes('cloudinary.com')) {
      return url.replace('/upload/', '/upload/w_60,h_60,c_fill,g_face,q_auto:low,f_auto/');
    }
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', '/upload/w_120,h_120,c_fill,g_face,q_auto,f_auto/');
    }
    return url;
  }, [technician.profile_image, isSlow]);
  
  // Handle WhatsApp click - creates lead and redirects to WhatsApp
  const handleWhatsAppClick = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get the first service or use a default message
    const service = technician.technician_services?.[0]?.service_name || 'General Inquiry';
    
    try {
      // Create lead (this also sends notification to technician)
      await createWhatsAppLead(technician.id, service);
    } catch (error) {
      console.error('Failed to create lead:', error);
      // Continue anyway to allow WhatsApp redirect
    }
    
    // Redirect to WhatsApp with technician's phone number
    const phoneNumber = technician.phone.replace(/\D/g, ''); // Remove non-digits
    const message = encodeURIComponent(`Hi ${technician.business_name}, I'm interested in your services. Could you please provide more information?`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  }, [technician.id, technician.phone, technician.business_name, technician.technician_services]);

  const handleCardClick = useCallback((e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
      return;
    }
  }, []);
  
  return (
    <Link 
      to={`/technician/${technician.slug}`}
      className="bg-[#f8fafc] border border-slate-200 rounded-lg overflow-hidden hover:border-primary-600 transition-colors group block"
      onClick={handleCardClick}
    >
      {/* Cover Image */}
      <div className="relative h-42 md:h-42 lg:h-42 overflow-visible mb-3">
        {coverPhoto ? (
          <img
            src={optimizedCoverPhoto}
            alt={`${technician.business_name} - ${technician.technician_services?.[0]?.service_name || 'Auto services'} in ${technician.area}, ${technician.county}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
            width={400}
            height={250}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-slate-900 flex items-center justify-center">
            <span className="text-2xl"></span>
          </div>
        )}
    
        {/* Rating Badge */}
        <div className="absolute top-1 right-1 bg-blue-500 backdrop-blur-sm px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
          <span className="text-[#F59E0B] text-[15px]">★</span>
          <span className="text-[#ffff] text-[10px] font-medium">
            {technician.review_count > 0 ? (technician.avg_rating || 0).toFixed(1) : 'New'}
          </span>
          <span className="text-[#ffff] text-[8px]">({technician.review_count || 0})</span>
        </div>

        {/* Profile Avatar Overlay */}
        <div className="absolute bottom-0 right-0 -translate-y-1/20">
          {technician.profile_image ? (
            <img
              src={optimizedProfileImage}
              alt={`${technician.business_name} profile`}
              className="w-15 h-15 rounded-full object-cover border-2 border-white shadow-md"
              loading="lazy"
              decoding="async"
              width={60}
              height={60}
            />
          ) : (
            <div className="w-15 h-15 rounded-full bg-white border-2 border-white shadow-md flex items-center justify-center">
              <span className="text-blue-500 text-sm font-semibold">
                {technician.business_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-2 md:p-3 pt-4">
        {/* Business Name with Verified Badge */}
        <div className="flex items-center gap-1 mb-0.5">
          <h3 className="font-bold text-[#0f172a] text-xs md:text-sm truncate group-hover:text-primary-600 transition-colors">
            {technician.business_name}
          </h3>
          {verified && (
            <div className="inline-flex items-center shrink-0" title="Mekh Verified">
              <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 md:w-5 md:h-5">
                {/* Smooth 12-bump seal shape — inner points become bezier control points */}
                <path d="M50 6 Q59.84 13.29 72 11.9 Q76.87 23.13 88.1 28 Q86.71 40.16 94 50 Q86.71 59.84 88.1 72Q76.87 76.87 72 88.1 Q59.84 86.71 50 94 Q40.16 86.71 28 88.1 Q23.13 76.87 11.9 72 Q13.29 59.84 6 50Q13.29 40.16 11.9 28 Q23.13 23.13 28 11.9 Q40.16 13.29 50 6 Z" fill="#1877F2"/>
                {/* White checkmark */}
                <path d="M30 52 L44 65 L70 35" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>

        {/* Location Row */}
        <div className="flex items-center mb-1">
          <p className="text-blue-500 text-[10px] md:text-xs flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            {technician.area}
          </p>
        </div>

        {/* Services Preview */}
        <div className="flex flex-wrap gap-0.5 mb-1">
          {/* Show primary service first in blue if it exists */}
          {technician.technician_services?.find(s => s.is_primary) && (
            <span 
              className="text-[9px] bg-slate-100 text-blue-500 px-1.5 py-0.5 rounded truncate max-w-[80px] font-medium"
            >
              {technician.technician_services.find(s => s.is_primary)!.service_name}
            </span>
          )}
          {/* Show other services */}
          {technician.technician_services
            ?.filter(service => !service.is_primary)
            .slice(0, technician.technician_services?.some(s => s.is_primary) ? 1 : 2)
            .map((service, idx) => (
              <span 
                key={idx}
                className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded truncate max-w-[80px]"
              >
                {service.service_name}
              </span>
            ))}
          {(technician.technician_services?.length || 0) > (technician.technician_services?.some(s => s.is_primary) ? 2 : 2) && (
            <span className="text-[8px] text-slate-500">
              +{(technician.technician_services?.length || 0) - (technician.technician_services?.some(s => s.is_primary) ? 2 : 2)}
            </span>
          )}
        </div>

        {/* Service Type Badge */}
        <div className="flex items-center gap-1">
          {technician.mobile_service === 'yes' && (
            <span className="inline-flex items-center gap-0.5 text-[9px] bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded border border-primary-200">
              Mobile
            </span>
          )}
          {technician.mobile_service === 'no' && (
            <span className="inline-flex items-center gap-0.5 text-[9px] bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded border border-primary-200">
              Studio
            </span>
          )}
          {technician.mobile_service === 'both' && (
            <span className="inline-flex items-center gap-0.5 text-[9px] bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded border border-primary-200">
              Both
            </span>
          )}
        </div>
        
      </div>
    </Link>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const TechnicianCard = memo(TechnicianCardComponent);

// Skeleton loading state
export const TechnicianCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#f8fafc] border border-slate-200 rounded-lg overflow-hidden animate-pulse">
      <div className="h-24 md:h-28 lg:h-32 bg-slate-200" />
      <div className="p-2 md:p-3">
        <div className="h-3 bg-slate-200 rounded w-3/4 mb-1.5" />
        <div className="h-2 bg-slate-200 rounded w-1/2 mb-2" />
        <div className="flex gap-1 mb-2">
          <div className="h-4 bg-slate-200 rounded w-14" />
          <div className="h-4 bg-slate-200 rounded w-14" />
        </div>
        <div className="h-5 bg-slate-200 rounded w-16" />
      </div>
    </div>
  );
};
