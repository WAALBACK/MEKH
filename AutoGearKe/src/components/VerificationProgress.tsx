import React, { useEffect, useState } from 'react';
import { getMyVerificationStatus } from '../lib/api';
import { VerificationResult } from '../lib/verificationEngine';

export const VerificationProgress: React.FC = () => {
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVerificationStatus();
  }, []);

  const loadVerificationStatus = async () => {
    try {
      setLoading(true);
      const result = await getMyVerificationStatus();
      setVerification(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load verification status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !verification) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800 text-sm">{error || 'Unable to load verification status'}</p>
      </div>
    );
  }

  const { badge_status, progress_tracker, gate_2 } = verification;
  const isVerified = badge_status === 'GRANTED';
  
  // Check if any Gate 1 item is incomplete (blocking badge)
  const gate1Blocked = progress_tracker.gate_1_items.some(item => !item.complete);
  
  // Calculate display values based on Gate 1 status
  const bonusEarned = gate_2.breakdown.tiktok_bonus.earned;
  const profileScoreWithoutBonus = gate_2.score - bonusEarned;
  
  // Cap displayed score at threshold (60), don't show bonus in the score
  const displayScore = Math.min(profileScoreWithoutBonus, gate_2.threshold);
  
  // If Gate 1 is blocked, cap percentage at 80% to show badge is blocked
  const displayPercentage = gate1Blocked 
    ? Math.min(progress_tracker.overall_percentage, 80) 
    : progress_tracker.overall_percentage;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900">Verified Badge</h2>
          {isVerified && (
            <div className="inline-flex items-center" title="Mekh Verified">
              <svg width="32" height="32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                <path d="M50 6 Q59.84 13.29 72 11.9 Q76.87 23.13 88.1 28 Q86.71 40.16 94 50 Q86.71 59.84 88.1 72Q76.87 76.87 72 88.1 Q59.84 86.71 50 94 Q40.16 86.71 28 88.1 Q23.13 76.87 11.9 72 Q13.29 59.84 6 50Q13.29 40.16 11.9 28 Q23.13 23.13 28 11.9 Q40.16 13.29 50 6 Z" fill="#1877F2"/>
                <path d="M30 52 L44 65 L70 35" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
        {!isVerified && (
          <span className="text-sm text-slate-600">
            {displayPercentage}% Complete
          </span>
        )}
      </div>

      {/* Status Message */}
      {isVerified ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-900 font-medium">
            🎉 Congratulations! You've earned the Mekh Verified Badge
          </p>
          <p className="text-blue-700 text-sm mt-1">
            Your badge is now visible to customers on your profile and in search results.
          </p>
        </div>
      ) : gate1Blocked ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-900 font-medium">
            Almost there — resolve the requirement below to earn your badge
          </p>
          <p className="text-red-700 text-sm mt-1">
            Complete the critical requirements to unlock your verified badge.
          </p>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
          <p className="text-slate-900 font-medium">
            You're {progress_tracker.points_needed} points away from earning your verified badge
          </p>
          <p className="text-slate-600 text-sm mt-1">
            Complete the checklist below to show customers you're a trusted professional.
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {!isVerified && (
        <div className="mb-6">
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                gate1Blocked ? 'bg-red-600' : 'bg-blue-600'
              }`}
              style={{ width: `${displayPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-600 mt-2">
            {displayScore} / {gate_2.threshold} points earned
          </p>
        </div>
      )}

      {/* Gate 1: Blockers */}
      {!progress_tracker.status_blocked && progress_tracker.gate_1_items.some(item => !item.complete) && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-red-900 mb-3">⚠️ Requirements (Must Complete)</h3>
          <div className="space-y-3">
            {progress_tracker.gate_1_items.filter(item => !item.complete).map((item) => (
              <div key={item.key} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-200 flex items-center justify-center mt-0.5">
                    <span className="text-red-700 text-xs">✕</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-red-900">{item.label}</p>
                    {item.hint && <p className="text-sm text-red-700 mt-1">{item.hint}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onboarding Items */}
      {progress_tracker.onboarding_items.some(item => !item.complete) && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">📋 Setup Steps</h3>
          <div className="space-y-2">
            {progress_tracker.onboarding_items.map((item) => (
              <div
                key={item.key}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  item.complete ? 'bg-green-50' : 'bg-slate-50'
                }`}
              >
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                  item.complete ? 'bg-green-500' : 'bg-slate-300'
                }`}>
                  {item.complete && <span className="text-white text-xs">✓</span>}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${item.complete ? 'text-green-900' : 'text-slate-700'}`}>
                    {item.label}
                  </p>
                  {!item.complete && item.hint && (
                    <p className="text-xs text-slate-600 mt-1">{item.hint}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gate 2: Scored Items */}
      {!isVerified && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">✨ Profile Completeness</h3>
          <div className="space-y-2">
            {progress_tracker.gate_2_items.map((item) => (
              <div
                key={item.key}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  item.complete ? 'bg-green-50' : 'bg-slate-50'
                }`}
              >
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                  item.complete ? 'bg-green-500' : 'bg-slate-300'
                }`}>
                  {item.complete && <span className="text-white text-xs">✓</span>}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${item.complete ? 'text-green-900' : 'text-slate-700'}`}>
                    {item.label}
                  </p>
                  {!item.complete && item.hint && (
                    <p className="text-xs text-slate-600 mt-1">{item.hint}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bonus Tip */}
      {progress_tracker.bonus_tip && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-900 text-sm">
            <span className="font-medium">💡 Bonus Tip:</span> {progress_tracker.bonus_tip}
          </p>
        </div>
      )}
    </div>
  );
};
