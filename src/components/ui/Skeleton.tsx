import React from 'react';
import './Skeleton.css';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  radius?: 'sm' | 'md' | 'lg' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = '100%', height = '1em', radius = 'sm', className = '', style, ...props }) => {
  const customStyle = {
    ...style,
    width,
    height,
    borderRadius: radius === 'full' ? '9999px' : `var(--radius-${radius})`,
  };
  return <div className={`skeleton ${className}`} style={customStyle} {...props} />;
};
