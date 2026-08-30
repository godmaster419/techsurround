'use client';

import React, { useEffect } from "react";
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
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Write your article content here...",
}: RichTextEditorProps) {
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
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose max-w-none focus:outline-none min-h-[300px] p-4 text-foreground text-sm",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="border border-input-border rounded-[var(--radius)] bg-input-bg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-surface border-b border-border-light text-muted">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 text-xs font-bold rounded ${editor.isActive("bold") ? "bg-primary text-primary-foreground" : "hover:bg-surface-hover hover:text-foreground"}`}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 text-xs italic rounded ${editor.isActive("italic") ? "bg-primary text-primary-foreground" : "hover:bg-surface-hover hover:text-foreground"}`}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 text-xs underline rounded ${editor.isActive("underline") ? "bg-primary text-primary-foreground" : "hover:bg-surface-hover hover:text-foreground"}`}
          title="Underline"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 text-xs line-through rounded ${editor.isActive("strike") ? "bg-primary text-primary-foreground" : "hover:bg-surface-hover hover:text-foreground"}`}
          title="Strikethrough"
        >
          S
        </button>

        <span className="w-[1px] h-4 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 text-xs font-bold rounded ${editor.isActive("heading", { level: 2 }) ? "bg-primary text-primary-foreground" : "hover:bg-surface-hover hover:text-foreground"}`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 text-xs font-bold rounded ${editor.isActive("heading", { level: 3 }) ? "bg-primary text-primary-foreground" : "hover:bg-surface-hover hover:text-foreground"}`}
          title="Heading 3"
        >
          H3
        </button>

        <span className="w-[1px] h-4 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 text-xs rounded ${editor.isActive("bulletList") ? "bg-primary text-primary-foreground" : "hover:bg-surface-hover hover:text-foreground"}`}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 text-xs rounded ${editor.isActive("orderedList") ? "bg-primary text-primary-foreground" : "hover:bg-surface-hover hover:text-foreground"}`}
          title="Numbered List"
        >
          1. List
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 text-xs rounded ${editor.isActive("blockquote") ? "bg-primary text-primary-foreground" : "hover:bg-surface-hover hover:text-foreground"}`}
          title="Quote"
        >
          &ldquo; Quote
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-2 py-1 text-xs rounded ${editor.isActive("codeBlock") ? "bg-primary text-primary-foreground" : "hover:bg-surface-hover hover:text-foreground"}`}
          title="Code Block"
        >
          &lt;/&gt; Code
        </button>

        <span className="w-[1px] h-4 bg-border mx-1" />

        <button
          type="button"
          onClick={setLink}
          className={`px-2 py-1 text-xs rounded ${editor.isActive("link") ? "bg-primary text-primary-foreground" : "hover:bg-surface-hover hover:text-foreground"}`}
          title="Insert Link"
        >
          🔗 Link
        </button>
        <button
          type="button"
          onClick={addImage}
          className="px-2 py-1 text-xs rounded hover:bg-surface-hover hover:text-foreground"
          title="Insert Image"
        >
          🖼️ Image
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
