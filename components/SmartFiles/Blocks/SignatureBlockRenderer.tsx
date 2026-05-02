'use client';
import React from 'react';
import type { SignatureBlockContent, SfTheme } from '@/lib/smartFiles/types';

interface Props {
  content: SignatureBlockContent;
  theme: SfTheme;
  mode: 'editor' | 'viewer';
}

export default function SignatureBlockRenderer({ content, theme, mode }: Props) {
  if (mode === 'editor') {
    return (
      <div className="px-2 py-2">
        <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {content.role === 'provider' ? 'Provider Signature' : 'Client Signature'}
          </div>
          <div className="h-16 bg-white border border-gray-200 rounded flex items-end px-3 pb-1">
            <span className="font-signature text-2xl text-gray-200 italic">Signature</span>
          </div>
          <div className="mt-2 flex gap-4">
            <div className="flex-1">
              <div className="h-px bg-gray-300 mb-1" />
              <div className="text-xs text-gray-400">{content.signerName ?? (content.role === 'provider' ? 'Provider Name' : 'Client Name')}</div>
            </div>
            <div>
              <div className="h-px bg-gray-300 mb-1" />
              <div className="text-xs text-gray-400">Date</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // In viewer mode, the actual signature capture is handled by the SignaturePanel in the viewer page
  return (
    <div className="py-4">
      <div className="border border-gray-200 rounded-xl p-5 text-center text-sm text-gray-500">
        <div className="text-base font-semibold mb-1" style={{ color: theme.primaryColor }}>{content.label}</div>
        <div className="text-xs text-gray-400">Signature block — complete at the end of this document</div>
      </div>
    </div>
  );
}
