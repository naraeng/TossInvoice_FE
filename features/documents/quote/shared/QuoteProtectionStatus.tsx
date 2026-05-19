import { Check } from 'lucide-react';

import { PROTECTION_STATUS_ITEMS } from './issued-constants';

export function QuoteProtectionStatus() {
  return (
    <div>
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-bold text-slate-800">🛡 보호 상태</p>
      </div>
      <ul className="mt-3 space-y-2">
        {PROTECTION_STATUS_ITEMS.map((item) => (
          <li key={item} className="flex items-center gap-2 text-xs text-slate-600">
            <Check className="size-3.5 shrink-0 text-emerald-500" strokeWidth={3} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
