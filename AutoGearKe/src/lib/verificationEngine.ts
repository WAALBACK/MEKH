/**
 * Technician Verified Badge Engine
 * 
 * This module implements the verification logic for technician badges.
 * A verified badge signals that a technician is real, committed, and trustworthy.
 * 
 * The badge requires passing two gates:
 * - Gate 1: Hard requirements (status, jobs, rating)
 * - Gate 2: Profile completeness score (>= 60 points)
 */

import { Technician, BusinessHours } from '../../types';

// Helper to get primary service category
const getPrimaryServiceCategory = (technician: Technician): ServiceCategory | undefined => {
  const primaryService = technician.technician_services?.find(s => s.is_primary);
  return primaryService?.category as ServiceCategory | undefined;
};

export interface VerificationResult {
  technician_id: string;
  badge_status: 'GRANTED' | 'DENIED';
  gate_1: {
    status: 'live' | 'pending' | 'suspended';
    completed_jobs: number;
    avg_rating: number;
    rating_count: number;
    passed: boolean;
  };
  gate_2: {
    score: number;
    threshold: number;
    max_score: number;
    passed: boolean;
    breakdown: {
      bio: { earned: number; max: number };
      google_maps_link: { earned: number; max: number };
      portfolio_photos: { earned: number; max: number; count: number };
      business_hours: { earned: number; max: number };
      trusted_brands: { earned: number; max: number };
      service_guarantee: { earned: number; max: number };
      tiktok_bonus: { earned: number; max: number };
    };
  };
  progress_tracker: {
    overall_percentage: number;
    points_earned: number;
    points_needed: number;
    status_blocked: boolean;
    gate_1_items: Array<{
      key: string;
      label: string;
      complete: boolean;
      hint: string | null;
    }>;
    onboarding_items: Array<{
      key: string;
      label: string;
      complete: boolean;
      hint: string | null;
    }>;
    gate_2_items: Array<{
      key: string;
      label: string;
      complete: boolean;
      hint: string | null;
    }>;
    bonus_tip: string | null;
  };
  denial_reasons: string[];
}

/**
 * Evaluate whether a technician qualifies for a verified badge
 */
export function evaluateVerification(
  technician: Technician,
  businessHours?: BusinessHours[]
): VerificationResult {
  const denialReasons: string[] = [];

  // Gate 1: Hard Requirements
  const gate1 = evaluateGate1(technician, denialReasons);

  // Gate 2: Profile Completeness Score
  const gate2 = evaluateGate2(technician, businessHours, denialReasons);

  // Determine badge status
  const badgeStatus: 'GRANTED' | 'DENIED' = gate1.passed && gate2.passed ? 'GRANTED' : 'DENIED';

  // Build progress tracker
  const progressTracker = buildProgressTracker(technician, gate1, gate2, businessHours);

  return {
    technician_id: technician.id,
    badge_status: badgeStatus,
    gate_1: gate1,
    gate_2: gate2,
    progress_tracker: progressTracker,
    denial_reasons: denialReasons,
  };
}

/**
 * Gate 1: Hard Requirements (Non-Negotiable)
 * All three conditions must be true
 */
function evaluateGate1(
  technician: Technician,
  denialReasons: string[]
): VerificationResult['gate_1'] {
  const status = technician.status || 'pending';
  const completedJobs = technician.completed_jobs || 0;
  const avgRating = technician.avg_rating || 0;
  const ratingCount = technician.review_count || 0;

  let passed = true;

  // Condition 1: Account Status
  if (status !== 'live') {
    passed = false;
    denialReasons.push(`Account status is "${status}" (must be "live")`);
  }

  // Condition 2: Jobs Completed
  if (completedJobs < 5) {
    passed = false;
    denialReasons.push(`Only ${completedJobs} jobs completed (need 5)`);
  }

  // Condition 3: Minimum Rating
  if (avgRating < 4.0 || ratingCount < 3) {
    passed = false;
    if (ratingCount < 3) {
      denialReasons.push(`Only ${ratingCount} reviews (need at least 3)`);
    } else {
      denialReasons.push(`Rating ${avgRating.toFixed(1)} is below 4.0`);
    }
  }

  return {
    status,
    completed_jobs: completedJobs,
    avg_rating: avgRating,
    rating_count: ratingCount,
    passed,
  };
}

