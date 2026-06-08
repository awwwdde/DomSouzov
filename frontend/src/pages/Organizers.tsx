import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FileText, LayoutGrid, ArrowUpRight } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { PageKicker } from '../components/PageKicker';
import Seo from '../components/Seo';
import { RevealSection } from '../components/Reveal';

/* ============================================================ */
/* ОРГАНИЗАТОРАМ — минималистичная страница аренды.             */
/* Короткий текст для понимания, без списков. Две ключевые      */
/* кнопки открывают PDF (тех. райдер и презентацию залов),      */
/* привязанные через CMS (site_settings):                       */
/*   organizers_rider_pdf — ссылка на PDF технического райдера; */
/*   organizers_halls_pdf — ссылка на PDF о залах.              */
/* ============================================================ */

export default function Organizers() {
  const { lang, t } = useSite();

  const title = t('organizers_title') || (lang === 'ru' ? 'Организаторам' : 'For Organizers');
  const lead =
    t('organizers_lead') ||
    (lang === 'ru'
      ? 'Колонный, Октябрьский и Малый залы Дома Союзов — для концертов, церемоний, форумов и съёмок. Историческая архитектура в центре Москвы, акустика класса A, вместимость до 1 200 гостей и собственная техническая команда.'
      : 'The Hall of Columns, the October and Small halls of the House of Unions — for concerts, ceremonies, forums and filming. Historic architecture in the heart of Moscow, class A acoustics, capacity up to 1,200 guests and an in-house technical crew.');
  const note =
    t('organizers_note') ||
    (lang === 'ru'
      ? 'Скачайте технический райдер и презентацию залов или отправьте запрос — мы ответим с доступными датами и сметой.'
      : 'Download the technical rider and the halls presentation, or send a request — we will reply with available dates and a quote.');

  const riderPdf = t('organizers_rider_pdf');
  const hallsPdf = t('organizers_halls_pdf');

  return (
    <div className="bg-paper">
      <Seo
        title={lang === 'ru' ? 'Организаторам — аренда залов Дома Союзов' : 'For Organizers — venue hire · House of Unions'}
        description={lead}
        path="organizers"
        lang={lang}
      />
      {/* HERO */}
      <RevealSection className="grid gap-8 border-b border-line px-5 pb-14 pt-28 md:grid-cols-[1.1fr_1fr] md:px-12 md:pb-20 md:pt-32">
        <div>
          <PageKicker>{lang === 'ru' ? 'Главная · Организаторам' : 'Home · For Organizers'}</PageKicker>
          <h1 className="font-heading text-[clamp(52px,9vw,140px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">
            {title}
          </h1>
        </div>
        <p className="max-w-2xl self-end text-lg leading-8 text-ink-soft">{lead}</p>
      </RevealSection>

      {/* ДЕЙСТВИЯ: две ключевые кнопки + запрос */}
      <RevealSection className="px-5 py-16 md:px-12 md:py-24">
        <p className="mb-10 max-w-3xl text-base leading-7 text-ink-soft md:text-lg">{note}</p>

        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          <PdfButton
            href={riderPdf}
            icon={<FileText size={22} strokeWidth={1.6} />}
            label={lang === 'ru' ? 'Просмотреть технический райдер' : 'View technical rider'}
            hint={lang === 'ru' ? 'PDF · откроется в новой вкладке' : 'PDF · opens in a new tab'}
            soon={lang === 'ru' ? 'Скоро' : 'Soon'}
          />
          <PdfButton
            href={hallsPdf}
            fallbackTo="/halls"
            icon={<LayoutGrid size={22} strokeWidth={1.6} />}
            label={lang === 'ru' ? 'Залы' : 'Halls'}
            hint={
              hallsPdf
                ? lang === 'ru'
                  ? 'PDF · откроется в новой вкладке'
                  : 'PDF · opens in a new tab'
                : lang === 'ru'
                  ? 'Перейти к описанию залов'
                  : 'Go to the halls overview'
            }
            soon={lang === 'ru' ? 'Скоро' : 'Soon'}
          />
        </div>

        <div className="mt-12 border-t border-line pt-10">
          <Link
            to="/contacts"
            className="group inline-flex items-center gap-3 font-heading text-[clamp(22px,2.4vw,34px)] font-bold uppercase leading-none tracking-[0.02em] text-ink transition hover:text-accent"
          >
            {lang === 'ru' ? 'Отправить запрос на аренду' : 'Send a rental request'}
            <ArrowUpRight
              size={28}
              strokeWidth={1.6}
              className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </Link>
        </div>
      </RevealSection>
    </div>
  );
}

/* ----------------------------------------------------------------- */
/* PdfButton — крупная кнопка действия.                              */
/*  • есть PDF → открывает его в новой вкладке;                      */
/*  • нет PDF, но есть fallbackTo → ведёт на внутреннюю страницу;    */
/*  • нет ничего → неактивная плашка «Скоро».                        */
/* ----------------------------------------------------------------- */
function PdfButton({
  href,
  fallbackTo,
  icon,
  label,
  hint,
  soon,
}: {
  href?: string;
  fallbackTo?: string;
  icon: ReactNode;
  label: string;
  hint: string;
  soon: string;
}) {
  const base =
    'group flex items-center justify-between gap-5 border border-line bg-paper-soft p-6 transition md:p-8';
  const active = 'hover:border-accent hover:bg-accent hover:text-paper';

  const inner = (
    <>
      <span className="flex items-center gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-current text-accent transition group-hover:text-paper">
          {icon}
        </span>
        <span className="flex flex-col">
          <span className="font-heading text-[clamp(20px,2vw,28px)] font-bold uppercase leading-[1.05] tracking-[0.02em]">
            {label}
          </span>
          <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted transition group-hover:text-paper/80">
            {hint}
          </span>
        </span>
      </span>
      <ArrowUpRight size={26} strokeWidth={1.6} className="shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
    </>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${active}`}>
        {inner}
      </a>
    );
  }
  if (fallbackTo) {
    return (
      <Link to={fallbackTo} className={`${base} ${active}`}>
        {inner}
      </Link>
    );
  }
  return (
    <div className={`${base} cursor-default opacity-60`} aria-disabled>
      <span className="flex items-center gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-current text-muted">
          {icon}
        </span>
        <span className="flex flex-col">
          <span className="font-heading text-[clamp(20px,2vw,28px)] font-bold uppercase leading-[1.05] tracking-[0.02em]">
            {label}
          </span>
          <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted">{soon}</span>
        </span>
      </span>
    </div>
  );
}
