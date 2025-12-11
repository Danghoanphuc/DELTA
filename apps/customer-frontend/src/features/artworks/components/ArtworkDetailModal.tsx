// features/artworks/components/ArtworkDetailModal.tsx
// ✅ Artwork Detail Modal - Display artwork info, technical specs, version history

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { Card } from "@/shared/components/ui/card";
import { Textarea } from "@/shared/components/ui/textarea";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Download,
  FileType,
  Ruler,
  Palette,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Tag,
  History,
  Edit,
  Save,
  X,
} from "lucide-react";
import { Artwork } from "../services/artwork.service";
import { useArtworkDetail } from "../hooks/useArtworks";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";

interface ArtworkDetailModalProps {
  artwork: Artwork | null;
  open: boolean;
  onClose: () => void;
  onUpdate?: (artworkId: string, data: any) => Promise<void>;
}

export function ArtworkDetailModal({
  artwork: initialArtwork,
  open,
  onClose,
  onUpdate,
}: ArtworkDetailModalProps) {
  const artworkId = initialArtwork?._id || "";
  const { artwork, versionHistory, fetchArtwork, fetchVersionHistory } =
    useArtworkDetail(artworkId);

  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Fetch data when modal opens
  useEffect(() => {
    if (open && artworkId) {
      fetchArtwork();
      fetchVersionHistory();
    }
  }, [open, artworkId, fetchArtwork, fetchVersionHistory]);

  // Initialize edit form
  useEffect(() => {
    if (artwork) {
      setEditDescription(artwork.description || "");
      setEditTags(artwork.tags || []);
    }
  }, [artwork]);

  const currentArtwork = artwork || initialArtwork;
  if (!currentArtwork) return null;

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="w-3 h-3" />
            Đã duyệt
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Từ chối
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Chờ duyệt
          </Badge>
        );
    }
  };

  // Handle save metadata
  const handleSave = async () => {
    if (onUpdate) {
      await onUpdate(currentArtwork._id, {
        description: editDescription,
        tags: editTags,
      });
      setIsEditing(false);
    }
  };

  // Add tag
  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !editTags.includes(trimmed)) {
      setEditTags([...editTags, trimmed]);
      setTagInput("");
    }
  };

  // Remove tag
  const handleRemoveTag = (tag: string) => {
    setEditTags(editTags.filter((t) => t !== tag));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">
                {currentArtwork.fileName}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {getStatusBadge(currentArtwork.validationStatus)}
                <span className="text-sm text-gray-500">
                  Version {currentArtwork.version}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open(currentArtwork.fileUrl, "_blank")}
            >
              <Download className="w-4 h-4 mr-2" />
              Tải xuống
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="technical">Kỹ thuật</TabsTrigger>
            <TabsTrigger value="history">Lịch sử</TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-4">
            {/* Preview */}
            <Card className="p-4">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {currentArtwork.thumbnailUrl || currentArtwork.fileUrl ? (
                  <img
                    src={currentArtwork.thumbnailUrl || currentArtwork.fileUrl}
                    alt={currentArtwork.fileName}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileType className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </Card>

            {/* Metadata */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Metadata</h3>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditDescription(currentArtwork.description || "");
                        setEditTags(currentArtwork.tags || []);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Hủy
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu
                    </Button>
                  </div>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-gray-600">Mô tả</Label>
                    <p className="mt-1">
                      {currentArtwork.description || (
                        <span className="text-gray-400 italic">
                          Chưa có mô tả
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-600">Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {currentArtwork.tags.length > 0 ? (
                        currentArtwork.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">
                          Chưa có tags
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-description">Mô tả</Label>
                    <Textarea
                      id="edit-description"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-tags">Tags</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="edit-tags"
                        placeholder="Nhập tag và nhấn Enter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddTag}
                      >
                        Thêm
                      </Button>
                    </div>
                    {editTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {editTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="gap-1"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Basic Info */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Thông tin cơ bản</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <FileType className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Định dạng</p>
                    <p className="font-medium">
                      {currentArtwork.fileFormat.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileType className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Kích thước file</p>
                    <p className="font-medium">
                      {(currentArtwork.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Ngày upload</p>
                    <p className="font-medium">
                      {format(
                        new Date(currentArtwork.createdAt),
                        "dd/MM/yyyy HH:mm"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Số lần sử dụng</p>
                    <p className="font-medium">{currentArtwork.usageCount}</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Technical Tab */}
          <TabsContent value="technical" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Thông số kỹ thuật</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Ruler className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Kích thước</p>
                    <p className="font-medium">
                      {currentArtwork.dimensions.width} x{" "}
                      {currentArtwork.dimensions.height}{" "}
                      {currentArtwork.dimensions.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileType className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Độ phân giải</p>
                    <p className="font-medium">
                      {currentArtwork.resolution} DPI
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Color Mode</p>
                    <p className="font-medium">{currentArtwork.colorMode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Số màu</p>
                    <p className="font-medium">{currentArtwork.colorCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Transparency</p>
                    <p className="font-medium">
                      {currentArtwork.hasTransparency ? "Có" : "Không"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Validation Errors */}
            {currentArtwork.validationStatus === "rejected" &&
              currentArtwork.validationErrors.length > 0 && (
                <Card className="p-4 border-red-200 bg-red-50">
                  <h3 className="font-semibold text-red-900 mb-2">
                    Lý do từ chối
                  </h3>
                  <ul className="space-y-1">
                    {currentArtwork.validationErrors.map((error, index) => (
                      <li key={index} className="text-sm text-red-700">
                        • {error}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                Lịch sử phiên bản
              </h3>
              {versionHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Chưa có phiên bản nào khác
                </p>
              ) : (
                <div className="space-y-3">
                  {versionHistory.map((version) => (
                    <div
                      key={version._id}
                      className="flex items-center gap-4 p-3 border rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {version.thumbnailUrl ? (
                          <img
                            src={version.thumbnailUrl}
                            alt={`Version ${version.version}`}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                            <FileType className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Version {version.version}</p>
                        <p className="text-sm text-gray-600">
                          {formatDistanceToNow(new Date(version.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(version.fileUrl, "_blank")}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
