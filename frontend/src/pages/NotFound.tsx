import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import Seo from '../components/Seo';
import { PageKicker } from '../components/PageKicker';

export default function NotFound() {
  const { lang } = useSite();
  return (
    <section className="flex min-h-[70vh] flex-col justify-center border-b border-line bg-paper px-5 py-28 md:px-12">
      <Seo
        title={lang === 'ru' ? 'Страница не найдена — Дом Союзов' : 'Page not found — House of Unions'}
        path="404"
        lang={lang}
        noindex
      />
      <PageKicker>{lang === 'ru' ? 'Ошибка 404' : 'Error 404'}</PageKicker>
      <h1 className="font-heading text-[clamp(64px,14vw,200px)] font-bold uppercase leading-[0.82] tracking-[0.02em] text-ink">
        404
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-ink-soft">
        {lang === 'ru'
          ? 'Такой страницы нет или она была перемещена. Вернитесь на главную или загляните в афишу.'
          : 'This page does not exist or has been moved. Return home or browse the programme.'}
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-paper transition hover:bg-accent-deep"
        >
          {lang === 'ru' ? 'На главную' : 'Home'}
        </Link>
        <Link
          to="/events"
          className="inline-flex items-center justify-center rounded-full border border-ink px-6 py-3 text-[12px] font-bold uppercase tracking-[0.16em] text-ink transition hover:bg-ink hover:text-paper"
        >
          {lang === 'ru' ? 'Афиша' : 'Programme'}
        </Link>
      </div>
    </section>
  );
}
