import { Container, Section } from '../components/Section';
import { useSite } from '../context/SiteContext';

export default function PrivacyPolicy() {
  const { lang } = useSite();

  if (lang === 'en') {
    return (
      <Section spacing="md" bordered>
        <Container>
          <h1 className="font-heading text-[clamp(56px,9vw,140px)] font-bold uppercase leading-[0.88] tracking-[0.02em]">
            Privacy policy
          </h1>
          <div className="mt-10 max-w-prose space-y-4 text-base leading-relaxed text-ink-soft">
            <p>This is a placeholder privacy policy text. Replace with the final document approved by legal counsel.</p>
            <p>It should describe personal data processing, retention, user rights, and contact for data requests.</p>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section spacing="md" bordered>
      <Container>
        <h1 className="font-heading text-[clamp(56px,9vw,140px)] font-bold uppercase leading-[0.88] tracking-[0.02em]">
          Политика конфиденциальности
        </h1>
        <div className="mt-10 max-w-prose space-y-4 text-base leading-relaxed text-ink-soft">
          <p>Текст-заглушка. Замените на утверждённую редакцию политики конфиденциальности.</p>
          <p>Здесь указываются цели и правовые основания обработки персональных данных, сроки хранения, права субъектов и порядок обращений.</p>
        </div>
      </Container>
    </Section>
  );
}
