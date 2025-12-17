// apps/admin-frontend/src/components/suppliers/RichTextEditor.tsx
// Rich text editor using Tiptap - professional editor library

import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";

// Custom Image extension với data-temp-id attribute để track pending images
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      "data-temp-id": {
        default: null,
        parseHTML: (element) => element.getAttribute("data-temp-id"),
        renderHTML: (attributes) => {
          if (!attributes["data-temp-id"]) return {};
          return { "data-temp-id": attributes["data-temp-id"] };
        },
      },
    };
  },
});

// Custom FontSize extension
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return {
      types: ["textStyle"],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              element.style.fontSize?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }: any) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Palette,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Quote,
  Code,
  Undo,
  Redo,
  Type,
  ImageIcon,
  Loader2,
} from "lucide-react";

const TEXT_COLORS = [
  { color: "#000000", label: "Đen" },
  { color: "#dc2626", label: "Đỏ" },
  { color: "#16a34a", label: "Xanh lá" },
  { color: "#2563eb", label: "Xanh dương" },
  { color: "#d97706", label: "Cam" },
  { color: "#7c3aed", label: "Tím" },
  { color: "#ec4899", label: "Hồng" },
  { color: "#64748b", label: "Xám" },
];

const FONT_SIZES = [
  { value: "0.875em", label: "Nhỏ", preview: "text-sm" },
  { value: "1em", label: "Bình thường", preview: "text-base" },
  { value: "1.25em", label: "Lớn", preview: "text-lg" },
  { value: "1.5em", label: "Rất lớn", preview: "text-xl" },
];

interface RichTextEditorProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  titlePlaceholder?: string;
  contentPlaceholder?: string;
  // Callback để thêm ảnh vào pending list (không upload ngay)
  onAddPendingImage?: (file: File) => Promise<{ id: string; preview: string }>;
}

