import { Container, Section } from '../components/Section';
import { useSite } from '../context/SiteContext';

export default function PersonalDataConsent() {
  const { lang } = useSite();

  if (lang === 'en') {
    return (
      <Section spacing="md" bordered>
        <Container>
          <h1 className="font-heading text-[clamp(56px,9vw,140px)] font-bold uppercase leading-[0.88] tracking-[0.02em]">
            Consent to personal data processing
          </h1>
          <div className="mt-10 max-w-prose space-y-4 text-base leading-relaxed text-ink-soft">
            <p>Placeholder consent text. Replace with the legally binding version.</p>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section spacing="md" bordered>
      <Container>
        <h1 className="font-heading text-[clamp(56px,9vw,140px)] font-bold uppercase leading-[0.88] tracking-[0.02em]">
          Согласие на обработку персональных данных
        </h1>
        <div className="mt-10 max-w-prose space-y-4 text-base leading-relaxed text-ink-soft">
          <p>Текст-заглушка. Замените на актуальную форму согласия.</p>
        </div>
      </Container>
    </Section>
  );
}
