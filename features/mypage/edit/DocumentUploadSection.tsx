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
import {
  extractTextFromFile,
  isNameIncludedInText,
  isSameCompanyName,
  parseBankbookText,
  sanitizeAccountHolder,
  toErrorMessage,
} from './ocr';

export type OcrGateStatus = 'idle' | 'matched' | 'mismatched';

export type OcrExtractedData = {
  companyName: string;
  businessNumber: string;
  ceoName: string;
  businessType: string;
  address: string;
  companyType: 'CORPORATE' | 'INDIVIDUAL';
  bank: string;
  account: string;
  accountHolder: string;
  isNameMatched: boolean;
};

/** 업로드 한도: 10MiB */
const MAX_BYTES = 10 * 1024 * 1024;

const ACCEPT_ATTR =
  'image/png,image/jpeg,image/jpg,image/webp,image/gif,image/heic,image/heif,application/pdf,.pdf';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAllowedUpload(file: File): boolean {
  const mime = file.type.toLowerCase();
  if (
    mime === 'application/pdf' ||
    mime.startsWith('image/png') ||
    mime.startsWith('image/jpeg') ||
    mime.startsWith('image/webp') ||
    mime.startsWith('image/gif') ||
    mime.startsWith('image/heic') ||
    mime.startsWith('image/heif')
  ) {
    return true;
  }
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'pdf', 'heic', 'heif'].includes(ext ?? '');
}

function isImageFile(file: File): boolean {
  if (file.type && file.type.startsWith('image/')) return true;
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'heic', 'heif'].includes(ext ?? '');
}

const ACCEPT_BANKBOOK = 'image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png';

function validateBankbookFile(file: File): string | null {
  const mime = file.type.toLowerCase();
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (
    mime.startsWith('image/jpeg') ||
    mime.startsWith('image/png') ||
    ext === 'jpg' ||
    ext === 'jpeg' ||
    ext === 'png'
  ) {
    return null;
  }
  return 'JPG 또는 PNG 이미지 파일만 업로드할 수 있어요.';
}

function isImageUrl(url: string): boolean {
  return /\.(png|jpe?g|webp|gif)(\?|$)/i.test(url);
}

function isPdfUrl(url: string): boolean {
  return /\.pdf(\?|$)/i.test(url);
}

export type MemberDocumentProfile = {
  companyName: string;
  businessNumber: string;
  ceoName: string;
  businessType: string;
  address: string;
  bank: string;
  account: string;
  accountHolder?: string;
  companyType?: string;
};

function toCompanyType(value?: string): 'CORPORATE' | 'INDIVIDUAL' {
  if (value === 'CORPORATE' || value === '법인') return 'CORPORATE';
  return 'INDIVIDUAL';
}

function profileToExtracted(profile: MemberDocumentProfile, isNameMatched: boolean): OcrExtractedData {
  return {
    companyName: profile.companyName,
    businessNumber: profile.businessNumber,
    ceoName: profile.ceoName,
    businessType: profile.businessType,
    address: profile.address,
    companyType: toCompanyType(profile.companyType),
    bank: profile.bank,
    account: profile.account,
    accountHolder: profile.accountHolder || profile.ceoName,
    isNameMatched,
  };
}

type DocumentUploadSlotProps = {
  title: string;
  file: File | null;
  onChange?: (file: File | null) => void;
  existingUrl?: string | null;
  readOnly?: boolean;
  accept?: string;
  hintText?: string;
  validateFile?: (file: File) => string | null;
};

