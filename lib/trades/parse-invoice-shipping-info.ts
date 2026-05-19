/** invoice.shippingInfo — "택배사 CJ대한통운 송장 1234567890" 형식 파싱 */
export type ParsedInvoiceShippingInfo = {
  courier?: string;
  trackingNumber?: string;
};

export function parseInvoiceShippingInfo(shippingInfo?: string | null): ParsedInvoiceShippingInfo {
  const raw = shippingInfo?.trim();
  if (!raw) return {};

  const courierMatch = raw.match(/택배사\s+(.+?)\s+송장\s+(.+)$/);
  if (courierMatch) {
    return {
      courier: courierMatch[1].trim(),
      trackingNumber: courierMatch[2].trim(),
    };
  }

  const trackingMatch = raw.match(/송장\s+(\S+)/);
  if (trackingMatch) {
    return { trackingNumber: trackingMatch[1].trim() };
  }

  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 8) {
    return { trackingNumber: digits };
  }

  return { trackingNumber: raw };
}
