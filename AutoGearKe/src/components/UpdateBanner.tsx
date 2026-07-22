import React from 'react';
import { isNative } from '../lib/platform';

interface UpdateBannerProps {
  latestVersion: string;
  currentVersion: string;
  onUpdate: () => void;
}

const UpdateBanner: React.FC<UpdateBannerProps> = ({
  latestVersion,
  currentVersion,
  onUpdate,
}) => {
  if (!isNative) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-blue-600 text-white px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium">
            New version available ({latestVersion})
          </p>
          <p className="text-xs text-blue-100">
            Update now for the latest features and fixes
          </p>
        </div>
        <button
          onClick={onUpdate}
          className="px-4 py-1.5 bg-white text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors flex-shrink-0"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default UpdateBanner;
