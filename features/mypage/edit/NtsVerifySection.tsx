'use client';

import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { toErrorMessage } from './ocr';

type NtsStatus = 'idle' | 'checking' | 'active' | 'inactive' | 'error';

export type NtsVerifySectionProps = {
  /** OCR 추출된 사업자등록번호 */
  businessNumber: string;
  /** OCR 파이프라인 실행 중일 때 true → 버튼 비활성화 */
  ocrBusy: boolean;
  /** NTS가 통과를 차단하는 상태(inactive·error)일 때 true를 콜백 */
  onBlockingChange: (isBlocking: boolean) => void;
};

export default function NtsVerifySection({
  businessNumber,
  ocrBusy,
  onBlockingChange,
}: NtsVerifySectionProps) {
  const [ntsStatus, setNtsStatus] = useState<NtsStatus>('idle');
  const [ntsMessage, setNtsMessage] = useState<string | null>(null);

  const isChecking = ntsStatus === 'checking';
  const isActive = ntsStatus === 'active';
  const isInactive = ntsStatus === 'inactive';
  const isError = ntsStatus === 'error';

  const statusLabel = isActive
    ? '정상 사업자(계속사업)로 확인되어 다음 단계 진행이 가능합니다.'
    : isInactive
      ? '휴업/폐업 또는 비정상 상태로 확인되어 진행할 수 없습니다.'
      : isError
        ? '국세청 상태 확인 중 오류가 발생했습니다.'
        : ntsMessage;

  const handleVerify = useCallback(async () => {
    const digits = businessNumber.replace(/\D/g, '');
    if (digits.length !== 10) {
      setNtsStatus('error');
      setNtsMessage('OCR에서 사업자등록번호(10자리)를 추출한 뒤 다시 시도해 주세요.');
      onBlockingChange(true);
      return;
    }

    setNtsStatus('checking');
    setNtsMessage(null);
    try {
      const res = await apiClient.post('/api/v1/nts/status', { businessNumber: digits });
      const data = res.data as {
        success?: boolean;
        businessStatus?: string;
        taxType?: string;
        endDate?: string;
      };
      const businessStatus = data.businessStatus ?? '';
      const taxType = data.taxType ?? '';
      const endDate = data.endDate ? ` / 폐업일: ${data.endDate}` : '';

      if (data.success) {
        setNtsStatus('active');
        setNtsMessage(
          `국세청 상태조회 결과: ${businessStatus || '계속사업자'}${taxType ? ` / ${taxType}` : ''}`,
        );
        onBlockingChange(false);
      } else {
        setNtsStatus('inactive');
        setNtsMessage(
          `위험 경고: 국세청 조회 결과 ${businessStatus || '비정상 사업자'} 상태입니다.${endDate}`,
        );
        onBlockingChange(true);
      }
    } catch (error) {
      setNtsStatus('error');
      const reason = toErrorMessage(error);
      setNtsMessage(`국세청 상태 조회 실패: ${reason}`);
      onBlockingChange(true);
    }
  }, [businessNumber, onBlockingChange]);

  const disabled = !businessNumber || ocrBusy || isChecking;

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-bold text-slate-900">국세청 정보 확인하기</h2>
      <p className="mt-1 text-sm text-slate-500">사업장의 인증 상태를 확인해 주세요.</p>
      <p className="mt-2 text-xs font-semibold text-slate-500">
        조회 사업자번호: {businessNumber || '(OCR 추출 필요)'}
      </p>
      <Button
        type="button"
        disabled={disabled}
        title="OCR에서 사업자번호 추출 후 조회할 수 있습니다"
        variant={isActive ? 'default' : 'secondary'}
        className={cn(
          'mt-5 h-10 rounded-lg px-6 text-sm font-semibold',
          isActive
            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
            : 'border border-slate-200 bg-slate-100 text-slate-700',
        )}
        onClick={handleVerify}
      >
        {isChecking ? '국세청 조회 중...' : '확인하기'}
      </Button>
      {statusLabel ? (
        <p
          className={cn(
            'mt-3 text-sm font-medium',
            isActive && 'text-emerald-700',
            (isInactive || isError) && 'text-red-600',
            ntsStatus === 'idle' && 'text-slate-500',
          )}
        >
          {statusLabel}
        </p>
      ) : null}
    </section>
  );
}