/**
 * Gate 2: Profile Completeness Score
 * Must score >= 60 points out of 75 (bonus can add +5)
 * For towing technicians: must score >= 48 points out of 60 (maintains 80% requirement)
 */
function evaluateGate2(
  technician: Technician,
  businessHours: BusinessHours[] | undefined,
  denialReasons: string[]
): VerificationResult['gate_2'] {
  let totalScore = 0;

  // Check if primary service is towing
  const isTowTech = getPrimaryServiceCategory(technician) === 'towing';

  // Bio (15 points)
  const bioScore = evaluateBio(technician.bio);
  totalScore += bioScore;

  // Google Maps Link (10 points)
  const mapsScore = evaluateGoogleMapsLink(technician.google_maps_link);
  totalScore += mapsScore;

  // Portfolio Photos (20 points)
  const portfolioCount = technician.technician_photos?.length || 0;
  const portfolioScore = portfolioCount >= 4 ? 20 : 0;
  totalScore += portfolioScore;

  // Business Hours (10 points)
  const hoursScore = evaluateBusinessHours(businessHours);
  totalScore += hoursScore;

  // Trusted Brands (10 points) - skipped for towing technicians
  let brandsScore = 0;
  if (!isTowTech) {
    brandsScore = evaluateTrustedBrands(technician.trusted_brands_used);
    totalScore += brandsScore;
  }

  // Service Guarantee (10 points) - skipped for towing technicians
  let guaranteeScore = 0;
  if (!isTowTech) {
    guaranteeScore = evaluateServiceGuarantee(technician.service_guarantee);
    totalScore += guaranteeScore;
  }

  // TikTok Bonus (5 points)
  const tiktokScore = evaluateTikTokBonus(technician.tiktok_link);

  // Calculate threshold and max score based on whether technician is a tow tech
  // This maintains the same 80% requirement (60/75 = 80%)
  // For tow techs: 80% of 60 = 48 points needed out of 60 possible
  const maxBaseScore = isTowTech ? 55 : 75; // 75 - 20 = 55 for tow techs (removed 2x10pt categories)
  const threshold = isTowTech ? 48 : 60; // 80% of maxBaseScore
  const maxScore = maxBaseScore + 5; // Base + TikTok bonus
  const passed = totalScore >= threshold;

  if (!passed) {
    denialReasons.push(`Profile score ${totalScore}/${maxScore - 5} (need ${threshold})`);
  }

  return {
    score: totalScore,
    threshold,
    max_score: maxScore,
    passed,
    breakdown: {
      bio: { earned: bioScore, max: 15 },
      google_maps_link: { earned: mapsScore, max: 10 },
      portfolio_photos: { earned: portfolioScore, max: 20, count: portfolioCount },
      business_hours: { earned: hoursScore, max: 10 },
      ...(!isTowTech ? {
        trusted_brands: { earned: brandsScore, max: 10 },
        service_guarantee: { earned: guaranteeScore, max: 10 },
      } : {}),
      tiktok_bonus: { earned: tiktokScore, max: 5 },
    },
  };
}

// Scoring functions
function evaluateBio(bio: string | null | undefined): number {
  if (!bio) return 0;
  const trimmed = bio.trim();
  return trimmed.length >= 50 ? 15 : 0;
}

function evaluateGoogleMapsLink(link: string | null | undefined): number {
  if (!link) return 0;
  const trimmed = link.trim();
  // Basic validation: check if it looks like a valid Google Maps URL
  return trimmed.length > 0 && (trimmed.includes('maps.google') || trimmed.includes('goo.gl') || trimmed.includes('google.com/maps')) ? 10 : 0;
}

