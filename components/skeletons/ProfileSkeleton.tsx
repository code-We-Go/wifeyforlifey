import React from 'react';

const ProfileSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {/* Profile Header Skeleton */}
    <div className="w-full flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="rounded-full h-24 w-24 bg-gray-200" />
        <div className="space-y-2">
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="h-6 w-20 bg-gray-200 rounded" />
    </div>
    {/* Stats Skeleton */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6">
          <div className="absolute rounded-md bg-gray-200 p-3" />
          <div className="ml-16 h-4 w-24 bg-gray-200 rounded mb-2" />
          <div className="ml-16 h-8 w-16 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
    {/* Recent Activity Skeleton */}
    <div>
      <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between border-b pb-4">
            <div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-40 bg-gray-200 rounded" />
            </div>
            <div className="h-6 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default ProfileSkeleton; 