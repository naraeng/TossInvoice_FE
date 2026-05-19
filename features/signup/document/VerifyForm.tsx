'use client';

import { AlertTriangle, Check, FileText } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/api';
import { useSignupDocumentFiles } from '@/features/signup/SignupDocumentFilesProvider';
import {
  extractTextFromFile,
  isNameIncludedInText,
  isSameCompanyName,
  parseBankbookText,
  parseBusinessDocText,
  toErrorMessage,
} from '@/features/signup/document/ocr';

export type OcrGateStatus = 'idle' | 'matched' | 'mismatched';
type NtsStatus = 'idle' | 'checking' | 'active' | 'inactive' | 'error';

function logOcrDebug(payload: {
  businessText: string;
  bankbookText: string;
  business: {
    companyName: string;
    businessNumber: string;
    ceoName: string;
    businessType: string;
    address: string;
    companyType: 'CORPORATE' | 'INDIVIDUAL';
  };
  bankbook: {
    bank: string;
    account: string;
    accountHolder: string;
  };
  isNameMatched: boolean;
  status: OcrGateStatus;
}) {
  if (process.env.NODE_ENV === 'production') return;
  const normalizePreview = (text: string) =>
    text
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 220);

  console.groupCollapsed(
    `[Signup OCR] ${payload.status.toUpperCase()} · matched=${payload.isNameMatched}`,
  );
  console.table([
    { key: 'status', value: payload.status },
    { key: 'isNameMatched', value: String(payload.isNameMatched) },
  ]);

  console.groupCollapsed('사업자등록증 OCR');
  console.table([
    { field: 'companyName', value: payload.business.companyName || '(empty)' },
    { field: 'businessNumber', value: payload.business.businessNumber || '(empty)' },
    { field: 'ceoName', value: payload.business.ceoName || '(empty)' },
    { field: 'address', value: payload.business.address || '(empty)' },
    { field: 'businessType', value: payload.business.businessType || '(empty)' },
    { field: 'companyType', value: payload.business.companyType || '(empty)' },
  ]);
  console.log('raw preview:', normalizePreview(payload.businessText));
  console.log('raw full text:', payload.businessText);
  console.groupEnd();

  console.groupCollapsed('통장사본 OCR');
  console.table([
    { field: 'bank', value: payload.bankbook.bank || '(empty)' },
    { field: 'account', value: payload.bankbook.account || '(empty)' },
    { field: 'accountHolder', value: payload.bankbook.accountHolder || '(empty)' },
  ]);
  console.log('raw preview:', normalizePreview(payload.bankbookText));
  console.log('raw full text:', payload.bankbookText);
  console.groupEnd();
  console.groupEnd();
}

/** 업로드 한도: 10MiB (1024 × 1024 × 10 바이트) */
const MAX_BYTES = 10 * 1024 * 1024;

const ACCEPT_BUSINESS = 'application/pdf,.pdf';
const ACCEPT_BANKBOOK = 'image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png';

/** 바이너리 기준 MB (OS·탐색기와 동일한 방식에 가깝게 표시) */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateBusinessFile(file: File): string | null {
  const mime = file.type.toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (mime === 'application/pdf' || ext === 'pdf') return null;
  return 'PDF 파일만 업로드할 수 있어요. (사업자등록증 PDF)';
}

function validateBankbookFile(file: File): string | null {
  const mime = file.type.toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (
    mime.startsWith('image/jpeg') ||
    mime.startsWith('image/png') ||
    ext === 'jpg' ||
    ext === 'jpeg' ||
    ext === 'png'
  ) return null;
  return 'JPG 또는 PNG 이미지 파일만 업로드할 수 있어요. (통장사본)';
}

function isImageFile(file: File): boolean {
  if (file.type && file.type.startsWith('image/')) return true;
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'heic', 'heif'].includes(ext ?? '');
}

type DocumentUploadSlotProps = {
  title: string;
  hintText: string;
  accept: string;
  validateFile: (file: File) => string | null;
  file: File | null;
  onChange: (file: File | null) => void;
};

