// apps/admin-frontend/src/components/suppliers/SupplierProfileEditor.tsx
// ✅ SOLID: Single Responsibility - Edit supplier public profile with image upload

import { useState, useEffect, useRef } from "react";
import {
  User,
  Image,
  FileText,
  Quote,
  Award,
  Link as LinkIcon,
  Save,
  Loader2,
  Plus,
  X,
  Upload,
  Trash2,
} from "lucide-react";
import {
  Supplier,
  SupplierProfile,
  supplierApi,
} from "@/services/catalog.service";
import { useToast } from "@/hooks/use-toast";
import { useFileUpload } from "@/hooks/useFileUpload";

interface SupplierProfileEditorProps {
  supplier: Supplier;
  onUpdate: (updated: Supplier) => void;
}

export function SupplierProfileEditor({
  supplier,
  onUpdate,
}: SupplierProfileEditorProps) {
  const { toast } = useToast();
  const { uploadImage, isUploading } = useFileUpload();
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<
    "avatar" | "cover" | null
  >(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<SupplierProfile>({
    avatar: "",
    coverImage: "",
    bio: "",
    story: "",
    quote: "",
    curatorNote: "",
    yearsOfExperience: 0,
    achievements: [],
    socialLinks: {
      facebook: "",
      instagram: "",
      youtube: "",
      website: "",
    },
    ...supplier.profile,
  });
  const [achievementInput, setAchievementInput] = useState("");

  // Sync when supplier changes
  useEffect(() => {
    setProfile({
      avatar: "",
      coverImage: "",
      bio: "",
      story: "",
      quote: "",
      curatorNote: "",
      yearsOfExperience: 0,
      achievements: [],
      socialLinks: {
        facebook: "",
        instagram: "",
        youtube: "",
        website: "",
      },
      ...supplier.profile,
    });
  }, [supplier]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await supplierApi.update(supplier._id, { profile });
      onUpdate(updated);
      toast({
        title: "Thành công",
        description: "Đã cập nhật profile công khai",
      });
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.response?.data?.message || "Không thể cập nhật",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file ảnh",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Ảnh không được vượt quá 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingField("avatar");
    try {
      const url = await uploadImage(file, `supplier-${supplier.code}-avatar`);
      setProfile({ ...profile, avatar: url });
    } catch (error) {
      // Error already handled by useFileUpload
    } finally {
      setUploadingField(null);
      // Reset input
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  // Handle cover image upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file ảnh",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Ảnh cover không được vượt quá 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingField("cover");
    try {
      const url = await uploadImage(file, `supplier-${supplier.code}-cover`);
      setProfile({ ...profile, coverImage: url });
    } catch (error) {
      // Error already handled by useFileUpload
    } finally {
      setUploadingField(null);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const addAchievement = () => {
    if (
      achievementInput.trim() &&
      !profile.achievements?.includes(achievementInput.trim())
    ) {
      setProfile({
        ...profile,
        achievements: [
          ...(profile.achievements || []),
          achievementInput.trim(),
        ],
      });
      setAchievementInput("");
    }
  };

  const removeAchievement = (achievement: string) => {
    setProfile({
      ...profile,
      achievements:
        profile.achievements?.filter((a) => a !== achievement) || [],
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Profile Công Khai
              </h2>
              <p className="text-sm text-gray-500">
                Thông tin hiển thị trên trang nghệ nhân
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving || isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Lưu Profile
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Images Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image className="w-4 h-4 inline mr-1" />
              Ảnh đại diện (Avatar)
            </label>
            <div className="space-y-3">
              {/* Preview */}
              {profile.avatar ? (
                <div className="relative inline-block">
                  <img
                    src={profile.avatar}
                    alt="Avatar preview"
                    className="w-32 h-32 rounded-xl object-cover border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, avatar: "" })}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    title="Xóa ảnh"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  {uploadingField === "avatar" ? (
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Upload</span>
                    </>
                  )}
                </div>
              )}

              {/* Upload Button */}
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              {profile.avatar && (
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingField === "avatar"}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Thay đổi ảnh
                </button>
              )}
              <p className="text-xs text-gray-400">
                Khuyến nghị: 400x400px, tối đa 5MB
              </p>
            </div>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Image className="w-4 h-4 inline mr-1" />
              Ảnh bìa (Cover)
            </label>
            <div className="space-y-3">
              {/* Preview */}
              {profile.coverImage ? (
                <div className="relative">
                  <img
                    src={profile.coverImage}
                    alt="Cover preview"
                    className="w-full h-32 rounded-xl object-cover border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, coverImage: "" })}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    title="Xóa ảnh"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  {uploadingField === "cover" ? (
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500 mt-1">
                        Click để upload ảnh bìa
                      </span>
                    </>
                  )}
                </div>
              )}

              {/* Upload Button */}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
              {profile.coverImage && (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingField === "cover"}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Thay đổi ảnh bìa
                </button>
              )}
              <p className="text-xs text-gray-400">
                Khuyến nghị: 1200x400px, tối đa 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Bio & Quote */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Giới thiệu ngắn (Bio)
            </label>
            <textarea
              value={profile.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Mô tả ngắn về nghệ nhân (tối đa 500 ký tự)"
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              {(profile.bio || "").length}/500 ký tự
            </p>
          </div>

          {/* Quote */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Quote className="w-4 h-4 inline mr-1" />
              Câu nói nổi tiếng
            </label>
            <textarea
              value={profile.quote || ""}
              onChange={(e) =>
                setProfile({ ...profile, quote: e.target.value })
              }
              placeholder="Câu nói đặc trưng của nghệ nhân"
              maxLength={300}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              {(profile.quote || "").length}/300 ký tự
            </p>
          </div>
        </div>

        {/* Curator Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Award className="w-4 h-4 inline mr-1" />
            Góc nhìn Giám tuyển (Curator's Note)
          </label>
          <textarea
            value={profile.curatorNote || ""}
            onChange={(e) =>
              setProfile({ ...profile, curatorNote: e.target.value })
            }
            placeholder="Nhận xét của ban giám tuyển về nghệ nhân này..."
            maxLength={1000}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            {(profile.curatorNote || "").length}/1000 ký tự
          </p>
        </div>

        {/* Story */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            Câu chuyện nghệ nhân (Story/Legend)
          </label>
          <textarea
            value={profile.story || ""}
            onChange={(e) => setProfile({ ...profile, story: e.target.value })}
            placeholder="Kể câu chuyện chi tiết về nghệ nhân, hành trình, nỗi vất vả, sự tỉ mỉ..."
            maxLength={5000}
            rows={8}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            {(profile.story || "").length}/5000 ký tự
          </p>
        </div>

        {/* Years of Experience */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số năm kinh nghiệm
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={profile.yearsOfExperience || 0}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  yearsOfExperience: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Achievements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Award className="w-4 h-4 inline mr-1" />
            Thành tựu & Giải thưởng
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={achievementInput}
              onChange={(e) => setAchievementInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addAchievement())
              }
              placeholder="Thêm thành tựu..."
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={addAchievement}
              className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(profile.achievements || []).map((achievement, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1"
              >
                {achievement}
                <button
                  type="button"
                  onClick={() => removeAchievement(achievement)}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {(profile.achievements || []).length === 0 && (
              <span className="text-gray-400 text-sm">
                Chưa có thành tựu nào
              </span>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <LinkIcon className="w-4 h-4 inline mr-1" />
            Liên kết mạng xã hội
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Facebook
              </label>
              <input
                type="url"
                value={profile.socialLinks?.facebook || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socialLinks: {
                      ...profile.socialLinks,
                      facebook: e.target.value,
                    },
                  })
                }
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Instagram
              </label>
              <input
                type="url"
                value={profile.socialLinks?.instagram || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socialLinks: {
                      ...profile.socialLinks,
                      instagram: e.target.value,
                    },
                  })
                }
                placeholder="https://instagram.com/..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                YouTube
              </label>
              <input
                type="url"
                value={profile.socialLinks?.youtube || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socialLinks: {
                      ...profile.socialLinks,
                      youtube: e.target.value,
                    },
                  })
                }
                placeholder="https://youtube.com/..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Website
              </label>
              <input
                type="url"
                value={profile.socialLinks?.website || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    socialLinks: {
                      ...profile.socialLinks,
                      website: e.target.value,
                    },
                  })
                }
                placeholder="https://..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
