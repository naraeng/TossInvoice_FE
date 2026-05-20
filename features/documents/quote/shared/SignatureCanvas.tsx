'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  initialImage?: string;
  onSignatureChange?: (signed: boolean, imageDataUrl?: string) => void;
  className?: string;
  clearLabel?: string;
};

function canvasHasInk(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 0) return true;
  }
  return false;
}

export function SignatureCanvas({
  initialImage,
  onSignatureChange,
  className,
  clearLabel = '서명 지우기',
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  // 캔버스가 자체적으로 emit한 dataUrl을 기억해 self-loop(부모 리렌더 → 동일 initialImage 재주입 → 캔버스 reset)를 방지
  const lastEmittedDataUrlRef = useRef<string | null>(null);
  // 외부에서 들어온 initialImage가 한 번이라도 캔버스에 그려졌는지(이후 두 번째 stroke가 사라지지 않도록 reset 방지)
  const hasRenderedInitialRef = useRef(false);

  const emitSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasHasInk(canvas)) {
      setHasSignature(false);
      lastEmittedDataUrlRef.current = null;
      onSignatureChange?.(false);
      return;
    }
    const dataUrl = canvas.toDataURL('image/png');
    lastEmittedDataUrlRef.current = dataUrl;
    setHasSignature(true);
    onSignatureChange?.(true, dataUrl);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !initialImage) return;
    // 이미 한 번 initialImage를 그렸다면, 부모 리렌더로 동일/유사한 값이 다시 들어와도 캔버스를 다시 reset 하지 않음.
    // 이렇게 하지 않으면 사용자가 두 번째 stroke를 그리는 순간 부모가 onChange로 받은 dataUrl을 setQuote에 반영 → 리렌더 →
    // useEffect가 initialImage를 다시 그리면서 두 번째 stroke가 첫 번째 stroke로 덮여 사라지는 버그가 생긴다.
    if (hasRenderedInitialRef.current) return;
    // 부모가 즉시 동기화한 자신의 emit 값이 들어오는 경우(self-loop)도 skip — 깜빡임/덮어쓰기 방지
    if (initialImage === lastEmittedDataUrlRef.current) return;

    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height, 1);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      ctx.drawImage(img, x, y, w, h);
      hasRenderedInitialRef.current = true;
      setHasSignature(true);
    };
    img.src = initialImage;
    // 검증 시나리오:
    // - 빈 캔버스에서 여러 stroke를 연속해서 그려도 모두 누적되어야 한다(이전 stroke 유지).
    // - 미리 저장된 dataUrl(initialImage)이 있으면 mount 시 1회 그려져야 한다.
    // - 한 번 그려진 이후 부모가 동일 dataUrl을 다시 props로 내려보내도 캔버스가 reset되지 않아야 한다.
  }, [initialImage]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const { x, y } = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPoint(e);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
    ctx.lineTo(x, y);
    ctx.stroke();
    if (!hasSignature) setHasSignature(true);
  };

  const endDraw = () => {
    setIsDrawing(false);
    emitSignature();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    // 사용자가 의도적으로 지운 경우엔 initialImage가 다시 props로 들어와도 복원하지 않도록 ref도 함께 초기화
    lastEmittedDataUrlRef.current = null;
    hasRenderedInitialRef.current = true;
    onSignatureChange?.(false);
  };

  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
        {!hasSignature && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
            <span className="text-xl">🖋</span>
            <p className="text-sm font-medium">여기에 서명해주세요</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={600}
          height={120}
          className="h-30 w-full touch-none cursor-crosshair"
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
        />
      </div>
      {hasSignature && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={clear}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            {clearLabel}
          </button>
        </div>
      )}
    </div>
  );
}
