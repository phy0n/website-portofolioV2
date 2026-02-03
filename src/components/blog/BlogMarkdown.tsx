'use client';

import React, { useMemo, useState } from 'react';
import { Copy, CopyCheck } from 'lucide-react';
import { createHeadingSlugger } from '@/lib/blog';

type MarkdownBlock =
  | { type: 'heading'; level: 2 | 3; text: string; id: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'code'; language: string | null; code: string }
  | { type: 'hr' };

const isSafeHref = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const renderInline = (value: string): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*|_[^_]+_)/;
  let remaining = value;
  let key = 0;

  while (remaining.length > 0) {
    const match = remaining.match(pattern);
    if (!match || match.index === undefined) {
      nodes.push(remaining);
      break;
    }

    const index = match.index;
    if (index > 0) {
      nodes.push(remaining.slice(0, index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(<strong key={`b-${key++}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code
          key={`c-${key++}`}
          className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[0.95em] text-white"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[')) {
      const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
      if (linkMatch) {
        const label = linkMatch[1];
        const href = linkMatch[2];
        if (isSafeHref(href)) {
          const external = !href.trim().startsWith('/');
          nodes.push(
            <a
              key={`l-${key++}`}
              href={href}
              target={external ? '_blank' : undefined}
              rel={external ? 'noreferrer noopener' : undefined}
              className="font-medium text-[var(--home-accent)] underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
            >
              {label}
            </a>
          );
        } else {
          nodes.push(token);
        }
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(<em key={`i-${key++}`}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('_') && token.endsWith('_')) {
      nodes.push(<em key={`u-${key++}`}>{token.slice(1, -1)}</em>);
    } else {
      nodes.push(token);
    }

    remaining = remaining.slice(index + token.length);
  }

  return nodes;
};

const parseBlocks = (content: string): MarkdownBlock[] => {
  const blocks: MarkdownBlock[] = [];
  const lines = content.split(/\r?\n/);
  const headingSlug = createHeadingSlugger();

  let inCodeBlock = false;
  let codeLanguage: string | null = null;
  let codeLines: string[] = [];
  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let quoteLines: string[] = [];

  const flushParagraph = () => {
    const text = paragraphLines.join(' ').trim();
    if (text) blocks.push({ type: 'paragraph', text });
    paragraphLines = [];
  };

  const flushList = () => {
    if (listItems.length > 0) blocks.push({ type: 'list', items: listItems });
    listItems = [];
  };

  const flushQuote = () => {
    const text = quoteLines.join('\n').trim();
    if (text) blocks.push({ type: 'quote', text });
    quoteLines = [];
  };

  const flushCode = () => {
    const code = codeLines.join('\n').replace(/\n+$/, '');
    blocks.push({ type: 'code', language: codeLanguage, code });
    codeLines = [];
    codeLanguage = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, '');
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (!inCodeBlock) {
        flushParagraph();
        flushList();
        flushQuote();
        inCodeBlock = true;
        codeLanguage = trimmed.slice(3).trim() || null;
        continue;
      }
      inCodeBlock = false;
      flushCode();
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(rawLine);
      continue;
    }

    if (trimmed === '---' || trimmed === '***') {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push({ type: 'hr' });
      continue;
    }

    const headingMatch = /^(#{2,3})\s+(.*)$/.exec(trimmed);
    if (headingMatch) {
      flushParagraph();
      flushList();
      flushQuote();
      const level = headingMatch[1].length === 2 ? 2 : 3;
      const text = headingMatch[2].trim();
      const id = headingSlug(text);
      blocks.push({ type: 'heading', level, text, id });
      continue;
    }

    const listMatch = /^[-*]\s+(.*)$/.exec(trimmed);
    if (listMatch) {
      flushParagraph();
      flushQuote();
      listItems.push(listMatch[1]);
      continue;
    }

    const quoteMatch = /^>\s?(.*)$/.exec(trimmed);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      quoteLines.push(quoteMatch[1]);
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    flushList();
    flushQuote();
    paragraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();
  flushQuote();

  return blocks;
};

export default function BlogMarkdown({
  content,
  enableCodeCopy = false,
}: {
  content: string;
  enableCodeCopy?: boolean;
}) {
  const blocks = useMemo(() => parseBlocks(content), [content]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          const base =
            block.level === 2
              ? 'text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold mt-10 xs:mt-12 sm:mt-14 text-white'
              : 'text-lg xs:text-xl sm:text-2xl font-bold mt-8 xs:mt-10 text-white';
          const HeadingTag = block.level === 2 ? 'h2' : 'h3';
          return (
            <HeadingTag
              key={`${block.type}-${block.id}-${index}`}
              id={block.id}
              className={`${base} scroll-mt-24`}
            >
              {block.text}
            </HeadingTag>
          );
        }

        if (block.type === 'paragraph') {
          return (
            <p
              key={`${block.type}-${index}`}
              className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed"
            >
              {renderInline(block.text)}
            </p>
          );
        }

        if (block.type === 'quote') {
          return (
            <blockquote
              key={`${block.type}-${index}`}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 xs:p-5 text-sm xs:text-base text-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
            >
              <div className="border-l-2 border-[var(--home-accent)] pl-4 leading-relaxed">
                {renderInline(block.text)}
              </div>
            </blockquote>
          );
        }

        if (block.type === 'list') {
          return (
            <ul
              key={`${block.type}-${index}`}
              className="space-y-2 pl-5 text-xs xs:text-sm sm:text-base text-gray-300"
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${block.type}-item-${index}-${itemIndex}`} className="list-disc">
                  {renderInline(item)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'hr') {
          return (
            <hr
              key={`${block.type}-${index}`}
              className="border-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent my-8"
            />
          );
        }

        if (block.type === 'code') {
          const copyable = enableCodeCopy && block.code.trim().length > 0;
          const showCopied = copiedIndex === index;
          return (
            <div
              key={`${block.type}-${index}`}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#07070b] shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] px-4 py-2">
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                  {block.language || 'code'}
                </div>
                {copyable && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(block.code);
                        setCopiedIndex(index);
                        window.setTimeout(() => setCopiedIndex(null), 1200);
                      } catch {
                        setCopiedIndex(null);
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition hover:border-white/30 hover:text-white"
                    aria-label="Copy code"
                  >
                    {showCopied ? (
                      <>
                        <CopyCheck className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>
                )}
              </div>
              <pre className="overflow-x-auto p-4 text-[10px] xs:text-xs sm:text-sm text-gray-200 hide-scrollbar">
                <code>{block.code}</code>
              </pre>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
