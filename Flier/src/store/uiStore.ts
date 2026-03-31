import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info';

export type ToastItem = {
  id: string;
  message: string;
  title: string;
  tone: ToastTone;
};

type UIState = {
  isOnline: boolean;
  toasts: ToastItem[];
  dismissToast: (id: string) => void;
  setIsOnline: (value: boolean) => void;
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
};

export const useUIStore = create<UIState>(set => ({
  dismissToast: id =>
    set(state => ({
      toasts: state.toasts.filter(item => item.id !== id),
    })),
  isOnline: true,
  setIsOnline: value => set({ isOnline: value }),
  showToast: toast =>
    set(state => ({
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        },
      ],
    })),
  toasts: [],
}));
