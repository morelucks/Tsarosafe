// LoadingSkeleton: animated placeholder shown while data is loading
import React from 'react';

interface SkeletonProps {
    className?: string;
    count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, count = 1 }) => {
    return (
        <>
            {Array(count).fill(0).map((_, i) => (
                <div
                    key={i}
                    className={`animate-pulse bg-white/10 rounded ${className}`}
                />
            ))}
        </>
    );
};

export const CardSkeleton = () => (
    <div className="bg-[#0b0c16]/75 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
        <div className="flex items-center">
            <div className="h-12 w-12 bg-white/10 rounded-xl animate-pulse" />
            <div className="ml-4 space-y-2 flex-1">
                <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse" />
                <div className="h-6 bg-white/10 rounded w-3/4 animate-pulse" />
            </div>
        </div>
    </div>
);
