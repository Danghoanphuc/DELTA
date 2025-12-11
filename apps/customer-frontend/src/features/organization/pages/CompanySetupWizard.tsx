// src/features/organization/pages/CompanySetupWizard.tsx
// ✅ VALUE-FIRST: Onboarding Wizard cho B2B Organizations
// Mục tiêu: Thu thập Logo & Nhu cầu, KHÔNG bắt điền form hành chính

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Loader2,
  Sparkles,
  Upload,
  Users,
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
  Gift,
  ShoppingBag,
  Calendar,
  Megaphone,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "@/shared/utils/toast";
import api from "@/shared/lib/axios";
import { uploadFileToCloudinary } from "@/services/cloudinaryService";
import { cn } from "@/shared/lib/utils";

// ✅ Usage Intent Options
const USAGE_INTENTS = [
  {
    id: "employee_onboarding",
    icon: Building2,
    title: "Onboarding nhân viên",
    description: "Welcome kit, đồng phục, quà tặng nhân viên mới",
  },
  {
    id: "partner_gifts",
    icon: Gift,
    title: "Tặng đối tác/khách hàng",
    description: "Quà tặng doanh nghiệp, tri ân khách hàng",
  },
  {
    id: "merchandise",
    icon: ShoppingBag,
    title: "Bán Merchandise",
    description: "Sản phẩm mang thương hiệu để bán hoặc tặng",
  },
  {
    id: "events",
    icon: Calendar,
    title: "Sự kiện/Hội nghị",
    description: "Quà tặng hội nghị, team building, workshop",
  },
  {
    id: "marketing",
    icon: Megaphone,
    title: "Marketing Campaigns",
    description: "Promotional items, giveaways, brand awareness",
  },
  {
    id: "other",
    icon: MoreHorizontal,
    title: "Khác",
    description: "Mục đích sử dụng khác",
  },
];

// ✅ Wizard Steps
const STEPS = [
  { id: 1, title: "Mục đích sử dụng", icon: Sparkles },
  { id: 2, title: "Logo thương hiệu", icon: Upload },
  { id: 3, title: "Mời đồng đội", icon: Users },
];

