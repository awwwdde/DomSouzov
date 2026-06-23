import { useEffect, useState } from 'react';
import { useSite } from '../context/SiteContext';

/* Тонкая полоска загрузки сверху (вместо полноэкранного прелоадера).
   Пока грузится контент сайта — ползёт вправо; по готовности добегает
   до конца и исчезает. */
export default function TopProgressBar() {
  const { loading } = useSite();
  const [width, setWidth] = useState(8);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (loading) {
      setVisible(true);
      setWidth(8);
      // Плавно подбираемся к 90%, пока ждём ответ.
      const t1 = window.setTimeout(() => setWidth(45), 80);
      const t2 = window.setTimeout(() => setWidth(90), 400);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }
    // Готово — добегаем до 100% и прячем.
    setWidth(100);
    const hide = window.setTimeout(() => setVisible(false), 350);
    return () => window.clearTimeout(hide);
  }, [loading]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px] bg-transparent" aria-hidden>
      <div
        className="h-full bg-accent shadow-[0_0_8px_rgba(31,95,78,0.6)] transition-[width,opacity] duration-300 ease-out"
        style={{ width: `${width}%`, opacity: width >= 100 ? 0 : 1 }}
      />
    </div>
  );
}
