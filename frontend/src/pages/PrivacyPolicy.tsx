import LegalDocument from '../components/LegalDocument';
import { useSite } from '../context/SiteContext';

export default function PrivacyPolicy() {
  const { lang, t } = useSite();

  const title = t('privacy_title') || (lang === 'ru' ? 'Политика конфиденциальности' : 'Privacy policy');
  const body = t('privacy_body') || (lang === 'ru'
    ? 'Текст-заглушка. Замените на утверждённую редакцию политики конфиденциальности.\n\nЗдесь указываются цели и правовые основания обработки персональных данных, сроки хранения, права субъектов и порядок обращений.'
    : 'This is a placeholder privacy policy text. Replace with the final document approved by legal counsel.\n\nIt should describe personal data processing, retention, user rights, and contact for data requests.');

  return <LegalDocument title={title} body={body} path="privacy-policy" lang={lang} />;
}
