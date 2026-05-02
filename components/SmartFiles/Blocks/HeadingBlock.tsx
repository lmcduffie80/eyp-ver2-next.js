'use client';
import React from 'react';
import type { HeadingBlockContent, SfTheme } from '@/lib/smartFiles/types';

interface Props { content: HeadingBlockContent; theme: SfTheme; mode: 'editor' | 'viewer' }

export default function HeadingBlock({ content, theme, mode }: Props) {
  const align = content.align ?? 'left';
  const baseClass = `font-bold leading-tight ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`;

  const Tag = content.level === 1 ? 'h1' : content.level === 2 ? 'h2' : 'h3';
  const sizeClass = content.level === 1 ? 'text-3xl' : content.level === 2 ? 'text-2xl' : 'text-xl';

  return (
    <div className="px-2 py-1">
      <Tag
        className={`${baseClass} ${sizeClass}`}
        style={{ color: theme.primaryColor, fontFamily: theme.headingFont }}
      >
        {content.text || (mode === 'editor' ? <span className="text-gray-300 italic">Heading text…</span> : null)}
      </Tag>
    </div>
  );
}
