// apps/admin-frontend/src/components/suppliers/artisan-blocks/TextBlockEditor.tsx
// Text block with TipTap rich text editor, char limit, and bot summary

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { TextBlock, BLOCK_LIMITS } from "@/types/artisan-block.types";
import {
  AlertCircle,
  Bot,
  ChevronDown,
  ChevronUp,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading2,
  Quote,
  Undo,
  Redo,
} from "lucide-react";

interface TextBlockEditorProps {
  block: TextBlock;
  onChange: (block: TextBlock) => void;
}

export function TextBlockEditor({ block, onChange }: TextBlockEditorProps) {
  const [showBotSummary, setShowBotSummary] = useState(
    !!block.content.botSummary
  );
  const [charCount, setCharCount] = useState(0);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const isOverLimit = charCount > BLOCK_LIMITS.TEXT_MAX_CHARS;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    ],
    content: block.content.text || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const textContent = editor.state.doc.textContent;
      setCharCount(textContent.length);

      onChange({
        ...block,
        content: { ...block.content, text: html },
      });
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[80px] outline-none px-3 py-2 text-gray-800",
      },
    },
  });

  // Sync content from parent
  useEffect(() => {
    if (
      editor &&
      block.content.text &&
      editor.getHTML() !== block.content.text
    ) {
      editor.commands.setContent(block.content.text);
    }
  }, [block.content.text, editor]);

  // Update char count on mount
  useEffect(() => {
    if (editor) {
      setCharCount(editor.state.doc.textContent.length);
    }
  }, [editor]);

  const handleBotSummaryChange = (summary: string) => {
    if (summary.length <= BLOCK_LIMITS.BOT_SUMMARY_MAX_CHARS) {
      onChange({
        ...block,
        content: { ...block.content, botSummary: summary },
      });
    }
  };

  const handleAddLink = () => {
    if (!editor) return;

    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
    } else {
      const url = linkUrl.match(/^https?:\/\//)
        ? linkUrl
        : `https://${linkUrl}`;
      editor.chain().focus().setLink({ href: url }).run();
    }
    setLinkUrl("");
    setShowLinkInput(false);
  };

  if (!editor) return null;

  const ToolBtn = ({
    onClick,
    active,
    disabled,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-7 w-7 flex items-center justify-center rounded transition ${
        active
          ? "bg-orange-100 text-orange-700"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-3">
      {/* Mini Toolbar */}
      <div className="flex items-center gap-0.5 p-1.5 bg-gray-50 border border-gray-200 rounded-t-lg flex-wrap">
        <ToolBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo size={14} />
        </ToolBtn>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon size={14} />
        </ToolBtn>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading"
        >
          <Heading2 size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote size={14} />
        </ToolBtn>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List size={14} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered size={14} />
        </ToolBtn>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Link Button */}
        <div className="relative">
          <ToolBtn
            onClick={() => setShowLinkInput(!showLinkInput)}
            active={editor.isActive("link")}
            title="Add Link"
          >
            <LinkIcon size={14} />
          </ToolBtn>

          {showLinkInput && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowLinkInput(false)}
              />
              <div className="absolute top-full left-0 mt-1 w-56 bg-white shadow-lg rounded border border-gray-200 p-2 z-20">
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddLink();
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-1 mt-1">
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="flex-1 px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700"
                  >
                    {linkUrl ? "Thêm" : "Xóa link"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLinkInput(false)}
                    className="px-2 py-1 border border-gray-200 text-xs rounded hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Character Counter */}
        <div className="ml-auto">
          <span
            className={`text-[10px] px-2 py-0.5 rounded ${
              isOverLimit
                ? "bg-red-100 text-red-600 font-medium"
                : charCount > BLOCK_LIMITS.TEXT_MAX_CHARS * 0.8
                ? "bg-amber-100 text-amber-600"
                : "text-gray-400"
            }`}
          >
            {charCount}/{BLOCK_LIMITS.TEXT_MAX_CHARS}
          </span>
        </div>
      </div>

      {/* Editor Content */}
      <div
        className={`border rounded-b-lg bg-white transition-all ${
          isOverLimit
            ? "border-red-300 focus-within:border-red-500"
            : "border-gray-200 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20"
        }`}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Styles for mini editor */}
      <style>{`
        .ProseMirror {
          min-height: 80px;
          max-height: 200px;
          overflow-y: auto;
        }
        .ProseMirror p {
          margin: 0.25rem 0;
        }
        .ProseMirror h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0.5rem 0 0.25rem;
        }
        .ProseMirror h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0.5rem 0 0.25rem;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #d1d5db;
          padding-left: 0.75rem;
          font-style: italic;
          color: #6b7280;
          margin: 0.5rem 0;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.25rem;
          margin: 0.25rem 0;
        }
        .ProseMirror ul {
          list-style-type: disc;
        }
        .ProseMirror ol {
          list-style-type: decimal;
        }
        .ProseMirror a {
          color: #ea580c;
          text-decoration: underline;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: "Nhập nội dung văn bản...";
          color: #9ca3af;
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>

      {/* Warning */}
      {isOverLimit && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700">
            Vượt quá {BLOCK_LIMITS.TEXT_MAX_CHARS} ký tự cho phép. Hãy chia
            thành nhiều block.
          </p>
        </div>
      )}

      {/* Bot Summary Toggle */}
      <div className="border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={() => setShowBotSummary(!showBotSummary)}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Bot Summary (cho AI/SEO)</span>
          {showBotSummary ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>

        {showBotSummary && (
          <div className="mt-2">
            <input
              type="text"
              value={block.content.botSummary || ""}
              onChange={(e) => handleBotSummaryChange(e.target.value)}
              placeholder="Tóm tắt 1 câu cho AI hiểu nội dung block này..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/30"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              {block.content.botSummary?.length || 0}/
              {BLOCK_LIMITS.BOT_SUMMARY_MAX_CHARS}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
