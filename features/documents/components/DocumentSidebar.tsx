'use client';

import {
  DocumentActionBar,
  type DocumentAction,
} from '@/components/documents/DocumentActionBar';
import { StatusStepper } from '@/components/documents/StatusStepper';
import type { ScreenConfig } from '@/features/documents/constants/screen-registry';
import type { QuoteDocument, UserRole } from '@/types/documents/document';

type Props = {
  quote: QuoteDocument;
  config: ScreenConfig;
  viewerRole: UserRole;
  onAction: (action: string) => void;
  busy?: boolean;
};

export function DocumentSidebar({ quote, config, viewerRole, onAction, busy }: Props) {
  const actions: DocumentAction[] = [];

  if (config.primaryAction) {
    actions.push({
      label: config.primaryAction.label,
      variant: 'primary',
      disabled: busy,
      onClick: () => onAction(config.primaryAction!.action),
    });
  }
  if (config.secondaryAction) {
    actions.push({
      label: config.secondaryAction.label,
      variant: 'secondary',
      disabled: busy,
      onClick: () => onAction(config.secondaryAction!.action),
    });
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">{config.title}</h2>
        <p className="mt-1 text-xs text-slate-500">
          {viewerRole === 'SUPPLIER' ? '수주처 화면' : '발주처 화면'} · {quote.status}
        </p>
        <div className="mt-5">
          <StatusStepper role={viewerRole} currentStatus={quote.status} />
        </div>
      </div>
      {actions.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <DocumentActionBar actions={actions} />
        </div>
      )}
    </>
  );
}
