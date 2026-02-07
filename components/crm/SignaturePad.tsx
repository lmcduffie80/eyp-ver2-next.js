'use client';

import React, { useRef, useState, useEffect } from 'react';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  onClear?: () => void;
  width?: number;
  height?: number;
  penColor?: string;
  penWidth?: number;
}

export default function SignaturePad({
  onSave,
  onClear,
  width = 600,
  height = 200,
  penColor = '#000000',
  penWidth = 2
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Set drawing style
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [width, height, penColor, penWidth]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e 
      ? e.touches[0].clientX - rect.left 
      : e.clientX - rect.left;
    const y = 'touches' in e 
      ? e.touches[0].clientY - rect.top 
      : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e 
      ? e.touches[0].clientX - rect.left 
      : e.clientX - rect.left;
    const y = 'touches' in e 
      ? e.touches[0].clientY - rect.top 
      : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    
    if (onClear) {
      onClear();
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to PNG data URL
    const signatureData = canvas.toDataURL('image/png');
    onSave(signatureData);
  };

  return (
    <div className="signature-pad">
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <div className="placeholder">Sign here</div>
        )}
      </div>

      <div className="controls">
        <button
          type="button"
          onClick={clearSignature}
          className="clear-button"
          disabled={!hasSignature}
        >
          Clear
        </button>
        <button
          type="button"
          onClick={saveSignature}
          className="save-button"
          disabled={!hasSignature}
        >
          Save Signature
        </button>
      </div>

      <style jsx>{`
        .signature-pad {
          width: 100%;
        }

        .canvas-container {
          position: relative;
          width: 100%;
          max-width: ${width}px;
          margin: 0 auto;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          overflow: hidden;
        }

        canvas {
          display: block;
          width: 100%;
          height: ${height}px;
          cursor: crosshair;
          touch-action: none;
        }

        .placeholder {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #ccc;
          font-size: 1.5rem;
          font-style: italic;
          pointer-events: none;
          user-select: none;
        }

        .controls {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 20px;
        }

        .clear-button,
        .save-button {
          padding: 12px 30px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .clear-button {
          background: #fee;
          color: #dc2626;
        }

        .clear-button:hover:not(:disabled) {
          background: #dc2626;
          color: white;
        }

        .save-button {
          background: #ff6b35;
          color: white;
        }

        .save-button:hover:not(:disabled) {
          background: #e55a2b;
          transform: translateY(-2px);
        }

        .clear-button:disabled,
        .save-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .canvas-container {
            max-width: 100%;
          }

          canvas {
            height: 150px;
          }

          .placeholder {
            font-size: 1.2rem;
          }

          .controls {
            flex-direction: column;
          }

          .clear-button,
          .save-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
