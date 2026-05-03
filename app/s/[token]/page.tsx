'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import type { SfBlock, SfTheme, SfField, SfPage, SfSignature, SfInvoiceItem, SfPaymentSchedule } from '@/lib/smartFiles/types';
import BlockRenderer from '@/components/SmartFiles/Blocks/BlockRenderer';
import SignaturePad from '@/components/SmartFiles/SignaturePad';

// ─── Types returned from the public API ──────────────────────────────────────

interface PublicFile {
  id: number;
  title: string;
  status: string;
  theme: SfTheme;
  clientName?: string;
  clientEmail?: string;
  eventDate?: string;
  pages: Array<SfPage & { blocks: SfBlock[] }>;
  fields: SfField[];
  signatures: Pick<SfSignature, 'signerRole' | 'signerName' | 'status' | 'signedAt'>[];
  invoiceItems: SfInvoiceItem[];
  paymentSchedule: SfPaymentSchedule[];
  recipientEmail: string;
}

// ─── Email verification gate ─────────────────────────────────────────────────

function VerificationGate({ recipientEmail, onVerify }: { recipientEmail: string; onVerify: () => void }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (input.trim().toLowerCase() === recipientEmail.toLowerCase()) {
      onVerify();
    } else {
      setError('Email does not match. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full shadow-sm">
        <div className="mb-6">
          <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Verify your email</h2>
          <p className="text-sm text-gray-500 mt-1">Enter the email address this Smart File was sent to.</p>
        </div>
        <div className="space-y-4">
          <input
            type="email"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="your@email.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            autoFocus
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            onClick={submit}
            className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
          >
            Continue
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-4 text-center">Externally Yours Productions, LLC · (229) 326-5408</p>
      </div>
    </div>
  );
}

// ─── Pay button component ─────────────────────────────────────────────────────

const TIP_OPTIONS = [0, 1800, 2000, 2500];

const TIP_PRESETS = [0, 18, 20, 25];

function PayButton({ token, scheduleId, accentColor, amountCents }: { token: string; scheduleId: number; accentColor: string; amountCents: number }) {
  const [loading, setLoading] = useState(false);
  const [tipPct, setTipPct] = useState(0);
  const [customTip, setCustomTip] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [error, setError] = useState('');

  const tipAmountCents = showCustom
    ? Math.round((parseFloat(customTip || '0') * 100))
    : Math.round((amountCents * tipPct) / 100);

  const pay = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/smart-files/public/${token}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId, tipAmountCents }),
      });
      const data = await res.json();
      if (data.success && data.data.checkoutUrl) {
        window.location.href = data.data.checkoutUrl;
      } else {
        setError(data.error ?? 'Failed to start checkout');
        setLoading(false);
      }
    } catch {
      setError('Network error');
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 space-y-3">
      <div>
        <div className="text-xs text-gray-500 mb-1.5 font-medium">Add a tip?</div>
        <div className="flex gap-2 flex-wrap">
          {TIP_PRESETS.map((pct) => (
            <button
              key={pct}
              onClick={() => { setTipPct(pct); setShowCustom(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${!showCustom && tipPct === pct ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
            >
              {pct === 0 ? 'No tip' : `${pct}%`}
            </button>
          ))}
          <button
            onClick={() => { setShowCustom(true); setTipPct(0); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${showCustom ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
          >
            Custom
          </button>
        </div>
        {showCustom && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-gray-500">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={customTip}
              onChange={(e) => setCustomTip(e.target.value)}
              placeholder="0.00"
              className="border border-gray-200 rounded-lg px-2 py-1 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        )}
        {tipAmountCents > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            Total: ${((amountCents + tipAmountCents) / 100).toFixed(2)} (includes ${(tipAmountCents / 100).toFixed(2)} tip)
          </p>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        onClick={pay}
        disabled={loading}
        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
        style={{ backgroundColor: accentColor }}
      >
        {loading ? 'Redirecting to payment…' : `Pay $${((amountCents + tipAmountCents) / 100).toFixed(2)} →`}
      </button>
    </div>
  );
}

// ─── Main viewer ──────────────────────────────────────────────────────────────

export default function SmartFileViewer() {
  const params = useParams();
  const token = params?.token as string;

  const [file, setFile] = useState<PublicFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [fields, setFields] = useState<SfField[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [showSignature, setShowSignature] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signingError, setSigningError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchFile = useCallback(async () => {
    try {
      const res = await fetch(`/api/smart-files/public/${token}`);
      if (!res.ok) { setError('This link is invalid or has expired.'); return; }
      const data = await res.json();
      if (data.success) {
        setFile(data.data);
        setFields(data.data.fields ?? []);
        const clientSig = data.data.signatures?.find((s: any) => s.signerRole === 'client');
        if (clientSig?.status === 'signed') setSigned(true);
      } else {
        setError(data.error ?? 'File not found');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchFile(); }, [fetchFile]);

  // Check if already verified (session storage)
  useEffect(() => {
    const v = sessionStorage.getItem(`sf_verified_${token}`);
    if (v === '1') setVerified(true);
  }, [token]);

  const handleVerify = () => {
    sessionStorage.setItem(`sf_verified_${token}`, '1');
    setVerified(true);
  };

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) => prev.map((f) => f.key === key ? { ...f, value } : f));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/smart-files/public/${token}/answers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { [key]: { label: fields.find((f) => f.key === key)?.label ?? key, value } } }),
      });
    }, 800);
  };

  const handleAnswerChange = (questionKey: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionKey]: value }));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch(`/api/smart-files/public/${token}/answers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: { [questionKey]: value } }),
      });
    }, 800);
  };

  const handleSign = async (signaturePngUrl: string | null, typedName: string) => {
    if (!file) return;
    setSubmitting(true);
    setSigningError('');
    try {
      const contentToHash = JSON.stringify({ fileId: file.id, typedName, timestamp: Date.now() });
      const htmlSnapshotHash = await sha256(contentToHash);

      const res = await fetch(`/api/smart-files/public/${token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          typedName,
          signaturePngUrl,
          signerName: typedName,
          signerEmail: file.recipientEmail,
          htmlSnapshotHash,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSigned(true);
        setShowSignature(false);
      } else {
        setSigningError(data.error ?? 'Signature failed');
      }
    } catch {
      setSigningError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  async function sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading your Smart File…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Link not found</h2>
          <p className="text-sm text-gray-500">{error}</p>
          <p className="text-sm text-gray-400 mt-2">Contact Externally Yours Productions at (229) 326-5408</p>
        </div>
      </div>
    );
  }

  if (!file) return null;

  if (!verified) {
    return <VerificationGate recipientEmail={file.recipientEmail} onVerify={handleVerify} />;
  }

  const totalPages = file.pages.length;
  const page = file.pages[currentPage];
  const theme = file.theme;
  const isLastPage = currentPage === totalPages - 1;
  const clientSig = file.signatures.find((s) => s.signerRole === 'client');
  const providerSig = file.signatures.find((s) => s.signerRole === 'provider');

  const invoiceTotal = file.invoiceItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const schedTotal = file.paymentSchedule.reduce((s, i) => s + i.amountCents, 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundColor ?? '#f9fafb', fontFamily: theme.bodyFont }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <span className="font-semibold text-gray-900 text-sm">{file.title}</span>
            {file.clientName && <span className="text-gray-400 text-xs ml-2">· {file.clientName}</span>}
          </div>
          <div className="text-xs text-gray-400">
            Page {currentPage + 1} of {totalPages}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-gray-100">
          <div
            className="h-full transition-all"
            style={{ width: `${((currentPage + 1) / totalPages) * 100}%`, backgroundColor: theme.accentColor }}
          />
        </div>
      </div>

      {/* Signature success banner */}
      {signed && (
        <div className="bg-green-50 border-b border-green-200 text-green-700 text-sm text-center py-2 font-medium">
          ✓ You have signed this contract. A copy has been recorded.
        </div>
      )}

      {/* Page content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {page && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
            {page.blocks.map((block) => (
              <BlockRenderer
                key={block.id}
                block={block}
                theme={theme}
                fields={fields}
                mode="viewer"
                onFieldChange={handleFieldChange}
              />
            ))}

            {/* Invoice summary (shown on invoice page) */}
            {page.pageType === 'invoice' && file.invoiceItems.length > 0 && (
              <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 font-medium text-gray-600">Service</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Qty</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {file.invoiceItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="px-4 py-3">{item.description}</td>
                        <td className="px-4 py-3 text-right">{item.qty}</td>
                        <td className="px-4 py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">${(item.qty * item.unitPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="font-semibold bg-gray-50">
                      <td colSpan={3} className="px-4 py-3 text-right text-gray-700">Total</td>
                      <td className="px-4 py-3 text-right" style={{ color: theme.accentColor }}>${invoiceTotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Payment schedule (shown on payment page) */}
            {page.pageType === 'payment' && file.paymentSchedule.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold text-gray-900" style={{ fontFamily: theme.headingFont }}>Payment Plan</h3>
                {file.paymentSchedule.map((s) => (
                  <div key={s.id} className="border border-gray-100 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm" style={{ color: theme.primaryColor }}>{s.label}</div>
                        <div className="text-xs text-gray-500">Due {new Date(s.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold" style={{ color: theme.accentColor }}>${(s.amountCents / 100).toFixed(2)}</div>
                        <div className={`text-xs font-medium ${s.status === 'paid' ? 'text-green-600' : s.status === 'overdue' ? 'text-red-500' : 'text-gray-400'}`}>
                          {s.status === 'paid' ? '✓ Paid' : s.status === 'overdue' ? '! Overdue' : 'Pending'}
                        </div>
                      </div>
                    </div>
                    {s.status !== 'paid' && (
                      <PayButton token={token} scheduleId={s.id} accentColor={theme.accentColor} amountCents={s.amountCents} />
                    )}
                  </div>
                ))}
                <div className="flex justify-between font-semibold px-4 py-2 text-sm">
                  <span>Total</span>
                  <span>${(schedTotal / 100).toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Contract page — show signature status & sign button */}
            {page.pageType === 'contract' && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4" style={{ fontFamily: theme.headingFont }}>Signatures</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className={`rounded-xl border p-4 ${providerSig?.status === 'signed' ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                    <div className="text-xs font-medium text-gray-500 mb-2">Provider</div>
                    {providerSig?.status === 'signed' ? (
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{providerSig.signerName}</div>
                        <div className="text-xs text-green-600 mt-1">✓ Signed</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">Awaiting signature</div>
                    )}
                  </div>
                  <div className={`rounded-xl border p-4 ${clientSig?.status === 'signed' ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                    <div className="text-xs font-medium text-gray-500 mb-2">Client</div>
                    {clientSig?.status === 'signed' ? (
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{clientSig.signerName}</div>
                        <div className="text-xs text-green-600 mt-1">✓ Signed</div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">Your signature required</div>
                    )}
                  </div>
                </div>

                {!signed && !showSignature && (
                  <button
                    onClick={() => setShowSignature(true)}
                    className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-colors"
                    style={{ backgroundColor: theme.accentColor }}
                  >
                    Sign Contract
                  </button>
                )}

                {showSignature && !signed && (
                  <div className="mt-4">
                    <SignaturePad
                      onSave={handleSign}
                      signerName={file.clientName ?? ''}
                      signerEmail={file.recipientEmail}
                      primaryColor={theme.primaryColor}
                      accentColor={theme.accentColor}
                    />
                    {signingError && <p className="text-red-500 text-sm mt-2 text-center">{signingError}</p>}
                    {submitting && <p className="text-blue-500 text-sm mt-2 text-center">Submitting signature…</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-30 transition-colors"
          >
            ← Back
          </button>

          <div className="flex gap-1.5">
            {file.pages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i)}
                className="w-2.5 h-2.5 rounded-full transition-colors"
                style={{ backgroundColor: i === currentPage ? theme.accentColor : '#d1d5db' }}
              />
            ))}
          </div>

          {!isLastPage ? (
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: theme.accentColor }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors opacity-30 cursor-default"
              style={{ backgroundColor: theme.accentColor }}
              disabled
            >
              Done
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Externally Yours Productions, LLC · (229) 326-5408 · lee@externallyyyoursproductions.com
        </p>
      </div>
    </div>
  );
}