export function CompanySetupWizard() {
  const navigate = useNavigate();
  const { user, fetchMe } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Step 1: Usage Intent
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);

  // Step 2: Logo Upload
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Step 3: Team Invites
  const [teamEmails, setTeamEmails] = useState<string[]>([""]);

  // Check if user already has organization profile
  useEffect(() => {
    const checkProfile = async () => {
      if (user?.organizationProfileId) {
        // User đã có profile, check onboarding status
        try {
          const res = await api.get("/organizations/profile/me");
          const profile = res.data?.data?.profile;
          if (profile?.onboardingCompleted) {
            navigate("/organization/dashboard");
          }
        } catch {
          // Ignore errors
        }
      }
    };
    checkProfile();
  }, [user, navigate]);

  // ✅ Step 1: Register Organization + Save Usage Intent
  const handleSaveIntent = async () => {
    if (!selectedIntent) {
      toast.error("Vui lòng chọn mục đích sử dụng");
      return;
    }

    setIsLoading(true);
    try {
      // Nếu chưa có organization profile -> tạo mới trước
      if (!user?.organizationProfileId) {
        // Tạo organization với tên mặc định từ displayName
        const res = await api.post("/organizations/register", {
          businessName: `${user?.displayName || "My"}'s Company`,
          usageIntent: selectedIntent,
        });

        // ✅ FIX: Update store directly to avoid triggering useEffect in other components
        const newProfile = res.data?.data?.profile;
        if (newProfile && user) {
          // Update user with organizationProfileId
          const updatedUser = {
            ...user,
            organizationProfileId: newProfile._id,
          };

          useAuthStore.setState({
            user: updatedUser,
            activeOrganizationProfile: newProfile,
            activeContext: "organization",
          });

          console.log("[CompanySetupWizard] ✅ Store updated:", {
            organizationProfileId: updatedUser.organizationProfileId,
            activeContext: "organization",
          });
        }
      } else {
        // Đã có profile -> chỉ update usage intent
        await api.put("/organizations/usage-intent", {
          usageIntent: selectedIntent,
        });
      }
      setCurrentStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Step 2: Upload Logo
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile && !logoUrl) {
      // Skip nếu không có logo
      setCurrentStep(3);
      return;
    }

    setIsUploading(true);
    try {
      let uploadedUrl = logoUrl;
      if (logoFile) {
        uploadedUrl = await uploadFileToCloudinary(logoFile);
      }

      await api.put("/organizations/brand-assets", {
        logoUrl: uploadedUrl,
      });

      setLogoUrl(uploadedUrl);
      toast.success("Logo đã được lưu!");
      setCurrentStep(3);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload thất bại");
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ Step 3: Invite Team Members
  const handleAddEmailField = () => {
    setTeamEmails([...teamEmails, ""]);
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...teamEmails];
    newEmails[index] = value;
    setTeamEmails(newEmails);
  };

  const handleInviteTeam = async () => {
    const validEmails = teamEmails.filter(
      (email) => email.trim() && email.includes("@")
    );

    if (validEmails.length > 0) {
      setIsLoading(true);
      try {
        await api.post("/organizations/invite-members", {
          emails: validEmails,
        });
        toast.success(`Đã gửi lời mời đến ${validEmails.length} người!`);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Gửi lời mời thất bại");
      } finally {
        setIsLoading(false);
      }
    }

    // Complete onboarding
    handleCompleteOnboarding();
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);
    try {
      const res = await api.put("/organizations/profile/me", {
        onboardingCompleted: true,
        onboardingStep: 4,
      });

      // ✅ FIX: Update store directly instead of fetchMe to avoid race condition
      const updatedProfile = res.data?.data?.profile;
      if (updatedProfile) {
        useAuthStore.setState({
          activeOrganizationProfile: updatedProfile,
        });
      }

      console.log(
        "[CompanySetupWizard] ✅ Onboarding complete, navigating to dashboard"
      );
      console.log(
        "[CompanySetupWizard] Current activeContext:",
        useAuthStore.getState().activeContext
      );
      console.log(
        "[CompanySetupWizard] User organizationProfileId:",
        useAuthStore.getState().user?.organizationProfileId
      );

      toast.success("Chào mừng bạn đến với PrintZ! 🎉");

      // ✅ FIX: Use setTimeout to ensure store persistence completes before navigation
      setTimeout(() => {
        console.log("[CompanySetupWizard] ✅ Executing navigation");
        navigate("/organization/dashboard", { replace: true });
      }, 300);
    } catch (err: any) {
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteOnboarding();
    }
  };

  const isBusy = isLoading || isUploading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0">
        {/* Progress Steps */}
        <div className="px-6 pt-6">
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      currentStep >= step.id
                        ? "bg-orange-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs mt-2 hidden sm:block",
                      currentStep >= step.id
                        ? "text-orange-600 font-medium"
                        : "text-gray-400"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2 rounded",
                      currentStep > step.id ? "bg-orange-500" : "bg-gray-200"
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <CardHeader className="text-center pt-0">
          <CardTitle className="text-2xl font-bold">
            {currentStep === 1 && `Chào ${user?.displayName || "bạn"}! 👋`}
            {currentStep === 2 && "Logo thương hiệu của bạn"}
            {currentStep === 3 && "Mời đồng đội cùng tham gia"}
          </CardTitle>
          <p className="text-gray-600">
            {currentStep === 1 && "Bạn muốn dùng PrintZ cho việc gì?"}
            {currentStep === 2 &&
              "Upload logo để xem mockup sản phẩm ngay lập tức"}
            {currentStep === 3 &&
              "Thêm đồng nghiệp vào workspace của bạn (tùy chọn)"}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* ========== STEP 1: Usage Intent ========== */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {USAGE_INTENTS.map((intent) => (
                <button
                  key={intent.id}
                  type="button"
                  onClick={() => setSelectedIntent(intent.id)}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all hover:shadow-md",
                    selectedIntent === intent.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-orange-300"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        selectedIntent === intent.id
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      )}
                    >
                      <intent.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {intent.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {intent.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ========== STEP 2: Logo Upload ========== */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {logoPreview || logoUrl ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-40 h-40 rounded-2xl border-4 border-orange-200 overflow-hidden bg-white shadow-lg">
                    <img
                      src={logoPreview || logoUrl || ""}
                      alt="Logo preview"
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Logo này sẽ xuất hiện trên mockup sản phẩm
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setLogoPreview(null);
                      setLogoFile(null);
                      setLogoUrl(null);
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Chọn logo khác
                  </Button>
                </div>
              ) : (
                <label
                  htmlFor="logo-upload"
                  className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <span className="text-lg font-medium text-gray-700">
                    Click để upload logo
                  </span>
                  <span className="text-sm text-gray-500 mt-2">
                    PNG, JPG, SVG (khuyến nghị nền trong suốt)
                  </span>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          )}

          {/* ========== STEP 3: Team Invites ========== */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {teamEmails.map((email, index) => (
                <Input
                  key={index}
                  type="email"
                  placeholder="email@company.com"
                  value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddEmailField}
                className="w-full"
              >
                + Thêm email khác
              </Button>
            </div>
          )}

          {/* ========== Navigation Buttons ========== */}
          <div className="flex items-center justify-between pt-4">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isBusy}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkipStep}
                disabled={isBusy}
              >
                Bỏ qua
              </Button>

              {currentStep === 1 && (
                <Button
                  onClick={handleSaveIntent}
                  disabled={!selectedIntent || isBusy}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isBusy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Tiếp tục
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}

              {currentStep === 2 && (
                <Button
                  onClick={handleUploadLogo}
                  disabled={isBusy}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {logoFile || logoUrl ? "Lưu & Tiếp tục" : "Tiếp tục"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}

              {currentStep === 3 && (
                <Button
                  onClick={handleInviteTeam}
                  disabled={isBusy}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  {isBusy ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Vào Dashboard
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CompanySetupWizard;
