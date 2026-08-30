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

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Write your article content here...",
  height = "520px",
  autoSaveTime,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [currentFontSize, setCurrentFontSize] = useState("16px");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
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
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      // Stats calculation
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

  if (!editor) return null;

  // Direct Image File Upload Handler
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to upload image.");
        setUploading(false);
        return;
      }

      // Insert uploaded image directly into TipTap editor
      editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Error uploading image. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFontSizeChange = (size: string) => {
    setCurrentFontSize(size);
    if (!size) {
      editor.chain().focus().unsetFontSize().run();
    } else {
      editor.chain().focus().setFontSize(size).run();
    }
  };

  const addImageUrl = () => {
    const url = window.prompt("Enter image URL (or use 'Upload Image' button for direct files):");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL (e.g., https://example.com):", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div
      style={{ height }}
      className="border border-input-border rounded-[var(--radius-xl)] bg-input-bg flex flex-col overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm"
    >
      {/* Hidden file input for direct image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileUpload}
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
      />

      {/* 100% FIXED STATIC TOOLBAR (NEVER SCROLLS) */}
      <div className="shrink-0 flex flex-wrap items-center gap-1.5 p-2.5 bg-surface-elevated border-b border-border text-foreground select-none shadow-xs z-10">
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 text-xs font-semibold rounded hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-transparent"
          title="Undo (Ctrl+Z)"
        >
          ↩️
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 text-xs font-semibold rounded hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-transparent"
          title="Redo (Ctrl+Y)"
        >
          ↪️
        </button>

        <span className="w-[1px] h-5 bg-border mx-1" />

        {/* FONT SIZE SELECTOR */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted font-medium">Size:</span>
          <select
            value={currentFontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            className="px-2 py-1 text-xs font-semibold rounded bg-surface border border-border text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
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
          className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
            editor.isActive("paragraph") && !editor.isActive("heading")
              ? "bg-primary text-primary-foreground font-bold shadow-xs"
              : "hover:bg-surface-hover text-muted hover:text-foreground"
          }`}
          title="Normal Text"
        >
          Normal
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-primary text-primary-foreground shadow-xs"
              : "hover:bg-surface-hover text-muted hover:text-foreground"
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-primary text-primary-foreground shadow-xs"
              : "hover:bg-surface-hover text-muted hover:text-foreground"
          }`}
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
            editor.isActive("heading", { level: 4 })
              ? "bg-primary text-primary-foreground shadow-xs"
              : "hover:bg-surface-hover text-muted hover:text-foreground"
          }`}
          title="Heading 4"
        >
          H4
        </button>

        <span className="w-[1px] h-5 bg-border mx-1" />

        {/* Inline Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2.5 py-1 text-xs font-extrabold rounded transition-colors ${
            editor.isActive("bold") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
          }`}
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2.5 py-1 text-xs italic font-serif rounded transition-colors ${
            editor.isActive("italic") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
          }`}
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2.5 py-1 text-xs underline rounded transition-colors ${
            editor.isActive("underline") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
          }`}
          title="Underline (Ctrl+U)"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2.5 py-1 text-xs line-through rounded transition-colors ${
            editor.isActive("strike") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
          }`}
          title="Strikethrough"
        >
          S
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
            editor.isActive("code") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
          }`}
          title="Inline Code"
        >
          `code`
        </button>

        <span className="w-[1px] h-5 bg-border mx-1" />

        {/* Lists & Blocks */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            editor.isActive("bulletList") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
          }`}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            editor.isActive("orderedList") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
          }`}
          title="Numbered List"
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            editor.isActive("blockquote") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
          }`}
          title="Blockquote"
        >
          &ldquo; Quote
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            editor.isActive("codeBlock") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
          }`}
          title="Code Block"
        >
          &lt;/&gt;
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-2 py-1 text-xs rounded hover:bg-surface-hover text-muted hover:text-foreground"
          title="Horizontal Divider"
        >
          ― Line
        </button>

        <span className="w-[1px] h-5 bg-border mx-1" />

        {/* Link & Media */}
        <button
          type="button"
          onClick={setLink}
          className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
            editor.isActive("link") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
          }`}
          title="Link"
        >
          🔗 Link
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-2.5 py-1 text-xs font-semibold rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors flex items-center gap-1"
          title="Upload Image from your device"
        >
          {uploading ? (
            <span className="animate-spin text-xs">⏳</span>
          ) : (
            <span>📁 Upload Image</span>
          )}
        </button>

        <button
          type="button"
          onClick={addImageUrl}
          className="px-2 py-1 text-xs rounded hover:bg-surface-hover text-muted hover:text-foreground"
          title="Insert Web Image URL"
        >
          🌐 URL
        </button>

        {/* Clear formatting */}
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().clearNodes().unsetAllMarks().unsetFontSize().run();
          }}
          className="px-2 py-1 text-xs rounded hover:bg-surface-hover text-muted hover:text-foreground ml-auto"
          title="Clear formatting"
        >
          🧹 Clean
        </button>
      </div>

      {/* DEDICATED SCROLLABLE CONTENT VIEWPORT ONLY (TOOLBAR STAYS FIXED ABOVE) */}
      <div className="flex-1 overflow-y-auto cursor-text bg-input-bg">
        <EditorContent editor={editor} />
      </div>

      {/* FOOTER BAR WITH WORD STATS & AUTOSAVE STATUS */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-surface border-t border-border-light text-xs text-muted">
        <div className="flex items-center gap-4">
          <span><strong>{wordCount}</strong> words</span>
          <span><strong>{charCount}</strong> characters</span>
          <span>Est. read: <strong>{Math.max(1, Math.ceil(wordCount / 200))}</strong> min</span>
        </div>

        <div className="flex items-center gap-2">
          {autoSaveTime && (
            <span className="text-[11px] font-medium text-success flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
              Auto-saved draft ({autoSaveTime})
            </span>
          )}
          <span className="text-[11px] text-muted-foreground font-mono">TipTap Editor</span>
        </div>
      </div>
    </div>
  );
}
