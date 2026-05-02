'use client';
import React from 'react';
import type { TextBlockContent, SfTheme } from '@/lib/smartFiles/types';

interface Props { content: TextBlockContent; theme: SfTheme; mode: 'editor' | 'viewer' }

export default function TextBlock({ content, theme, mode }: Props) {
  const align = content.align ?? 'left';
  return (
    <div
      className={`px-2 py-1 text-sm leading-relaxed ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}
      style={{ color: theme.primaryColor, fontFamily: theme.bodyFont }}
      dangerouslySetInnerHTML={{ __html: content.html || (mode === 'editor' ? '<span style="color:#ccc;font-style:italic">Text content…</span>' : '') }}
    />
  );
}
