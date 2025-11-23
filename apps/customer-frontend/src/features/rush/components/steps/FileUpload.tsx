// apps/customer-frontend/src/features/rush/components/steps/FileUpload.tsx
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileImage, X, Link2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

interface FileUploadProps {
  file: File | null;
  setFile: (f: File | null) => void;
  fileUrl: string;
  setFileUrl: (s: string) => void;
  inputMode: "upload" | "link";
  setInputMode: (m: "upload" | "link") => void;
}

export const FileUpload = ({ 
  file, setFile, fileUrl, setFileUrl, inputMode, setInputMode 
}: FileUploadProps) => {
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) setFile(acceptedFiles[0]);
  }, [setFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [] },
    multiple: false,
    noClick: !!file // Disable click khi đã có file để tránh mở dialog nhầm
  });

  return (
    <div className="space-y-3">
      {/* Tabs chuyển đổi Upload/Link */}
      <div className="flex bg-gray-100 p-1 rounded-lg w-full">
        <button 
          onClick={() => setInputMode("upload")} 
          className={cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-all", inputMode === 'upload' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
        >
          File Upload
        </button>
        <button 
          onClick={() => setInputMode("link")} 
          className={cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-all", inputMode === 'link' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
        >
          Link Drive/Canva
        </button>
      </div>

      {/* Khu vực Dropzone */}
      {inputMode === 'upload' ? (
        <div
          {...getRootProps()}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all min-h-[140px]",
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-400 bg-gray-50/50",
            file && "border-green-500 bg-green-50/30"
          )}
        >
          <input {...getInputProps()} />
          
          {file ? (
            <div className="w-full">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-2">
                <FileImage size={20} />
              </div>
              <p className="font-bold text-sm text-gray-800 truncate px-2">{file.name}</p>
              <p className="text-[10px] text-gray-500 mb-2">{(file.size/1024/1024).toFixed(2)} MB</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => { e.stopPropagation(); setFile(null); }} 
                className="text-red-500 hover:bg-red-50 h-7 text-xs"
              >
                <X size={12} className="mr-1"/> Gỡ bỏ
              </Button>
            </div>
          ) : (
            <div className="cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mb-2 mx-auto" />
              <p className="text-xs font-medium text-gray-600">Click để tải lên</p>
              <p className="text-[10px] text-gray-400 mt-1">PDF, PNG, JPG (Max 10MB)</p>
            </div>
          )}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col justify-center bg-gray-50/50 min-h-[140px]">
          <div className="flex items-center gap-2 mb-2 text-gray-500">
            <Link2 size={16} />
            <span className="text-xs font-medium">Dán liên kết file</span>
          </div>
          <Input 
            value={fileUrl} 
            onChange={(e) => setFileUrl(e.target.value)} 
            placeholder="https://drive.google.com/..." 
            className="bg-white text-sm" 
          />
        </div>
      )}
    </div>
  );
};