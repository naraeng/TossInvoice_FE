export function formatKRW(value: number) {
  return `${value.toLocaleString('ko-KR')}원`;
}

export function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}
