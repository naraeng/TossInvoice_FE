'use client';

import { Check, FileText } from 'lucide-react';
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

/** 업로드 한도: 10MiB */
const MAX_BYTES = 10 * 1024 * 1024;

export const UPLOAD_ACCEPT_ATTR =
  'image/png,image/jpeg,image/jpg,image/webp,image/gif,image/heic,image/heif,application/pdf,.pdf';

/** 바이너리 기준 파일 크기 표시 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isAllowedUpload(file: File): boolean {
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

export function isImageFile(file: File): boolean {
  if (file.type && file.type.startsWith('image/')) return true;
  const ext = file.name.split('.').pop()?.toLowerCase();
  return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'heic', 'heif'].includes(ext ?? '');
}

export type DocumentUploadSlotProps = {
  title: string;
  file: File | null;
  onChange: (file: File | null) => void;
  /** * 필수 문구 노출 여부 (기본 true) */
  required?: boolean;
};

export default function DocumentUploadSlot({
  title,
  file,
  onChange,
  required = true,
}: DocumentUploadSlotProps) {
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
      if (!isAllowedUpload(next)) {
        setError('PNG, JPG, WEBP, GIF, HEIC, PDF 파일만 업로드할 수 있어요.');
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
        accept={UPLOAD_ACCEPT_ATTR}
        onChange={handleInputChange}
      />

      {complete && file ? (
        <div
          className="flex min-h-[260px] flex-1 flex-col items-center justify-center rounded-xl border-2 border-emerald-500 bg-emerald-50/60 px-4 py-5 text-center sm:min-h-[280px] sm:px-6 sm:py-7"
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

          <p className="text-sm font-bold text-slate-900">{title} · 업로드 완료</p>
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
            이미지·PDF 업로드 가능 · 최대 10MB
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
          {required ? (
            <p className="mt-2 text-center text-xs text-red-500">
              <span className="font-semibold">*</span> 필수
            </p>
          ) : null}
        </div>
      )}

      {error ? (
        <p className="mt-2 text-center text-xs font-medium text-red-600">{error}</p>
      ) : null}

      {previewModal}
    </div>
  );
}
