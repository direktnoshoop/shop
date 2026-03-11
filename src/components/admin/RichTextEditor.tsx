'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  maxChars?: number;
}

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors ${
        active
          ? 'bg-rose-500 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, maxChars = 2000 }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        code: false,
      }),
      Underline,
    ],
    content: value || '',
    onUpdate({ editor }) {
      const html = editor.isEmpty ? '' : editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class:
          'min-h-[120px] px-3.5 py-2.5 text-sm text-gray-800 leading-relaxed focus:outline-none',
      },
    },
  });

  // Sync value from outside (e.g. when editing an existing listing)
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? '' : editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const plainTextLength = editor?.getText().length ?? 0;
  const isOverLimit = plainTextLength > maxChars;

  if (!editor) return null;

  return (
    <div
      className={`border rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-rose-500 focus-within:border-transparent transition-shadow ${
        isOverLimit ? 'border-red-400' : 'border-gray-200'
      }`}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50 flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Podebljano (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Kurziv (Ctrl+I)"
        >
          <em>I</em>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Podvučeno (Ctrl+U)"
        >
          <span className="underline">U</span>
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Lista sa tačkama"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            <circle cx="2" cy="6" r="1" fill="currentColor" />
            <circle cx="2" cy="10" r="1" fill="currentColor" />
            <circle cx="2" cy="14" r="1" fill="currentColor" />
            <circle cx="2" cy="18" r="1" fill="currentColor" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numerisana lista"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6h11M10 12h11M10 18h11" />
            <text x="1" y="8" fontSize="6" fill="currentColor">1</text>
            <text x="1" y="14" fontSize="6" fill="currentColor">2</text>
            <text x="1" y="20" fontSize="6" fill="currentColor">3</text>
          </svg>
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-200 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Poništi (Ctrl+Z)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 010 16H5m-2-6l-2-4 4-2" />
          </svg>
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Ponovi (Ctrl+Y)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 000 16h8m2-6l2-4-4-2" />
          </svg>
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      {/* Character count */}
      <div className="flex justify-end px-3 py-1 border-t border-gray-100 bg-gray-50">
        <span className={`text-xs ${isOverLimit ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
          {plainTextLength} / {maxChars}
        </span>
      </div>
    </div>
  );
}
