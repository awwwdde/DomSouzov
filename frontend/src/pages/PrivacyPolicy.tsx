import { Container, Section } from '../components/Section';
import { useSite } from '../context/SiteContext';

function paragraphs(text: string) {
  return text.split(/\n\s*\n+/).map((p, i) => (
    <p key={i} className="whitespace-pre-wrap">{p}</p>
  ));
}

export default function PrivacyPolicy() {
  const { lang, t } = useSite();

  const title = t('privacy_title') || (lang === 'ru' ? 'Политика конфиденциальности' : 'Privacy policy');
  const body = t('privacy_body') || (lang === 'ru'
    ? 'Текст-заглушка. Замените на утверждённую редакцию политики конфиденциальности.\n\nЗдесь указываются цели и правовые основания обработки персональных данных, сроки хранения, права субъектов и порядок обращений.'
    : 'This is a placeholder privacy policy text. Replace with the final document approved by legal counsel.\n\nIt should describe personal data processing, retention, user rights, and contact for data requests.');

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
