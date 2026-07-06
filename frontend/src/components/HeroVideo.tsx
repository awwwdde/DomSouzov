import { useEffect, useRef } from 'react';

/* ================================================================ */
/* HeroVideo — фоновое видео-hero с автоплеем, надёжным на мобильных. */
/*                                                                  */
/* ВАЖНО про iOS: рабочий вариант — чисто декларативный              */
/* (muted + autoplay + playsinline + preload="metadata"). Именно так  */
/* автоплей работал на iPhone. НЕ ставим preload="auto": для тяжёлого  */
/* видео iOS начинает буферизировать весь файл и застревает на первом  */
/* кадре. Программный play() тоже не форсируем на монтировании —       */
/* только как безопасный фолбэк по первому касанию (Low Power Mode),   */
/* где это разрешено внутри пользовательского жеста.                   */
/* ================================================================ */
export default function HeroVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    // iOS проверяет именно DOM-атрибут muted (React ставит только свойство).
    v.muted = true;
    v.setAttribute('muted', '');

    // Фолбэк на случай, когда автоплей заблокирован (Low Power Mode и т.п.):
    // стартуем при первом реальном касании/клике — это валидный жест.
    const onInteract = () => {
      v.play().catch(() => {});
    };
    window.addEventListener('touchend', onInteract, { once: true, passive: true });
    window.addEventListener('click', onInteract, { once: true });

    return () => {
      window.removeEventListener('touchend', onInteract);
      window.removeEventListener('click', onInteract);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster || undefined}
      preload="metadata"
      muted
      autoPlay
      loop
      playsInline
    />
  );
}
