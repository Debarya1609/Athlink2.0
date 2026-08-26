'use client';

import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { Bold, Italic, Underline as UnderlineIcon, Image as ImageIcon, X } from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: () => void;
}

export function CreatePostModal({ onClose, onPostCreated }: CreatePostModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const MAX_WORDS = 12000;

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({
        allowBase64: true,
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose focus:outline-none min-h-[200px] text-[15px] leading-relaxed',
      },
    },
  });

  const getWordCount = () => {
    if (!editor) return 0;
    const text = editor.getText();
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  const handlePost = async () => {
    if (!editor || loading) return;
    
    if (getWordCount() > MAX_WORDS) {
      alert(`Word limit exceeded! (Max ${MAX_WORDS})`);
      return;
    }

    const html = editor.getHTML();
    
    setLoading(true);
    try {
      await api.post('/feed', { content: html, type: 'general' });
      onPostCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create post', err);
    } finally {
      setLoading(false);
    }
  };

  const addImage = () => {
    const url = window.prompt('URL of the image (uploading coming soon):');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-[var(--color-white)] rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-gray-15)]">
          <h2 className="font-display font-bold text-xl text-[var(--color-ink)]">Create a Post</h2>
          <button onClick={onClose} className="p-2 text-[var(--color-gray-60)] hover:bg-[var(--color-paper)] rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-[var(--color-gray-15)] bg-[var(--color-paper)]">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bold') ? 'bg-gray-200 text-[var(--color-ink)]' : 'text-[var(--color-gray-60)]'}`}
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('italic') ? 'bg-gray-200 text-[var(--color-ink)]' : 'text-[var(--color-gray-60)]'}`}
          >
            <Italic size={18} />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('underline') ? 'bg-gray-200 text-[var(--color-ink)]' : 'text-[var(--color-gray-60)]'}`}
          >
            <UnderlineIcon size={18} />
          </button>
          <div className="w-[1px] h-6 bg-[var(--color-gray-40)] mx-2"></div>
          <button
            onClick={addImage}
            className="p-2 rounded hover:bg-gray-200 text-[var(--color-gray-60)]"
          >
            <ImageIcon size={18} />
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <EditorContent editor={editor} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-gray-15)] flex items-center justify-between bg-[var(--color-white)] rounded-b-xl">
          <div className="text-[12px] font-mono text-[var(--color-gray-60)]">
            <span className={getWordCount() > MAX_WORDS ? 'text-red-500 font-bold' : ''}>
              {getWordCount()}
            </span> / {MAX_WORDS} words
          </div>
          <button 
            onClick={handlePost}
            disabled={loading || !editor?.getText().trim() || getWordCount() > MAX_WORDS}
            className={`px-6 py-2 rounded-full bg-[var(--color-ink)] text-[var(--color-white)] font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
