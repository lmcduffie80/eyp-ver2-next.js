"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    _HB_?: any;
    HoneyBook?: any;
    HB?: any;
  }
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modal: React.CSSProperties = {
  background: "#fff",
  width: "100%",
  maxWidth: "900px",
  height: "80vh",
  borderRadius: "8px",
  padding: "1rem",
  position: "relative",
  overflow: "auto",
};

const closeBtn: React.CSSProperties = {
  position: "absolute",
  top: "10px",
  right: "12px",
  fontSize: "20px",
  background: "none",
  border: "none",
  cursor: "pointer",
};

export default function HoneyBookModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    
    // Initialize HoneyBook global object
    window._HB_ = window._HB_ || {};
    window._HB_.pid = '64f2adb3998a8300079826c0';
    
    // Try to initialize HoneyBook widgets
    setTimeout(() => {
      (window as any)?.HoneyBook?.init?.();
      (window as any)?.HB?.init?.();
      
      // Trigger resize event to help widget detect container
      window.dispatchEvent(new Event('resize'));
    }, 100);
  }, [open]);

  if (!open) return null;

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <button style={closeBtn} onClick={onClose}>
          ×
        </button>
        {/* HoneyBook will render into this div */}
        <div id="honeybook-widget-root" className="hb-p-64f2adb3998a8300079826c0-1" data-hb-pid="64f2adb3998a8300079826c0"></div>
        <img 
          height={1} 
          width={1} 
          style={{ display: 'none' }} 
          src="https://www.honeybook.com/p.png?pid=64f2adb3998a8300079826c0" 
          alt="" 
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
}

