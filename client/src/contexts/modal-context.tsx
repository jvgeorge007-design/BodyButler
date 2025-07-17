import { createContext, useContext, useCallback, useRef } from 'react';

interface ModalContextType {
  registerModal: (id: string, closeHandler: () => void) => void;
  unregisterModal: (id: string) => void;
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const modalsRef = useRef<Map<string, () => void>>(new Map());

  const registerModal = useCallback((id: string, closeHandler: () => void) => {
    modalsRef.current.set(id, closeHandler);
  }, []);

  const unregisterModal = useCallback((id: string) => {
    modalsRef.current.delete(id);
  }, []);

  const closeAllModals = useCallback(() => {
    modalsRef.current.forEach((closeHandler) => {
      closeHandler();
    });
    modalsRef.current.clear();
  }, []);

  return (
    <ModalContext.Provider value={{ registerModal, unregisterModal, closeAllModals }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}