function DocumentUploadSlot({
  title,
  file,
  onChange,
  existingUrl = null,
  readOnly = false,
  accept = ACCEPT_ATTR,
  hintText = '이미지·PDF 업로드 가능 · 최대 10MB',
  validateFile = (f) =>
    isAllowedUpload(f) ? null : 'PNG, JPG, WEBP, GIF, HEIC, PDF 파일만 업로드할 수 있어요.',
}: DocumentUploadSlotProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const dialogTitleId = useId();
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedPreviewKey, setFailedPreviewKey] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [urlDismissed, setUrlDismissed] = useState(false);
  const currentFileKey = file ? `${file.name}-${file.size}-${file.lastModified}` : null;
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const showExisting = Boolean(existingUrl && !file && !urlDismissed);
  const previewSrc = file ? objectUrl : showExisting ? existingUrl : null;

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
        onChange?.(null);
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
      setUrlDismissed(false);
      onChange?.(next);
    },
    [onChange, validateFile],
  );

  const openPicker = useCallback(() => {
    if (readOnly) return;
    inputRef.current?.click();
  }, [readOnly]);

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
    if (file) {
      onChange?.(null);
    } else {
      setUrlDismissed(true);
    }
    requestAnimationFrame(() => inputRef.current?.click());
  };

  const complete = Boolean(file || showExisting);
  const showImageThumb =
    complete &&
    ((file && objectUrl && isImageFile(file) && failedPreviewKey !== currentFileKey) ||
      (showExisting && existingUrl && isImageUrl(existingUrl)));
  const canOpenPreview = Boolean(complete && previewSrc);
  const isPdf = Boolean(
    file
      ? file.type === 'application/pdf' || file.name.split('.').pop()?.toLowerCase() === 'pdf'
      : showExisting && existingUrl && isPdfUrl(existingUrl),
  );

  const previewModal =
    previewOpen && previewSrc && typeof document !== 'undefined'
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
                    {file
                      ? `${file.name} · ${formatFileSize(file.size)}`
                      : '가입 시 제출한 서류'}
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
                    src={previewSrc ?? undefined}
                    className="h-[min(78vh,720px)] w-full rounded-lg border border-slate-200 bg-white"
                  />
                ) : (file && isImageFile(file) && failedPreviewKey !== currentFileKey) ||
                  (showExisting && existingUrl && isImageUrl(existingUrl)) ? (
                  <div className="flex min-h-[min(78vh,720px)] items-center justify-center">
                    <img
                      src={previewSrc ?? undefined}
                      alt={`${title} 전체 미리보기`}
                      className="max-h-[min(78vh,720px)] w-full max-w-full object-contain"
                      onError={() => setFailedPreviewKey(currentFileKey ?? 'url')}
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
        disabled={readOnly}
      />

      {complete ? (
        <div
          className={cn(
            'flex min-h-[260px] flex-1 flex-col items-center justify-center rounded-xl border-2 border-emerald-500 bg-emerald-50/60 px-4 py-5 text-center sm:min-h-[280px] sm:px-6 sm:py-7',
          )}
        >
          {showImageThumb ? (
            <div className="mb-3 w-full overflow-hidden rounded-lg border border-emerald-200 bg-white shadow-sm">
              <img
                src={previewSrc ?? undefined}
                alt={`${title} 미리보기`}
                className="mx-auto max-h-40 w-full object-contain sm:max-h-48"
                onError={() => setFailedPreviewKey(currentFileKey ?? 'url')}
              />
            </div>
          ) : null}

          {complete && !showImageThumb ? (
            <div className="mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
              {file && isImageFile(file) && failedPreviewKey === currentFileKey ? (
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
            {title} · {readOnly ? '등록됨' : file ? '업로드 완료' : '등록된 서류'}
          </p>
          <p className="mt-2 break-all text-xs font-medium text-slate-600">
            {file
              ? `${file.name} · ${formatFileSize(file.size)}`
              : readOnly
                ? '가입 시 제출 · 변경 불가'
                : '가입 시 제출한 통장사본'}
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
            {!readOnly ? (
              <button
                type="button"
                onClick={handleReupload}
                className="text-sm font-semibold text-blue-600 underline-offset-2 hover:underline"
              >
                다시 업로드
              </button>
            ) : null}
          </div>
        </div>
      ) : readOnly ? (
        <div className="flex min-h-[260px] flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-7 text-center text-sm text-slate-500 sm:min-h-[280px]">
          등록된 서류를 불러오지 못했습니다.
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

export type DocumentUploadSectionProps = {
  profile: MemberDocumentProfile;
  businessRegistrationUrl?: string | null;
  bankbookUrl?: string | null;
  onOcrGateChange?: (status: OcrGateStatus) => void;
  onOcrExtracted?: (data: OcrExtractedData | null) => void;
  onOcrBusyChange?: (busy: boolean) => void;
  onBankbookFileChange?: (file: File | null) => void;
};

export default function DocumentUploadSection({
  profile,
  businessRegistrationUrl,
  bankbookUrl,
  onOcrGateChange,
  onOcrExtracted,
  onOcrBusyChange,
  onBankbookFileChange,
}: DocumentUploadSectionProps) {
  const [bankbookFile, setBankbookFile] = useState<File | null>(null);
  const [ocrExtracted, setOcrExtracted] = useState<OcrExtractedData | null>(null);
  const [mismatchModalOpen, setMismatchModalOpen] = useState(false);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const mismatchModalTitleId = useId();
  const ocrRunIdRef = useRef(0);
  const prevOcrStatusRef = useRef<OcrGateStatus>('idle');
  const profileRef = useRef(profile);
  profileRef.current = profile;
  const hasAppliedExistingBankbookRef = useRef(false);

  const applyMatchedFromProfile = useCallback(() => {
    const extracted = profileToExtracted(profileRef.current, true);
    setOcrExtracted(extracted);
    onOcrExtracted?.(extracted);
    onOcrGateChange?.('matched');
    prevOcrStatusRef.current = 'matched';
    setMismatchModalOpen(false);
  }, [onOcrExtracted, onOcrGateChange]);

  useEffect(() => {
    if (!profile.companyName || !bankbookUrl) {
      hasAppliedExistingBankbookRef.current = false;
      return;
    }
    if (hasAppliedExistingBankbookRef.current) return;
    hasAppliedExistingBankbookRef.current = true;
    applyMatchedFromProfile();
  }, [profile.companyName, bankbookUrl, applyMatchedFromProfile]);

  const runBankbookOcr = useCallback(
    (nextBankbookFile: File | null) => {
      onBankbookFileChange?.(nextBankbookFile);

      if (!nextBankbookFile) {
        if (bankbookUrl && profile.companyName) {
          applyMatchedFromProfile();
          setOcrError(null);
          return;
        }
        ocrRunIdRef.current += 1;
        setOcrBusy(false);
        onOcrBusyChange?.(false);
        setOcrError(null);
        setOcrExtracted(null);
        onOcrExtracted?.(null);
        onOcrGateChange?.('idle');
        prevOcrStatusRef.current = 'idle';
        return;
      }

      const runId = ocrRunIdRef.current + 1;
      ocrRunIdRef.current = runId;
      setOcrBusy(true);
      onOcrBusyChange?.(true);
      setOcrError(null);
      onOcrGateChange?.('idle');

      void (async () => {
        try {
          const bankbookText = await extractTextFromFile(nextBankbookFile);
          if (ocrRunIdRef.current !== runId) return;

          const bankbook = parseBankbookText(bankbookText);
          const accountHolder = sanitizeAccountHolder(bankbook.accountHolder);
          const accountHolderOrRaw = accountHolder || bankbookText;
          const isNameMatched =
            isSameCompanyName(profile.companyName, accountHolderOrRaw) ||
            isSameCompanyName(profile.ceoName, accountHolderOrRaw) ||
            isNameIncludedInText(profile.companyName, bankbookText) ||
            isNameIncludedInText(profile.ceoName, bankbookText);
          const status: OcrGateStatus = isNameMatched ? 'matched' : 'mismatched';

          const extracted: OcrExtractedData = {
            ...profileToExtracted(profile, isNameMatched),
            bank: bankbook.bank,
            account: bankbook.account,
            accountHolder: accountHolder || profile.ceoName,
            isNameMatched,
          };
          setOcrExtracted(extracted);
          onOcrExtracted?.(extracted);
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
          onOcrExtracted?.(null);
          const reason = toErrorMessage(error);
          setOcrError(`OCR 처리 중 오류가 발생했습니다. (${reason})`);
          onOcrGateChange?.('idle');
        } finally {
          if (ocrRunIdRef.current === runId) {
            setOcrBusy(false);
            onOcrBusyChange?.(false);
          }
        }
      })();
    },
    [
      applyMatchedFromProfile,
      bankbookUrl,
      onBankbookFileChange,
      onOcrBusyChange,
      onOcrExtracted,
      onOcrGateChange,
      profile,
    ],
  );

  const handleBankbookFileChange = useCallback(
    (next: File | null) => {
      setBankbookFile(next);
      runBankbookOcr(next);
    },
    [runBankbookOcr],
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
                    통장사본 예금주 정보가 등록된 사업자 정보와 일치하지 않습니다.
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">
                    예금주 정보와 사업자 상호/대표자명이 다를 수 있어요. 서류를 확인한 뒤 다시
                    업로드해 주세요.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                className="mt-6 w-full rounded-xl font-semibold"
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
          <h2 className="text-lg font-bold text-slate-900">등록된 서류</h2>
          <p className="mt-1 text-sm text-slate-500">
            사업자등록증은 보기만 가능 · 통장사본은 변경 시 재검증됩니다
          </p>
        </div>

        <div className="flex flex-col gap-5 md:flex-row md:items-stretch md:gap-7 lg:gap-8">
          <DocumentUploadSlot
            title="사업자등록증"
            file={null}
            readOnly
            existingUrl={businessRegistrationUrl}
            hintText="PDF · 가입 시 제출"
          />
          <DocumentUploadSlot
            title="통장사본"
            file={bankbookFile}
            existingUrl={bankbookUrl}
            onChange={handleBankbookFileChange}
            accept={ACCEPT_BANKBOOK}
            hintText="JPG 또는 PNG · 최대 10MB"
            validateFile={validateBankbookFile}
          />
        </div>

        {ocrBusy ? (
          <p className="mt-3 text-sm font-medium text-blue-700">
            OCR 인식 중입니다... 파일 크기에 따라 최대 10~20초 정도 걸릴 수 있어요.
          </p>
        ) : null}
        {ocrError ? <p className="mt-3 text-sm font-medium text-red-600">{ocrError}</p> : null}
      </section>
      {mismatchModal}
    </>
  );
}
