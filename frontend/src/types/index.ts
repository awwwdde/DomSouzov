export interface BilingualString {
  ru: string;
  en: string;
}

export interface EventGalleryImage {
  id: number;
  image: string;
  caption: BilingualString | null;
  order: number;
}

export interface EventOccurrence {
  date: string;       // RU, напр. "20 ДЕК 2025"
  date_en: string;    // EN, напр. "20 DEC 2025"
  time: string;       // "12:00"
  weekday_ru?: string;
  weekday_en?: string;
}

export interface Event {
  id: number;
  title: BilingualString;
  date: BilingualString;
  time: string;
  weekday: BilingualString;
  /** Сеансы мультидат; пусто/нет → одиночная дата (date/time выше). */
  dates?: EventOccurrence[];
  hall: BilingualString;
  tag: BilingualString;
  price: BilingualString;
  description: BilingualString;
  image: string | null;
  image_vertical?: string | null;
  is_featured: boolean;
  is_lead?: boolean;
  has_ticket?: boolean;
  ticket_url?: string | null;
  age_rating?: string | null;
  is_pinned?: boolean;
  pin_order?: number;
  gallery?: EventGalleryImage[];
}

export interface NewsMedia {
  type: 'image' | 'video';
  url: string;
}

export interface NewsArticle {
  id: number;
  tag: BilingualString;
  title: BilingualString;
  excerpt: BilingualString;
  content: BilingualString;
  image: string | null;
  gallery?: NewsMedia[];
  is_lead: boolean;
  is_pinned?: boolean;
  pin_order?: number;
  created_at?: string | null;
}

export interface HallFeature {
  title: BilingualString;
  text: BilingualString;
}

export interface Hall {
  id: number;
  name: BilingualString;
  capacity: string;
  area: string;
  columns: string | null;
  features: BilingualString;
  features_list?: HallFeature[];
  description: BilingualString;
  image: string | null;
  gallery?: string[];
  scheme?: string | null;
  schemes?: string[];
  equipment?: BilingualString;
  equipment_list?: { ru: string[]; en: string[] };
  rider_only?: boolean;
}

export interface Review {
  author: string;
  text: string;
  rating: number;
  date_label: string;
  source: 'manual' | 'yandex';
}

export interface ReviewsResponse {
  rating: number | null;
  url: string;
  reviews: Review[];
}

export interface GalleryCategory {
  id: number;
  slug: string;
  name: BilingualString;
  cover_image: string | null;
  cover_video?: string | null;
  order: number;
}

export interface GalleryImage {
  id: number;
  caption: BilingualString;
  category: BilingualString;
  image: string;
  span: string | null;
  category_id?: number | null;
  is_video?: boolean;
  video_url?: string | null;
}

export interface Partner {
  id: number;
  name: BilingualString;
  logo: string | null;
  url: string;
  sort_order: number;
  is_active?: boolean;
}

export interface SiteSettings {
  [key: string]: BilingualString;
}

export interface AboutHoverTip {
  id: number;
  phrase: BilingualString;
  media_url: string;
  media_type: 'image' | 'video' | 'gif';
  caption: BilingualString;
  sort_order: number;
}

export interface AboutScatteredPhoto {
  id: number;
  image: string;
  caption: BilingualString;
  col_start: number;
  col_span: number;
  offset_y: number;
  parallax_speed: number;
  reveal_progress: number;
  sort_order: number;
}

export interface AboutTimelineEvent {
  id: number;
  year: string;
  tag?: BilingualString;
  title: BilingualString;
  description: BilingualString;
  image: string | null;
  sort_order: number;
}

export interface AboutContent {
  hover_tips: AboutHoverTip[];
  scattered_photos: AboutScatteredPhoto[];
  timeline: AboutTimelineEvent[];
}

export interface SiteContent {
  settings: SiteSettings;
  events: Event[];
  news: NewsArticle[];
  halls: Hall[];
  gallery: GalleryImage[];
  gallery_categories: GalleryCategory[];
  partners: Partner[];
  about?: AboutContent;
}

export type Lang = 'ru' | 'en';
