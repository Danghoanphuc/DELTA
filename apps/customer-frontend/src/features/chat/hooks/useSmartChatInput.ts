// src/features/chat/hooks/useSmartChatInput.ts
import { useState, useCallback, useRef } from "react";
import { useFileUpload } from "./useFileUpload";

export type LinkType = 'canva' | 'drive' | 'general';

export interface LinkAttachment {
  id: string;
  url: string;
  type: LinkType;
  title: string;
}

interface UseSmartInputProps {
  onSendRaw: (text: string) => void | Promise<void>;
  onFileUpload?: (file: File) => void;
  triggerActions?: {
    openCanva?: () => void;
    openDrive?: () => void;
    openUpload?: () => void;
  };
}

const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export function useSmartChatInput({ onSendRaw, onFileUpload, triggerActions }: UseSmartInputProps) {
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState<LinkAttachment[]>([]);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- 1. SMART PARSING LOGIC ---
  const detectLinkType = (url: string): { type: LinkType; title: string } => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('canva.com')) return { type: 'canva', title: 'Canva Design' };
    if (lowerUrl.includes('drive.google.com') || lowerUrl.includes('docs.google.com')) return { type: 'drive', title: 'Google Drive' };
    try {
        return { type: 'general', title: new URL(url).hostname.replace('www.', '') };
    } catch {
        return { type: 'general', title: 'Liên kết' };
    }
  };

  // ✅ REVERT: Chỉ thêm vào danh sách links, KHÔNG gọi store.toggleDeepResearch
  const addLink = useCallback((url: string) => {
    const { type, title } = detectLinkType(url);
    setLinks(prev => {
      if (prev.some(l => l.url === url)) return prev;
      return [...prev, { id: Date.now() + Math.random().toString(), url, type, title }];
    });
  }, []);

  const removeLink = useCallback((id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  }, []);

  // ... (Giữ nguyên phần Event Handlers: handleInputChange, handlePaste, handleKeyDown) ...
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMessage(val);
    if (val === "/" || val.endsWith(" /") || val.endsWith("\n/")) {
        setShowSlashMenu(true);
    } else if (showSlashMenu && !val.includes("/")) {
        setShowSlashMenu(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const pastedFiles: File[] = [];
    for (const item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) pastedFiles.push(file);
      }
    }
    if (pastedFiles.length > 0) return { handled: false, files: pastedFiles };

    const pastedText = e.clipboardData.getData('text');
    const matches = pastedText.match(URL_REGEX);

    if (matches && matches.length > 0) {
        e.preventDefault();
        matches.forEach(url => addLink(url));
        const cleanText = pastedText.replace(URL_REGEX, '').trim();
        
        if (cleanText) {
             const textarea = textareaRef.current;
             if (textarea) {
                 const start = textarea.selectionStart;
                 const end = textarea.selectionEnd;
                 const newValue = message.substring(0, start) + " " + cleanText + " " + message.substring(end);
                 setMessage(newValue);
                 setTimeout(() => {
                     textarea.selectionStart = textarea.selectionEnd = start + cleanText.length + 2;
                 }, 0);
             } else {
                 setMessage(prev => prev + " " + cleanText);
             }
        }
        return { handled: true };
    }
    return { handled: false };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }
    if (showSlashMenu && (e.key === "Escape" || e.key === "Backspace")) {
        setShowSlashMenu(false);
    }
    if (e.key === " " || e.key === "Enter") {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const cursorPosition = textarea.selectionStart;
        const textBeforeCursor = message.substring(0, cursorPosition);
        const lastWord = textBeforeCursor.split(/\s+/).pop();
        if (lastWord && lastWord.match(/^https?:\/\/[^\s]+$/)) {
            e.preventDefault(); 
            addLink(lastWord);
            const newText = message.substring(0, cursorPosition - lastWord.length) + message.substring(cursorPosition);
            setMessage(newText);
        }
    }
  };

  const executeSlashCommand = (command: 'canva' | 'drive' | 'upload') => {
      const cleanMsg = message.replace(/\/?$/, '').replace(/\/?\s?$/, ''); 
      setMessage(cleanMsg);
      setShowSlashMenu(false);
      if (command === 'canva') triggerActions?.openCanva?.();
      if (command === 'drive') triggerActions?.openDrive?.();
      if (command === 'upload') triggerActions?.openUpload?.();
  };

  const handleSend = async () => {
      if (!message.trim() && links.length === 0) return;
      let finalMsg = message.trim();
      if (links.length > 0) {
          finalMsg += links.map(l => `\n[LINK_ATTACHMENT: ${l.type.toUpperCase()}] ${l.url}`).join("");
      }
      await onSendRaw(finalMsg);
      setMessage("");
      setLinks([]);
      setShowSlashMenu(false);
  };

  return {
      message, setMessage, links, addLink, removeLink, showSlashMenu,
      executeSlashCommand, handleInputChange, handlePaste, handleKeyDown, handleSend, textareaRef
  };
}