import { Link } from 'react-router-dom';

const Arrow = () => (
  <svg
    className="h-8 w-8 text-ink transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1"
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
    <section className="border-y border-line bg-paper">
      <div className="mx-auto grid max-w-[1600px] md:grid-cols-3">
        {items.map(({ to, title }, i) => (
          <div
            key={to}
            className={[
              'group relative min-h-[280px] md:min-h-[320px]',
              i > 0 ? 'border-t border-line md:border-l md:border-t-0' : '',
            ].join(' ')}
          >
            <Link to={to} className="flex h-full flex-col p-6 pt-7 md:p-8 md:pt-10">
              <div className="flex justify-end">
                <Arrow />
              </div>
              <div className="mt-auto">
                <h2 className="font-heading text-[clamp(40px,5vw,84px)] font-bold uppercase leading-[0.92] tracking-[0.02em] text-ink transition-colors duration-300 group-hover:text-accent">
                  {title}
                </h2>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
