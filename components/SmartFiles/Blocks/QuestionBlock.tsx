'use client';
import React from 'react';
import type { QuestionBlockContent, SfTheme } from '@/lib/smartFiles/types';

interface Props {
  content: QuestionBlockContent;
  theme: SfTheme;
  mode: 'editor' | 'viewer';
  onFieldChange?: (key: string, value: string) => void;
}

export default function QuestionBlock({ content, theme, mode, onFieldChange }: Props) {
  if (mode === 'editor') {
    return (
      <div className="px-2 py-2">
        <div className="border border-dashed border-gray-200 rounded-lg p-3 bg-gray-50">
          <div className="text-sm font-medium text-gray-700 mb-1">
            {content.label}{content.required && <span className="text-red-400 ml-1">*</span>}
          </div>
          <div className="h-8 bg-white border border-gray-200 rounded text-xs flex items-center px-2 text-gray-300 italic">
            {content.inputType === 'textarea' ? 'Long answer…' : 'Short answer…'}
          </div>
          {content.hint && <p className="text-xs text-gray-400 mt-1">{content.hint}</p>}
        </div>
      </div>
    );
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300";

  return (
    <div className="py-3">
      <label className="block text-sm font-medium mb-1.5" style={{ color: theme.primaryColor }}>
        {content.label}{content.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {content.hint && <p className="text-xs text-gray-500 mb-2">{content.hint}</p>}
      {content.inputType === 'textarea' ? (
        <textarea
          rows={4}
          required={content.required}
          onChange={(e) => onFieldChange?.(content.questionKey, e.target.value)}
          className={inputClass}
        />
      ) : content.inputType === 'select' && content.options ? (
        <select required={content.required} onChange={(e) => onFieldChange?.(content.questionKey, e.target.value)} className={inputClass}>
          <option value="">Select…</option>
          {content.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : content.inputType === 'checkbox' ? (
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" required={content.required} onChange={(e) => onFieldChange?.(content.questionKey, String(e.target.checked))} className="rounded" />
          {content.label}
        </label>
      ) : (
        <input type="text" required={content.required} onChange={(e) => onFieldChange?.(content.questionKey, e.target.value)} className={inputClass} />
      )}
    </div>
  );
}
