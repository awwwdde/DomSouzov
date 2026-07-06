import { useEffect, useRef } from 'react';

/* ================================================================ */
/* HeroVideo — фоновое видео-hero с автоплеем, надёжным на мобильных. */
/*                                                                  */
/* iOS/Android капризны с автоплеем, поэтому подстраховываемся с      */
/* нескольких сторон:                                                 */
/*  1. muted как DOM-атрибут (React ставит только свойство) + ранний   */
/*     defaultMuted — иначе iOS считает видео «со звуком» и блокирует.  */
/*  2. Проактивный play() при монтировании и на loadeddata/canplay —   */
/*     сам по себе автоплей-атрибут на iOS часто НЕ стартует (тогда     */
/*     виден чёрный экран/первый кадр, пока не будет жеста).            */
/*  3. IntersectionObserver — (пере)запуск, когда видео во вьюпорте.    */
/*  4. Фолбэк по первому касанию/клику (Low Power Mode).               */
/* preload="metadata" (НЕ "auto"): для тяжёлого файла auto заставляет   */
/* iOS буферизировать всё целиком и застревать на первом кадре.        */
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
    v.defaultMuted = true;
    v.setAttribute('muted', '');

    const play = () => {
      v.play().catch(() => {});
    };

    // Пытаемся стартовать сразу и по мере готовности данных.
    play();
    v.addEventListener('loadeddata', play);
    v.addEventListener('canplay', play);

    // Запуск, когда видео появляется во вьюпорте (в т.ч. при возврате скроллом).
    let io: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) play();
        },
        { threshold: 0.1 }
      );
      io.observe(v);
    }

    // Фолбэк на случай, когда автоплей заблокирован (Low Power Mode и т.п.):
    // стартуем при первом реальном касании/клике — это валидный жест.
    const onInteract = () => play();
    window.addEventListener('touchend', onInteract, { once: true, passive: true });
    window.addEventListener('click', onInteract, { once: true });

    return () => {
      v.removeEventListener('loadeddata', play);
      v.removeEventListener('canplay', play);
      io?.disconnect();
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
