'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  galleryTitle?: string;
}

export default function ImageLightbox({ images, currentIndex, isOpen, onClose, galleryTitle }: ImageLightboxProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex]);

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[activeIndex];
  if (!currentImage) return null;

  return (
    <div 
      className="lightbox-overlay"
      onClick={onClose}
    >
      <button 
        className="lightbox-close"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        ×
      </button>
      
      <button 
        className="lightbox-nav lightbox-prev"
        onClick={(e) => {
          e.stopPropagation();
          handlePrevious();
        }}
        aria-label="Previous image"
      >
        ‹
      </button>
      
      <button 
        className="lightbox-nav lightbox-next"
        onClick={(e) => {
          e.stopPropagation();
          handleNext();
        }}
        aria-label="Next image"
      >
        ›
      </button>

      <div 
        className="lightbox-content"
        onClick={(e) => e.stopPropagation()}
      >
        {galleryTitle && (
          <div className="lightbox-title">{galleryTitle}</div>
        )}
        <div className="lightbox-image-wrapper">
          <Image
            src={currentImage}
            alt={`Image ${activeIndex + 1} of ${images.length}`}
            fill
            className="lightbox-image"
            priority
            quality={95}
            sizes="90vw"
          />
        </div>
        <div className="lightbox-counter">
          {activeIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}

