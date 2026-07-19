import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useEffect, useRef } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function useBackButtonModal(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    
    const stateId = Math.random().toString(36).substring(7);
    window.history.pushState({ modalId: stateId }, '', window.location.hash);
    
    const handlePopState = (e: PopStateEvent) => {
      onCloseRef.current();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      setTimeout(() => {
        if (window.history.state?.modalId === stateId) {
          window.history.back();
        }
      }, 0);
    };
  }, [isOpen]);
}
