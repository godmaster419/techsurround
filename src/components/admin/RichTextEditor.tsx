'use client';

import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Mark, mergeAttributes } from "@tiptap/core";

// Custom TipTap Extension for Font Sizes
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

const FontSize = Mark.create({
  name: "fontSize",
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
  addAttributes() {
    return {
      size: {
        default: null,
        parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, ""),
        renderHTML: (attributes) => {
          if (!attributes.size) {
            return {};
          }
          return {
            style: `font-size: ${attributes.size}`,
          };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        style: "font-size",
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },
  addCommands() {
    return {
      setFontSize:
        (size: string) =>
        ({ chain }) => {
          return chain().setMark(this.name, { size }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain().unsetMark(this.name).run();
        },
    };
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  height?: string;
  autoSaveTime?: string | null;
}

const FONT_SIZES = [
  { label: "Small (13px)", value: "13px" },
  { label: "Regular (16px)", value: "16px" },
  { label: "Medium (18px)", value: "18px" },
  { label: "Large (20px)", value: "20px" },
  { label: "Extra Large (24px)", value: "24px" },
  { label: "Heading (28px)", value: "28px" },
  { label: "Title (34px)", value: "34px" },
];

interface GrammarIssue {
  type: "grammar" | "spelling" | "readability" | "style";
  message: string;
  snippet?: string;
  suggestion?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Write your article content here...",
  height = "520px",
  autoSaveTime,
}: RichTextEditorProps) {
  const fileInputSingleRef = useRef<HTMLInputElement>(null);
  const fileInputDoubleRef = useRef<HTMLInputElement>(null);
  const fileInputTripleRef = useRef<HTMLInputElement>(null);
  const fileInputDistributedRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [currentFontSize, setCurrentFontSize] = useState("16px");

  // Grammar & Quality Assistant Panel
  const [showGrammarPanel, setShowGrammarPanel] = useState(false);
  const [grammarIssues, setGrammarIssues] = useState<GrammarIssue[]>([]);
  const [readabilityScore, setReadabilityScore] = useState<string>("Good");

  // Multi-image layout dropdown
  const [showImageMenu, setShowImageMenu] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
        link: false,
        underline: false,
      }),
      Underline,
      FontSize,
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-[var(--radius-lg)] my-4 max-w-full h-auto border border-border shadow-sm",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary font-medium underline underline-offset-2 cursor-pointer hover:text-primary-hover",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none p-5 text-foreground leading-relaxed min-h-full",
        spellcheck: "true",
        lang: "en",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      const text = editor.getText();
      setCharCount(text.length);
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      setWordCount(words);
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
      const text = editor.getText();
      setCharCount(text.length);
      setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
    }
  }, [content, editor]);

  // GRAMMAR & QUALITY CHECK LOGIC
  const runGrammarCheck = () => {
    if (!editor) return;
    const text = editor.getText();
    const issues: GrammarIssue[] = [];

    if (!text.trim()) {
      setGrammarIssues([{ type: "readability", message: "Please write some text before running grammar check." }]);
      setShowGrammarPanel(true);
      return;
    }

    // 1. Check repeated words (e.g., "the the", "is is")
    const repeatedWordRegex = /\b([a-zA-Z]+)\s+\1\b/gi;
    let match;
    while ((match = repeatedWordRegex.exec(text)) !== null) {
      issues.push({
        type: "grammar",
        message: `Repeated word found: "${match[0]}"`,
        snippet: match[0],
        suggestion: match[1],
      });
    }

    // 2. Common English Confusions
    const confusions = [
      { pattern: /\b(their)\s+(is|are|was|were)\b/gi, msg: 'Did you mean "there is/are"?', suggestion: "there" },
      { pattern: /\b(your)\s+(right|wrong|welcome|going|doing)\b/gi, msg: 'Did you mean "you\'re"?', suggestion: "you're" },
      { pattern: /\b(it's)\s+(color|size|name|features|camera|battery|screen|specs)\b/gi, msg: 'Possessive "its" does not have an apostrophe.', suggestion: "its" },
      { pattern: /\b(could|should|would)\s+of\b/gi, msg: 'Use "could/should/would have" instead of "of".', suggestion: "have" },
      { pattern: /\b(then)\s+(he|she|they|we|I)\s+(is|are)\s+better\b/gi, msg: 'For comparison, use "than".', suggestion: "than" },
      { pattern: /\ba\s+([aeiou][a-z]+)\b/gi, msg: 'Use "an" before vowel sounds.', suggestion: "an" },
    ];

    for (const item of confusions) {
      while ((match = item.pattern.exec(text)) !== null) {
        issues.push({
          type: "grammar",
          message: item.msg,
          snippet: match[0],
          suggestion: item.suggestion,
        });
      }
    }

    // 3. Capitalization after period check
    const capitalizationRegex = /\.\s+([a-z])/g;
    while ((match = capitalizationRegex.exec(text)) !== null) {
      issues.push({
        type: "grammar",
        message: `Sentence starts with lowercase letter: ". ${match[1]}"`,
        snippet: match[0],
        suggestion: `. ${match[1].toUpperCase()}`,
      });
    }

    // 4. Readability metric
    const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
    const words = text.trim().split(/\s+/).filter(Boolean).length || 1;
    const avgWordsPerSentence = Math.round(words / sentences);

    if (avgWordsPerSentence > 28) {
      issues.push({
        type: "readability",
        message: `Average sentence length is high (${avgWordsPerSentence} words/sentence). Consider breaking long sentences for easier reading.`,
      });
      setReadabilityScore("Needs Shorter Sentences");
    } else if (avgWordsPerSentence > 18) {
      setReadabilityScore("Standard (Good)");
    } else {
      setReadabilityScore("Very Easy to Read");
    }

    setGrammarIssues(issues);
    setShowGrammarPanel(true);
  };

  // JUMP TO EXACT ERROR LINE IN EDITOR & HIGHLIGHT
  const jumpToErrorInEditor = (snippet?: string) => {
    if (!editor || !snippet) return;
    const target = snippet.trim();
    const doc = editor.state.doc;
    let foundFrom = -1;
    let foundTo = -1;

    doc.descendants((node, pos) => {
      if (foundFrom !== -1) return false;
      if (node.isText && node.text) {
        const index = node.text.indexOf(target);
        if (index !== -1) {
          foundFrom = pos + index;
          foundTo = foundFrom + target.length;
          return false;
        }
      }
    });

    if (foundFrom !== -1 && foundTo !== -1) {
      editor.chain().focus().setTextSelection({ from: foundFrom, to: foundTo }).scrollIntoView().run();
    }
  };

  // 1-CLICK AUTO-FIX GRAMMAR ERROR IN EDITOR
  const autoFixErrorInEditor = (snippet?: string, suggestion?: string) => {
    if (!editor || !snippet || !suggestion) return;
    jumpToErrorInEditor(snippet);
    editor.chain().focus().insertContent(suggestion).run();
    setTimeout(() => {
      runGrammarCheck();
    }, 150);
  };

  // Upload helper for single or multiple images
  const uploadFiles = async (files: FileList | File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        urls.push(data.url);
      }
    }
    return urls;
  };

  // 1. Single Image Upload
  const handleSingleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const urls = await uploadFiles([file]);
      if (urls.length > 0) {
        editor?.chain().focus().setImage({ src: urls[0], alt: file.name }).run();
      }
    } catch (err) {
      alert("Image upload failed.");
    } finally {
      setUploading(false);
      if (fileInputSingleRef.current) fileInputSingleRef.current.value = "";
    }
  };

  // 2. 2-Images Side-by-Side Grid
  const handleDoubleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setShowImageMenu(false);
    try {
      const urls = await uploadFiles(Array.from(files).slice(0, 2));
      if (urls.length > 0) {
        const gridHtml = `
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 not-prose">
            ${urls
              .map(
                (url, i) => `
              <div class="rounded-xl overflow-hidden border border-border bg-surface p-1 shadow-sm">
                <img src="${url}" alt="Image ${i + 1}" class="w-full h-56 object-cover rounded-lg" />
              </div>
            `
              )
              .join("")}
          </div>
          <p></p>
        `;
        editor?.chain().focus().insertContent(gridHtml).run();
      }
    } catch (err) {
      alert("Multi-image upload failed.");
    } finally {
      setUploading(false);
      if (fileInputDoubleRef.current) fileInputDoubleRef.current.value = "";
    }
  };

  // 3. 3-Images Triple Comparison Grid
  const handleTripleImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setShowImageMenu(false);
    try {
      const urls = await uploadFiles(Array.from(files).slice(0, 3));
      if (urls.length > 0) {
        const gridHtml = `
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 not-prose">
            ${urls
              .map(
                (url, i) => `
              <div class="rounded-xl overflow-hidden border border-border bg-surface p-1 shadow-sm">
                <img src="${url}" alt="Image ${i + 1}" class="w-full h-44 object-cover rounded-lg" />
              </div>
            `
              )
              .join("")}
          </div>
          <p></p>
        `;
        editor?.chain().focus().insertContent(gridHtml).run();
      }
    } catch (err) {
      alert("3-Image upload failed.");
    } finally {
      setUploading(false);
      if (fileInputTripleRef.current) fileInputTripleRef.current.value = "";
    }
  };

  // 4. Distribute 3 Images across Top, Middle, and Bottom sections of the article
  const handleDistributed3Images = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setShowImageMenu(false);
    try {
      const urls = await uploadFiles(Array.from(files).slice(0, 3));
      if (urls.length > 0) {
        const url1 = urls[0];
        const url2 = urls[1] || urls[0];
        const url3 = urls[2] || urls[1] || urls[0];

        const distributedHtml = `
          <figure class="my-6 not-prose">
            <div class="rounded-2xl overflow-hidden border border-border bg-surface shadow-md">
              <img src="${url1}" alt="Overview Visual" class="w-full h-80 object-cover" />
            </div>
            <figcaption class="text-xs text-muted mt-2 text-center italic">Figure 1: Main Story Overview & Visual Highlights</figcaption>
          </figure>
          
          <p>Write your introductory overview, key announcements, and initial impressions here...</p>

          <h2>Key Innovations & Deep-Dive Features</h2>
          <p>Explain the core technology, architecture, user experience, and hardware specs in detail...</p>

          <figure class="my-6 not-prose">
            <div class="rounded-2xl overflow-hidden border border-border bg-surface shadow-md">
              <img src="${url2}" alt="Feature In-Depth" class="w-full h-72 object-cover" />
            </div>
            <figcaption class="text-xs text-muted mt-2 text-center italic">Figure 2: Performance Benchmarks & Key Capabilities</figcaption>
          </figure>

          <p>Compare with previous models, highlight real-world benefits, and discuss performance...</p>

          <h2>Final Verdict & Buying Recommendation</h2>
          <p>Summarize the key strengths, pricing value, and final recommendation for buyers...</p>

          <figure class="my-6 not-prose">
            <div class="rounded-2xl overflow-hidden border border-border bg-surface shadow-md">
              <img src="${url3}" alt="Conclusion Summary" class="w-full h-72 object-cover" />
            </div>
            <figcaption class="text-xs text-muted mt-2 text-center italic">Figure 3: Final Assessment & Comprehensive Summary</figcaption>
          </figure>
          <p></p>
        `;
        editor?.chain().focus().insertContent(distributedHtml).run();
      }
    } catch (err) {
      alert("Failed to distribute images.");
    } finally {
      setUploading(false);
      if (fileInputDistributedRef.current) fileInputDistributedRef.current.value = "";
    }
  };

  const handleFontSizeChange = (size: string) => {
    setCurrentFontSize(size);
    if (!size) {
      editor?.chain().focus().unsetFontSize().run();
    } else {
      editor?.chain().focus().setFontSize(size).run();
    }
  };

  const addImageUrl = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL (e.g., https://example.com):", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) return null;

  return (
    <div className="relative">
      {/* Hidden file inputs for Single, 2-Grid, 3-Grid, and 3-Distributed uploads */}
      <input
        type="file"
        ref={fileInputSingleRef}
        onChange={handleSingleImage}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputDoubleRef}
        onChange={handleDoubleImages}
        accept="image/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputTripleRef}
        onChange={handleTripleImages}
        accept="image/*"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputDistributedRef}
        onChange={handleDistributed3Images}
        accept="image/*"
        multiple
        className="hidden"
      />

      <div
        style={{ height }}
        className="border border-input-border rounded-[var(--radius-xl)] bg-input-bg flex flex-col overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm"
      >
        {/* 100% FIXED STATIONARY TOOLBAR */}
        <div className="shrink-0 flex flex-wrap items-center gap-1.5 p-2.5 bg-surface-elevated border-b border-border text-foreground select-none shadow-xs z-10">
          {/* Undo / Redo */}
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 text-xs font-semibold rounded hover:bg-surface-hover disabled:opacity-40"
            title="Undo"
          >
            ↩️
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 text-xs font-semibold rounded hover:bg-surface-hover disabled:opacity-40"
            title="Redo"
          >
            ↪️
          </button>

          <span className="w-[1px] h-5 bg-border mx-1" />

          {/* FONT SIZE SELECTOR */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted font-medium">Font:</span>
            <select
              value={currentFontSize}
              onChange={(e) => handleFontSizeChange(e.target.value)}
              className="px-2 py-1 text-xs font-semibold rounded bg-surface border border-border text-foreground cursor-pointer focus:outline-none"
              title="Font Size"
            >
              {FONT_SIZES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <span className="w-[1px] h-5 bg-border mx-1" />

          {/* Headings */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`px-2 py-1 text-xs font-medium rounded ${
              editor.isActive("paragraph") && !editor.isActive("heading")
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "hover:bg-surface-hover text-muted hover:text-foreground"
            }`}
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-2 py-1 text-xs font-bold rounded ${
              editor.isActive("heading", { level: 2 })
                ? "bg-primary text-primary-foreground shadow-xs"
                : "hover:bg-surface-hover text-muted hover:text-foreground"
            }`}
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-2 py-1 text-xs font-bold rounded ${
              editor.isActive("heading", { level: 3 })
                ? "bg-primary text-primary-foreground shadow-xs"
                : "hover:bg-surface-hover text-muted hover:text-foreground"
            }`}
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            className={`px-2 py-1 text-xs font-bold rounded ${
              editor.isActive("heading", { level: 4 })
                ? "bg-primary text-primary-foreground shadow-xs"
                : "hover:bg-surface-hover text-muted hover:text-foreground"
            }`}
          >
            H4
          </button>

          <span className="w-[1px] h-5 bg-border mx-1" />

          {/* Inline Styles */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1 text-xs font-extrabold rounded ${
              editor.isActive("bold") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
            }`}
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 text-xs italic font-serif rounded ${
              editor.isActive("italic") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
            }`}
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-2 py-1 text-xs underline rounded ${
              editor.isActive("underline") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
            }`}
            title="Underline"
          >
            U
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`px-2 py-1 text-xs line-through rounded ${
              editor.isActive("strike") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
            }`}
            title="Strikethrough"
          >
            S
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`px-2 py-1 text-xs font-mono rounded ${
              editor.isActive("code") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
            }`}
            title="Inline Code"
          >
            `code`
          </button>

          <span className="w-[1px] h-5 bg-border mx-1" />

          {/* Lists & Quotes */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-2 py-1 text-xs rounded ${
              editor.isActive("bulletList") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
            }`}
          >
            • List
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-2 py-1 text-xs rounded ${
              editor.isActive("orderedList") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
            }`}
          >
            1. List
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-2 py-1 text-xs rounded ${
              editor.isActive("blockquote") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
            }`}
          >
            &ldquo; Quote
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`px-2 py-1 text-xs rounded ${
              editor.isActive("codeBlock") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
            }`}
          >
            &lt;/&gt;
          </button>

          <span className="w-[1px] h-5 bg-border mx-1" />

          {/* Link */}
          <button
            type="button"
            onClick={setLink}
            className={`px-2 py-1 text-xs font-semibold rounded ${
              editor.isActive("link") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
            }`}
          >
            🔗 Link
          </button>

          {/* MULTI-IMAGE PROFESSIONAL LAYOUT MENU */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowImageMenu(!showImageMenu)}
              className="px-2.5 py-1 text-xs font-bold rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors flex items-center gap-1"
            >
              {uploading ? (
                <span className="animate-spin">⏳ Uploading...</span>
              ) : (
                <span>🖼️ Professional Image Placements (1-3) ▾</span>
              )}
            </button>

            {showImageMenu && (
              <div className="absolute top-full mt-1 left-0 w-72 bg-surface-elevated border border-border rounded-[var(--radius-lg)] shadow-xl py-2 z-40 animate-in fade-in">
                {/* 3 Images Distributed across 3 distinct article positions */}
                <button
                  type="button"
                  onClick={() => {
                    setShowImageMenu(false);
                    fileInputDistributedRef.current?.click();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-primary font-bold hover:bg-primary/10 flex flex-col gap-0.5 border-b border-border"
                >
                  <span className="flex items-center gap-1.5">
                    <span>📰</span> 3 Images in 3 Distinct Sections (Recommended)
                  </span>
                  <span className="text-[10px] text-muted font-normal">
                    Places 1 at Top (Hero), 1 in Middle (Specs), and 1 at Bottom (Verdict)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowImageMenu(false);
                    fileInputSingleRef.current?.click();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-foreground hover:bg-surface-hover flex items-center gap-2"
                >
                  <span>📷 1 Image (Single Full-width Hero)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowImageMenu(false);
                    fileInputDoubleRef.current?.click();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-foreground hover:bg-surface-hover flex items-center gap-2 border-t border-border-light"
                >
                  <span>👥 2 Images Grid (Side-by-Side Comparison)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowImageMenu(false);
                    fileInputTripleRef.current?.click();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-foreground hover:bg-surface-hover flex items-center gap-2 border-t border-border-light"
                >
                  <span>🖼️🖼️🖼️ 3 Images Gallery (3 Columns)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowImageMenu(false);
                    addImageUrl();
                  }}
                  className="w-full text-left px-3.5 py-2 text-xs text-muted hover:text-foreground hover:bg-surface-hover flex items-center gap-2 border-t border-border-light"
                >
                  <span>🌐 Insert Web Image URL</span>
                </button>
              </div>
            )}
          </div>

          <span className="w-[1px] h-5 bg-border mx-1" />

          {/* ENGLISH GRAMMAR & QUALITY CHECK BUTTON */}
          <button
            type="button"
            onClick={runGrammarCheck}
            className="px-2.5 py-1 text-xs font-bold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors flex items-center gap-1"
            title="Check English Grammar & Readability"
          >
            <span>✨ Grammar Check</span>
          </button>
        </div>

        {/* DEDICATED SCROLLABLE CONTENT VIEWPORT (TOOLBAR REMAINS FIXED AT TOP) */}
        <div className="flex-1 overflow-y-auto cursor-text bg-input-bg">
          <EditorContent editor={editor} />
        </div>

        {/* FOOTER BAR WITH WORD STATS & AUTOSAVE STATUS */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-surface border-t border-border-light text-xs text-muted">
          <div className="flex items-center gap-4">
            <span><strong>{wordCount}</strong> words</span>
            <span><strong>{charCount}</strong> characters</span>
            <span>Read time: <strong>{Math.max(1, Math.ceil(wordCount / 200))}</strong> min</span>
          </div>

          <div className="flex items-center gap-2">
            {autoSaveTime && (
              <span className="text-[11px] font-medium text-success flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                Auto-saved ({autoSaveTime})
              </span>
            )}
            <span className="text-[11px] text-muted font-mono">Spellcheck Active</span>
          </div>
        </div>
      </div>

      {/* GRAMMAR & QUALITY CHECK MODAL / SIDE PANEL */}
      {showGrammarPanel && (
        <div className="mt-3 p-4 bg-card-bg border border-card-border rounded-[var(--radius-xl)] shadow-md animate-in fade-in">
          <div className="flex items-center justify-between border-b border-border-light pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <h3 className="font-bold text-foreground text-sm">English Grammar & Content Report</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                Readability: {readabilityScore}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowGrammarPanel(false)}
              className="text-xs text-muted hover:text-foreground px-2 py-1 rounded"
            >
              ✕ Close
            </button>
          </div>

          {grammarIssues.length === 0 ? (
            <div className="p-3 bg-success/10 border border-success/20 rounded text-xs text-success font-medium flex items-center gap-2">
              <span>🎉</span>
              <span>Great job! No obvious grammatical errors or repeated words found. Your article is well-written!</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {grammarIssues.map((issue, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-surface hover:bg-surface-hover/70 transition-colors rounded-[var(--radius)] border border-border-light text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div
                    onClick={() => jumpToErrorInEditor(issue.snippet)}
                    className="cursor-pointer flex-1"
                    title="Click to jump to this word in the editor"
                  >
                    <span className="font-bold text-destructive mr-1.5">• {issue.message}</span>
                    {issue.snippet && (
                      <span className="text-muted block mt-1">
                        Found in text:{" "}
                        <code className="bg-destructive/10 text-destructive font-mono font-bold px-1.5 py-0.5 rounded border border-destructive/20 hover:bg-destructive/20">
                          {issue.snippet}
                        </code>{" "}
                        <span className="text-[11px] text-primary underline ml-1">📍 Jump to word</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {issue.snippet && (
                      <button
                        type="button"
                        onClick={() => jumpToErrorInEditor(issue.snippet)}
                        className="px-2.5 py-1 text-xs font-semibold rounded bg-surface border border-border hover:border-primary text-foreground transition-colors"
                      >
                        📍 Go to line
                      </button>
                    )}

                    {issue.suggestion && issue.snippet && (
                      <button
                        type="button"
                        onClick={() => autoFixErrorInEditor(issue.snippet, issue.suggestion)}
                        className="px-3 py-1 text-xs font-bold rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 transition-colors flex items-center gap-1"
                      >
                        <span>⚡ Fix: {issue.suggestion}</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

