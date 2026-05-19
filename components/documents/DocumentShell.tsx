type DocumentShellProps = {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  variant?: 'default' | 'draft';
};

export function DocumentShell({ children, sidebar, variant = 'default' }: DocumentShellProps) {
  if (variant === 'draft') {
    return (
      <div className="min-h-screen bg-[#F2F4F6]">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_340px] lg:gap-6 lg:py-8">
          <div className="space-y-5">{children}</div>
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">{sidebar}</aside>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_320px]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        {children}
      </section>
      <aside className="space-y-4">{sidebar}</aside>
    </div>
  );
}
