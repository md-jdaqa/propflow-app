// PropFlow — receipt numbering.
// Format: PF-<YYYY>-<6-digit-sequence>.

export function nextReceiptNumber(year: number, lastSeq: number): string {
  const next = lastSeq + 1;
  const padded = String(next).padStart(6, "0");
  return `PF-${year}-${padded}`;
}

// Helper so the API route can extract the sequence from an existing number.
export function parseReceiptNumber(
  num: string,
): { year: number; seq: number } | null {
  const match = /^PF-(\d{4})-(\d{6})$/.exec(num);
  if (!match) return null;
  return { year: parseInt(match[1], 10), seq: parseInt(match[2], 10) };
}
