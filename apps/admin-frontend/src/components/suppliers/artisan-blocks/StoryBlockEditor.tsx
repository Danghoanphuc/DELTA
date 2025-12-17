// apps/admin-frontend/src/components/suppliers/artisan-blocks/StoryBlockEditor.tsx
// Story Block - Educational Content with Rich Text and Drop-caps

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { StoryBlock, BLOCK_LIMITS } from "@/types/artisan-block.types";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading2,
  Heading3,
  Quote,
  AlignLeft,
  AlignCenter,
  Undo,
  Redo,
  Sparkles,
} from "lucide-react";

interface StoryBlockEditorProps {
  block: StoryBlock;
  onChange: (block: StoryBlock) => void;
}

export function StoryBlockEditor({ block, onChange }: StoryBlockEditorProps) {
  const [charCount, setCharCount] = useState(0);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const { content, enableDropCap = true, highlightQuote } = block.data;

  const updateData = (updates: Partial<StoryBlock["data"]>) => {
    onChange({ ...block, data: { ...block.data, ...updates } });
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const textContent = editor.state.doc.textContent;
      setCharCount(textContent.length);
      updateData({ content: html });
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-stone max-w-none min-h-[200px] outline-none px-4 py-3",
      },
    },
  });

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) setCharCount(editor.state.doc.textContent.length);
  }, [editor]);

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

  const ToolBtn = ({ onClick, active, disabled, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`h-8 w-8 flex items-center justify-center rounded transition ${
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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-2 bg-gray-50 border border-gray-200 rounded-t-lg flex-wrap">
        <ToolBtn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo size={15} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo size={15} />
        </ToolBtn>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={15} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={15} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon size={15} />
        </ToolBtn>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={15} />
        </ToolBtn>
        <ToolBtn
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={15} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote size={15} />
        </ToolBtn>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List size={15} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered size={15} />
        </ToolBtn>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          title="Align Left"
        >
          <AlignLeft size={15} />
        </ToolBtn>
        <ToolBtn
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          title="Align Center"
        >
          <AlignCenter size={15} />
        </ToolBtn>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Link */}
        <div className="relative">
          <ToolBtn
            onClick={() => setShowLinkInput(!showLinkInput)}
            active={editor.isActive("link")}
            title="Add Link"
          >
            <LinkIcon size={15} />
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
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), handleAddLink())
                  }
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

        {/* Char Counter */}
        <div className="ml-auto">
          <span
            className={`text-[10px] px-2 py-0.5 rounded ${
              charCount > BLOCK_LIMITS.STORY_MAX_CHARS
                ? "bg-red-100 text-red-600"
                : "text-gray-400"
            }`}
          >
            {charCount}/{BLOCK_LIMITS.STORY_MAX_CHARS}
          </span>
        </div>
      </div>

      {/* Editor */}
      <div className="border border-gray-200 rounded-b-lg bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* Drop Cap Toggle */}
      <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
        <input
          type="checkbox"
          checked={enableDropCap}
          onChange={(e) => updateData({ enableDropCap: e.target.checked })}
          className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
        />
        <div>
          <span className="text-sm font-medium text-gray-700">Drop Cap</span>
          <p className="text-xs text-gray-500">
            Chữ cái đầu tiên lớn (kiểu tạp chí)
          </p>
        </div>
      </label>

      {/* Highlight Quote */}
      <div>
        <label className="flex items-center gap-2 text-xs font-medium text-gray-600 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Pull Quote (trích dẫn nổi bật)
        </label>
        <textarea
          value={highlightQuote || ""}
          onChange={(e) =>
            updateData({
              highlightQuote: e.target.value.slice(
                0,
                BLOCK_LIMITS.QUOTE_MAX_CHARS
              ),
            })
          }
          placeholder="Một câu trích dẫn đặc biệt từ nội dung..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
        />
        <p className="text-[10px] text-gray-400 mt-1 text-right">
          {(highlightQuote || "").length}/{BLOCK_LIMITS.QUOTE_MAX_CHARS}
        </p>
      </div>

      {/* Styles */}
      <style>{`
        .ProseMirror { min-height: 200px; }
        .ProseMirror p { margin: 0.5rem 0; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 600; margin: 1rem 0 0.5rem; }
        .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
        .ProseMirror blockquote { border-left: 3px solid #d1d5db; padding-left: 1rem; font-style: italic; color: #6b7280; margin: 1rem 0; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5rem; margin: 0.5rem 0; }
        .ProseMirror ul { list-style-type: disc; }
        .ProseMirror ol { list-style-type: decimal; }
        .ProseMirror a { color: #ea580c; text-decoration: underline; }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: "Kể câu chuyện của bạn...";
          color: #9ca3af;
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