export function RichTextEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
  titlePlaceholder = "Tiêu đề bài viết",
  contentPlaceholder = "Bắt đầu câu chuyện của bạn...",
  onAddPendingImage,
}: RichTextEditorProps) {
  const { toast } = useToast();
  const [isAddingImage, setIsAddingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSize, setShowFontSize] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      FontSize,
      CustomImage.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none min-h-[60vh] outline-none px-8 py-6 text-gray-800",
      },
      // Xử lý Enter key: sau heading tạo paragraph mới
      handleKeyDown: (view, event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          const { state } = view;
          const { $from } = state.selection;
          const node = $from.parent;

          // Nếu đang ở cuối heading và nhấn Enter
          if (
            node.type.name === "heading" &&
            $from.parentOffset === node.content.size
          ) {
            // Tạo paragraph mới thay vì heading mới
            view.dispatch(
              state.tr
                .split($from.pos)
                .setBlockType(
                  $from.pos + 1,
                  $from.pos + 1,
                  state.schema.nodes.paragraph
                )
            );
            return true;
          }
        }
        return false;
      },
    },
  });

  // Sync content from parent
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  const handleLink = () => {
    if (!editor.state.selection.empty) {
      const previousUrl = editor.getAttributes("link").href;
      setLinkUrl(previousUrl || "");
      setShowLinkDialog(true);
    } else {
      toast({
        title: "Chưa chọn text",
        description: "Bôi đen text trước khi thêm link nhé",
        variant: "default",
      });
    }
  };

  const isValidUrl = (str: string): boolean => {
    // Add https if missing
    const urlToTest = str.match(/^https?:\/\//) ? str : `https://${str}`;
    try {
      const url = new URL(urlToTest);
      // Must have valid domain with at least one dot
      return url.hostname.includes(".");
    } catch {
      return false;
    }
  };

  const applyLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
      setLinkUrl("");
      setShowLinkDialog(false);
      return;
    }

    if (!isValidUrl(linkUrl)) {
      toast({
        title: "URL không hợp lệ",
        description: "Vui lòng nhập đúng định dạng (vd: google.com)",
        variant: "destructive",
      });
      return;
    }

    const url = linkUrl.match(/^https?:\/\//) ? linkUrl : `https://${linkUrl}`;
    editor.chain().focus().setLink({ href: url }).run();
    setLinkUrl("");
    setShowLinkDialog(false);
  };

  // Handle image upload - giữ local, chỉ upload khi submit bài
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "File không hợp lệ",
        description: "Vui lòng chọn file ảnh (JPG, PNG, WebP...)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File quá lớn",
        description: "Kích thước tối đa là 10MB",
        variant: "destructive",
      });
      return;
    }

    // Nếu không có callback, không thể thêm ảnh
    if (!onAddPendingImage) {
      toast({
        title: "Lỗi",
        description: "Chức năng thêm ảnh chưa được cấu hình",
        variant: "destructive",
      });
      return;
    }

    setIsAddingImage(true);
    try {
      // Thêm vào pending list qua callback từ parent (không upload ngay)
      const { id, preview } = await onAddPendingImage(file);

      // Insert preview image vào editor
      // Lưu tempId vào data attribute để track khi submit
      (editor.chain().focus() as any)
        .setImage({
          src: preview,
          "data-temp-id": id, // Track để thay thế URL sau khi upload
        })
        .run();

      toast({
        title: "📷 Ảnh đã thêm",
        description: "Ảnh sẽ được upload khi bạn đăng bài",
      });
    } catch {
      toast({
        title: "Lỗi",
        description: "Không thể thêm ảnh",
        variant: "destructive",
      });
    } finally {
      setIsAddingImage(false);
    }

    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

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
      className={`h-8 w-8 flex items-center justify-center rounded transition ${
        active
          ? "bg-orange-100 text-orange-700"
          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="px-8 pt-8 pb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder={titlePlaceholder}
          className="w-full text-4xl font-bold text-gray-900 placeholder:text-gray-300 border-none focus:ring-0 px-0 py-4 bg-transparent outline-none"
        />
      </div>

      {/* Toolbar */}
      <div className="px-8 py-3 border-y border-gray-200 bg-gray-50 sticky top-0 z-10">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Undo/Redo */}
          <ToolBtn
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo size={16} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo size={16} />
          </ToolBtn>

          <Divider />

          {/* Basic formatting */}
          <ToolBtn
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold (Ctrl+B)"
          >
            <Bold size={16} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic (Ctrl+I)"
          >
            <Italic size={16} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon size={16} />
          </ToolBtn>

          <Divider />

          {/* Headings */}
          <ToolBtn
            onClick={() => {
              // Nếu đang là heading 1, chuyển về paragraph
              if (editor.isActive("heading", { level: 1 })) {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().toggleHeading({ level: 1 }).run();
              }
            }}
            active={editor.isActive("heading", { level: 1 })}
            title="Heading 1 (nhấp lại để về text thường)"
          >
            <Heading1 size={16} />
          </ToolBtn>
          <ToolBtn
            onClick={() => {
              // Nếu đang là heading 2, chuyển về paragraph
              if (editor.isActive("heading", { level: 2 })) {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().toggleHeading({ level: 2 }).run();
              }
            }}
            active={editor.isActive("heading", { level: 2 })}
            title="Heading 2 (nhấp lại để về text thường)"
          >
            <Heading2 size={16} />
          </ToolBtn>
          {/* Paragraph - để convert về text thường */}
          <ToolBtn
            onClick={() => editor.chain().focus().setParagraph().run()}
            active={editor.isActive("paragraph") && !editor.isActive("heading")}
            title="Text thường (Paragraph)"
          >
            <span className="text-xs font-bold">P</span>
          </ToolBtn>

          <Divider />

          {/* Lists */}
          <ToolBtn
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet list"
          >
            <List size={16} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Numbered list"
          >
            <ListOrdered size={16} />
          </ToolBtn>

          <Divider />

          {/* Alignment */}
          <ToolBtn
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            title="Align left"
          >
            <AlignLeft size={16} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            title="Align center"
          >
            <AlignCenter size={16} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            title="Align right"
          >
            <AlignRight size={16} />
          </ToolBtn>

          <Divider />

          {/* Quote & Code */}
          <ToolBtn
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Quote"
          >
            <Quote size={16} />
          </ToolBtn>
          <ToolBtn
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            title="Code block"
          >
            <Code size={16} />
          </ToolBtn>

          <Divider />

          {/* Font Size */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFontSize(!showFontSize)}
              className="h-8 px-3 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
            >
              <Type size={16} />
              <span>Size</span>
            </button>
            {showFontSize && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFontSize(false)}
                />
                <div className="absolute top-full mt-1 left-0 bg-white shadow-lg rounded border border-gray-200 p-1 z-20 min-w-[120px]">
                  {FONT_SIZES.map((fs) => (
                    <button
                      key={fs.value}
                      type="button"
                      onClick={() => {
                        (editor.chain().focus() as any)
                          .setFontSize(fs.value)
                          .run();
                        setShowFontSize(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left hover:bg-gray-100 rounded ${fs.preview}`}
                    >
                      {fs.label}
                    </button>
                  ))}
                  <hr className="my-1 border-gray-200" />
                  <button
                    type="button"
                    onClick={() => {
                      (editor.chain().focus() as any).unsetFontSize().run();
                      setShowFontSize(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-gray-500 hover:bg-gray-100 rounded text-sm"
                  >
                    Reset
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Color Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="h-8 px-3 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
            >
              <Palette size={16} />
              <span>Màu</span>
            </button>
            {showColorPicker && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowColorPicker(false)}
                />
                <div className="absolute top-full mt-1 left-0 bg-white shadow-lg rounded border border-gray-200 p-2 grid grid-cols-4 gap-2 z-20">
                  {TEXT_COLORS.map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().setColor(c.color).run();
                        setShowColorPicker(false);
                      }}
                      className="w-7 h-7 rounded border-2 border-gray-300 hover:scale-110 transition"
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <Divider />

          {/* Image Upload */}
          <div className="relative">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <ToolBtn
              onClick={() => imageInputRef.current?.click()}
              disabled={isAddingImage || !onAddPendingImage}
              title={
                onAddPendingImage
                  ? "Chèn ảnh"
                  : "Chức năng thêm ảnh chưa được cấu hình"
              }
            >
              {isAddingImage ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ImageIcon size={16} />
              )}
            </ToolBtn>
          </div>

          {/* Link */}
          <div className="relative">
            <ToolBtn
              onClick={handleLink}
              active={editor.isActive("link")}
              title="Thêm link (bôi đen text trước)"
            >
              <LinkIcon size={16} />
            </ToolBtn>
            {showLinkDialog && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowLinkDialog(false)}
                />
                <div className="absolute top-full mt-1 right-0 w-72 bg-white shadow-xl rounded border border-gray-200 p-3 z-20">
                  <label className="text-xs font-semibold text-gray-700 mb-1 block">
                    Nhập URL
                  </label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyLink();
                      }
                      if (e.key === "Escape") {
                        setShowLinkDialog(false);
                      }
                    }}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 mb-2"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={applyLink}
                      className="flex-1 px-3 py-1.5 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                    >
                      {linkUrl.trim() ? "Thêm" : "Xóa link"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLinkDialog(false)}
                      className="px-3 py-1.5 border border-gray-300 text-sm rounded hover:bg-gray-50"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content Editor */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Styles for Tiptap */}
      <style>{`
        .ProseMirror {
          min-height: 60vh;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: "${contentPlaceholder}";
          color: #9ca3af;
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror h1 {
          font-size: 2.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .ProseMirror h2 {
          font-size: 1.75rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #d1d5db;
          padding-left: 1rem;
          font-style: italic;
          color: #4b5563;
        }
        .ProseMirror pre {
          background: #1f2937;
          color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        .ProseMirror a {
          color: #ea580c;
          text-decoration: none;
          border-bottom: 1px dashed #ea580c;
          padding-bottom: 1px;
          transition: all 0.2s ease;
        }
        .ProseMirror a:hover {
          color: #c2410c;
          border-bottom-style: solid;
          background-color: rgba(234, 88, 12, 0.08);
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5rem;
        }
        .ProseMirror ul {
          list-style-type: disc;
        }
        .ProseMirror ol {
          list-style-type: decimal;
        }
        .ProseMirror img {
          max-width: min(100%, 600px);
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem auto;
          display: block;
          cursor: pointer;
        }
        .ProseMirror img.ProseMirror-selectednode {
          outline: 3px solid #ea580c;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

const Divider = () => <div className="w-px h-6 bg-gray-300 mx-1" />;
