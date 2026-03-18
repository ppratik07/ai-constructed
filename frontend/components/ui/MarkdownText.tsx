import React from 'react';

function parseBold(text: string): React.ReactNode[] {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-slate-900">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

export default function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  const output: React.ReactNode[] = [];
  let listBuffer: React.ReactNode[] = [];

  function flushList(key: string) {
    if (listBuffer.length > 0) {
      output.push(
        <ul key={key} className="my-1.5 space-y-0.5 pl-5 list-disc">
          {listBuffer}
        </ul>
      );
      listBuffer = [];
    }
  }

  lines.forEach((line, i) => {
    const key = `l${i}`;

    // Headings: ## ### ####
    const headMatch = line.match(/^(#{2,4}) (.+)/);
    if (headMatch) {
      flushList(key + 'u');
      const level = headMatch[1].length;
      output.push(
        <p
          key={key}
          className={
            level <= 2
              ? 'mt-4 mb-1 text-sm font-bold text-slate-800'
              : 'mt-3 mb-0.5 text-sm font-semibold text-slate-700'
          }
        >
          {parseBold(headMatch[2])}
        </p>
      );
      return;
    }

    // Numbered headings like "1. Room Layout" that appear at start of line
    const numberedHead = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*/);
    if (numberedHead) {
      flushList(key + 'u');
      output.push(
        <p key={key} className="mt-3 mb-0.5 text-sm font-semibold text-slate-700">
          {numberedHead[1]}. {numberedHead[2]}
        </p>
      );
      return;
    }

    // List items
    if (line.startsWith('- ') || line.startsWith('* ')) {
      listBuffer.push(
        <li key={key} className="text-sm text-slate-700 leading-relaxed">
          {parseBold(line.slice(2))}
        </li>
      );
      return;
    }

    // Empty line → flush list + spacing
    if (!line.trim()) {
      flushList(key + 'u');
      return;
    }

    // Normal paragraph
    flushList(key + 'u');
    output.push(
      <p key={key} className="text-sm text-slate-700 leading-relaxed">
        {parseBold(line)}
      </p>
    );
  });

  flushList('end');
  return <div className="space-y-1">{output}</div>;
}
