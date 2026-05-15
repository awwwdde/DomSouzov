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

export interface Event {
  id: number;
  title: BilingualString;
  date: BilingualString;
  time: string;
  weekday: BilingualString;
  hall: BilingualString;
  tag: BilingualString;
  price: BilingualString;
  description: BilingualString;
  image: string | null;
  is_featured: boolean;
  has_ticket?: boolean;
  ticket_url?: string | null;
  is_pinned?: boolean;
  pin_order?: number;
  gallery?: EventGalleryImage[];
}

export interface NewsArticle {
  id: number;
  tag: BilingualString;
  title: BilingualString;
  excerpt: BilingualString;
  content: BilingualString;
  image: string | null;
  is_lead: boolean;
  is_pinned?: boolean;
  pin_order?: number;
  created_at?: string | null;
}

export interface Hall {
  id: number;
  name: BilingualString;
  capacity: string;
  area: string;
  columns: string | null;
  features: BilingualString;
  description: BilingualString;
  image: string | null;
}

export interface GalleryCategory {
  id: number;
  slug: string;
  name: BilingualString;
  cover_image: string | null;
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

export interface SiteContent {
  settings: SiteSettings;
  events: Event[];
  news: NewsArticle[];
  halls: Hall[];
  gallery: GalleryImage[];
  gallery_categories: GalleryCategory[];
  partners: Partner[];
}

export type Lang = 'ru' | 'en';
