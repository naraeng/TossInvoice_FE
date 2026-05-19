'use client';

import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

import { type NoticeIcon } from '@/lib/notices';
import { useNotifications } from '@/lib/use-notifications';

function NoticeIconBadge({ icon }: { icon: NoticeIcon }) {
  const base = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full';
  const iconDim = 'h-4 w-4';
  if (icon === 'alert')
    return (
      <div className={`${base} bg-red-100 text-red-500`}>
        <AlertCircle className={iconDim} />
      </div>
    );
  if (icon === 'check')
    return (
      <div className={`${base} bg-emerald-100 text-emerald-600`}>
        <CheckCircle2 className={iconDim} />
      </div>
    );
  return (
    <div className={`${base} bg-slate-100 text-slate-500`}>
      <Info className={iconDim} />
    </div>
  );
}

export default function NoticeList() {
  const { notices, loading } = useNotifications();
  const preview = notices.slice(0, 3);

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-bold text-slate-900">알림</h2>
      </div>

      <ul className="flex-1 divide-y divide-slate-50 overflow-y-auto">
        {loading ? (
          <li className="px-5 py-6 text-center text-sm text-slate-400">불러오는 중...</li>
        ) : preview.length === 0 ? (
          <li className="px-5 py-6 text-center text-sm text-slate-400">새 알림이 없습니다.</li>
        ) : (
          preview.map((n) => (
            <li
              key={n.id}
              className="flex items-start gap-3 px-5 py-4 transition hover:bg-slate-50"
            >
              <NoticeIconBadge icon={n.icon} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                <p className="mt-0.5 whitespace-normal break-words text-xs text-slate-400">{n.desc}</p>
                {n.senderCompanyName && (
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                    {n.senderCompanyName}
                  </p>
                )}
              </div>
              <span className="shrink-0 whitespace-nowrap text-[11px] text-slate-300">{n.time}</span>
            </li>
          ))
        )}
      </ul>

      <div className="border-t border-slate-100 px-5 py-3">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-notifications'))}
          className="w-full cursor-pointer text-center text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          전체 알림 보기
        </button>
      </div>
    </section>
  );
}
