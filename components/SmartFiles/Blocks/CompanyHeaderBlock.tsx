'use client';
import React from 'react';
import type { CompanyHeaderBlockContent, SfTheme } from '@/lib/smartFiles/types';

interface Props { content: CompanyHeaderBlockContent; theme: SfTheme }

export default function CompanyHeaderBlock({ content, theme }: Props) {
  const align = content.align ?? 'center';
  const alignClass = align === 'center' ? 'items-center text-center' : align === 'right' ? 'items-end text-right' : 'items-start text-left';

  return (
    <div className={`px-2 py-4 flex flex-col gap-1 ${alignClass}`}>
      {content.logoUrl && (
        <img src={content.logoUrl} alt={content.companyName} className="h-16 object-contain mb-2" />
      )}
      <div className="font-bold text-xl" style={{ color: theme.primaryColor, fontFamily: theme.headingFont }}>
        {content.companyName}
      </div>
      {content.tagline && <div className="text-sm text-gray-500">{content.tagline}</div>}
      <div className="text-sm text-gray-500 flex flex-wrap gap-2 justify-center mt-1">
        {content.phone && <span>{content.phone}</span>}
        {content.email && <span>{content.email}</span>}
      </div>
      {content.address && <div className="text-xs text-gray-400">{content.address}</div>}
      {content.website && (
        <a href={content.website} target="_blank" rel="noreferrer" className="text-xs underline" style={{ color: theme.accentColor }}>
          {content.website.replace(/^https?:\/\//, '')}
        </a>
      )}
    </div>
  );
}
