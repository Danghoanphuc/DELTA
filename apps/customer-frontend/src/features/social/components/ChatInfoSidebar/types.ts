// types.ts - Định nghĩa types cho ChatInfoSidebar
export interface FileItem {
  _id: string;
  messageId: string;
  url: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
  sender?: {
    _id: string;
    displayName?: string;
    username?: string;
  };
}

export interface MediaItem {
  _id: string;
  messageId: string;
  url: string;
  thumbnailUrl: string;
  type: "image" | "video";
  createdAt: string;
  sender?: {
    _id: string;
    displayName?: string;
    username?: string;
  };
}

export type FileCategory = "contracts" | "production" | "media" | "documents";

export interface FileGroup {
  contracts: FileItem[];
  production: FileItem[];
  media: FileItem[];
  documents: FileItem[];
}
