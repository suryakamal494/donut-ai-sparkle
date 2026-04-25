// MathMarkdown — renders markdown with LaTeX math and mhchem chemistry notation
import React, { useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "katex/contrib/mhchem";
import { cn } from "@/lib/utils";

// Stable plugin arrays — created once, never recreated
const REMARK_PLUGINS = [remarkGfm, remarkMath] as any[];
const REHYPE_PLUGINS = [[rehypeKatex, { throwOnError: false, strict: false }]] as any[];

function normalizeMathDelimiters(text: string): string {
  // Convert \[...\] → $$...$$ and \(...\) → $...$
  let result = text.replace(/\\\[([\s\S]*?)\\\]/g, "$$$$1$$");
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, "$$$1$");
  result = result.replace(/\\\$/g, "$ ");
  result = result.replace(/\$\s+/g, "$");
  result = result.replace(/\\pu\{/g, "\\pu{");
  result = result.replace(/(?<!\$)(\\pu\{[^}]+\})(?!\$)/g, "$$$1$");
  return result;
}

interface MathMarkdownProps {
  children: string;
  compact?: boolean;
  inline?: boolean;
  className?: string;
}

const MathMarkdown: React.FC<MathMarkdownProps> = ({
  children,
  compact = false,
  inline = false,
  className,
}) => {
  const normalized = useMemo(() => normalizeMathDelimiters(children), [children]);

  const Tag = inline ? "span" : "div";

  return (
    <Tag
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert",
        compact && "prose-p:my-1 prose-li:my-0.5 prose-headings:my-2",
        "[&_.katex]:text-[0.95em]",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={REHYPE_PLUGINS}
      >
        {normalized}
      </ReactMarkdown>
    </Tag>
  );
};

export default React.memo(MathMarkdown);