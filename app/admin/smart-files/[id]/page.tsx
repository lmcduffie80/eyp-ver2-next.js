'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import type {
  SmartFileDetail,
  SfPage,
  SfBlock,
  SfField,
  SfSignature,
  SfInvoiceItem,
  SfPaymentSchedule,
  SfPageType,
  SfFileStatus,
} from '@/lib/smartFiles/types';

const PAGE_TYPE_ICONS: Record<SfPageType, string> = {
  cover: '📄',
  pricing: '💲',
  questionnaire: '📋',
  contract: '✍️',
  invoice: '🧾',
  payment: '💳',
};

const STATUS_OPTIONS: SfFileStatus[] = ['draft', 'sent', 'partial', 'completed', 'cancelled'];

export default function SmartFileDetailPage() {
  const params = useParams();
  const router = useRouter();
  const fileId = Number(params.id);

  const [file, setFile] = useState<SmartFileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<SfPage | null>(null);
  const [saving, setSaving] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareMsg, setShareMsg] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareResult, setShareResult] = useState<string>('');
  const [error, setError] = useState('');

  // Meta edit form
  const [editTitle, setEditTitle] = useState('');
  const [editClientName, setEditClientName] = useState('');
  const [editClientEmail, setEditClientEmail] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editStatus, setEditStatus] = useState<SfFileStatus>('draft');
  const [editNotes, setEditNotes] = useState('');

  // Add page
  const [addingPage, setAddingPage] = useState(false);
  const [newPageType, setNewPageType] = useState<SfPageType>('cover');
  const [newPageTitle, setNewPageTitle] = useState('');

  // Add block
  const [addingBlock, setAddingBlock] = useState(false);
  const [newBlockType, setNewBlockType] = useState('text');
  const [newBlockContent, setNewBlockContent] = useState('{}');

  // Invoice items
  const [newItem, setNewItem] = useState({ description: '', qty: 1, unitPrice: 0, taxRate: 0 });
  const [addingItem, setAddingItem] = useState(false);

  // Payment schedule
  const [newSched, setNewSched] = useState({ label: 'Deposit', amountCents: 25000, dueDate: '' });
  const [addingSched, setAddingSched] = useState(false);

  // Fields
  const [newField, setNewField] = useState({ key: '', label: '', value: '', fieldType: 'text' as SfField['fieldType'] });
  const [addingField, setAddingField] = useState(false);

  // Provider signature
  const [providerTypedName, setProviderTypedName] = useState('Lee McDuffie');
  const [providerEmail, setProviderEmail] = useState('lee@externallyyyoursproductions.com');
  const [signingProvider, setSigningProvider] = useState(false);

  const fetchFile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/smart-files/${fileId}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setFile(data.data);
        setEditTitle(data.data.title);
        setEditClientName(data.data.clientName ?? '');
        setEditClientEmail(data.data.clientEmail ?? '');
        setEditEventDate(data.data.eventDate ?? '');
        setEditStatus(data.data.status);
        setEditNotes(data.data.notes ?? '');
        if (!activePage && data.data.pages.length > 0) {
          setActivePage(data.data.pages[0]);
        }
      } else {
        setError(data.error ?? 'File not found');
      }
    } catch {
      setError('Failed to load file');
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => { fetchFile(); }, [fetchFile]);

  const saveMeta = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/smart-files/${fileId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          clientName: editClientName,
          clientEmail: editClientEmail,
          eventDate: editEventDate || undefined,
          status: editStatus,
          notes: editNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFile((prev) => prev ? { ...prev, ...data.data } : null);
      }
    } finally {
      setSaving(false);
    }
  };

  const addPage = async () => {
    const res = await fetch(`/api/smart-files/${fileId}/pages`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageType: newPageType, title: newPageTitle || undefined }),
    });
    const data = await res.json();
    if (data.success) {
      setAddingPage(false);
      setNewPageTitle('');
      fetchFile();
      setActivePage(data.data);
    }
  };

  const deletePage = async (pageId: number) => {
    if (!confirm('Delete this page?')) return;
    await fetch(`/api/smart-files/${fileId}/pages/${pageId}`, { method: 'DELETE', credentials: 'include' });
    fetchFile();
    setActivePage(null);
  };

  const addBlock = async () => {
    let parsed: unknown;
    try { parsed = JSON.parse(newBlockContent); } catch { setError('Invalid JSON for block content'); return; }
    const res = await fetch(`/api/smart-files/${fileId}/blocks`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId: activePage?.id, blockType: newBlockType, content: parsed }),
    });
    const data = await res.json();
    if (data.success) {
      setAddingBlock(false);
      setNewBlockContent('{}');
      fetchFile();
    }
  };

  const deleteBlock = async (blockId: number) => {
    if (!confirm('Delete this block?')) return;
    await fetch(`/api/smart-files/${fileId}/blocks/${blockId}`, { method: 'DELETE', credentials: 'include' });
    fetchFile();
  };

  const addField = async () => {
    if (!newField.key || !newField.label) return;
    await fetch(`/api/smart-files/${fileId}/fields`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newField),
    });
    setAddingField(false);
    setNewField({ key: '', label: '', value: '', fieldType: 'text' });
    fetchFile();
  };

  const addInvoiceItem = async () => {
    await fetch(`/api/smart-files/${fileId}/invoice-items`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    setAddingItem(false);
    setNewItem({ description: '', qty: 1, unitPrice: 0, taxRate: 0 });
    fetchFile();
  };

  const addScheduleItem = async () => {
    if (!newSched.dueDate) { setError('Due date required'); return; }
    await fetch(`/api/smart-files/${fileId}/payment-schedule`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSched),
    });
    setAddingSched(false);
    setNewSched({ label: 'Deposit', amountCents: 25000, dueDate: '' });
    fetchFile();
  };

  const signAsProvider = async () => {
    setSigningProvider(true);
    try {
      await fetch(`/api/smart-files/${fileId}/signatures`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signerRole: 'provider',
          signerName: providerTypedName,
          signerEmail: providerEmail,
          typedName: providerTypedName,
          status: 'signed',
        }),
      });
      fetchFile();
    } finally {
      setSigningProvider(false);
    }
  };

  const shareFile = async () => {
    if (!shareEmail) { setError('Enter recipient email'); return; }
    setSharing(true);
    try {
      const res = await fetch(`/api/smart-files/${fileId}/share`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: shareEmail,
          recipientName: file?.clientName,
          message: shareMsg,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShareResult(data.data.shareUrl);
        fetchFile();
      } else {
        setError(data.error ?? 'Share failed');
      }
    } finally {
      setSharing(false);
    }
  };

  const cloneAsTemplate = async () => {
    const title = prompt('Template name?', `${file?.title} (Template)`);
    if (!title) return;
    const res = await fetch(`/api/smart-files/${fileId}/clone`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, isTemplate: true }),
    });
    const data = await res.json();
    if (data.success) {
      alert('Template saved! You can now use it for new clients.');
      router.push('/admin/smart-files');
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading…</div>;
  if (!file) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">{error || 'File not found'}</div>;

  const activePageBlocks = file.pages.find((p) => p.id === activePage?.id)?.blocks ?? [];
  const invoiceTotal = file.invoiceItems.reduce((s, i) => s + i.qty * i.unitPrice * (1 + i.taxRate), 0);
  const scheduleTotal = file.paymentSchedule.reduce((s, i) => s + i.amountCents, 0);

  const providerSig = file.signatures.find((s) => s.signerRole === 'provider');
  const clientSig = file.signatures.find((s) => s.signerRole === 'client');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/admin/smart-files" className="text-gray-400 hover:text-gray-600 text-sm">← Smart Files</Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-900 max-w-xs truncate">{file.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            file.status === 'completed' ? 'bg-green-100 text-green-700' :
            file.status === 'sent' ? 'bg-blue-100 text-blue-700' :
            file.status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-600'
          }`}>{file.status.toUpperCase()}</span>
          <button
            onClick={cloneAsTemplate}
            className="text-sm border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Save as Template
          </button>
          <Link
            href={`/admin/smart-files/${fileId}/audit`}
            className="text-sm border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Audit Log
          </Link>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left sidebar — pages */}
        <aside className="w-52 bg-white border-r border-gray-200 flex flex-col p-3 gap-1 shrink-0">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">Pages</div>
          {file.pages.map((page) => (
            <div
              key={page.id}
              className={`group flex items-center justify-between rounded-lg px-2 py-2 cursor-pointer transition-colors text-sm ${
                activePage?.id === page.id ? 'bg-gray-900 text-white' : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={() => setActivePage(page)}
            >
              <span className="flex items-center gap-2 truncate">
                <span>{PAGE_TYPE_ICONS[page.pageType]}</span>
                <span className="truncate">{page.title}</span>
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                className={`opacity-0 group-hover:opacity-100 ml-1 text-xs ${activePage?.id === page.id ? 'text-gray-300 hover:text-white' : 'text-gray-400 hover:text-red-500'} transition-opacity`}
              >
                ✕
              </button>
            </div>
          ))}

          {addingPage ? (
            <div className="mt-2 space-y-2 px-1">
              <select
                value={newPageType}
                onChange={(e) => setNewPageType(e.target.value as SfPageType)}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs"
              >
                {(['cover','pricing','questionnaire','contract','invoice','payment'] as SfPageType[]).map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Page title (optional)"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs"
              />
              <div className="flex gap-1">
                <button onClick={addPage} className="flex-1 bg-gray-900 text-white text-xs py-1.5 rounded">Add</button>
                <button onClick={() => setAddingPage(false)} className="flex-1 text-xs border rounded py-1.5">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingPage(true)}
              className="mt-1 text-xs text-gray-500 hover:text-gray-800 px-2 py-1.5 rounded-lg hover:bg-gray-100 text-left transition-colors"
            >
              + Add page
            </button>
          )}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center justify-between">
                {error}
                <button onClick={() => setError('')}>✕</button>
              </div>
            )}

            {/* Meta section */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">File Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as SfFileStatus)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900">
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Client Name</label>
                  <input type="text" value={editClientName} onChange={(e) => setEditClientName(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Client Email</label>
                  <input type="email" value={editClientEmail} onChange={(e) => setEditClientEmail(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Event Date</label>
                  <input type="date" value={editEventDate} onChange={(e) => setEditEventDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                  <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
              </div>
              <button
                onClick={saveMeta}
                disabled={saving}
                className="mt-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : 'Save Details'}
              </button>
            </section>

            {/* Active page blocks */}
            {activePage && (
              <section className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">
                    {PAGE_TYPE_ICONS[activePage.pageType]} {activePage.title} — Blocks
                  </h2>
                  <button
                    onClick={() => setAddingBlock(true)}
                    className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    + Add Block
                  </button>
                </div>

                {activePageBlocks.length === 0 ? (
                  <p className="text-sm text-gray-400">No blocks on this page yet.</p>
                ) : (
                  <div className="space-y-2">
                    {activePageBlocks.map((block) => (
                      <div key={block.id} className="flex items-start justify-between gap-3 border border-gray-100 rounded-lg p-3 bg-gray-50">
                        <div className="min-w-0">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{block.blockType}</span>
                          <pre className="text-xs text-gray-700 mt-1 whitespace-pre-wrap break-all font-mono">
                            {JSON.stringify(block.content, null, 2)}
                          </pre>
                        </div>
                        <button onClick={() => deleteBlock(block.id)} className="text-red-400 hover:text-red-600 text-sm shrink-0">✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {addingBlock && (
                  <div className="mt-4 border border-gray-200 rounded-lg p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Block Type</label>
                      <select value={newBlockType} onChange={(e) => setNewBlockType(e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-2 text-sm">
                        {['heading','text','package_card','field_token','question','signature_block',
                          'invoice_line','payment_schedule','image','spacer','divider','company_header'].map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Content (JSON)</label>
                      <textarea
                        rows={5}
                        value={newBlockContent}
                        onChange={(e) => setNewBlockContent(e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-2 text-xs font-mono"
                        placeholder='{"text": "Hello world"}'
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={addBlock} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm">Add Block</button>
                      <button onClick={() => setAddingBlock(false)} className="text-sm text-gray-500">Cancel</button>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Fields */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Field Tokens</h2>
                <button onClick={() => setAddingField(true)}
                  className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                  + Add Field
                </button>
              </div>
              {file.fields.length === 0 ? (
                <p className="text-sm text-gray-400">No fields defined. Add fields to use in your contract (e.g. client name, venue).</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-xs font-medium text-gray-500">Key</th>
                        <th className="text-left py-2 text-xs font-medium text-gray-500">Label</th>
                        <th className="text-left py-2 text-xs font-medium text-gray-500">Type</th>
                        <th className="text-left py-2 text-xs font-medium text-gray-500">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {file.fields.map((f) => (
                        <tr key={f.id} className="border-b border-gray-50">
                          <td className="py-2 font-mono text-xs text-blue-600">{f.key}</td>
                          <td className="py-2">{f.label}</td>
                          <td className="py-2 text-gray-500">{f.fieldType}</td>
                          <td className="py-2 text-gray-700">{f.value ?? <span className="text-gray-300">—</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {addingField && (
                <div className="mt-4 border border-gray-200 rounded-lg p-4 grid grid-cols-2 gap-3">
                  {[
                    { key: 'key', label: 'Key (e.g. venue)', value: newField.key, onChange: (v: string) => setNewField((f) => ({...f, key: v})) },
                    { key: 'label', label: 'Label', value: newField.label, onChange: (v: string) => setNewField((f) => ({...f, label: v})) },
                    { key: 'value', label: 'Value', value: newField.value, onChange: (v: string) => setNewField((f) => ({...f, value: v})) },
                  ].map((item) => (
                    <div key={item.key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{item.label}</label>
                      <input type="text" value={item.value} onChange={(e) => item.onChange(e.target.value)}
                        className="w-full border border-gray-200 rounded px-2 py-2 text-sm" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                    <select value={newField.fieldType} onChange={(e) => setNewField((f) => ({...f, fieldType: e.target.value as SfField['fieldType']}))}
                      className="w-full border border-gray-200 rounded px-2 py-2 text-sm">
                      {['text','date','email','phone','currency','select'].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 flex gap-2">
                    <button onClick={addField} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm">Add Field</button>
                    <button onClick={() => setAddingField(false)} className="text-sm text-gray-500">Cancel</button>
                  </div>
                </div>
              )}
            </section>

            {/* Invoice Items */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Invoice Items</h2>
                <button onClick={() => setAddingItem(true)}
                  className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                  + Add Item
                </button>
              </div>
              {file.invoiceItems.length > 0 && (
                <div className="mb-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 text-xs font-medium text-gray-500">Description</th>
                        <th className="text-right py-2 text-xs font-medium text-gray-500">Qty</th>
                        <th className="text-right py-2 text-xs font-medium text-gray-500">Unit Price</th>
                        <th className="text-right py-2 text-xs font-medium text-gray-500">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {file.invoiceItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-50">
                          <td className="py-2">{item.description}</td>
                          <td className="py-2 text-right">{item.qty}</td>
                          <td className="py-2 text-right">${item.unitPrice.toFixed(2)}</td>
                          <td className="py-2 text-right">${(item.qty * item.unitPrice).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="font-semibold">
                        <td colSpan={3} className="py-2 text-right text-gray-600">Total</td>
                        <td className="py-2 text-right">${invoiceTotal.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {addingItem && (
                <div className="border border-gray-200 rounded-lg p-4 grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <input type="text" value={newItem.description} onChange={(e) => setNewItem((i) => ({...i, description: e.target.value}))}
                      className="w-full border border-gray-200 rounded px-2 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
                    <input type="number" value={newItem.qty} onChange={(e) => setNewItem((i) => ({...i, qty: Number(e.target.value)}))}
                      className="w-full border border-gray-200 rounded px-2 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Unit Price ($)</label>
                    <input type="number" value={newItem.unitPrice} onChange={(e) => setNewItem((i) => ({...i, unitPrice: Number(e.target.value)}))}
                      className="w-full border border-gray-200 rounded px-2 py-2 text-sm" />
                  </div>
                  <div className="col-span-2 flex gap-2">
                    <button onClick={addInvoiceItem} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm">Add Item</button>
                    <button onClick={() => setAddingItem(false)} className="text-sm text-gray-500">Cancel</button>
                  </div>
                </div>
              )}
            </section>

            {/* Payment Schedule */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Payment Schedule</h2>
                <button onClick={() => setAddingSched(true)}
                  className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                  + Add Payment
                </button>
              </div>
              {file.paymentSchedule.length > 0 && (
                <div className="space-y-2 mb-4">
                  {file.paymentSchedule.map((s) => (
                    <div key={s.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                      <div>
                        <span className="font-medium text-gray-900">{s.label}</span>
                        <span className="text-gray-500 ml-3">${(s.amountCents / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">{new Date(s.dueDate).toLocaleDateString()}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          s.status === 'paid' ? 'bg-green-100 text-green-700' :
                          s.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>{s.status}</span>
                      </div>
                    </div>
                  ))}
                  <div className="text-right text-sm font-semibold text-gray-700">
                    Total: ${(scheduleTotal / 100).toFixed(2)}
                  </div>
                </div>
              )}
              {addingSched && (
                <div className="border border-gray-200 rounded-lg p-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                    <input type="text" value={newSched.label} onChange={(e) => setNewSched((s) => ({...s, label: e.target.value}))}
                      className="w-full border border-gray-200 rounded px-2 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Amount ($)</label>
                    <input type="number" value={newSched.amountCents / 100}
                      onChange={(e) => setNewSched((s) => ({...s, amountCents: Math.round(Number(e.target.value) * 100)}))}
                      className="w-full border border-gray-200 rounded px-2 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                    <input type="date" value={newSched.dueDate} onChange={(e) => setNewSched((s) => ({...s, dueDate: e.target.value}))}
                      className="w-full border border-gray-200 rounded px-2 py-2 text-sm" />
                  </div>
                  <div className="col-span-2 flex gap-2">
                    <button onClick={addScheduleItem} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm">Add</button>
                    <button onClick={() => setAddingSched(false)} className="text-sm text-gray-500">Cancel</button>
                  </div>
                </div>
              )}
            </section>

            {/* Signatures */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Signatures</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {[{ role: 'provider', label: 'Provider (You)', sig: providerSig },
                  { role: 'client', label: 'Client', sig: clientSig }].map(({ role, label, sig }) => (
                  <div key={role} className={`border rounded-lg p-4 ${sig?.status === 'signed' ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                    <div className="text-sm font-medium text-gray-600 mb-2">{label}</div>
                    {sig?.status === 'signed' ? (
                      <div>
                        <div className="font-semibold text-gray-900">{sig.signerName}</div>
                        <div className="text-xs text-green-600 mt-1">✓ Signed {sig.signedAt ? new Date(sig.signedAt).toLocaleString() : ''}</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">Not yet signed</div>
                    )}
                  </div>
                ))}
              </div>

              {!providerSig?.status || providerSig.status === 'pending' ? (
                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">Sign as Provider</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Your Full Name</label>
                      <input type="text" value={providerTypedName} onChange={(e) => setProviderTypedName(e.target.value)}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Your Email</label>
                      <input type="email" value={providerEmail} onChange={(e) => setProviderEmail(e.target.value)}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    By clicking &ldquo;Sign&rdquo;, you agree that &ldquo;{providerTypedName}&rdquo; constitutes your legal electronic signature.
                  </p>
                  <button
                    onClick={signAsProvider}
                    disabled={signingProvider}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
                  >
                    {signingProvider ? 'Signing…' : 'Sign as Provider'}
                  </button>
                </div>
              ) : null}
            </section>

            {/* Share */}
            <section className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Send to Client</h2>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Client Email</label>
                  <input type="email" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)}
                    placeholder={file.clientEmail ?? 'client@example.com'}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Personal Message (optional)</label>
                  <textarea rows={2} value={shareMsg} onChange={(e) => setShareMsg(e.target.value)}
                    placeholder="Looking forward to working with you!"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                </div>
                <div>
                  <button
                    onClick={shareFile}
                    disabled={sharing}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {sharing ? 'Sending…' : 'Send Smart File'}
                  </button>
                </div>
                {shareResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-700 font-medium">Link sent!</p>
                    <p className="text-xs text-green-600 mt-1 break-all">{shareResult}</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
