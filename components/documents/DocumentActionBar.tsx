'use client';

import { Button } from '@/components/ui/button';

export type DocumentAction = {
  label: string;
  variant: 'primary' | 'secondary';
  onClick: () => void;
  disabled?: boolean;
};

export function DocumentActionBar({ actions }: { actions: DocumentAction[] }) {
  return (
    <div className="flex flex-col gap-2">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant === 'primary' ? 'default' : 'outline'}
          className={
            action.variant === 'primary'
              ? 'h-12 w-full rounded-xl bg-[#3182F6] text-base font-bold shadow-[0_4px_14px_-4px_rgba(49,130,246,0.6)] hover:bg-[#1b64da]'
              : 'h-12 w-full rounded-xl border-slate-200 text-base font-semibold'
          }
          onClick={action.onClick}
          disabled={action.disabled}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
