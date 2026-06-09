import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

export type LightboxItem = {
  src: string;
  alt: string;
  caption?: string;
  /** Если задано — в модалке показывается `<video controls>` вместо `<img>`. `src` может быть постером. */
  videoSrc?: string | null;
};

type LightboxProps = {
  open: boolean;
  onClose: () => void;
  items: LightboxItem[];
  index: number;
  onIndexChange: (i: number) => void;
};

export default function Lightbox({ open, onClose, items, index, onIndexChange }: LightboxProps) {
  const safeLen = items.length;
  const i = safeLen ? Math.min(Math.max(index, 0), safeLen - 1) : 0;
  const current = items[i];

  const goPrev = useCallback(() => {
    if (safeLen < 2) return;
    onIndexChange(i === 0 ? safeLen - 1 : i - 1);
  }, [i, safeLen, onIndexChange]);

  const goNext = useCallback(() => {
    if (safeLen < 2) return;
    onIndexChange(i === safeLen - 1 ? 0 : i + 1);
  }, [i, safeLen, onIndexChange]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, goPrev, goNext]);

  if (!open || !safeLen || !current) return null;

  const el = (
    <div data-lenis-prevent className="fixed inset-0 z-[400] flex flex-col bg-ink/95" role="dialog" aria-modal="true" aria-label="Gallery">
      <button
        type="button"
        className="absolute right-4 top-4 z-[402] flex h-12 w-12 items-center justify-center text-2xl text-paper/90 transition hover:text-paper"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>

      {safeLen > 1 ? (
        <>
          <button
            type="button"
            className="absolute left-2 top-1/2 z-[402] flex h-12 w-12 -translate-y-1/2 items-center justify-center text-2xl text-paper/80 transition hover:text-paper md:left-6"
            onClick={goPrev}
            aria-label="Previous"
          >
            ←
          </button>
          <button
            type="button"
            className="absolute right-2 top-1/2 z-[402] flex h-12 w-12 -translate-y-1/2 items-center justify-center text-2xl text-paper/80 transition hover:text-paper md:right-6"
            onClick={goNext}
            aria-label="Next"
          >
            →
          </button>
        </>
      ) : null}

      <div
        className="flex flex-1 cursor-zoom-out items-center justify-center p-4 pt-16"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="presentation"
      >
        {current.videoSrc ? (
          <video
            className="max-h-[90vh] max-w-[90vw]"
            controls
            playsInline
            poster={current.src || undefined}
            onClick={(e) => e.stopPropagation()}
          >
            <source src={current.videoSrc} />
          </video>
        ) : (
          <img
            src={current.src}
            alt={current.alt}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {current.caption ? (
        <p className="border-t border-white/10 px-6 py-4 text-center text-sm text-paper/80">{current.caption}</p>
      ) : null}

      {safeLen > 1 ? (
        <div className="pb-4 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-paper/45">
          {i + 1} / {safeLen}
        </div>
      ) : null}
    </div>
  );

  if (typeof document === 'undefined') return el;
  return createPortal(el, document.body);
}
