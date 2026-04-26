// PropFlow — printable cash-receipt HTML generator.
// Self-contained HTML (inline styles only, no external assets) so it prints
// cleanly from a phone or a kiosk printer.

export interface ReceiptInput {
  number: string;
  payerName: string;
  amount: number;
  paidOn: Date;
  method: string;
  notes?: string | null;
  propertyName?: string | null;
  unitLabel?: string | null;
}

const ONES = [
  "Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
  "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen",
  "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy",
  "Eighty", "Ninety",
];

function under1000(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return o === 0 ? TENS[t] : `${TENS[t]}-${ONES[o]}`;
  }
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return rest === 0
    ? `${ONES[h]} Hundred`
    : `${ONES[h]} Hundred ${under1000(rest)}`;
}

export function amountInWords(amount: number): string {
  const dollars = Math.floor(Math.abs(amount));
  const cents = Math.round((Math.abs(amount) - dollars) * 100);

  let words: string;
  if (dollars === 0) {
    words = "Zero";
  } else {
    const parts: string[] = [];
    const millions = Math.floor(dollars / 1_000_000);
    const thousands = Math.floor((dollars % 1_000_000) / 1000);
    const remainder = dollars % 1000;
    if (millions > 0) parts.push(`${under1000(millions)} Million`);
    if (thousands > 0) parts.push(`${under1000(thousands)} Thousand`);
    if (remainder > 0) parts.push(under1000(remainder));
    words = parts.join(" ");
  }

  const centsPart = String(cents).padStart(2, "0");
  return `${words} and ${centsPart}/100 Dollars`;
}

function formatMoney(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderReceiptHtml(input: ReceiptInput): string {
  const safe = {
    number: escapeHtml(input.number),
    payer: escapeHtml(input.payerName),
    method: escapeHtml(input.method),
    notes: input.notes ? escapeHtml(input.notes) : "",
    property: input.propertyName ? escapeHtml(input.propertyName) : "",
    unit: input.unitLabel ? escapeHtml(input.unitLabel) : "",
  };
  const dateStr = formatDate(input.paidOn);
  const moneyStr = formatMoney(input.amount);
  const wordsStr = amountInWords(input.amount);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Receipt ${safe.number}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <main style="max-width:640px;margin:0 auto;background:#ffffff;padding:32px 28px;box-shadow:0 0 0 1px #e2e8f0;">
    <header style="border-bottom:2px solid #0f172a;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
      <div>
        <h1 style="margin:0;font-size:28px;letter-spacing:-0.5px;">PropFlow</h1>
        <p style="margin:4px 0 0;font-size:13px;color:#475569;">Cash Receipt</p>
      </div>
      <div style="text-align:right;">
        <p style="margin:0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Receipt #</p>
        <p style="margin:2px 0 0;font-size:18px;font-weight:600;font-family:ui-monospace,Menlo,Consolas,monospace;">${safe.number}</p>
      </div>
    </header>

    <section style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
      <div>
        <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Date</p>
        <p style="margin:4px 0 0;font-size:15px;">${dateStr}</p>
      </div>
      <div>
        <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Method</p>
        <p style="margin:4px 0 0;font-size:15px;">${safe.method}</p>
      </div>
      <div>
        <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Received From</p>
        <p style="margin:4px 0 0;font-size:15px;font-weight:600;">${safe.payer}</p>
      </div>
      ${safe.property ? `<div>
        <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Property</p>
        <p style="margin:4px 0 0;font-size:15px;">${safe.property}${safe.unit ? ` &middot; ${safe.unit}` : ""}</p>
      </div>` : ""}
    </section>

    <section style="background:#f1f5f9;padding:20px;border-radius:8px;margin-bottom:24px;">
      <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Amount</p>
      <p style="margin:4px 0 8px;font-size:36px;font-weight:700;letter-spacing:-1px;">${moneyStr}</p>
      <p style="margin:0;font-size:13px;color:#334155;font-style:italic;">${wordsStr}</p>
    </section>

    ${safe.notes ? `<section style="margin-bottom:24px;">
      <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Notes</p>
      <p style="margin:4px 0 0;font-size:14px;white-space:pre-wrap;">${safe.notes}</p>
    </section>` : ""}

    <section style="margin-top:48px;display:grid;grid-template-columns:1fr 1fr;gap:32px;">
      <div>
        <div style="border-top:1px solid #0f172a;padding-top:6px;">
          <p style="margin:0;font-size:11px;color:#64748b;">Received By</p>
        </div>
      </div>
      <div>
        <div style="border-top:1px solid #0f172a;padding-top:6px;">
          <p style="margin:0;font-size:11px;color:#64748b;">Signature</p>
        </div>
      </div>
    </section>

    <footer style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="margin:0;font-size:11px;color:#94a3b8;">Generated by PropFlow &middot; Keep this receipt for your records.</p>
    </footer>
  </main>
</body>
</html>`;
}
