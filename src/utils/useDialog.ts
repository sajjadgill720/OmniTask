import { useEffect, useRef } from 'react';
const stack: HTMLElement[] = [];
let previousOverflow = '';
export function useDialog(onClose: () => void, active = true) {
  const ref = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!active) return;
    const root = ref.current;
    if (!root) return;
    const previous = document.activeElement as HTMLElement | null;
    stack.push(root);
    if (stack.length === 1) { previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
    const selectable = () => [...root.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]')].filter(el => el.getClientRects().length);
    const timer = setTimeout(() => { (root.querySelector<HTMLElement>('[autofocus]') || selectable()[0] || root).focus(); }, 0);
    const key = (event: KeyboardEvent) => {
      if (stack[stack.length - 1] !== root) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); close.current(); }
      if (event.key !== 'Tab') return;
      const items = selectable(), first = items[0], last = items[items.length - 1];
      if (!first) { event.preventDefault(); root.focus(); }
      else if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', key, true);
    return () => { clearTimeout(timer); stack.splice(stack.indexOf(root), 1); if (stack.length === 0) document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', key, true); if (previous?.isConnected) previous.focus(); };
  }, [active]);
  return ref;
}
