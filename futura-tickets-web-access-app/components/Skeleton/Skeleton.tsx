"use client";
import React from 'react';
import './Skeleton.scss';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    animation?: 'pulse' | 'wave' | 'none';
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width,
    height,
    variant = 'text',
    animation = 'wave',
    className = '',
}) => {
    const style: React.CSSProperties = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    return (
        <div
            className={`skeleton skeleton-${variant} skeleton-${animation} ${className}`}
            style={style}
        />
    );
};

// Pre-built skeleton layouts
export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
    return (
        <div className="skeleton-text-block">
            {Array.from({ length: lines }).map((_, index) => (
                <Skeleton
                    key={index}
                    width={index === lines - 1 ? '80%' : '100%'}
                    height={16}
                    variant="text"
                />
            ))}
        </div>
    );
};

export const SkeletonCard: React.FC = () => {
    return (
        <div className="skeleton-card">
            <Skeleton variant="rectangular" height={200} />
            <div className="skeleton-card-content">
                <Skeleton variant="text" height={24} width="60%" />
                <Skeleton variant="text" height={16} width="40%" />
                <SkeletonText lines={3} />
            </div>
        </div>
    );
};

export const SkeletonList: React.FC<{ items?: number }> = ({ items = 5 }) => {
    return (
        <div className="skeleton-list">
            {Array.from({ length: items }).map((_, index) => (
                <div key={index} className="skeleton-list-item">
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="skeleton-list-item-content">
                        <Skeleton variant="text" height={16} width="70%" />
                        <Skeleton variant="text" height={14} width="40%" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export const SkeletonAttendant: React.FC = () => {
    return (
        <div className="skeleton-attendant-item">
            <div className="skeleton-attendant-info">
                <Skeleton variant="text" height={16} width="150px" />
                <Skeleton variant="text" height={14} width="100px" />
            </div>
            <Skeleton variant="rounded" width={80} height={32} />
        </div>
    );
};

export const SkeletonAttendantsList: React.FC<{ count?: number }> = ({ count = 10 }) => {
    return (
        <div className="skeleton-attendants-list">
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonAttendant key={index} />
            ))}
        </div>
    );
};
