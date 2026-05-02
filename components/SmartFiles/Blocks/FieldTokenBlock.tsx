'use client';
import React from 'react';
import type { FieldTokenBlockContent, SfTheme, SfField } from '@/lib/smartFiles/types';

interface Props {
  content: FieldTokenBlockContent;
  theme: SfTheme;
  fields: SfField[];
  mode: 'editor' | 'viewer';
  onFieldChange?: (key: string, value: string) => void;
}

export default function FieldTokenBlock({ content, theme, fields, mode, onFieldChange }: Props) {
  const field = fields.find((f) => f.key === content.fieldKey);
  const value = field?.value ?? '';

  if (mode === 'editor') {
    return (
      <div className="px-2 py-1">
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium border"
          style={{ backgroundColor: theme.accentColor + '18', borderColor: theme.accentColor + '40', color: theme.accentColor }}
        >
          <span className="opacity-60 text-xs">[ ]</span>
          {content.label}
          {content.required && <span className="text-red-400">*</span>}
        </span>
      </div>
    );
  }

  // Viewer — editable input
  return (
    <div className="py-2">
      <label className="block text-sm font-medium mb-1" style={{ color: theme.primaryColor }}>
        {content.label}{content.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={content.fieldType === 'date' ? 'date' : content.fieldType === 'email' ? 'email' : content.fieldType === 'phone' ? 'tel' : 'text'}
        value={value}
        onChange={(e) => onFieldChange?.(content.fieldKey, e.target.value)}
        required={content.required}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
        style={{ '--tw-ring-color': theme.accentColor } as React.CSSProperties}
      />
    </div>
  );
}
