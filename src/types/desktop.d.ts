export {};

declare global {
  interface Window {
    omniStickyDesktop?: {
      onQuickAdd: (callback: () => void) => () => void;
    };
  }
}

