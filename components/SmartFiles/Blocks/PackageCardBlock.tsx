'use client';
import React from 'react';
import type { PackageCardContent, SfTheme } from '@/lib/smartFiles/types';

interface Props { content: PackageCardContent; theme: SfTheme; mode: 'editor' | 'viewer' }

export default function PackageCardBlock({ content, theme }: Props) {
  const price = typeof content.price === 'number' ? content.price : 0;

  return (
    <div className="px-2 py-2">
      <div className="border border-gray-200 rounded-xl p-5 bg-white">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-bold text-lg" style={{ color: theme.primaryColor, fontFamily: theme.headingFont }}>
            {content.name || 'Package Name'}
          </h3>
          <div className="text-right shrink-0">
            <div className="font-bold text-xl" style={{ color: theme.accentColor }}>
              ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            {content.billingPeriod && content.billingPeriod !== 'one_time' && (
              <div className="text-xs text-gray-500">/{content.billingPeriod === 'weekly' ? 'week' : 'mo'}</div>
            )}
          </div>
        </div>
        {content.description && (
          <p className="text-sm text-gray-600 mb-3" style={{ fontFamily: theme.bodyFont }}>{content.description}</p>
        )}
        {content.features?.length > 0 && (
          <ul className="space-y-1">
            {content.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="mt-0.5 text-green-500 shrink-0">✓</span>
                {f}
              </li>
            ))}
          </ul>
        )}
        {content.note && (
          <p className="mt-3 text-xs text-gray-400 italic">{content.note}</p>
        )}
      </div>
    </div>
  );
}
