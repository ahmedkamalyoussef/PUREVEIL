import React, { useState, useEffect } from 'react';
import { getImageUrl, DEFAULT_PLACEHOLDER } from '../utils/imageUrl';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallback?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallback = DEFAULT_PLACEHOLDER,
  alt = '',
  className = '',
  onError,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>(getImageUrl(src, fallback));

  useEffect(() => {
    setImgSrc(getImageUrl(src, fallback));
  }, [src, fallback]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    }
    if (onError) {
      onError(e);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};
