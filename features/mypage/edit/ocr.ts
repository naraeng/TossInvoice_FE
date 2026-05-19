'use client';

import Tesseract from 'tesseract.js';

type BusinessDocExtract = {
  companyName: string;
  businessNumber: string;
  ceoName: string;
  businessType: string;
  address: string;
  companyType: 'CORPORATE' | 'INDIVIDUAL';
};

type BankbookExtract = {
  bank: string;
  account: string;
  accountHolder: string;
};

const BANK_NAMES = [
  '국민은행',
  '신한은행',
  '우리은행',
  '하나은행',
  '농협은행',
  '기업은행',
  '카카오뱅크',
  '토스뱅크',
  '새마을금고',
  '우체국',
  '수협은행',
  'SC제일은행',
];

function collapseSpaces(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

const KOR_CITIES = [
  '서울특별시',
  '서울시',
  '부산광역시',
  '대구광역시',
  '인천광역시',
  '광주광역시',
  '대전광역시',
  '울산광역시',
  '세종특별자치시',
  '경기도',
  '강원특별자치도',
  '충청북도',
  '충청남도',
  '전북특별자치도',
  '전라남도',
  '경상북도',
  '경상남도',
  '제주특별자치도',
];

function firstMatch(text: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const hit = text.match(pattern);
    const value = hit?.[1]?.trim();
    if (value) return value;
  }
  return '';
}

function readValueAfterLabelPatterns(
  text: string,
  labelPatterns: RegExp[],
  stopKeywords: string[],
): string {
  const flat = collapseSpaces(text);
  for (const pattern of labelPatterns) {
    const hit = flat.match(pattern);
    const raw = hit?.[1];
    if (!raw) continue;
    const bySection = trimBySectionBoundary(raw, stopKeywords);
    const byKeyword = cutAtFirstKeyword(bySection, stopKeywords);
    const cleaned = collapseSpaces(byKeyword);
    if (cleaned) return cleaned;
  }
  return '';
}

function cutAtFirstKeyword(input: string, keywords: string[]): string {
  let value = input;
  for (const keyword of keywords) {
    const idx = value.search(new RegExp(`\\s*${keyword}`, 'i'));
    if (idx > 0) {
      value = value.slice(0, idx);
    }
  }
  return value;
}

function trimBySectionBoundary(input: string, extraStops: string[] = []): string {
  let value = collapseSpaces(input);
  const sectionBoundary = value.search(/\s(?:[①②③④⑤⑥⑦⑧⑨⑩⑪]|\d{1,2}\s*[.)])\s*/);
  if (sectionBoundary > 0) {
    value = value.slice(0, sectionBoundary);
  }
  for (const stop of extraStops) {
    const idx = value.search(new RegExp(`\\s${stop}`, 'i'));
    if (idx > 0) {
      value = value.slice(0, idx);
    }
  }
  return collapseSpaces(value.replace(/^[=:：\s]+/, ''));
}

function sanitizeCompanyName(value: string): string {
  const trimmed = trimBySectionBoundary(value, ['성명', '개업연월일', '생년월일', '사업장소재지']);
  const cut = cutAtFirstKeyword(trimmed, ['대표자', '사업장', '업태', '업종']).trim();
  const cleaned = cut
    .replace(/\(일반과세자\)|\(간이과세자\)|일반과세자|간이과세자/gi, '')
    .replace(/사업자등록증|등록번호|등록|번호/gi, '')
    .replace(/\s+성(\s|$).*/i, '') // "준회사 성 (일반과세자)" 케이스
    .replace(/\s+성$/, '') // OCR이 "성 명" 라벨의 "성"을 상호 뒤에 붙이는 케이스
    .trim();
  return cleaned;
}

function sanitizeCeoName(value: string): string {
  const trimmed = trimBySectionBoundary(value, ['개업연월일', '생년월일', '사업장소재지']);
  const nameHit = trimmed.match(/[가-힣]{2,5}/);
  return nameHit?.[0] ?? trimmed;
}

function sanitizeAddress(value: string): string {
  const trimmed = trimBySectionBoundary(value, [
    '사업의종류',
    '사 업 의 종 류',
    '업태',
    '업종',
    '발급',
    '공동사업자',
  ]);
  return cutAtFirstKeyword(trimmed, ['업태', '업종', '발급사유', '공동사업자']);
}

