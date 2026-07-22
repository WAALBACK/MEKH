import React from 'react';

/**
 * SkeletonCard — a reusable skeleton loading placeholder that matches
 * the TechnicianCard layout. Shows grey `animate-pulse` blocks for:
 *   • Cover image area
 *   • Profile avatar overlay (bottom-right circle)
 *   • Rating badge (top-right)
 *   • Business name line
 *   • Location line with icon
 *   • Service tag pills (2)
 *   • Service type badge
 *
 * Drop-in replacement for TechnicianCard while Supabase data loads.
 */
export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-[#f8fafc] border border-slate-200 rounded-lg overflow-hidden animate-pulse">
      {/* Cover Image Area */}
      <div className="relative h-42 md:h-42 lg:h-42 bg-gray-100">
        {/* Rating badge placeholder */}
        <div className="absolute top-1 right-1 w-14 h-5 bg-slate-200 rounded-full" />

        {/* Profile avatar placeholder (bottom-right) */}
        <div className="absolute bottom-0 right-0 -translate-y-1/20">
          <div className="w-15 h-15 rounded-full bg-slate-200 border-2 border-white shadow-md" />
        </div>
      </div>

      {/* Content */}
      <div className="p-2 md:p-3 pt-4">
        {/* Business Name + Verified Badge */}
        <div className="flex items-center gap-1 mb-0.5">
          <div className="h-3.5 bg-slate-200 rounded w-3/4" />
        </div>

        {/* Location Row */}
        <div className="flex items-center mb-1 gap-1">
          <div className="w-2.5 h-2.5 bg-slate-200 rounded-full shrink-0" />
          <div className="h-2.5 bg-slate-200 rounded w-1/2" />
        </div>

        {/* Service Tag Pills */}
        <div className="flex flex-wrap gap-0.5 mb-1">
          <div className="h-4 bg-slate-200 rounded w-16" />
          <div className="h-4 bg-slate-200 rounded w-14" />
        </div>

        {/* Service Type Badge */}
        <div className="h-5 bg-slate-200 rounded w-12" />
      </div>
    </div>
  );
};
