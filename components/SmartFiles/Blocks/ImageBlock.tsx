'use client';
import React from 'react';
import Image from 'next/image';
import type { ImageBlockContent, SfTheme } from '@/lib/smartFiles/types';

interface Props { content: ImageBlockContent; theme: SfTheme; mode: 'editor' | 'viewer' }

export default function ImageBlock({ content, mode }: Props) {
  const align = content.align ?? 'center';
  const justifyClass = align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start';

  if (!content.url) {
    if (mode === 'editor') {
      return (
        <div className="px-2 py-2">
          <div className="border-2 border-dashed border-gray-200 rounded-lg h-32 flex items-center justify-center text-gray-300 text-sm">
            Image — set URL in block settings
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className={`px-2 py-2 flex ${justifyClass}`}>
      <img
        src={content.url}
        alt={content.alt ?? ''}
        style={{ maxWidth: content.width ? `${content.width}px` : '100%' }}
        className="rounded-lg max-h-80 object-contain"
      />
    </div>
  );
}