function DocumentUploadSlot({ title, hintText, accept, validateFile, file, onChange }: DocumentUploadSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const dialogTitleId = useId();
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedPreviewKey, setFailedPreviewKey] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const currentFileKey = file ? `${file.name}-${file.size}-${file.lastModified}` : null;
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    if (!objectUrl) return;
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  useEffect(() => {
    if (!previewOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [previewOpen]);

  const validateAndCommit = useCallback(
    (next: File | null) => {
      setError(null);
      if (!next) {
        onChange(null);
        return;
      }
      const validationError = validateFile(next);
      if (validationError) {
        setError(validationError);
        return;
      }
      if (next.size > MAX_BYTES) {
        setError('파일 크기는 최대 10MB까지 가능해요.');
        return;
      }
      onChange(next);
    },
    [onChange],
  );

  const openPicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    validateAndCommit(picked ?? null);
    e.target.value = '';
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current += 1;
    setDragOver(true);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current -= 1;
    if (dragDepthRef.current <= 0) {
      dragDepthRef.current = 0;
      setDragOver(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = 0;
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    validateAndCommit(dropped ?? null);
  };

  const handleReupload = () => {
    onChange(null);
    requestAnimationFrame(() => inputRef.current?.click());
  };

  const complete = Boolean(file);
  const showImageThumb =
    complete &&
    file &&
    objectUrl &&
    isImageFile(file) &&
    failedPreviewKey !== currentFileKey;
  const canOpenPreview = Boolean(complete && file && objectUrl);
  const isPdf = Boolean(
    file &&
      (file.type === 'application/pdf' ||
        file.name.split('.').pop()?.toLowerCase() === 'pdf'),
  );

  const previewModal =
    previewOpen &&
    file &&
    objectUrl &&
    typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            role="presentation"
          >
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]"
              aria-label="미리보기 닫기"
              onClick={() => setPreviewOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId}
              className="relative z-[101] flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
                <div className="min-w-0 text-left">
                  <p id={dialogTitleId} className="truncate text-sm font-bold text-slate-900">
                    {title} 미리보기
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {file.name} · {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-slate-200"
                  onClick={() => setPreviewOpen(false)}
                >
                  닫기
                </Button>
              </div>
              <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-3 sm:p-5">
                {isPdf ? (
                  <iframe
                    title={`${title} PDF`}
                    src={objectUrl}
                    className="h-[min(78vh,720px)] w-full rounded-lg border border-slate-200 bg-white"
                  />
                ) : isImageFile(file) && failedPreviewKey !== currentFileKey ? (
                  <div className="flex min-h-[min(78vh,720px)] items-center justify-center">
                    <img
                      src={objectUrl}
                      alt={`${title} 전체 미리보기`}
                      className="max-h-[min(78vh,720px)] w-full max-w-full object-contain"
                      onError={() => setFailedPreviewKey(currentFileKey)}
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[min(50vh,400px)] flex-col items-center justify-center gap-3 text-center text-slate-600">
                    <FileText className="h-14 w-14 text-slate-300" strokeWidth={1.25} />
                    <p className="text-sm font-medium">
                      이 브라우저에서는 이 파일 형식의 미리보기를 불러올 수 없어요.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept={accept}
        onChange={handleInputChange}
      />

      {complete && file ? (
        <div
          className={cn(
            'flex min-h-[260px] flex-1 flex-col items-center justify-center rounded-xl border-2 border-emerald-500 bg-emerald-50/60 px-4 py-5 text-center sm:min-h-[280px] sm:px-6 sm:py-7',
          )}
        >
          {showImageThumb ? (
            <div className="mb-3 w-full overflow-hidden rounded-lg border border-emerald-200 bg-white shadow-sm">
              <img
                src={objectUrl!}
                alt={`${title} 미리보기`}
                className="mx-auto max-h-40 w-full object-contain sm:max-h-48"
                onError={() => setFailedPreviewKey(currentFileKey)}
              />
            </div>
          ) : null}

          {complete && file && !showImageThumb ? (
            <div className="mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
              {isImageFile(file) && failedPreviewKey === currentFileKey ? (
                <FileText className="h-7 w-7 opacity-95" aria-hidden />
              ) : (
                <Check className="h-7 w-7 stroke-[2.5]" aria-hidden />
              )}
            </div>
          ) : null}

          {showImageThumb ? (
            <div className="mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
              <Check className="h-4 w-4 stroke-[2.5]" aria-hidden />
            </div>
          ) : null}

          <p className="text-sm font-bold text-slate-900">
            {title} · 업로드 완료
          </p>
          <p className="mt-2 break-all text-xs font-medium text-slate-600">
            {file.name} · {formatFileSize(file.size)}
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-slate-200 font-semibold text-slate-800"
              disabled={!canOpenPreview}
              onClick={() => setPreviewOpen(true)}
            >
              보기
            </Button>
            <button
              type="button"
              onClick={handleReupload}
              className="text-sm font-semibold text-blue-600 underline-offset-2 hover:underline"
            >
              다시 업로드
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openPicker();
            }
          }}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'flex min-h-[260px] flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white px-5 py-7 text-center transition-colors outline-none hover:border-slate-300 hover:bg-slate-50/80 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:min-h-[280px] sm:px-6 sm:py-8',
            dragOver && 'border-blue-400 bg-blue-50/50',
          )}
        >
          <FileText className="mb-3 h-10 w-10 text-slate-300" strokeWidth={1.25} aria-hidden />
          <p className="text-sm font-bold text-slate-900">{title}</p>
          <p className="mt-1 text-xs text-slate-500">
            파일을 끌어다 놓거나 클릭
            <br />
            {hintText}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4 border-slate-200 bg-white font-semibold text-slate-700 shadow-none"
            onClick={(e) => {
              e.stopPropagation();
              openPicker();
            }}
          >
            파일 선택
          </Button>
          <p className="mt-2 text-center text-xs text-red-500">
            <span className="font-semibold">*</span> 필수
          </p>
        </div>
      )}

      {error ? (
        <p className="mt-2 text-center text-xs font-medium text-red-600">{error}</p>
      ) : null}

      

      {previewModal}
    </div>
  );
}

