"use client";

import React, { useState } from "react";
import HoneyBookModal from "./components/HoneyBookModal";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {children}
      <HoneyBookModal open={open} onClose={() => setOpen(false)} />
      {/* Expose global open helper */}
      <button id="open-honeybook" hidden onClick={() => setOpen(true)} />
    </>
  );
}

