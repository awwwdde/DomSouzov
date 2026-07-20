import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Mail, X, Check, Loader2, Paperclip, Layers, Image as ImageIcon, Map, UtensilsCrossed, Coffee, Wine, Mic, Piano, Speaker, SlidersHorizontal, Volume2, MonitorSpeaker, Music, Users, ZoomIn } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { PageKicker } from '../components/PageKicker';
import Seo from '../components/Seo';
import { RevealSection } from '../components/Reveal';
import HallStats from '../components/HallStats';
import Lightbox from '../components/Lightbox';
import { submitOrganizerRequest } from '../api/client';
import type { Hall } from '../types';

/* ============================================================ */
/* ОРГАНИЗАТОРАМ — страница аренды.                             */
/* Короткий текст, видео-презентация, затем технический райдер: */
/* блоки по каждому помещению (фото + схема, описание,          */
/* оборудование). Данные — залы из CMS (админка «Залы»):        */
/*   scheme — изображение схемы/плана;                          */
/*   equipment_list — перечень оборудования (тех. райдер);      */
/*   rider_only — буфет/анфилада (без оборудования).            */
/* ============================================================ */

function mediaUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/')) return path;
  return `/${path}`;
}

export default function Organizers() {
  const { lang, t, tStrict, content } = useSite();
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const halls = content?.halls ?? [];

  /* Переход со страницы «Залы» (?hall=<id>): плавно проматываем к нужному
     блоку зала в тех. райдере, как только залы загрузились и отрисовались. */
  useEffect(() => {
    const hallId = new URLSearchParams(location.search).get('hall');
    if (!hallId || !halls.length) return;
    const timer = window.setTimeout(() => {
      document.getElementById(`hall-${hallId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [location.search, halls.length]);

  const title = tStrict('organizers_title') || (lang === 'ru' ? 'Организаторам' : 'For Organizers');
  const lead =
    tStrict('organizers_lead') ||
    (lang === 'ru'
      ? 'Колонный, Октябрьский и Малый залы Дома Союзов — для концертов, церемоний, форумов и съёмок. Историческая архитектура в центре Москвы, акустика класса A, вместимость до 1 200 гостей и собственная техническая команда.'
      : 'The Hall of Columns, the October and Small halls of the House of Unions — for concerts, ceremonies, forums and filming. Historic architecture in the heart of Moscow, class A acoustics, capacity up to 1,200 guests and an in-house technical crew.');
  const videoUrl = t('organizers_video_url');
  const videoPoster = t('organizers_video_poster');

  return (
    <div className="bg-paper">
      <Seo
        title={lang === 'ru' ? 'Организаторам — залы Дома Союзов' : 'For Organizers — venues · House of Unions'}
        description={lead}
        path="organizers"
        lang={lang}
      />
      {/* HERO */}
      <RevealSection className="border-b border-line px-5 pb-14 pt-28 md:px-12 md:pb-20 md:pt-32">
        <PageKicker>{lang === 'ru' ? 'Главная · Организаторам' : 'Home · For Organizers'}</PageKicker>
        <h1 className="font-heading text-[clamp(52px,9vw,140px)] font-bold uppercase leading-[0.86] tracking-[0.04em] text-ink">
          {title}
        </h1>
      </RevealSection>

      {/* ВИДЕО — крупный блок во всю ширину (как видео-герой на «О Доме») */}
      {videoUrl ? (
        <video
          className="block h-[86vh] max-h-[900px] min-h-[480px] w-full bg-ink object-cover"
          src={videoUrl}
          poster={videoPoster || undefined}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
        />
      ) : (
        <div className="flex h-[86vh] max-h-[900px] min-h-[480px] w-full items-center justify-center border-b border-line bg-paper-soft text-center text-[12px] font-bold uppercase tracking-[0.18em] text-muted">
          {lang === 'ru' ? 'Видео-презентация появится здесь' : 'Presentation video will appear here'}
        </div>
      )}

      {/* ТЕХНИЧЕСКИЙ РАЙДЕР: блоки по каждому помещению */}
      <HallsRider halls={halls} lang={lang} />

      {/* ЗАЯВКА */}
      <RevealSection className="px-5 py-16 md:px-12 md:py-24">
        {/* Заявка — кнопка во всю ширину, открывает форму */}
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="group mt-4 flex w-full items-center justify-between gap-5 border border-ink bg-ink p-6 text-paper transition hover:border-accent hover:bg-accent md:mt-6 md:p-8"
        >
          <span className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-current">
              <Mail size={22} strokeWidth={1.6} />
            </span>
            <span className="flex flex-col text-left">
              <span className="font-heading text-[clamp(20px,2vw,28px)] font-bold uppercase leading-[1.05] tracking-[0.02em]">
                {lang === 'ru' ? 'Оставить заявку' : 'Send a request'}
              </span>
              <span className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-paper/70">
                {lang === 'ru' ? 'Ответим с датами и сметой' : 'We will reply with dates and a quote'}
              </span>
            </span>
          </span>
          <ArrowUpRight
            size={26}
            strokeWidth={1.6}
            className="shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </button>
      </RevealSection>

      <AnimatePresence>
        {modalOpen ? <RequestModal lang={lang} onClose={() => setModalOpen(false)} /> : null}
      </AnimatePresence>
    </div>
  );
}

/* ----------------------------------------------------------------- */
/* RequestModal — модальное окно с формой заявки.                    */
/*  • поля: имя, email, телефон, сообщение;                          */
/*  • обязательный чекбокс согласия на обработку ПДн (152-ФЗ);       */
/*  • отправка на бэкенд → письмо на адрес из настроек.              */
/* ----------------------------------------------------------------- */
function RequestModal({ lang, onClose }: { lang: 'ru' | 'en'; onClose: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const MAX_FILE_MB = 25;
  const ACCEPT_FILES = '.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  const pickFile = (f: File | undefined | null) => {
    setError('');
    if (!f) {
      setFile(null);
      return;
    }
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'doc', 'docx'].includes(ext)) {
      setError(lang === 'ru' ? 'Можно прикрепить только PDF или DOCX' : 'Only PDF or DOCX files are allowed');
      return;
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setError(lang === 'ru' ? `Файл больше ${MAX_FILE_MB} МБ` : `File exceeds ${MAX_FILE_MB} MB`);
      return;
    }
    setFile(f);
  };

  /* Закрытие по Esc + блокировка прокрутки фона. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && consent && !sending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSending(true);
    setError('');
    try {
      await submitOrganizerRequest({ name, email, phone, message, consent, file });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : lang === 'ru' ? 'Ошибка отправки' : 'Submission error');
    } finally {
      setSending(false);
    }
  };

  const inputCls =
    'min-h-12 w-full rounded-none border border-line bg-paper px-4 text-base text-ink outline-none transition placeholder:text-muted focus:border-ink';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/60 backdrop-blur-sm md:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-[620px] overflow-y-auto bg-paper p-6 md:p-10"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={lang === 'ru' ? 'Закрыть' : 'Close'}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-line text-ink transition hover:border-ink hover:bg-ink hover:text-paper"
        >
          <X size={18} />
        </button>

        {done ? (
          <div className="flex flex-col items-start gap-5 py-6">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-accent text-paper">
              <Check size={26} />
            </span>
            <h2 className="font-heading text-[clamp(26px,4vw,40px)] font-bold uppercase leading-[1] tracking-[0.02em] text-ink">
              {lang === 'ru' ? 'Заявка отправлена' : 'Request sent'}
            </h2>
            <p className="max-w-md text-justify text-base leading-7 text-ink-soft [hyphens:none] [text-align-last:start]">
              {lang === 'ru'
                ? 'Спасибо! Мы свяжемся с вами в ближайшее время — с доступными датами и сметой.'
                : 'Thank you! We will get back to you shortly with available dates and a quote.'}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 inline-flex min-h-12 items-center justify-center border border-ink bg-ink px-7 text-[12px] font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-accent hover:border-accent"
            >
              {lang === 'ru' ? 'Готово' : 'Done'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
                {lang === 'ru' ? 'Организаторам' : 'For organizers'}
              </div>
              <h2 className="mt-2 font-heading text-[clamp(26px,4vw,42px)] font-bold uppercase leading-[0.98] tracking-[0.02em] text-ink">
                {lang === 'ru' ? 'Оставить заявку' : 'Send a request'}
              </h2>
              <p className="mt-3 text-justify text-[15px] leading-6 text-ink-soft [hyphens:none] [text-align-last:start]">
                {lang === 'ru'
                  ? 'Опишите мероприятие — мы ответим с доступными датами, залами и сметой.'
                  : 'Tell us about your event — we will reply with available dates, halls and a quote.'}
              </p>
            </div>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                {lang === 'ru' ? 'Имя *' : 'Name *'}
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputCls}
                placeholder={lang === 'ru' ? 'Как к вам обращаться' : 'Your name'}
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">Email *</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputCls}
                  placeholder="you@example.com"
                />
              </label>
              <label className="grid gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                  {lang === 'ru' ? 'Телефон' : 'Phone'}
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls}
                  placeholder="+7 (___) ___-__-__"
                />
              </label>
            </div>

            <label className="grid gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                {lang === 'ru' ? 'Сообщение' : 'Message'}
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full rounded-none border border-line bg-paper p-4 text-base text-ink outline-none transition placeholder:text-muted focus:border-ink"
                placeholder={
                  lang === 'ru'
                    ? 'Тип мероприятия, предполагаемая дата, число гостей…'
                    : 'Event type, preferred date, number of guests…'
                }
              />
            </label>

            <div className="grid gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">
                {lang === 'ru' ? 'Файл (PDF или DOCX)' : 'File (PDF or DOCX)'}
              </span>
              {file ? (
                <div className="flex items-center justify-between gap-3 border border-line bg-paper-soft px-4 py-3">
                  <span className="flex min-w-0 items-center gap-2 text-sm text-ink">
                    <Paperclip size={15} className="shrink-0 text-accent" />
                    <span className="truncate">{file.name}</span>
                    <span className="shrink-0 text-muted">({(file.size / (1024 * 1024)).toFixed(1)} МБ)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    aria-label={lang === 'ru' ? 'Убрать файл' : 'Remove file'}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-ink transition hover:border-ink hover:bg-ink hover:text-paper"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center gap-3 border border-dashed border-line bg-paper px-4 py-3 text-sm text-ink-soft transition hover:border-ink">
                  <Paperclip size={15} className="shrink-0 text-accent" />
                  <span>{lang === 'ru' ? 'Прикрепить файл' : 'Attach a file'}</span>
                  <span className="ml-auto text-[11px] uppercase tracking-[0.12em] text-muted">
                    {lang === 'ru' ? `до ${MAX_FILE_MB} МБ` : `up to ${MAX_FILE_MB} MB`}
                  </span>
                  <input
                    type="file"
                    accept={ACCEPT_FILES}
                    onChange={(e) => pickFile(e.target.files?.[0])}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-accent"
              />
              <span className="text-[13px] leading-5 text-ink-soft">
                {lang === 'ru' ? 'Я согласен на обработку ' : 'I consent to the processing of my '}
                <Link to="/personal-data-consent" target="_blank" className="font-semibold text-ink underline underline-offset-2 hover:text-accent">
                  {lang === 'ru' ? 'персональных данных' : 'personal data'}
                </Link>
                {lang === 'ru' ? ' в соответствии с 152-ФЗ.' : ' under Federal Law No. 152-FZ.'}
              </span>
            </label>

            {error ? (
              <div className="border-l-2 border-error bg-paper-soft px-4 py-3 text-[13px] leading-5 text-error">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-ink bg-ink px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-paper transition hover:bg-accent hover:border-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? <Loader2 size={16} className="animate-spin" /> : null}
              {sending
                ? lang === 'ru'
                  ? 'Отправка…'
                  : 'Sending…'
                : lang === 'ru'
                  ? 'Отправить заявку'
                  : 'Send request'}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ================================================================= */
/* HallsRider — технический райдер: блок по каждому помещению.        */
/*  Данные из CMS (залы). Для помещений без оборудования (буфет,      */
/*  анфилада — rider_only) показываем аккуратную пометку.            */
/* ================================================================= */
function HallsRider({ halls, lang }: { halls: Hall[]; lang: 'ru' | 'en' }) {
  if (!halls.length) return null;
  return (
    <RevealSection className="border-t border-line px-5 py-16 md:px-12 md:py-24">
      <PageKicker>{lang === 'ru' ? 'Технический райдер' : 'Technical rider'}</PageKicker>
      <h2 className="max-w-[18ch] font-heading text-[clamp(34px,5vw,72px)] font-bold uppercase leading-[0.9] tracking-[0.03em] text-ink">
        {lang === 'ru' ? 'Залы и помещения' : 'Halls & spaces'}
      </h2>

      <div className="mt-10 border-t border-line md:mt-14">
        {halls.map((hall) => (
          <HallRiderBlock key={hall.id} hall={hall} lang={lang} />
        ))}
      </div>
    </RevealSection>
  );
}

/** Подбирает иконку под пункт оборудования по ключевым словам. */
function equipmentIcon(text: string): LucideIcon {
  const s = text.toLowerCase();
  if (/рояль|пианино|piano|steinway|bechstein|москва/.test(s)) return Piano;
  if (/микрофон|радиомикроф|mic|shure/.test(s)) return Mic;
  if (/микшер|пульт|mixer|soundcraft|yamaha|allen/.test(s)) return SlidersHorizontal;
  if (/сабвуфер|subwoofer/.test(s)) return Volume2;
  if (/монитор|monitor/.test(s)) return MonitorSpeaker;
  if (/массив|портал|колонк|акустик|array|speaker|coda|jbl/.test(s)) return Speaker;
  if (/конференц|conference/.test(s)) return Users;
  return Music;
}

/** Число колонок под количество блоков: 3→3, 8→4 (2 ряда), 6→3 и т.д.
 *  Стараемся заполнять ряды нацело, чтобы не оставалось пустых ячеек. */
function colsFor(n: number): number {
  if (n <= 4) return Math.max(n, 1); // 1→1, 2→2, 3→3, 4→4
  let best = 4;
  let bestRem = Infinity;
  for (const c of [4, 3, 2]) {
    const rem = (c - (n % c)) % c; // сколько пустых ячеек в последнем ряду
    if (rem < bestRem || (rem === bestRem && c > best)) {
      bestRem = rem;
      best = c;
    }
  }
  return best;
}

/** Адаптивные колонки: на десктопе — под количество (colsFor), на узких — меньше.
 *  Строки статичные, чтобы Tailwind их собрал. Незаполненный ряд остаётся
 *  пустым (без «цветной» ячейки) — карточки сами рисуют border-r/border-b. */
function gridColsClass(count: number): string {
  switch (colsFor(count)) {
    case 1:
      return 'grid-cols-1';
    case 2:
      return 'grid-cols-1 sm:grid-cols-2';
    case 3:
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
    default:
      return 'grid-cols-2 md:grid-cols-4';
  }
}

function HallRiderBlock({ hall, lang }: { hall: Hall; lang: 'ru' | 'en' }) {
  const name = hall.name?.[lang] || hall.name?.ru || '';

  // Блоки оборудования (каждый — отдельная запись, у части может быть картинка).
  const eqBlocks = hall.equipment_blocks ?? [];
  const eqText = (b: { text: { ru: string; en: string } }) => b.text?.[lang] || b.text?.ru || '';
  // Лайтбокс — только блоки с картинкой; клик по блоку открывает его фото.
  const imageBlocks = eqBlocks.filter((b) => b.image);
  const lightboxItems = imageBlocks.map((b) => ({ src: mediaUrl(b.image), alt: eqText(b) || name }));
  const [lbOpen, setLbOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const openLightbox = (image: string | null | undefined) => {
    const idx = imageBlocks.findIndex((b) => b.image === image);
    if (idx >= 0) {
      setLbIndex(idx);
      setLbOpen(true);
    }
  };

  // Фото зала (до 5) и схемы рассадки (может быть несколько вариаций).
  const photos = (hall.gallery && hall.gallery.length ? hall.gallery : hall.image ? [hall.image] : [])
    .filter(Boolean)
    .slice(0, 5);
  const schemes = (hall.schemes && hall.schemes.length ? hall.schemes : hall.scheme ? [hall.scheme] : [])
    .filter(Boolean);

  // Два одинаковых блока в ряд: схема | фото. Показываем только непустые.
  const blocks: { key: 'scheme' | 'photo'; items: string[] }[] = [];
  if (schemes.length) blocks.push({ key: 'scheme', items: schemes });
  if (photos.length) blocks.push({ key: 'photo', items: photos });

  return (
    <article id={`hall-${hall.id}`} className="scroll-mt-28 border-b border-line py-10 md:py-14">
      {/* Заголовок зала над медиа: название слева, цифры справа в один ряд */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12">
        <h3 className="font-heading text-[clamp(28px,3.4vw,52px)] font-bold uppercase leading-[0.98] tracking-[0.02em] text-ink">
          {name}
        </h3>
        {/* Крупная типографика: только цифры (мест / м²). */}
        <HallStats capacity={hall.capacity} area={hall.area} className="shrink-0 md:justify-end" />
      </div>

      {/* Два блока в ряд: схема и фото, каждый со своим слайдером. */}
      {blocks.length ? (
        <div className={`mt-8 grid gap-5 md:mt-10 md:gap-6 ${blocks.length > 1 ? 'md:grid-cols-2' : ''}`}>
          {blocks.map((b) => (
            <div key={b.key}>
              <div className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink">
                {b.key === 'scheme' ? (
                  <Map size={14} className="text-accent" strokeWidth={1.9} />
                ) : (
                  <ImageIcon size={14} className="text-accent" strokeWidth={1.9} />
                )}
                {b.key === 'scheme'
                  ? lang === 'ru' ? 'Схема рассадки' : 'Seating plan'
                  : lang === 'ru' ? 'Фотографии' : 'Photos'}
              </div>
              <MediaSlider items={b.items} variant={b.key} name={name} lang={lang} />
            </div>
          ))}
        </div>
      ) : null}

      {/* Оборудование */}
      <div className="mt-8 border-t border-line pt-6">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-ink">
            <Layers size={15} className="text-accent" strokeWidth={1.8} />
            {lang === 'ru' ? 'Оборудование' : 'Equipment'}
          </div>
          {eqBlocks.length ? (
            /* Блоки во всю ширину, число колонок — под количество. Блок с фото
               кликабелен и открывает картинку в модальном окне (лайтбокс). */
            <div className={`mt-5 grid border-l border-t border-line ${gridColsClass(eqBlocks.length)}`}>
              {eqBlocks.map((b, j) => {
                const item = eqText(b);
                const Icon = equipmentIcon(item);
                const hasImage = Boolean(b.image);
                const inner = (
                  <>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line text-accent transition group-hover:border-accent group-hover:bg-accent group-hover:text-paper">
                      <Icon size={22} strokeWidth={1.6} />
                    </span>
                    <p className="text-justify text-[16px] font-medium leading-[1.5] text-ink [hyphens:none] [text-align-last:start]">
                      {item}
                    </p>
                    {hasImage ? (
                      <span className="mt-auto inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
                        <ZoomIn size={14} strokeWidth={2} />
                        {lang === 'ru' ? 'Смотреть фото' : 'View photo'}
                      </span>
                    ) : null}
                  </>
                );
                const cls = 'group flex h-full flex-col gap-4 border-b border-r border-line bg-paper p-6 transition hover:bg-paper-soft md:p-7';
                return hasImage ? (
                  <button
                    key={j}
                    type="button"
                    onClick={() => openLightbox(b.image)}
                    className={`${cls} cursor-zoom-in text-left`}
                    aria-label={`${item} — ${lang === 'ru' ? 'открыть фото' : 'open photo'}`}
                  >
                    {inner}
                  </button>
                ) : (
                  <div key={j} className={cls}>
                    {inner}
                  </div>
                );
              })}
            </div>
          ) : (
            <NoEquipment lang={lang} />
          )}
      </div>

      {lightboxItems.length ? (
        <Lightbox
          open={lbOpen}
          onClose={() => setLbOpen(false)}
          items={lightboxItems}
          index={lbIndex}
          onIndexChange={setLbIndex}
        />
      ) : null}
    </article>
  );
}

/* Помещения без сцен. оборудования (буфет, анфилада): пояснение + крупные
   блоки-назначения в стиле раздела «Зрителям». */
function NoEquipment({ lang }: { lang: 'ru' | 'en' }) {
  const uses = lang === 'ru'
    ? [
        { icon: UtensilsCrossed, label: 'Фуршеты' },
        { icon: Coffee, label: 'Кофе-брейки' },
        { icon: Wine, label: 'Дегустации' },
      ]
    : [
        { icon: UtensilsCrossed, label: 'Receptions' },
        { icon: Coffee, label: 'Coffee breaks' },
        { icon: Wine, label: 'Tastings' },
      ];
  return (
    <>
      <p className="mt-3 text-justify text-[15px] leading-[1.6] text-muted [hyphens:none] [text-align-last:start]">
        {lang === 'ru'
          ? 'Сценическое оборудование не предусмотрено — пространство для:'
          : 'No stage equipment — a space for:'}
      </p>
      <div className={`mt-5 grid border-l border-t border-line ${gridColsClass(uses.length)}`}>
        {uses.map(({ icon: Icon, label }, i) => (
          <div key={i} className="group flex h-full flex-col gap-4 border-b border-r border-line bg-paper p-6 transition hover:bg-paper-soft md:p-7">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line text-accent transition group-hover:border-accent group-hover:bg-accent group-hover:text-paper">
              <Icon size={22} strokeWidth={1.6} />
            </span>
            <h4 className="font-heading text-[clamp(17px,1.4vw,21px)] font-bold uppercase leading-[1.1] tracking-[0.02em] text-ink">
              {label}
            </h4>
          </div>
        ))}
      </div>
    </>
  );
}

/* Универсальный слайдер медиа для блока зала: массив кадров одного типа.
   Фиксированная высота (оба блока в ряду одинаковые). Фото показываем целиком
   (object-contain) на размытой заливке — без белых полей и без обрезки. Схему
   показываем на белом фоне (это план, а не фото). Стрелки и точки — при
   нескольких кадрах (доп. фото или вариации схемы). */
function MediaSlider({
  items,
  variant,
  name,
  lang,
}: {
  items: string[];
  variant: 'scheme' | 'photo';
  name: string;
  lang: 'ru' | 'en';
}) {
  const [idx, setIdx] = useState(0);
  const go = (dir: 1 | -1) => setIdx((i) => (i + dir + items.length) % items.length);

  if (!items.length) return null;
  const isScheme = variant === 'scheme';

  return (
    <div className="relative aspect-[4/3] w-full min-w-0 overflow-hidden bg-paper-soft md:min-h-[360px]">
      {items.map((src, i) => {
        const active = i === idx;
        return (
          <div
            key={src + i}
            className="absolute inset-0 transition-opacity duration-700 ease-ds"
            style={{ opacity: active ? 1 : 0 }}
            aria-hidden={!active}
          >
            <img
              src={mediaUrl(src)}
              alt={
                !active
                  ? ''
                  : isScheme
                    ? `${name} — ${lang === 'ru' ? 'схема рассадки' : 'seating plan'}`
                    : name
              }
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 h-full w-full ${isScheme ? 'bg-white object-contain p-3' : 'object-cover'}`}
            />
          </div>
        );
      })}

      {/* Стрелки и точки — при нескольких кадрах */}
      {items.length > 1 ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={lang === 'ru' ? 'Предыдущий кадр' : 'Previous slide'}
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/20 text-2xl leading-none text-paper backdrop-blur-sm transition hover:bg-ink/45"
          >
            <span aria-hidden>←</span>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={lang === 'ru' ? 'Следующий кадр' : 'Next slide'}
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-ink/20 text-2xl leading-none text-paper backdrop-blur-sm transition hover:bg-ink/45"
          >
            <span aria-hidden>→</span>
          </button>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={lang === 'ru' ? `Кадр ${i + 1}` : `Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-5 bg-paper' : 'w-1.5 bg-paper/50 hover:bg-paper/80'}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