export type VerifyFormProps = {
  onOcrGateChange?: (status: OcrGateStatus) => void;
};

function NtsVerifySection({
  businessNumber,
  ntsStatus,
  ntsMessage,
  onVerify,
  disabled,
}: {
  businessNumber: string;
  ntsStatus: NtsStatus;
  ntsMessage: string | null;
  onVerify: () => void;
  disabled: boolean;
}) {
  const isChecking = ntsStatus === 'checking';
  const isActive = ntsStatus === 'active';
  const isInactive = ntsStatus === 'inactive';
  const isError = ntsStatus === 'error';

  const statusLabel = isActive
    ? '정상 사업자(계속사업)로 확인되었습니다.'
    : ntsMessage;

  return (
    <section className="mt-10 w-full border-t border-slate-100 pt-8">
      <h2 className="text-lg font-bold text-slate-900">2. 국세청 정보 확인하기</h2>
      <p className="mt-1 text-sm text-slate-500">사업장의 인증 상태를 확인해 주세요.</p>
      <p className="mt-2 text-xs font-semibold text-slate-500">
        조회 사업자번호: {businessNumber || '(OCR 추출 필요)'}
      </p>
      <Button
        type="button"
        disabled={disabled || isChecking}
        title="OCR에서 사업자번호 추출 후 조회할 수 있습니다"
        variant={isActive ? 'default' : 'secondary'}
        className={cn(
          'mt-5 h-10 rounded-lg px-6 text-sm font-semibold',
          isActive
            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
            : 'border border-slate-200 bg-slate-100 text-slate-700',
        )}
        onClick={onVerify}
      >
        {isChecking ? '국세청 조회 중...' : '확인하기'}
      </Button>
      {statusLabel ? (
        <p
          className={cn(
            'mt-3 text-sm font-medium',
            isActive && 'text-emerald-700',
            isInactive && 'text-amber-600',
            isError && 'text-slate-500',
            ntsStatus === 'idle' && 'text-slate-500',
          )}
        >
          {statusLabel}
        </p>
      ) : null}
    </section>
  );
}

