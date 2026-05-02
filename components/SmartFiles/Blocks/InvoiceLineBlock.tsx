'use client';
import React from 'react';
import type { InvoiceLineBlockContent, SfTheme } from '@/lib/smartFiles/types';

interface Props { content: InvoiceLineBlockContent; theme: SfTheme; mode: 'editor' | 'viewer' }

export default function InvoiceLineBlock({ content, theme }: Props) {
  const total = content.quantity * content.unitPrice * (1 + (content.taxRate ?? 0));
  return (
    <div className="px-2 py-2">
      <div className="border border-gray-100 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="font-semibold text-sm" style={{ color: theme.primaryColor }}>{content.description || 'Service'}</div>
            {content.note && <div className="text-xs text-gray-500 mt-0.5">{content.note}</div>}
          </div>
          <div className="text-right text-sm shrink-0">
            <div className="text-gray-500">{content.quantity} × ${content.unitPrice.toFixed(2)}</div>
            <div className="font-bold" style={{ color: theme.accentColor }}>${total.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
