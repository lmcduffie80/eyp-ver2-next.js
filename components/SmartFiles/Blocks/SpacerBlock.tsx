'use client';
import React from 'react';
import type { SpacerBlockContent } from '@/lib/smartFiles/types';

interface Props { content: SpacerBlockContent; mode: 'editor' | 'viewer' }

export default function SpacerBlock({ content, mode }: Props) {
  const h = content.height ?? 32;
  if (mode === 'editor') {
    return (
      <div className="px-2 relative" style={{ height: h }}>
        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 border-t border-dashed border-gray-200 flex items-center justify-center">
          <span className="bg-white px-2 text-xs text-gray-300">{h}px spacer</span>
        </div>
      </div>
    );
  }
  return <div style={{ height: h }} />;
}
