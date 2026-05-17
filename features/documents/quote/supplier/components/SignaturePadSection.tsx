'use client';

import { Divide, PenLine } from 'lucide-react';
import { useRef, useState } from 'react';

import { SectionCard, SectionTitle } from './SectionCard';

type Props = {
  onSigned?: (signed: boolean) => void;
};

export function SignaturePadSection({ onSigned }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

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
    if (!hasSignature) {
      setHasSignature(true);
      onSigned?.(true);
    }
  };

  const endDraw = () => setIsDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSigned?.(false);
  };

  return (
    <SectionCard>
      <SectionTitle
        title="수주처 서명"
        badge={
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
            발행 시 필수
          </span>
        }
        subtitle="견적서를 발행하려면 서명이 필요합니다. 발주처 검토 후 거래가 진행돼요"
      />

      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
        {!hasSignature && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
            <PenLine className="size-6" />
            <p className="text-sm font-medium">여기에 서명해주세요</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="h-44 w-full touch-none cursor-crosshair"
          onPointerDown={startDraw}
          onPointerMove={draw}
          onPointerUp={endDraw}
          onPointerLeave={endDraw}
        />
      </div>
      {hasSignature && (
        <button
          type="button"
          onClick={clear}
          className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
        >
          서명 지우기
        </button>
      )}
    </SectionCard>
  );
}
