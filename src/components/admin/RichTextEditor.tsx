'use client';

import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Write your article content here...",
  minHeight = "400px",
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Underline,
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
        class: `prose max-w-none focus:outline-none p-5 text-foreground text-base leading-relaxed`,
        style: `min-height: ${minHeight};`,
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
    <div className="border border-input-border rounded-[var(--radius-xl)] bg-input-bg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
      {/* Hidden file input for direct image upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileUpload}
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
      />

      {/* STICKY FIXED TOOLBAR */}
      <div className="sticky top-0 z-30 flex flex-wrap items-center gap-1.5 p-2.5 bg-surface-elevated/95 backdrop-blur-md border-b border-border text-foreground shadow-xs">
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

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
            editor.isActive("paragraph") && !editor.isActive("heading")
              ? "bg-primary text-primary-foreground font-bold shadow-xs"
              : "hover:bg-surface-hover text-muted hover:text-foreground"
          }`}
          title="Normal Text Paragraph"
        >
          Paragraph
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-primary text-primary-foreground shadow-xs"
              : "hover:bg-surface-hover text-muted hover:text-foreground"
          }`}
          title="Heading 2 (Major Section)"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-primary text-primary-foreground shadow-xs"
              : "hover:bg-surface-hover text-muted hover:text-foreground"
          }`}
          title="Heading 3 (Sub-section)"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
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
          title="Blockquote / Callout"
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
          title="Insert Horizontal Divider Line"
        >
          ― Divider
        </button>

        <span className="w-[1px] h-5 bg-border mx-1" />

        {/* Link & Media */}
        <button
          type="button"
          onClick={setLink}
          className={`px-2 py-1 text-xs font-semibold rounded transition-colors ${
            editor.isActive("link") ? "bg-primary text-primary-foreground shadow-xs" : "hover:bg-surface-hover text-muted hover:text-foreground"
          }`}
          title="Insert / Edit Link"
        >
          🔗 Link
        </button>

        {/* Direct Image Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-2.5 py-1 text-xs font-semibold rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-colors flex items-center gap-1.5"
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
          title="Insert Image by Web URL"
        >
          🌐 Image URL
        </button>

        {/* Clear formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="px-2 py-1 text-xs rounded hover:bg-surface-hover text-muted hover:text-foreground ml-auto"
          title="Clear all formatting"
        >
          🧹 Clean
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />

      {/* Live Content Statistics Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface border-t border-border-light text-xs text-muted">
        <div className="flex items-center gap-4">
          <span><strong>{wordCount}</strong> words</span>
          <span><strong>{charCount}</strong> characters</span>
          <span>Est. read: <strong>{Math.max(1, Math.ceil(wordCount / 200))}</strong> min</span>
        </div>
        <span className="text-[11px] text-muted-foreground font-mono">TipTap Editor v2</span>
      </div>
    </div>
  );
}
