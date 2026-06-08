import { Helmet } from 'react-helmet-async';

/* ============================================================ */
/* Seo — мета-теги страницы для клиентской SPA-навигации.       */
/* На проде те же теги сервер уже внедряет в HTML (backend/seo) */
/* для краулеров; здесь поддерживаем их при переходах и для     */
/* JS-краулеров. Канонический URL строится от SITE_URL.         */
/* ============================================================ */

export const SITE_URL = 'https://union.awwwdde.art';
export const SITE_NAME = 'Дом Союзов';
const DEFAULT_IMAGE = `${SITE_URL}/og-default.jpg`;

function abs(pathOrUrl?: string): string {
  if (!pathOrUrl) return DEFAULT_IMAGE;
  if (pathOrUrl.startsWith('http')) return pathOrUrl;
  return `${SITE_URL}/${pathOrUrl.replace(/^\//, '')}`;
}

type SeoProps = {
  title: string;
  description?: string;
  /** Путь без домена, напр. "events/12" или "" для главной. */
  path?: string;
  image?: string;
  type?: 'website' | 'article' | 'event';
  lang?: 'ru' | 'en';
  /** Готовый объект JSON-LD (будет сериализован). */
  jsonLd?: Record<string, unknown>;
  /** Не индексировать (правовые/служебные). */
  noindex?: boolean;
};

export default function Seo({
  title,
  description,
  path = '',
  image,
  type = 'website',
  lang = 'ru',
  jsonLd,
  noindex,
}: SeoProps) {
  const canonical = `${SITE_URL}/${path.replace(/^\//, '')}`.replace(/\/$/, '') || SITE_URL;
  const img = abs(image);
  const ogType = type === 'event' ? 'website' : type; // og не знает "event"

  return (
    <Helmet>
      <html lang={lang} />
      <title>{title}</title>
      {description ? <meta name="description" content={description} /> : null}
      <link rel="canonical" href={canonical} />
      {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={lang === 'ru' ? 'ru_RU' : 'en_US'} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      {description ? <meta property="og:description" content={description} /> : null}
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={img} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description ? <meta name="twitter:description" content={description} /> : null}
      <meta name="twitter:image" content={img} />

      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  );
}
