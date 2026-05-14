export default function NoticeList() {
  const notices = [
    {
      title: '거래처 계좌 변경 감지',
      description: '(주)수민유통 · 신한 110-****-***81 -> 우리 1002-***-**45',
      time: '2분전',
      color: 'bg-red-500',
      box: 'bg-red-50 text-red-500',
    },
    {
      title: '결제 승인 대기',
      description: 'PO-240511-002 · 준플라워 · 950,000원',
      time: '1시간전',
      color: 'bg-amber-500',
      box: 'bg-amber-50 text-amber-500',
    },
  ];

  return (
    <section className="h-full rounded-3xl border-2 border-blue-500 bg-white p-5">
      <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
        🔔 실시간 알림
      </div>
      <h2 className="mt-5 text-lg font-bold text-slate-900">확인 필요한 알림 2건</h2>

      <div className="mt-4 space-y-3">
        {notices.map((notice) => (
          <article key={notice.title} className={`flex gap-4 rounded-2xl px-4 py-4 ${notice.box}`}>
            <div className={`mt-1 h-9 w-1.5 flex-shrink-0 rounded-full ${notice.color}`} />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold">{notice.title}</h3>
              <p className="mt-1 truncate text-xs font-medium text-slate-600">
                {notice.description}
              </p>
            </div>
            <span className="self-end whitespace-nowrap text-xs font-medium text-slate-400">
              {notice.time}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
