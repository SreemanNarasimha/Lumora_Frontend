import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './EditorialBanner.css';

interface EditorialBannerProps {
  imageSrc: string;
  overline: string;
  title: string;
  linkText: string;
  linkTo: string;
}

export const EditorialBanner: React.FC<EditorialBannerProps> = ({
  imageSrc,
  overline,
  title,
  linkText,
  linkTo
}) => {
  return (
    <div className="editorial-banner">
      <div className="editorial-banner-image-wrapper">
        <img src={imageSrc} alt={title} className="editorial-banner-image" />
      </div>
      <div className="editorial-banner-content">
        <span className="editorial-overline">{overline}</span>
        <h2 className="editorial-title">{title}</h2>
        <Link to={linkTo} className="editorial-link">
          {linkText} <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};
