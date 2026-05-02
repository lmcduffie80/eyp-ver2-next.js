'use client';
import React from 'react';
import type { DividerBlockContent } from '@/lib/smartFiles/types';

interface Props { content: DividerBlockContent }

export default function DividerBlock({ content }: Props) {
  return (
    <div className="px-2 py-4">
      <hr style={{ borderStyle: content.style ?? 'solid', borderColor: content.color ?? '#e5e7eb', borderTopWidth: 1 }} />
    </div>
  );
}
