import { Container, Section } from '../components/Section';
import { useSite } from '../context/SiteContext';

function paragraphs(text: string) {
  return text.split(/\n\s*\n+/).map((p, i) => (
    <p key={i} className="whitespace-pre-wrap">{p}</p>
  ));
}

export default function PersonalDataConsent() {
  const { lang, t } = useSite();

  const title = t('consent_title') || (lang === 'ru' ? 'Согласие на обработку персональных данных' : 'Consent to personal data processing');
  const body = t('consent_body') || (lang === 'ru'
    ? 'Текст-заглушка. Замените на актуальную форму согласия.'
    : 'Placeholder consent text. Replace with the legally binding version.');

  return (
    <Section spacing="md" bordered>
      <Container>
        <h1 className="font-heading text-[clamp(56px,9vw,140px)] font-bold uppercase leading-[0.88] tracking-[0.02em]">
          {title}
        </h1>
        <div className="mt-10 max-w-prose space-y-4 text-base leading-relaxed text-ink-soft">
          {paragraphs(body)}
        </div>
      </Container>
    </Section>
  );
}
