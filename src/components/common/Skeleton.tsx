import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height, 
  borderRadius = '8px' 
}) => {
  return (
    <div 
      className={`skeleton-pulse ${className}`}
      style={{
        width: width,
        height: height,
        borderRadius: borderRadius,
        backgroundColor: 'var(--color-bg-tertiary)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <style>{`
        .skeleton-pulse::after {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0,
            rgba(255, 255, 255, 0.2) 20%,
            rgba(255, 255, 255, 0.5) 60%,
            rgba(255, 255, 255, 0)
          );
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export const PageSkeleton: React.FC = () => (
  <div className="p-6 space-y-6">
    <div className="flex justify-between items-center">
      <Skeleton width="200px" height="32px" />
      <div className="flex gap-2">
        <Skeleton width="100px" height="36px" />
        <Skeleton width="100px" height="36px" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton height="120px" />
      <Skeleton height="120px" />
      <Skeleton height="120px" />
    </div>
    <Skeleton height="400px" />
  </div>
);
