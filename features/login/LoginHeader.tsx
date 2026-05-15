import Link from 'next/link';

export default function LoginHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-screen-lg items-center px-6 md:px-8">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-slate-900 transition hover:text-slate-700"
        >
          TossInvoice
        </Link>
      </div>
    </header>
  );
}
