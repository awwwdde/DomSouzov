import { useEffect, useRef } from 'react';

/* ================================================================ */
/* HeroVideo — фоновое видео-hero с надёжным автоплеем на мобильных.  */
/*                                                                  */
/* iOS Safari и Android Chrome блокируют autoplay, пока не выполнены  */
/* ВСЕ условия: реальный DOM-атрибут muted (React ставит только       */
/* свойство), playsInline и явный вызов play(). Плюс видео может быть  */
/* ещё не готово в момент mount — поэтому повторяем play() на          */
/* loadeddata/canplay, а на случай Low Power Mode (где автоплей        */
/* запрещён совсем) стартуем при первом касании/клике по странице.     */
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

    v.muted = true;
    v.setAttribute('muted', '');

    const tryPlay = () => {
      v.play().catch(() => {});
    };
    tryPlay();

    v.addEventListener('loadeddata', tryPlay);
    v.addEventListener('canplay', tryPlay);

    // Автоплей заблокирован (Low Power Mode и т.п.) — стартуем при первом
    // взаимодействии пользователя, один раз.
    const onInteract = () => tryPlay();
    window.addEventListener('touchstart', onInteract, { once: true, passive: true });
    window.addEventListener('click', onInteract, { once: true });

    return () => {
      v.removeEventListener('loadeddata', tryPlay);
      v.removeEventListener('canplay', tryPlay);
      window.removeEventListener('touchstart', onInteract);
      window.removeEventListener('click', onInteract);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster || undefined}
      preload="auto"
      muted
      autoPlay
      loop
      playsInline
      disablePictureInPicture
    />
  );
}
