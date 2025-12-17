// apps/admin-frontend/src/hooks/useArtisanBlocks.ts
// Custom hook for managing artisan blocks state

import { useState, useCallback } from "react";
import {
  ArtisanBlock,
  BlockType,
  createEmptyBlock,
  MediaBlock,
} from "@/types/artisan-block.types";

interface PendingMedia {
  blockId: string;
  file: File;
  preview: string;
}

export function useArtisanBlocks(initialBlocks: ArtisanBlock[] = []) {
  const [blocks, setBlocks] = useState<ArtisanBlock[]>(initialBlocks);
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);

  // Add a new block
  const addBlock = useCallback(
    (type: BlockType) => {
      const newBlock = createEmptyBlock(type, blocks.length + 1);
      setBlocks((prev) => [...prev, newBlock]);
      return newBlock;
    },
    [blocks.length]
  );

  // Update a block
  const updateBlock = useCallback((updatedBlock: ArtisanBlock) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === updatedBlock.id ? updatedBlock : b))
    );
  }, []);

  // Delete a block
  const deleteBlock = useCallback((blockId: string) => {
    setBlocks((prev) => {
      const newBlocks = prev
        .filter((b) => b.id !== blockId)
        .map((block, index) => ({ ...block, order: index + 1 }));
      return newBlocks;
    });

    // Also remove any pending media for this block
    setPendingMedia((prev) => prev.filter((p) => p.blockId !== blockId));
  }, []);

  // Reorder blocks
  const reorderBlocks = useCallback((newBlocks: ArtisanBlock[]) => {
    const reordered = newBlocks.map((block, index) => ({
      ...block,
      order: index + 1,
    }));
    setBlocks(reordered);
  }, []);

  // Move block up or down
  const moveBlock = useCallback((blockId: string, direction: "up" | "down") => {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === blockId);
      if (index === -1) return prev;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newBlocks = [...prev];
      [newBlocks[index], newBlocks[newIndex]] = [
        newBlocks[newIndex],
        newBlocks[index],
      ];

      return newBlocks.map((block, i) => ({ ...block, order: i + 1 }));
    });
  }, []);

  // Add pending media (for upload on submit)
  const addPendingMedia = useCallback(
    async (blockId: string, file: File): Promise<{ preview: string }> => {
      const preview = URL.createObjectURL(file);

      setPendingMedia((prev) => [
        ...prev.filter((p) => p.blockId !== blockId), // Replace existing for same block
        { blockId, file, preview },
      ]);

      return { preview };
    },
    []
  );

  // Get pending media for a block
  const getPendingMediaForBlock = useCallback(
    (blockId: string): PendingMedia | undefined => {
      return pendingMedia.find((p) => p.blockId === blockId);
    },
    [pendingMedia]
  );

  // Convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Get all pending media for submit (as base64)
  // Scans blocks for files that need to be uploaded
  const getPendingMediaForSubmit = useCallback(async () => {
    const mediaToUpload: {
      blockId: string;
      data: string;
      type: string;
      name: string;
    }[] = [];

    // Scan all blocks for files
    for (const block of blocks) {
      // Legacy media block
      if (block.type === "media") {
        const mediaBlock = block as MediaBlock;
        if (mediaBlock.content.file) {
          const base64 = await fileToBase64(mediaBlock.content.file);
          mediaToUpload.push({
            blockId: block.id,
            data: base64,
            type: mediaBlock.content.file.type,
            name: mediaBlock.content.file.name,
          });
        }
      }

      // New B2B blocks with media - check data fields for File objects
      if (block.type === "hero" && (block as any).data?.mediaFile) {
        const file = (block as any).data.mediaFile as File;
        const base64 = await fileToBase64(file);
        mediaToUpload.push({
          blockId: `${block.id}:mediaUrl`,
          data: base64,
          type: file.type,
          name: file.name,
        });
      }

      if (block.type === "interactive") {
        const data = (block as any).data;
        if (data?.audioFile) {
          const base64 = await fileToBase64(data.audioFile);
          mediaToUpload.push({
            blockId: `${block.id}:audioUrl`,
            data: base64,
            type: data.audioFile.type,
            name: data.audioFile.name,
          });
        }
        if (data?.zoomImageFile) {
          const base64 = await fileToBase64(data.zoomImageFile);
          mediaToUpload.push({
            blockId: `${block.id}:zoomImageUrl`,
            data: base64,
            type: data.zoomImageFile.type,
            name: data.zoomImageFile.name,
          });
        }
        if (data?.beforeImageFile) {
          const base64 = await fileToBase64(data.beforeImageFile);
          mediaToUpload.push({
            blockId: `${block.id}:beforeImageUrl`,
            data: base64,
            type: data.beforeImageFile.type,
            name: data.beforeImageFile.name,
          });
        }
        if (data?.afterImageFile) {
          const base64 = await fileToBase64(data.afterImageFile);
          mediaToUpload.push({
            blockId: `${block.id}:afterImageUrl`,
            data: base64,
            type: data.afterImageFile.type,
            name: data.afterImageFile.name,
          });
        }
      }

      if (block.type === "artifact" && (block as any).data?.imageFile) {
        const file = (block as any).data.imageFile as File;
        const base64 = await fileToBase64(file);
        mediaToUpload.push({
          blockId: `${block.id}:imageUrl`,
          data: base64,
          type: file.type,
          name: file.name,
        });
      }
    }

    // Also include any manually added pending media
    for (const p of pendingMedia) {
      const base64 = await fileToBase64(p.file);
      mediaToUpload.push({
        blockId: p.blockId,
        data: base64,
        type: p.file.type,
        name: p.file.name,
      });
    }

    return mediaToUpload;
  }, [blocks, pendingMedia]);

  // Clear pending media after successful submit
  const clearPendingMedia = useCallback(() => {
    pendingMedia.forEach((p) => {
      URL.revokeObjectURL(p.preview);
    });
    setPendingMedia([]);
  }, [pendingMedia]);

  // Prepare blocks for submit (replace blob URLs with placeholders, remove File objects)
  const prepareBlocksForSubmit = useCallback(() => {
    return blocks.map((block) => {
      // Legacy media block
      if (block.type === "media") {
        const mediaBlock = block as MediaBlock;
        if (mediaBlock.content.file || mediaBlock.content.preview) {
          return {
            ...mediaBlock,
            content: {
              ...mediaBlock.content,
              url: `{{media:${block.id}}}`, // Placeholder for backend
              preview: undefined,
              file: undefined,
            },
          };
        }
      }

      // New B2B blocks - replace file references with placeholders
      if (block.type === "hero") {
        const data = (block as any).data;
        if (data?.mediaFile) {
          return {
            ...block,
            data: {
              ...data,
              mediaUrl: `{{media:${block.id}:mediaUrl}}`,
              mediaFile: undefined,
            },
          };
        }
      }

      if (block.type === "interactive") {
        const data = (block as any).data;
        const updatedData = { ...data };
        let hasChanges = false;

        if (data?.audioFile) {
          updatedData.audioUrl = `{{media:${block.id}:audioUrl}}`;
          updatedData.audioFile = undefined;
          hasChanges = true;
        }
        if (data?.zoomImageFile) {
          updatedData.zoomImageUrl = `{{media:${block.id}:zoomImageUrl}}`;
          updatedData.zoomImageFile = undefined;
          hasChanges = true;
        }
        if (data?.beforeImageFile) {
          updatedData.beforeImageUrl = `{{media:${block.id}:beforeImageUrl}}`;
          updatedData.beforeImageFile = undefined;
          hasChanges = true;
        }
        if (data?.afterImageFile) {
          updatedData.afterImageUrl = `{{media:${block.id}:afterImageUrl}}`;
          updatedData.afterImageFile = undefined;
          hasChanges = true;
        }

        if (hasChanges) {
          return { ...block, data: updatedData };
        }
      }

      if (block.type === "artifact") {
        const data = (block as any).data;
        if (data?.imageFile) {
          return {
            ...block,
            data: {
              ...data,
              imageUrl: `{{media:${block.id}:imageUrl}}`,
              imageFile: undefined,
            },
          };
        }
      }

      return block;
    });
  }, [blocks]);

  // Reset all blocks
  const reset = useCallback(() => {
    clearPendingMedia();
    setBlocks([]);
  }, [clearPendingMedia]);

  // Check if has any content
  const hasContent = blocks.length > 0;

  // Validate blocks
  const validateBlocks = useCallback((): {
    valid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    if (blocks.length === 0) {
      errors.push("Cần ít nhất 1 block nội dung");
    }

    blocks.forEach((block, index) => {
      if (block.type === "text" && !block.content.text?.trim()) {
        errors.push(`Block #${index + 1}: Văn bản không được để trống`);
      }
      if (block.type === "curator_note" && !block.content.note?.trim()) {
        errors.push(`Block #${index + 1}: Góc giám tuyển không được để trống`);
      }
    });

    return { valid: errors.length === 0, errors };
  }, [blocks]);

  return {
    blocks,
    setBlocks,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    moveBlock,
    addPendingMedia,
    getPendingMediaForBlock,
    getPendingMediaForSubmit,
    clearPendingMedia,
    prepareBlocksForSubmit,
    reset,
    hasContent,
    validateBlocks,
  };
}
