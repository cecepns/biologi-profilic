import React, { useState, useEffect } from 'react';
import { ImageOff, User } from 'lucide-react';

export const UserAvatar = ({
  src,
  alt = 'Avatar Pengguna',
  size = 'md',
  className = '',
  iconClassName = '',
}) => {
  const [imgError, setImgError] = useState(false);

  // Reset error state if src changes
  useEffect(() => {
    setImgError(false);
  }, [src]);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20',
  };

  const iconSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
  };

  const containerSize = sizeClasses[size] || sizeClasses.md;
  const currentIconSize = iconSizes[size] || 16;

  // Resolve API uploaded URL if needed
  const getFullUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
      return trimmed;
    }
    const apiBase = import.meta.env.VITE_API_URL || 'https://api.kingcreativestudio.my.id/biologi-proflic/api';
    const base = apiBase.replace(/\/api\/?$/, '');
    return `${base}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
  };

  const fullSrc = getFullUrl(src);

  if (!fullSrc || imgError) {
    return (
      <div
        className={`${containerSize} rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 select-none overflow-hidden ${className}`}
        title={alt || 'Foto Profil (Kosong)'}
      >
        <ImageOff size={currentIconSize} className={`text-slate-400 ${iconClassName}`} />
      </div>
    );
  }

  return (
    <img
      src={fullSrc}
      alt={alt}
      onError={() => setImgError(true)}
      className={`${containerSize} rounded-full object-cover border border-slate-200 shrink-0 ${className}`}
    />
  );
};
