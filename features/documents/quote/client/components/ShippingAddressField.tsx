'use client';

import { MapPin, Plus, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useKakaoPostcodePopup, type Address } from 'react-daum-postcode';

import { Input } from '@/components/ui/input';

type Props = {
  value?: string;
  onChange: (value: string) => void;
};

function formatRoadAddress(data: Address) {
  const road = data.roadAddress || data.address;
  return data.buildingName ? `${road} ${data.buildingName}` : road;
}

function composeFullAddress(road: string, detail: string, zonecode: string) {
  const base = road.trim();
  const extra = detail.trim();
  if (!base && !extra) return '';

  const zipPrefix = zonecode ? `(우) ${zonecode} ` : '';
  return `${zipPrefix}${base}${extra ? `, ${extra}` : ''}`.trim();
}

/** 저장된 주소에서 우편번호·도로명·상세를 대략 분리 */
function parseStoredAddress(stored: string) {
  const zipMatch = stored.match(/^\(우\)\s*(\d{5})\s+([\s\S]+)$/);
  if (!zipMatch) {
    return { zonecode: '', road: stored, detail: '' };
  }

  const rest = zipMatch[2] ?? '';
  const commaIdx = rest.indexOf(', ');
  if (commaIdx === -1) {
    return { zonecode: zipMatch[1], road: rest, detail: '' };
  }

  return {
    zonecode: zipMatch[1],
    road: rest.slice(0, commaIdx),
    detail: rest.slice(commaIdx + 2),
  };
}

export function ShippingAddressField({ value, onChange }: Props) {
  const openPostcode = useKakaoPostcodePopup();
  const hydratedRef = useRef(false);

  const [roadAddress, setRoadAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [zonecode, setZonecode] = useState('');

  useEffect(() => {
    if (hydratedRef.current) return;
    if (!value?.trim()) return;

    const parsed = parseStoredAddress(value.trim());
    setZonecode(parsed.zonecode);
    setRoadAddress(parsed.road);
    setDetailAddress(parsed.detail);
    hydratedRef.current = true;
  }, [value]);

  useEffect(() => {
    const next = composeFullAddress(roadAddress, detailAddress, zonecode);
    if (next !== (value ?? '')) {
      onChange(next);
    }
  }, [roadAddress, detailAddress, zonecode, onChange, value]);

  const handleOpenSearch = () => {
    openPostcode({
      onComplete: (data) => {
        setZonecode(data.zonecode);
        setRoadAddress(formatRoadAddress(data));
        hydratedRef.current = true;
      },
    });
  };

  const handleClear = () => {
    setRoadAddress('');
    setDetailAddress('');
    setZonecode('');
    hydratedRef.current = true;
    onChange('');
  };

  const hasRoadAddress = !!roadAddress.trim();

  return (
    <div className="space-y-2">
      {!hasRoadAddress ? (
        <button
          type="button"
          onClick={handleOpenSearch}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 text-sm font-semibold text-slate-600 transition-colors hover:border-[#3182F6]/40 hover:bg-blue-50/50 hover:text-[#3182F6]"
        >
          <Plus className="size-4" />
          배송주소 검색하기
        </button>
      ) : (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 size-4 shrink-0 text-[#3182F6]" />
            <div className="min-w-0 flex-1">
              {zonecode && (
                <p className="text-xs font-semibold text-slate-500">우편번호 {zonecode}</p>
              )}
              <p className="text-sm font-bold leading-relaxed text-slate-900">{roadAddress}</p>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              상세 주소 (동·호수, 층)
            </label>
            <Input
              value={detailAddress}
              onChange={(e) => setDetailAddress(e.target.value)}
              placeholder="예: 4층 물류팀, 101호"
              className="h-9 border-slate-200 bg-white text-sm"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleOpenSearch}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#3182F6] hover:underline"
            >
              <Search className="size-3.5" />
              주소 다시 검색
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              주소 지우기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
