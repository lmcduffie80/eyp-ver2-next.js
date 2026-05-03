'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';

interface SignaturePadProps {
  onSave: (dataUrl: string | null, typedName: string) => void;
  signerName?: string;
  signerEmail?: string;
  primaryColor?: string;
  accentColor?: string;
}

export default function SignaturePad({ onSave, signerName = '', signerEmail = '', primaryColor = '#1a1a1a', accentColor = '#3b82f6' }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [typedName, setTypedName] = useState(signerName);
  const [name, setName] = useState(signerName);
  const [email, setEmail] = useState(signerEmail);
  const [agreed, setAgreed] = useState(false);
  const [tab, setTab] = useState<'draw' | 'type'>('draw');
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const getCtx = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  };

  const getPoint = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = getCtx();
    if (!ctx) return;
    const pt = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
    lastPoint.current = pt;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const ctx = getCtx();
    if (!ctx || !lastPoint.current) return;
    const pt = getPoint(e);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = primaryColor;

    // Smooth curve through points
    ctx.quadraticCurveTo(
      lastPoint.current.x, lastPoint.current.y,
      (pt.x + lastPoint.current.x) / 2,
      (pt.y + lastPoint.current.y) / 2
    );
    ctx.stroke();
    lastPoint.current = pt;
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPoint.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSubmit = () => {
    if (!name.trim() || !agreed) return;

    if (tab === 'draw') {
      if (!hasDrawn) { alert('Please draw your signature.'); return; }
      const canvas = canvasRef.current;
      const dataUrl = canvas?.toDataURL('image/png') ?? null;
      onSave(dataUrl, name);
    } else {
      onSave(null, name);
    }
  };

  const renderTypedSig = () => {
    const ctx = getCtx();
    if (!ctx || !canvasRef.current) return;
    const canvas = canvasRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'italic 36px Georgia, serif';
    ctx.fillStyle = primaryColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName || 'Your Name', canvas.width / 2, canvas.height / 2);
  };

  useEffect(() => {
    if (tab === 'type') renderTypedSig();
    else clear();
  }, [tab, typedName]);

  const canSubmit = name.trim() && agreed && (tab === 'draw' ? hasDrawn : typedName.trim());

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-1" style={{ color: primaryColor }}>Sign Contract</h2>
      <p className="text-sm text-gray-500 mb-5">Review and sign below to complete your agreement with Externally Yours Productions, LLC.</p>

      {/* Signer info */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Jane Smith" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="jane@example.com" />
        </div>
      </div>

      {/* Signature method tabs */}
      <div className="flex gap-1 mb-3 bg-gray-100 p-1 rounded-lg w-fit">
        {(['draw', 'type'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'draw' ? 'Draw' : 'Type'}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50 mb-2">
        <canvas
          ref={canvasRef}
          width={600}
          height={160}
          className="w-full cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {tab === 'draw' && !hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-300 text-sm italic">Sign here</span>
          </div>
        )}
      </div>

      {tab === 'draw' ? (
        <button onClick={clear} className="text-xs text-gray-400 hover:text-gray-600 mb-4">Clear</button>
      ) : (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">Type your signature</label>
          <input type="text" value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder="Your name"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
      )}

      {/* Agreement */}
      <label className="flex items-start gap-2 text-sm cursor-pointer mb-5">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 rounded shrink-0" />
        <span className="text-gray-600">
          By {tab === 'draw' ? 'drawing my signature' : 'typing my name'}, I agree this constitutes my legal electronic signature under the E-SIGN Act and UETA.
          I have read and agree to the terms of this contract.
        </span>
      </label>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-colors disabled:opacity-40"
        style={{ backgroundColor: canSubmit ? accentColor : '#9ca3af' }}
      >
        Sign and Submit
      </button>
    </div>
  );
}