function evaluateBusinessHours(hours: BusinessHours[] | undefined): number {
  if (!hours || hours.length === 0) return 0;
  const openDays = hours.filter(h => h.is_open).length;
  return openDays >= 3 ? 10 : 0;
}

function evaluateTrustedBrands(brands: string | null | undefined): number {
  if (!brands) return 0;
  const brandList = brands.split(',').map(b => b.trim()).filter(b => b.length > 0);
  return brandList.length >= 2 ? 10 : 0;
}

function evaluateServiceGuarantee(guarantee: string | null | undefined): number {
  if (!guarantee) return 0;
  const lines = guarantee.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  return lines.length >= 2 ? 10 : 0;
}

function evaluateTikTokBonus(tiktokLink: string | null | undefined): number {
  if (!tiktokLink) return 0;
  const trimmed = tiktokLink.trim();
  return trimmed.length > 0 && trimmed.includes('tiktok') ? 5 : 0;
}

/**
 * Build the progress tracker for UI display
 */
function buildProgressTracker(
  technician: Technician,
  gate1: VerificationResult['gate_1'],
  gate2: VerificationResult['gate_2'],
  businessHours?: BusinessHours[]
): VerificationResult['progress_tracker'] {
  const statusBlocked = gate1.status !== 'live';
  const pointsEarned = gate2.score;
  const pointsNeeded = Math.max(0, gate2.threshold - pointsEarned);
  const overallPercentage = Math.min((pointsEarned / gate2.threshold) * 100, 100);

  // Check if primary service is towing
  const isTowTech = getPrimaryServiceCategory(technician) === 'towing';

  // Gate 1 Items (Blockers)
  const gate1Items = [
    {
      key: 'account_status',
      label: 'Account Status',
      complete: gate1.status === 'live',
      hint: gate1.status !== 'live'
        ? `Your account is ${gate1.status}. Contact support to resolve this — no badge can be issued until your account is active.`
        : null,
    },
    {
      key: 'jobs_completed',
      label: 'Jobs Completed',
      complete: gate1.completed_jobs >= 5,
      hint: gate1.completed_jobs < 5
        ? `Complete ${5 - gate1.completed_jobs} more job(s) on the platform. You've done ${gate1.completed_jobs} so far — keep going.`
        : null,
    },
    {
      key: 'minimum_rating',
      label: 'Minimum Rating',
      complete: gate1.avg_rating >= 4.0 && gate1.rating_count >= 3,
      hint: gate1.avg_rating < 4.0 || gate1.rating_count < 3
        ? `You need a rating of 4.0 or above from at least 3 customers. Your current rating is ${gate1.avg_rating.toFixed(1)} across ${gate1.rating_count} review(s).`
        : null,
    },
  ];

  // Onboarding Items (Setup Steps)
  const onboardingItems = [
    {
      key: 'basic_info',
      label: 'Basic Info',
      complete: !!(technician.first_name && technician.last_name && technician.business_name),
      hint: !technician.first_name || !technician.last_name || !technician.business_name
        ? 'Complete your name and business name — this is required to activate your profile.'
        : null,
    },
    {
      key: 'contact',
      label: 'Contact',
      complete: !!(technician.phone && technician.email),
      hint: !technician.phone || !technician.email
        ? 'Add your phone number and email address to your profile.'
        : null,
    },
    {
      key: 'service_location',
      label: 'Service Location',
      complete: !!technician.area,
      hint: !technician.area
        ? 'Set the area you serve so customers can find you.'
        : null,
    },
    {
      key: 'experience',
      label: 'Experience',
      complete: !!technician.experience_years,
      hint: !technician.experience_years
        ? 'Select your years of experience from your profile settings.'
        : null,
    },
    {
      key: 'services',
      label: 'Services',
      complete: (technician.technician_services?.length || 0) >= 1,
      hint: (technician.technician_services?.length || 0) < 1
        ? 'Add at least 1 service with prices so customers know what you offer.'
        : null,
    },
    {
      key: 'profile_photo',
      label: 'Profile Photo',
      complete: !!technician.profile_image,
      hint: !technician.profile_image
        ? 'Upload a clear profile photo — customers are more likely to hire technicians with a photo.'
        : null,
    },
    {
      key: 'cover_image',
      label: 'Cover Image',
      complete: !!technician.thumbnail_image,
      hint: !technician.thumbnail_image
        ? 'Upload a cover/banner image to complete your profile appearance.'
        : null,
    },
  ];

  // Gate 2 Items (Scored Checklist)
  const portfolioCount = technician.technician_photos?.length || 0;
  let gate2Items = [
    {
      key: 'bio',
      label: 'Bio',
      complete: gate2.breakdown.bio.earned > 0,
      hint: gate2.breakdown.bio.earned === 0
        ? 'Write a bio of at least 50 characters. Tell customers who you are, what you do, and why they should hire you.'
        : null,
    },
    {
      key: 'google_maps_link',
      label: 'Google Maps Link',
      complete: gate2.breakdown.google_maps_link.earned > 0,
      hint: gate2.breakdown.google_maps_link.earned === 0
        ? 'Add your Google Maps location link so customers can verify where you\'re based.'
        : null,
    },
    {
      key: 'portfolio_photos',
      label: 'Portfolio Photos',
      complete: gate2.breakdown.portfolio_photos.earned > 0,
      hint: gate2.breakdown.portfolio_photos.earned === 0
        ? `Upload at least 4 photos showing your real work. You've added ${portfolioCount} so far — you can add up to 6 total.`
        : null,
    },
    {
      key: 'business_hours',
      label: 'Business Hours',
      complete: gate2.breakdown.business_hours.earned > 0,
      hint: gate2.breakdown.business_hours.earned === 0
        ? 'Set your available working hours for at least 3 days of the week.'
        : null,
    },
  ];

  // Conditionally add Trusted Brands and Service Guarantee for non-towing technicians
  if (!isTowTech) {
    gate2Items = [
      ...gate2Items.slice(0, 4), // First 4 items (bio, maps, photos, hours)
      {
        key: 'trusted_brands',
        label: 'Trusted Brands',
        complete: gate2.breakdown.trusted_brands?.earned > 0,
        hint: gate2.breakdown.trusted_brands?.earned === 0
          ? 'Add at least 2 brands or materials you regularly work with (e.g. 3M, LLumar, Pioneer).'
          : null,
      },
      {
        key: 'service_guarantee',
        label: 'Service Guarantee',
        complete: gate2.breakdown.service_guarantee?.earned > 0,
        hint: gate2.breakdown.service_guarantee?.earned === 0
          ? 'Add at least 2 guarantee points so customers know what protection they get (e.g. \'7-day correction guarantee\').'
          : null,
      },
      ...gate2Items.slice(4),
    ];
  }

  // Add TikTok bonus item at the end
  gate2Items = [
    ...gate2Items,
    {
      key: 'tiktok_bonus',
      label: 'TikTok Bonus',
      complete: gate2.breakdown.tiktok_bonus.earned > 0,
      hint: gate2.breakdown.tiktok_bonus.earned === 0
        ? 'Add a TikTok video link to your profile — it\'s optional but helps you stand out and earns a bonus.'
        : null,
    },
  ];

  const bonusTip = gate2.breakdown.tiktok_bonus.earned === 0
    ? 'Add a TikTok video link to your profile — it\'s optional but helps you stand out and earns a bonus.'
    : null;

  return {
    overall_percentage: Math.round(overallPercentage),
    points_earned: pointsEarned,
    points_needed: pointsNeeded,
    status_blocked: statusBlocked,
    gate_1_items: gate1Items,
    onboarding_items: onboardingItems,
    gate_2_items: gate2Items,
    bonus_tip: bonusTip,
  };
}

/**
 * Quick check if a technician is verified (for display purposes)
 */
export function isVerified(technician: Technician, businessHours?: BusinessHours[]): boolean {
  const result = evaluateVerification(technician, businessHours);
  return result.badge_status === 'GRANTED';
}
