/** 캔버스 data URL → multipart `signature` 파트용 파일 */

export function dataUrlToSignatureFile(
  dataUrl: string,
  filename = 'signature.png',
): File {
  const [header, base64] = dataUrl.split(',');
  if (!base64) {
    throw new Error('유효하지 않은 서명 이미지입니다.');
  }

  const mime = header?.match(/data:([^;]+)/)?.[1] ?? 'image/png';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new File([bytes], filename, { type: mime });
}
