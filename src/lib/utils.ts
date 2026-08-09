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
      // Only close if we are actually popping this specific modal's state.
      // Wait, if the user presses back, the current state will be the PREVIOUS state, not stateId.
      // So if the current state is NOT stateId, it means our state was popped!
      // But wait, if another modal was pushed ON TOP of us, and then popped, the state might now be stateId again!
      // But we shouldn't close.
      // Actually, if popstate fires, and the new state is NOT our stateId, it means we went back past our state.
      // But if there are multiple modals, e.state might be the state underneath us.
      
      // Let's just unconditionally call onClose? NO! That caused the bug!
      // If history.back() is called manually by a child modal, it pops back to OUR stateId.
      // So if e.state?.modalId === stateId, it means the user went back to OUR modal! We should NOT close!
      if (e.state?.modalId !== stateId) {
          onCloseRef.current();
      }
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
