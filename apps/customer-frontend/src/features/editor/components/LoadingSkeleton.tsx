// frontend/src/features/editor/components/LoadingSkeleton.tsx
// ✅ LOADING SKELETON - Beautiful loading states

import React from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

// Canvas Loading Skeleton
export const CanvasLoadingSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div
      className={cn(
        "w-full h-full flex items-center justify-center bg-gray-50",
        className
      )}
    >
      <div className="text-center space-y-4">
        <div className="relative">
          <Skeleton className="w-[600px] h-[600px] rounded-lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="space-y-3">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
              <p className="text-sm text-gray-600 font-medium">
                Loading canvas editor...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toolbar Loading Skeleton
export const ToolbarLoadingSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div className={cn("w-80 bg-white border-r p-4 space-y-4", className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>

      {/* Separator */}
      <div className="border-t" />

      {/* More buttons */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

// Layers Panel Loading Skeleton
export const LayersPanelLoadingSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div className={cn("w-72 bg-white border-l p-4 space-y-4", className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-9 w-full" />
      </div>

      {/* Layer items */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-2 p-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      ))}
    </div>
  );
};

// Properties Panel Loading Skeleton
export const PropertiesPanelLoadingSkeleton: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div className={cn("w-80 bg-white border-l p-4 space-y-4", className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
      </div>

      {/* Form fields */}
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}

      {/* Sliders */}
      {[1, 2].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-2 w-full" />
        </div>
      ))}
    </div>
  );
};

// Full Studio Loading Skeleton
export const StudioLoadingSkeleton: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Toolbar */}
      <ToolbarLoadingSkeleton />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-16 bg-white border-b flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Canvas */}
        <CanvasLoadingSkeleton className="flex-1" />

        {/* Bottom Bar */}
        <div className="h-16 bg-white border-t flex items-center justify-center gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-96 bg-white border-l p-6 space-y-6">
        {/* Product Info Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 3D Preview Card */}
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// 3D Viewer Loading
export const ViewerLoadingSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div
      className={cn(
        "w-full h-full bg-gray-100 rounded-lg flex items-center justify-center",
        className
      )}
    >
      <div className="text-center space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
        <p className="text-sm text-gray-600">Loading 3D model...</p>
      </div>
    </div>
  );
};

// Image Upload Loading
export const ImageUploadLoadingSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div className={cn("relative", className)}>
      <Skeleton className="w-full h-32 rounded-lg" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-xs text-gray-600">Uploading image...</p>
        </div>
      </div>
    </div>
  );
};

// Progress Bar with Text
export const ProgressLoader: React.FC<{
  progress: number;
  text?: string;
  className?: string;
}> = ({ progress, text, className }) => {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">{text || "Loading..."}</span>
        <span className="text-sm font-semibold text-gray-900">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Pulsing Dot Loader
export const PulsingLoader: React.FC<{
  text?: string;
  className?: string;
}> = ({ text, className }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
        <div
          className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
          style={{ animationDelay: "0.2s" }}
        />
        <div
          className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
          style={{ animationDelay: "0.4s" }}
        />
      </div>
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
};

// Spinner with overlay
export const SpinnerOverlay: React.FC<{
  text?: string;
  show: boolean;
}> = ({ text, show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <div className="text-center space-y-3">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-gray-600 font-medium">
            {text || "Please wait..."}
          </p>
        </div>
      </div>
    </div>
  );
};
