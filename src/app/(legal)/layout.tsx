import type { ReactNode } from 'react';
import Footer from '@/components/Footer';

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
