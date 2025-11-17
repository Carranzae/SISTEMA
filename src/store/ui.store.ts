import { create } from 'zustand';

interface UIState {
  // Modales
  modals: {
    [key: string]: boolean;
  };
  
  // Notificaciones
  notification: {
    visible: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  } | null;

  // Acciones
  openModal: (modalName: string) => void;
  closeModal: (modalName: string) => void;
  showNotification: (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ) => void;
  hideNotification: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  modals: {},
  notification: null,

  openModal: (modalName) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: true },
    })),

  closeModal: (modalName) =>
    set((state) => ({
      modals: { ...state.modals, [modalName]: false },
    })),

  showNotification: (message, type) =>
    set({
      notification: { visible: true, message, type },
    }),

  hideNotification: () =>
    set({
      notification: null,
    }),
}));
