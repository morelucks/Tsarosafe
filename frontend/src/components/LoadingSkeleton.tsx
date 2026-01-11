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
                    className={`animate-pulse bg-gray-200 rounded ${className}`}
                />
            ))}
        </>
    );
};

export const CardSkeleton = () => (
    <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="ml-4 space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
        </div>
    </div>
);
