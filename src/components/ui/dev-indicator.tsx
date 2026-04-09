'use client';

import { useState } from 'react';

interface Props {
  file: string;
  section?: string;
}

export function DevIndicator({ file, section }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const label = section ? `${file} → ${section}` : file;
  const short = file.replace('src/', '').replace('.tsx', '').replace('.ts', '');

  function handleCopy() {
    navigator.clipboard.writeText(label);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={() => {
        if (expanded) handleCopy();
        setExpanded((v) => !v);
      }}
      title={expanded ? 'Click to copy path' : 'Dev: show file path'}
      className="fixed bottom-2 left-2 z-[9999] flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono transition-all duration-200 opacity-20 hover:opacity-90 bg-black/60 text-gray-400 hover:text-brand-gold border border-transparent hover:border-brand-gold/30 backdrop-blur-sm max-w-[90vw] truncate"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-brand-gold/60 shrink-0" />
      {expanded ? (
        <span className="truncate">{copied ? 'Copied!' : label}</span>
      ) : (
        <span className="truncate">{short}</span>
      )}
    </button>
  );
}

export function SectionIndicator({ file, section }: Props) {
  return (
    <span
      title={`${file} → ${section}`}
      className="inline-block text-[7px] font-mono text-brand-gold/0 hover:text-brand-gold/50 transition-colors duration-300 cursor-default select-none ml-1"
    >
      [{section}]
    </span>
  );
}