export default function VerifyForm({ onOcrGateChange }: VerifyFormProps) {
  const {
    businessFile,
    setBusinessFile,
    bankbookFile,
    setBankbookFile,
    ocrExtracted,
    setOcrExtracted,
  } = useSignupDocumentFiles();
  const [mismatchModalOpen, setMismatchModalOpen] = useState(false);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ntsStatus, setNtsStatus] = useState<NtsStatus>('idle');
  const [ntsMessage, setNtsMessage] = useState<string | null>(null);
  const mismatchModalTitleId = useId();
  const ocrRunIdRef = useRef(0);
  const prevOcrStatusRef = useRef<OcrGateStatus>('idle');
  const [lastOcrStatus, setLastOcrStatus] = useState<OcrGateStatus>('idle');

  const runOcrPipeline = useCallback(
    (nextBusinessFile: File | null, nextBankbookFile: File | null) => {
      if (!nextBusinessFile || !nextBankbookFile) {
        ocrRunIdRef.current += 1;
        setOcrBusy(false);
        setOcrError(null);
        setMismatchModalOpen(false);
        setNtsStatus('idle');
        setNtsMessage(null);
        setLastOcrStatus('idle');
        setOcrExtracted(null);
        onOcrGateChange?.('idle');
        prevOcrStatusRef.current = 'idle';
        return;
      }

      const runId = ocrRunIdRef.current + 1;
      ocrRunIdRef.current = runId;
      setOcrBusy(true);
      setOcrError(null);
      setNtsStatus('idle');
      setNtsMessage(null);
      onOcrGateChange?.('idle');

      void (async () => {
        try {
          const [businessText, bankbookText] = await Promise.all([
            extractTextFromFile(nextBusinessFile),
            extractTextFromFile(nextBankbookFile),
          ]);
          if (ocrRunIdRef.current !== runId) return;

          const business = parseBusinessDocText(businessText);
          const bankbook = parseBankbookText(bankbookText);
          const accountHolderOrRaw = bankbook.accountHolder || bankbookText;
          const isNameMatched =
            isSameCompanyName(business.companyName, accountHolderOrRaw) ||
            isSameCompanyName(business.ceoName, accountHolderOrRaw) ||
            isNameIncludedInText(business.companyName, bankbookText) ||
            isNameIncludedInText(business.ceoName, bankbookText);
          const status: OcrGateStatus = isNameMatched ? 'matched' : 'mismatched';
          logOcrDebug({
            businessText,
            bankbookText,
            business,
            bankbook,
            isNameMatched,
            status,
          });

          setOcrExtracted({
            companyName: business.companyName,
            businessNumber: business.businessNumber,
            ceoName: business.ceoName,
            businessType: business.businessType,
            address: business.address,
            bank: bankbook.bank,
            account: bankbook.account,
            accountHolder: bankbook.accountHolder,
            companyType: business.companyType,
            isNameMatched,
          });
          setLastOcrStatus(status);
          onOcrGateChange?.(status);
          if (status === 'mismatched' && prevOcrStatusRef.current !== 'mismatched') {
            setMismatchModalOpen(true);
          } else {
            setMismatchModalOpen(false);
          }
          prevOcrStatusRef.current = status;
        } catch (error) {
          if (ocrRunIdRef.current !== runId) return;
          setOcrExtracted(null);
          const reason = toErrorMessage(error);
          setOcrError(`OCR 처리 중 오류가 발생했습니다. (${reason})`);
          setLastOcrStatus('idle');
          onOcrGateChange?.('idle');
        } finally {
          if (ocrRunIdRef.current === runId) {
            setOcrBusy(false);
          }
        }
      })();
    },
    [ntsStatus, onOcrGateChange, setOcrExtracted],
  );

  const handleNtsVerify = useCallback(async () => {
    const businessNumber = (ocrExtracted?.businessNumber ?? '').replace(/\D/g, '');
    if (businessNumber.length !== 10) {
      setNtsStatus('error');
      setNtsMessage('OCR에서 사업자등록번호(10자리)를 추출한 뒤 다시 시도해 주세요.');
      onOcrGateChange?.('mismatched');
      return;
    }

    setNtsStatus('checking');
    setNtsMessage(null);
    try {
      const res = await apiClient.post('/api/v1/nts/status', {
        businessNumber,
      });
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
      } else {
        setNtsStatus('inactive');
        setNtsMessage(
          `국세청 조회 결과 ${businessStatus || '비정상 사업자'} 상태입니다.${endDate}`,
        );
      }
      onOcrGateChange?.(lastOcrStatus === 'matched' ? 'matched' : 'mismatched');
    } catch (error) {
      setNtsStatus('error');
      const reason = toErrorMessage(error);
      setNtsMessage(`국세청 상태 조회 실패: ${reason}`);
      onOcrGateChange?.(lastOcrStatus === 'matched' ? 'matched' : 'mismatched');
    }
  }, [lastOcrStatus, ocrExtracted?.businessNumber, onOcrGateChange]);

  const handleBusinessFileChange = useCallback(
    (next: File | null) => {
      setBusinessFile(next);
      runOcrPipeline(next, bankbookFile);
    },
    [bankbookFile, runOcrPipeline, setBusinessFile],
  );

  const handleBankbookFileChange = useCallback(
    (next: File | null) => {
      setBankbookFile(next);
      runOcrPipeline(businessFile, next);
    },
    [businessFile, runOcrPipeline, setBankbookFile],
  );

  useEffect(() => {
    if (!mismatchModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMismatchModalOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [mismatchModalOpen]);

  const mismatchModal =
    mismatchModalOpen && typeof document !== 'undefined'
      ? createPortal(
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px]"
              aria-label="닫기"
              onClick={() => setMismatchModalOpen(false)}
            />
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={mismatchModalTitleId}
              className="relative z-[111] w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            >
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <AlertTriangle className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p id={mismatchModalTitleId} className="text-base font-bold text-slate-900">
                    서류 정보 불일치
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    업로드하신 사업자등록증과 통장사본이 일치하지 않습니다.
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    예금주 정보와 사업자 상호/대표자명이 다를 수 있어요. 서류를 확인한 뒤 다시 업로드해 주세요.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                className="mt-6 w-full rounded-xl bg-blue-600 font-semibold text-white hover:bg-blue-700"
                onClick={() => setMismatchModalOpen(false)}
              >
                확인
              </Button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <section className="w-full">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">1. 서류 업로드</h2>
          <p className="mt-1 text-sm text-slate-500">
            최대 10MB · 사업자등록증(PDF)과 통장사본(JPG/PNG) 모두 업로드해 주세요
          </p>
        </div>

        <div className="flex flex-col gap-5 md:flex-row md:items-stretch md:gap-7 lg:gap-8">
          <DocumentUploadSlot
            title="사업자등록증"
            hintText="PDF 파일만 가능 · 최대 10MB"
            accept={ACCEPT_BUSINESS}
            validateFile={validateBusinessFile}
            file={businessFile}
            onChange={handleBusinessFileChange}
          />
          <DocumentUploadSlot
            title="통장사본"
            hintText="JPG 또는 PNG 이미지만 가능 · 최대 10MB"
            accept={ACCEPT_BANKBOOK}
            validateFile={validateBankbookFile}
            file={bankbookFile}
            onChange={handleBankbookFileChange}
          />
        </div>
        {ocrBusy ? (
          <p className="mt-3 text-sm font-medium text-blue-700">
            OCR 인식 중입니다... 파일 크기에 따라 최대 10~20초 정도 걸릴 수 있어요.
          </p>
        ) : null}
        {ocrError ? <p className="mt-3 text-sm font-medium text-red-600">{ocrError}</p> : null}

        <NtsVerifySection
          businessNumber={ocrExtracted?.businessNumber ?? ''}
          ntsStatus={ntsStatus}
          ntsMessage={ntsMessage}
          onVerify={handleNtsVerify}
          disabled={!ocrExtracted?.businessNumber || ocrBusy}
        />
      </section>
      {mismatchModal}
    </>
  );
}
