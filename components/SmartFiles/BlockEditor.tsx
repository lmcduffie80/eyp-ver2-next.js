'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { SfBlock, SfBlockType, SfTheme, SfField } from '@/lib/smartFiles/types';

interface BlockEditorProps {
  block: SfBlock;
  theme: SfTheme;
  fields: SfField[];
  onSave: (blockId: number, content: unknown) => Promise<void>;
  onDelete: (blockId: number) => Promise<void>;
  onClose: () => void;
}

type FieldKey = string;

function getDefaultContent(blockType: SfBlockType): Record<string, unknown> {
  const defaults: Partial<Record<SfBlockType, Record<string, unknown>>> = {
    heading: { text: '', level: 2, align: 'left' },
    text: { html: '', align: 'left' },
    package_card: { name: '', price: 0, description: '', features: [] },
    field_token: { fieldKey: '', label: '', fieldType: 'text', required: false },
    question: { questionKey: '', label: '', inputType: 'text', required: false },
    signature_block: { role: 'client', label: 'Signature' },
    image: { url: '', alt: '', align: 'center' },
    spacer: { height: 32 },
    divider: { style: 'solid' },
    company_header: {
      companyName: 'Externally Yours Productions, LLC',
      phone: '(229) 326-5408',
      email: 'lee@externallyyyoursproductions.com',
      address: '181 Cedar Ridge Rd, Tifton, GA 31794',
      website: 'www.externallyyyoursproductions.com',
      align: 'center',
    },
    invoice_line: { description: '', quantity: 1, unitPrice: 0 },
    payment_schedule: { schedule: [] },
  };
  return defaults[blockType] ?? {};
}

