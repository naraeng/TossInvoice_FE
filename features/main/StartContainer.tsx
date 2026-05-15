export default function StartContainer() {
  const changeRiskCases = [
    { type: '일반 변경', example: '담당자 연락처 단일 변경', action: '알림 후 확인' },
    { type: '주의 변경', example: '계좌번호 단일 변경', action: '재확인 요청' },
    { type: '고위험 변경', example: '계좌 + 상호 동시 변경', action: '강제 재인증' },
  ];
  return (
    <>
      <section className="rounded-3xl bg-slate-950 px-6 py-10 text-white md:px-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-300">
              발주처와 수주처가 함께 쓰는 거래 표준을 시작하세요
            </p>
            <h3 className="mt-2 text-3xl font-bold leading-tight">
              오늘 보낸 발주도, 내일 받을 입금도 안전하게
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-100">
              회원가입 하러가기
            </button>
            <button className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-500">
              로그인 하러가기
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
