'use client';
import React from 'react';
import type { PaymentScheduleBlockContent, SfTheme } from '@/lib/smartFiles/types';

interface Props { content: PaymentScheduleBlockContent; theme: SfTheme; mode: 'editor' | 'viewer' }

export default function PaymentScheduleBlockRenderer({ content, theme }: Props) {
  const total = (content.schedule ?? []).reduce((s, item) => s + item.amountCents, 0);
  return (
    <div className="px-2 py-2">
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Payment Plan</span>
        </div>
        {(content.schedule ?? []).map((item, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0">
            <div className="text-sm font-medium" style={{ color: theme.primaryColor }}>{item.label}</div>
            <div className="text-right">
              <div className="font-semibold" style={{ color: theme.accentColor }}>
                ${(item.amountCents / 100).toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">+{item.dueDays} days from signing</div>
            </div>
          </div>
        ))}
        {total > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 font-semibold text-sm">
            <span>Total</span>
            <span style={{ color: theme.primaryColor }}>${(total / 100).toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
