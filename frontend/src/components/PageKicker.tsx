import type { ReactNode } from 'react';
import { KickerRow } from './Section';

/** Метка страницы: линия 40px + точка + caps (см. design.md §1.4). */
export function PageKicker({ children }: { children: ReactNode }) {
  return <KickerRow>{children}</KickerRow>;
}
