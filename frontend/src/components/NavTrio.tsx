import { Link } from 'react-router-dom';
import { Section } from './Section';

const Arrow = () => (
  <svg
    className="h-7 w-7 text-ink transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1"
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    aria-hidden
  >
    <path d="M8 24L24 8M10 8h14v14" />
  </svg>
);

type Item = { to: string; title: string };

type NavTrioProps = {
  items: [Item, Item, Item];
};

export default function NavTrio({ items }: NavTrioProps) {
  return (
    <Section tone="paper" spacing="none" bordered className="border-t border-line">
      <div className="grid md:grid-cols-3">
        {items.map(({ to, title }, i) => (
          <div
            key={to}
            className={[
              'group relative min-h-[240px] md:min-h-[300px]',
              i > 0 ? 'border-t border-line md:border-l md:border-t-0' : '',
            ].join(' ')}
          >
            <Link to={to} className="flex h-full flex-col py-8 md:py-10 md:px-8 first:md:pl-0 last:md:pr-0">
              <div className="flex justify-end">
                <Arrow />
              </div>
              <div className="mt-auto">
                <h2 className="font-heading text-[clamp(36px,4.6vw,76px)] font-bold uppercase leading-[0.92] tracking-[0.02em] text-ink transition-colors duration-300 group-hover:underline group-hover:underline-offset-4">
                  {title}
                </h2>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}
