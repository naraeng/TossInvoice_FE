import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';

export type BrandLogoProps = {
  href?: string;
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({ href = '/', className, priority = false }: BrandLogoProps) {
  const logo = (
    <Image
      src="/TossInvoice_Logo.svg"
      alt="Toss Invoice"
      width={156}
      height={27}
      className={cn('h-7 w-auto', className)}
      priority={priority}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 transition hover:opacity-90">
        {logo}
      </Link>
    );
  }

  return logo;
}
