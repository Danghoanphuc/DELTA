import { useEffect, useState } from "react";
import { toast } from "@/shared/utils/toast";

// ⚠️ CẤU HÌNH GOOGLE: Điền thông tin thật của bạn vào đây
const GOOGLE_API_KEY = "YOUR_API_KEY_HERE"; 
const GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID_HERE";
const APP_ID = "YOUR_APP_ID"; // Project Number

export function useGoogleDrive({ onPick }: { onPick: (files: File[]) => void }) {
  const [pickerApiLoaded, setPickerApiLoaded] = useState(false);
  const [oauthToken, setOauthToken] = useState<string | null>(null);

  useEffect(() => {
    // Load Google API Script
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.onload = () => {
      window.gapi.load("picker", { callback: () => setPickerApiLoaded(true) });
    };
    document.body.appendChild(script);
  }, []);

  const openDrivePicker = () => {
    if (!pickerApiLoaded) {
      toast.error("Google Drive chưa sẵn sàng. Vui lòng đợi...");
      return;
    }

    // Nếu chưa có token thì phải authorize (ở đây giả lập flow đơn giản hoặc dùng thư viện `react-google-login`)
    // Vì setup OAuth Client phức tạp, tôi sẽ code phần Picker giả định đã có Token hoặc Open Mode
    
    // MOCK: Giả lập chọn file thành công để test UI (Vì không có Key thật)
    // ⚠️ XÓA PHẦN NÀY KHI CÓ KEY THẬT
    const mockFile = new File(["dummy content"], "Design_From_Drive.pdf", { type: "application/pdf" });
    toast.success("Đã chọn file từ Drive (Mô phỏng)");
    onPick([mockFile]); 
    return;

    /* --- CODE THẬT KHI CÓ API KEY ---
    const pickerCallback = (data: any) => {
      if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
        const doc = data[window.google.picker.Response.DOCUMENTS][0];
        const fileUrl = doc[window.google.picker.Document.URL];
        const fileId = doc[window.google.picker.Document.ID];
        const name = doc[window.google.picker.Document.NAME];
        
        // Cách 1: Download file về thành Blob (Cần Token xịn)
        // Cách 2: Trả về một "Link File" (An toàn hơn cho App in ấn)
        
        // Ở đây mình tạo một File ảo chứa link
        const dummyFile = new File([""], name, { type: "application/pdf" }); // Type giả định
        Object.defineProperty(dummyFile, 'driveLink', { value: fileUrl });
        onPick([dummyFile]);
      }
    };

    const picker = new window.google.picker.PickerBuilder()
      .addView(window.google.picker.ViewId.DOCS)
      .setOAuthToken(oauthToken) // Cần access token
      .setDeveloperKey(GOOGLE_API_KEY)
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
    */
  };

  return { openDrivePicker };
}

// Add types globally if needed
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}