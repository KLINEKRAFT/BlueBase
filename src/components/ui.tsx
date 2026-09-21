'use client';
import { useEffect, useRef, useSyncExternalStore, useCallback, useId } from 'react';
import { X, ArrowUpRight, Layers, Check } from 'lucide-react';
export function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark">
        <Layers size={23} strokeWidth={1.7} />
      </span>
      BLUEBASE
    </span>
  );
}
export function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const titleId = useId();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    const previous = document.activeElement as HTMLElement;
    d?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = old;
      d?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      aria-labelledby={titleId}
      ref={ref}
      className={`modal ${wide ? 'wide' : ''}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-inner">
        <div className="modal-heading">
          <h2 id={titleId}>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close dialog">
            <X size={21} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function ArrowLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="text-link" onClick={onClick}>
      {children}
      <ArrowUpRight size={16} />
    </button>
  );
}
export function Empty({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty">
      <Layers />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export function SaveButton({ saved = false }: { saved?: boolean }) {
  return (
    <button className="btn primary" type="submit">
      {saved ? (
        <>
          <Check size={17} />
          Saved
        </>
      ) : (
        'Save changes'
      )}
    </button>
  );
}
// An external store keeps multiple consumers and browser tabs in sync.
const cache = new Map<string, { raw: string | null; value: unknown }>();
function subscribe(listener: () => void) {
  window.addEventListener('storage', listener);
  window.addEventListener('bluebase-change', listener);
  return () => {
    window.removeEventListener('storage', listener);
    window.removeEventListener('bluebase-change', listener);
  };
}
export function useStoredState<T>(key: string, initial: T) {
  const seed = useRef(initial);
  const snapshot = useCallback(() => {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem('bluebase:' + key);
    } catch {}
    const cached = cache.get(key);
    if (cached && cached.raw === raw) return cached.value as T;
    let value = seed.current;
    try {
      const parsed = raw ? JSON.parse(raw) : null;
      if (
        parsed !== null &&
        typeof parsed === typeof seed.current &&
        Array.isArray(parsed) === Array.isArray(seed.current)
      )
        value = parsed;
    } catch {}
    cache.set(key, { raw, value });
    return value;
  }, [key]);
  const value = useSyncExternalStore(subscribe, snapshot, () => seed.current);
  const loaded = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const setValue = (next: T) => {
    try {
      localStorage.setItem('bluebase:' + key, JSON.stringify(next));
      window.dispatchEvent(new Event('bluebase-change'));
    } catch {
      window.dispatchEvent(new Event('bluebase-storage-error'));
    }
  };
  return [value, setValue, loaded] as const;
}
