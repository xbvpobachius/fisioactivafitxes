import Link from 'next/link';
import { Stethoscope } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-bold text-xl font-headline tracking-tight">
              Gestor FisioActiva
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
