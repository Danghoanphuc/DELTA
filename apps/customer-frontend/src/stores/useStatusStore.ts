import { create } from 'zustand';

export type StatusType = 'idle' | 'loading' | 'success' | 'error' | 'info';

interface StatusState {
  status: StatusType;
  message: string;
  icon?: React.ReactNode;
  isVisible: boolean;
  showStatus: (type: StatusType, message: string, icon?: React.ReactNode, duration?: number) => void;
  hideStatus: () => void;
}

export const useStatusStore = create<StatusState>((set, get) => ({
  status: 'idle',
  message: '',
  isVisible: false,
  showStatus: (type, message, icon, duration = 3000) => {
    set({ status: type, message, icon, isVisible: true });
    
    // Tự động ẩn nếu không phải loading
    if (type !== 'loading') {
      setTimeout(() => {
        get().hideStatus();
      }, duration);
    }
  },
  hideStatus: () => set({ isVisible: false, status: 'idle' }),
}));

