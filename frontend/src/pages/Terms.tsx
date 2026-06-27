import LegalDocument from '../components/LegalDocument';
import { useSite } from '../context/SiteContext';

export default function Terms() {
  const { lang, t } = useSite();

  const title = t('terms_title') || (lang === 'ru' ? 'Пользовательское соглашение' : 'Terms of use');
  const body = t('terms_body') || (lang === 'ru'
    ? 'Текст-заглушка. Замените на утверждённое пользовательское соглашение.'
    : 'Placeholder terms of use. Replace with approved user agreement.');

  return <LegalDocument title={title} body={body} path="terms" lang={lang} />;
}
