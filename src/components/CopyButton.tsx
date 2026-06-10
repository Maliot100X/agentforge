"use client";
import { useState } from "react";

export default function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={copy}
      style={{
        position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
        background: "#00ff8820", border: "1px solid #00ff8840", color: "#00ff88",
        borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {copied ? "✓" : "Copy"}
    </button>
  );
}
