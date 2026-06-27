import LegalDocument from '../components/LegalDocument';
import { useSite } from '../context/SiteContext';

export default function PersonalDataConsent() {
  const { lang, t } = useSite();

  const title = t('consent_title') || (lang === 'ru' ? 'Согласие на обработку персональных данных' : 'Consent to personal data processing');
  const body = t('consent_body') || (lang === 'ru'
    ? 'Текст-заглушка. Замените на актуальную форму согласия.'
    : 'Placeholder consent text. Replace with the legally binding version.');

  return <LegalDocument title={title} body={body} path="personal-data-consent" lang={lang} />;
}