function sanitizeBusinessType(value: string): string {
  const trimmed = trimBySectionBoundary(value, [
    '생산',
    '발급',
    '공동사업자',
    '주류판매신고번호',
    '사업장소재지',
    '사 업 장 소 재 지',
    '전자세금계산서',
    '도봉세무서장',
  ]);
  return cutAtFirstKeyword(trimmed, [
    '생산요소',
    '발급사유',
    '공동사업자',
    '사업장소재지',
    '전자세금계산서',
  ]);
}

function fallbackBusinessAddress(text: string): string {
  const compact = collapseSpaces(text);
  for (const city of KOR_CITIES) {
    const re = new RegExp(
      `(${city}[\\s\\S]{0,60}?)(?=\\s*(사업의종류|업태|종목|발급사유|공동사업자|주류판매신고번호|전자세금계산서|$))`,
      'i',
    );
    const hit = compact.match(re);
    if (hit?.[1]) {
      return collapseSpaces(hit[1]);
    }
  }
  return '';
}

function fallbackCompanyName(flat: string): string {
  return (
    firstMatch(flat, [
      /등록번호\s*[:：]?\s*\d{3}[-\s]?\d{2}[-\s]?\d{5}\s*호?\s*[:：]?\s*([가-힣A-Za-z()]+(?:\s*[가-힣A-Za-z()]+){0,3})(?=\s*성|\s*대표|\s*개업)/i,
      /상\s*호\s*[:：]?\s*([가-힣A-Za-z() ]{2,30})(?=\s*성|\s*대표|\s*개업|\s*\()/i,
      /호\s*([가-힣A-Za-z()]{2,20})(?=\s*성)/i,
      /([가-힣A-Za-z()]{2,20}회사)(?=\s*성|\s*대표|\s*개업)/i,
    ]) || ''
  );
}

function fallbackCompanyByBusinessNumber(flat: string): string {
  const biz = flat.match(/\d{3}\s*[-]?\s*\d{2}\s*[-]?\s*\d{5}/);
  if (!biz || biz.index === undefined) return '';
  const near = flat.slice(biz.index, biz.index + 120);
  return (
    firstMatch(near, [
      /호?\s*[:：]?\s*([가-힣A-Za-z()]+(?:\s*[가-힣A-Za-z()]+){0,3})(?=\s*성|\s*대표|\s*개업)/i,
      /([가-힣A-Za-z()]+(?:\s*[가-힣A-Za-z()]+){0,3})(?=\s*성|\s*대표|\s*개업)/i,
    ]) || ''
  );
}

function fallbackCeoName(flat: string): string {
  const direct =
    firstMatch(flat, [
      /(?:성\s*명|대표자|공동명)\s*[:：]?\s*([가-힣]{2,5})(?=\s|$)/i,
      /([가-힣]{2,5})(?=\s*개업연월일|\s*생년월일)/i,
    ]) || '';
  if (direct) return direct;

  const candidates = [...flat.matchAll(/[가-힣]{2,4}/g)].map((m) => m[0]);
  const blocked = new Set([
    '등록번호',
    '일반과세자',
    '사업자',
    '도봉세무서장',
    '서울특별시',
    '도봉구',
    '정보통신업',
    '준회사',
  ]);
  const filtered = candidates.filter((name) => !blocked.has(name));
  return filtered.at(-1) ?? '';
}

function normalizeForCompare(input: string): string {
  return input
    .replace(/\s+/g, '')
    .replace(/[()]/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .replace(/님$/i, '')
    .toLowerCase();
}

function readByLabel(text: string, labels: string[]): string | null {
  for (const label of labels) {
    const re = new RegExp(`${label}\\s*[:：]?\\s*([^\\n\\r]+)`, 'i');
    const hit = text.match(re);
    if (hit?.[1]) return collapseSpaces(hit[1]);
  }
  return null;
}

function toBusinessNumber(text: string): string {
  const hit = text.match(/(\d{3})[-\s]?(\d{2})[-\s]?(\d{5})/);
  if (!hit) return '';
  return `${hit[1]}-${hit[2]}-${hit[3]}`;
}

function toAccount(text: string): string {
  const hit = text.match(/(\d{2,4})[-\s]?(\d{2,6})[-\s]?(\d{4,8})/);
  if (!hit) return '';
  return `${hit[1]}-${hit[2]}-${hit[3]}`;
}

function extractBank(text: string): string {
  const found = BANK_NAMES.find((bank) => text.includes(bank));
  return found ?? '';
}

function detectCompanyType(text: string): 'CORPORATE' | 'INDIVIDUAL' {
  if (/법인|주식회사|\(주\)|㈜/i.test(text)) return 'CORPORATE';
  return 'INDIVIDUAL';
}

export function parseBusinessDocText(text: string): BusinessDocExtract {
  const flat = collapseSpaces(text);
  const companyNameByLabel = readValueAfterLabelPatterns(
    text,
    [/상\s*호\s*명?\s*[:：]?\s*([\s\S]{1,80})/i, /회\s*사\s*명\s*[:：]?\s*([\s\S]{1,80})/i],
    [
      '성명',
      '대표자',
      '개업연월일',
      '생년월일',
      '사업장소재지',
      '사업장 소재지',
      '사업의종류',
      '사 업 의 종 류',
      '업태',
      '업종',
      '발급사유',
      '공동사업자',
      '주류판매신고번호',
      '전자세금계산서',
    ],
  );
  const companyNameRaw =
    companyNameByLabel ||
    firstMatch(flat, [
      /상\s*호\s*[:：]?\s*([\s\S]*?)(?=\s*성\s*명\s*[:：]?|\s*대표자\s*[:：]?|\s*개\s*업\s*연\s*월\s*일)/i,
      /법\s*인\s*명\s*[:：]?\s*([\s\S]*?)(?=\s*성\s*명\s*[:：]?|\s*대표자\s*[:：]?)/i,
      /회\s*사\s*명\s*[:：]?\s*([\s\S]*?)(?=\s*성\s*명\s*[:：]?|\s*대표자\s*[:：]?)/i,
      /(\(주\)\s*[^\n\r]+|주식회사\s*[^\n\r]+)/i,
    ]) ||
    fallbackCompanyName(flat) ||
    fallbackCompanyByBusinessNumber(flat) ||
    readByLabel(text, ['상호', '법인명', '회사명']) ||
    '';
  const businessNumber = toBusinessNumber(text);
  const ceoNameRaw =
    firstMatch(flat, [
      /성\s*명\s*[:：]?\s*([가-힣]{2,5})(?=\s*개\s*업\s*연\s*월\s*일|\s*생\s*년\s*월\s*일|\s*사\s*업\s*장)/i,
      /대표자\s*[:：]?\s*([가-힣]{2,5})(?=\s*개\s*업\s*연\s*월\s*일|\s*생\s*년\s*월\s*일|\s*사\s*업\s*장)/i,
    ]) ||
    fallbackCeoName(flat) ||
    readByLabel(text, ['대표자', '성명']) ||
    '';

  const upTae = trimBySectionBoundary(
    firstMatch(flat, [/업\s*태\s*[:：]?\s*([\s\S]*?)(?=\s*종\s*목\s*[:：]?|\s*생\s*산|\s*발\s*급)/i]),
    ['종목', '생산', '발급', '공동사업자'],
  );
  const jongMok = trimBySectionBoundary(
    firstMatch(flat, [/종\s*목\s*[:：]?\s*([\s\S]*?)(?=\s*생\s*산|\s*발\s*급|\s*공\s*동\s*사\s*업\s*자)/i]),
    ['생산', '발급', '공동사업자'],
  );
  const businessTypeCombined = collapseSpaces(
    [upTae, jongMok].filter((v, i, arr) => Boolean(v) && arr.indexOf(v) === i).join(' / '),
  );

  const businessType =
    businessTypeCombined ||
    sanitizeBusinessType(trimBySectionBoundary(readByLabel(text, ['업태', '업종']) ?? '', [
      '발급',
      '공동사업자',
      '주류판매신고번호',
    ]));
  const addressRaw =
    firstMatch(flat, [
      /사\s*업\s*장\s*소\s*재\s*지\s*[:：]?\s*([\s\S]*?)(?=\s*사\s*업\s*의\s*종\s*류|\s*업\s*태|\s*⑥)/i,
      /사\s*업\s*장\s*소\s*재\s*지\s*[:：]?\s*([\s\S]*?)(?=\s*발\s*급\s*사\s*유|\s*공\s*동\s*사\s*업\s*자|\s*주\s*류\s*판\s*매\s*신\s*고)/i,
      /사\s*업\s*장\s*소\s*재\s*지\s*[:：]?\s*([\s\S]*?)(?=\s*전자세금계산서|\s*도봉세무서장|\s*\d{4}\s*년)/i,
    ]) || readByLabel(text, ['사업장\\s*소재지']) || '';
  const address = sanitizeAddress(
    trimBySectionBoundary(addressRaw, ['사업의종류', '사 업 의 종 류', '업태', '발급', '공동사업자']),
  );
  const resolvedAddress = address || fallbackBusinessAddress(flat);
  const companyType = detectCompanyType(`${companyNameRaw}\n${text}`);

  return {
    companyName: sanitizeCompanyName(companyNameRaw),
    businessNumber,
    ceoName: sanitizeCeoName(ceoNameRaw),
    businessType: sanitizeBusinessType(businessType),
    address: resolvedAddress,
    companyType,
  };
}

export function parseBankbookText(text: string): BankbookExtract {
  const flat = collapseSpaces(text);
  const accountHolder =
    readByLabel(text, ['예금주', '받는분', '성명']) ??
    firstMatch(flat, [
      /([가-힣]{2,5})\s*님\s*의?\s*계좌/i,
      /([가-힣]{2,5})\s*계좌가\s*개설/i,
      /([가-힣]{2,5})\s*님\s*의?\s*계좌가\s*개설/i,
    ]) ??
    '';
  const account = toAccount(text);
  const bank = extractBank(text);

  return {
    bank,
    account,
    accountHolder: collapseSpaces(accountHolder),
  };
}

async function recognizeImageWithTesseract(source: File | HTMLCanvasElement): Promise<string> {
  try {
    const { data } = await Tesseract.recognize(source, 'kor+eng');
    return data.text ?? '';
  } catch {
    // Fallback for environments where Korean traineddata download fails.
    const { data } = await Tesseract.recognize(source, 'eng');
    return data.text ?? '';
  }
}

async function importPdfJs() {
  const legacyPath = 'pdfjs-dist/legacy/build/pdf.mjs';
  const modernPath = 'pdfjs-dist/build/pdf.mjs';
  try {
    return (await import(legacyPath)) as Record<string, unknown>;
  } catch {
    return (await import(modernPath)) as Record<string, unknown>;
  }
}

async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsModule = await importPdfJs();
  const pdfjs = ((pdfjsModule.default as Record<string, unknown> | undefined) ??
    pdfjsModule) as {
    version?: string;
    GlobalWorkerOptions?: { workerSrc?: string };
    getDocument: (params: unknown) => { promise: Promise<any> };
  };
  const version = pdfjs.version ?? '5.7.284';
  if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/legacy/build/pdf.worker.min.mjs`;
  }
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;
  const pages = Math.min(pdf.numPages, 3);
  const chunks: string[] = [];

  for (let i = 1; i <= pages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const fromTextLayer = (content.items as Array<{ str?: string }>)
      .map((item) => item.str ?? '')
      .join(' ')
      .trim();
    if (fromTextLayer) chunks.push(fromTextLayer);
  }

  if (chunks.join(' ').trim()) {
    return chunks.join('\n');
  }

  const firstPage = await pdf.getPage(1);
  const viewport = firstPage.getViewport({ scale: 2 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return '';
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  await firstPage.render({ canvasContext: context, viewport }).promise;
  return recognizeImageWithTesseract(canvas);
}

export async function extractTextFromFile(file: File): Promise<string> {
  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (isPdf) return extractTextFromPdf(file);
  return recognizeImageWithTesseract(file);
}

export function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return '알 수 없는 오류';
  }
}

export function isSameCompanyName(a: string, b: string): boolean {
  if (!a || !b) return false;
  const na = normalizeForCompare(a);
  const nb = normalizeForCompare(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

export function isNameIncludedInText(name: string, text: string): boolean {
  if (!name || !text) return false;
  const normalizedName = normalizeForCompare(name);
  const normalizedText = normalizeForCompare(text);
  if (!normalizedName || !normalizedText) return false;
  return normalizedText.includes(normalizedName);
}