export default function BlockEditor({ block, theme, fields, onSave, onDelete, onClose }: BlockEditorProps) {
  const [content, setContent] = useState<Record<string, unknown>>(() => {
    try {
      return typeof block.content === 'object' ? (block.content as Record<string, unknown>) : {};
    } catch {
      return getDefaultContent(block.blockType);
    }
  });
  const [saving, setSaving] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const set = (key: string, value: unknown) => setContent((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(block.id, content);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300";
  const labelClass = "block text-xs font-medium text-gray-500 mb-1";

  const renderFields = () => {
    const bt = block.blockType;

    if (bt === 'heading') return (
      <>
        <div>
          <label className={labelClass}>Text</label>
          <input type="text" className={inputClass} value={String(content.text ?? '')} onChange={(e) => set('text', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Level</label>
          <select className={inputClass} value={String(content.level ?? 2)} onChange={(e) => set('level', Number(e.target.value))}>
            <option value="1">H1</option><option value="2">H2</option><option value="3">H3</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Align</label>
          <select className={inputClass} value={String(content.align ?? 'left')} onChange={(e) => set('align', e.target.value)}>
            <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
          </select>
        </div>
      </>
    );

    if (bt === 'text') return (
      <>
        <div>
          <label className={labelClass}>Content (HTML)</label>
          <textarea rows={6} className={inputClass + ' font-mono text-xs'} value={String(content.html ?? '')} onChange={(e) => set('html', e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Align</label>
          <select className={inputClass} value={String(content.align ?? 'left')} onChange={(e) => set('align', e.target.value)}>
            <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
          </select>
        </div>
      </>
    );

    if (bt === 'package_card') return (
      <>
        <div><label className={labelClass}>Package Name</label><input type="text" className={inputClass} value={String(content.name ?? '')} onChange={(e) => set('name', e.target.value)} /></div>
        <div><label className={labelClass}>Price ($)</label><input type="number" className={inputClass} value={Number(content.price ?? 0)} onChange={(e) => set('price', Number(e.target.value))} /></div>
        <div><label className={labelClass}>Description</label><textarea rows={3} className={inputClass} value={String(content.description ?? '')} onChange={(e) => set('description', e.target.value)} /></div>
        <div>
          <label className={labelClass}>Features (one per line)</label>
          <textarea rows={4} className={inputClass} value={(content.features as string[] ?? []).join('\n')} onChange={(e) => set('features', e.target.value.split('\n'))} />
        </div>
        <div><label className={labelClass}>Note / Footnote</label><input type="text" className={inputClass} value={String(content.note ?? '')} onChange={(e) => set('note', e.target.value)} /></div>
      </>
    );

    if (bt === 'field_token') return (
      <>
        <div>
          <label className={labelClass}>Field Key</label>
          <select className={inputClass} value={String(content.fieldKey ?? '')} onChange={(e) => set('fieldKey', e.target.value)}>
            <option value="">— Select field —</option>
            {fields.map((f) => <option key={f.key} value={f.key}>{f.label} ({f.key})</option>)}
          </select>
        </div>
        <div><label className={labelClass}>Label Override</label><input type="text" className={inputClass} value={String(content.label ?? '')} onChange={(e) => set('label', e.target.value)} /></div>
        <div>
          <label className={labelClass}>Field Type</label>
          <select className={inputClass} value={String(content.fieldType ?? 'text')} onChange={(e) => set('fieldType', e.target.value)}>
            {['text','date','email','phone','currency'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={!!content.required} onChange={(e) => set('required', e.target.checked)} />
          Required
        </label>
      </>
    );

    if (bt === 'question') return (
      <>
        <div><label className={labelClass}>Question Key</label><input type="text" className={inputClass} value={String(content.questionKey ?? '')} onChange={(e) => set('questionKey', e.target.value)} placeholder="e.g. first_dance_song" /></div>
        <div><label className={labelClass}>Label</label><input type="text" className={inputClass} value={String(content.label ?? '')} onChange={(e) => set('label', e.target.value)} /></div>
        <div>
          <label className={labelClass}>Input Type</label>
          <select className={inputClass} value={String(content.inputType ?? 'text')} onChange={(e) => set('inputType', e.target.value)}>
            {['text','textarea','select','checkbox','radio'].map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div><label className={labelClass}>Hint / Subtext</label><input type="text" className={inputClass} value={String(content.hint ?? '')} onChange={(e) => set('hint', e.target.value)} /></div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={!!content.required} onChange={(e) => set('required', e.target.checked)} />
          Required
        </label>
      </>
    );

    if (bt === 'signature_block') return (
      <>
        <div>
          <label className={labelClass}>Role</label>
          <select className={inputClass} value={String(content.role ?? 'client')} onChange={(e) => set('role', e.target.value)}>
            <option value="provider">Provider (You)</option>
            <option value="client">Client</option>
          </select>
        </div>
        <div><label className={labelClass}>Label</label><input type="text" className={inputClass} value={String(content.label ?? 'Signature')} onChange={(e) => set('label', e.target.value)} /></div>
        <div><label className={labelClass}>Signer Name (pre-fill)</label><input type="text" className={inputClass} value={String(content.signerName ?? '')} onChange={(e) => set('signerName', e.target.value)} /></div>
      </>
    );

    if (bt === 'image') return (
      <>
        <div><label className={labelClass}>Image URL</label><input type="url" className={inputClass} value={String(content.url ?? '')} onChange={(e) => set('url', e.target.value)} /></div>
        <div><label className={labelClass}>Alt Text</label><input type="text" className={inputClass} value={String(content.alt ?? '')} onChange={(e) => set('alt', e.target.value)} /></div>
        <div><label className={labelClass}>Max Width (px)</label><input type="number" className={inputClass} value={Number(content.width ?? '')} onChange={(e) => set('width', e.target.value ? Number(e.target.value) : undefined)} /></div>
        <div>
          <label className={labelClass}>Align</label>
          <select className={inputClass} value={String(content.align ?? 'center')} onChange={(e) => set('align', e.target.value)}>
            <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
          </select>
        </div>
      </>
    );

    if (bt === 'spacer') return (
      <div><label className={labelClass}>Height (px)</label><input type="number" className={inputClass} value={Number(content.height ?? 32)} onChange={(e) => set('height', Number(e.target.value))} /></div>
    );

    if (bt === 'divider') return (
      <>
        <div>
          <label className={labelClass}>Style</label>
          <select className={inputClass} value={String(content.style ?? 'solid')} onChange={(e) => set('style', e.target.value)}>
            <option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option>
          </select>
        </div>
        <div><label className={labelClass}>Color (hex)</label><input type="color" className="h-9 w-full rounded border border-gray-200 cursor-pointer" value={String(content.color ?? '#e5e7eb')} onChange={(e) => set('color', e.target.value)} /></div>
      </>
    );

    if (bt === 'company_header') return (
      <>
        <div><label className={labelClass}>Company Name</label><input type="text" className={inputClass} value={String(content.companyName ?? '')} onChange={(e) => set('companyName', e.target.value)} /></div>
        <div><label className={labelClass}>Logo URL</label><input type="url" className={inputClass} value={String(content.logoUrl ?? '')} onChange={(e) => set('logoUrl', e.target.value)} /></div>
        <div><label className={labelClass}>Tagline</label><input type="text" className={inputClass} value={String(content.tagline ?? '')} onChange={(e) => set('tagline', e.target.value)} /></div>
        <div><label className={labelClass}>Phone</label><input type="tel" className={inputClass} value={String(content.phone ?? '')} onChange={(e) => set('phone', e.target.value)} /></div>
        <div><label className={labelClass}>Email</label><input type="email" className={inputClass} value={String(content.email ?? '')} onChange={(e) => set('email', e.target.value)} /></div>
        <div><label className={labelClass}>Address</label><input type="text" className={inputClass} value={String(content.address ?? '')} onChange={(e) => set('address', e.target.value)} /></div>
        <div><label className={labelClass}>Website</label><input type="url" className={inputClass} value={String(content.website ?? '')} onChange={(e) => set('website', e.target.value)} /></div>
        <div>
          <label className={labelClass}>Align</label>
          <select className={inputClass} value={String(content.align ?? 'center')} onChange={(e) => set('align', e.target.value)}>
            <option value="left">Left</option><option value="center">Center</option><option value="right">Right</option>
          </select>
        </div>
      </>
    );

    if (bt === 'invoice_line') return (
      <>
        <div><label className={labelClass}>Description</label><input type="text" className={inputClass} value={String(content.description ?? '')} onChange={(e) => set('description', e.target.value)} /></div>
        <div><label className={labelClass}>Quantity</label><input type="number" className={inputClass} value={Number(content.quantity ?? 1)} onChange={(e) => set('quantity', Number(e.target.value))} /></div>
        <div><label className={labelClass}>Unit Price ($)</label><input type="number" className={inputClass} value={Number(content.unitPrice ?? 0)} onChange={(e) => set('unitPrice', Number(e.target.value))} /></div>
        <div><label className={labelClass}>Note</label><input type="text" className={inputClass} value={String(content.note ?? '')} onChange={(e) => set('note', e.target.value)} /></div>
      </>
    );

    return <div className="text-sm text-gray-400">No editable fields for this block type.</div>;
  };

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-0 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4 overflow-y-auto max-h-screen"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-sm capitalize">{block.blockType.replace(/_/g, ' ')}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
      </div>

      <div className="space-y-3">
        {renderFields()}
      </div>

      <div className="mt-5 flex items-center gap-2 pt-4 border-t border-gray-100">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Block'}
        </button>
        <button
          onClick={() => { if (confirm('Delete this block?')) onDelete(block.id); }}
          className="px-3 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
