export interface BilingualString {
  ru: string;
  en: string;
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
}

export interface NewsArticle {
  id: number;
  tag: BilingualString;
  title: BilingualString;
  excerpt: BilingualString;
  content: BilingualString;
  image: string | null;
  is_lead: boolean;
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

export interface GalleryImage {
  id: number;
  caption: BilingualString;
  category: BilingualString;
  image: string;
  span: string | null;
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
}

export type Lang = 'ru' | 'en';
