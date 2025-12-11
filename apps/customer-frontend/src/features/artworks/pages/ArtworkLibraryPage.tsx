// features/artworks/pages/ArtworkLibraryPage.tsx
// ✅ Artwork Library Page - Display artwork grid with filters

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { Card } from "@/shared/components/ui/card";
import {
  Upload,
  Search,
  Filter,
  Image as ImageIcon,
  Calendar,
  FileType,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Download,
  Trash2,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useArtworks } from "../hooks/useArtworks";
import { ArtworkUploadModal } from "../components/ArtworkUploadModal";
import { ArtworkDetailModal } from "../components/ArtworkDetailModal";
import { Artwork } from "../services/artwork.service";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export function ArtworkLibraryPage() {
  const {
    artworks,
    isLoading,
    pagination,
    fetchArtworks,
    uploadArtwork,
    deleteArtwork,
    updateMetadata,
  } = useArtworks();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Wrapper function to match modal's expected type
  const handleUploadArtwork = async (data: {
    file: File;
    description?: string;
    tags?: string[];
  }) => {
    await uploadArtwork(data);
  };

  // Wrapper function for updateMetadata
  const handleUpdateMetadata = async (artworkId: string, data: any) => {
    await updateMetadata(artworkId, data);
  };
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  // Fetch artworks on mount and filter changes
  useEffect(() => {
    fetchArtworks({
      status: statusFilter !== "all" ? statusFilter : undefined,
      search: searchQuery || undefined,
      page: 1,
      limit: 20,
    });
  }, [statusFilter, fetchArtworks]);

  // Handle search
  const handleSearch = () => {
    fetchArtworks({
      status: statusFilter !== "all" ? statusFilter : undefined,
      search: searchQuery || undefined,
      page: 1,
      limit: 20,
    });
  };

  // Handle delete
  const handleDelete = async (artworkId: string) => {
    if (confirm("Bạn có chắc muốn xóa artwork này?")) {
      await deleteArtwork(artworkId);
    }
  };

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

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Thư viện Artwork</h1>
          <p className="text-gray-600 mt-1">
            Quản lý các file thiết kế của bạn
          </p>
        </div>
        <Button onClick={() => setUploadModalOpen(true)} size="lg">
          <Upload className="w-4 h-4 mr-2" />
          Upload Artwork
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm artwork..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Tìm</Button>
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="rejected">Từ chối</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng artwork</p>
              <p className="text-2xl font-bold">{pagination.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đã duyệt</p>
              <p className="text-2xl font-bold">
                {
                  artworks.filter((a) => a.validationStatus === "approved")
                    .length
                }
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Chờ duyệt</p>
              <p className="text-2xl font-bold">
                {
                  artworks.filter((a) => a.validationStatus === "pending")
                    .length
                }
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Từ chối</p>
              <p className="text-2xl font-bold">
                {
                  artworks.filter((a) => a.validationStatus === "rejected")
                    .length
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Artwork Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      ) : artworks.length === 0 ? (
        <Card className="p-12 text-center">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Chưa có artwork nào</h3>
          <p className="text-gray-600 mb-4">
            Upload artwork đầu tiên của bạn để bắt đầu
          </p>
          <Button onClick={() => setUploadModalOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Artwork
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {artworks.map((artwork) => (
            <Card key={artwork._id} className="overflow-hidden group">
              {/* Thumbnail */}
              <div className="relative aspect-square bg-gray-100">
                {artwork.thumbnailUrl || artwork.fileUrl ? (
                  <img
                    src={artwork.thumbnailUrl || artwork.fileUrl}
                    alt={artwork.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileType className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedArtwork(artwork)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(artwork.fileUrl, "_blank")}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(artwork.validationStatus)}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold truncate flex-1">
                    {artwork.fileName}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setSelectedArtwork(artwork)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.open(artwork.fileUrl, "_blank")}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Tải xuống
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(artwork._id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FileType className="w-4 h-4" />
                    <span>{artwork.fileFormat.toUpperCase()}</span>
                    <span>•</span>
                    <span>
                      {(artwork.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDistanceToNow(new Date(artwork.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {artwork.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {artwork.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {artwork.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{artwork.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <ArtworkUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUploadArtwork}
      />

      {/* Artwork Detail Modal */}
      <ArtworkDetailModal
        artwork={selectedArtwork}
        open={!!selectedArtwork}
        onClose={() => setSelectedArtwork(null)}
        onUpdate={handleUpdateMetadata}
      />
    </div>
  );
}
