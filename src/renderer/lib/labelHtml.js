
/**
 * Thermal label HTML for:
 *
 * Xprinter XP-365B
 * 203 DPI
 * 38 x 25 mm labels
 *
 * Barcode PNGs are generated before this HTML is created.
 * This file does not run barcode-generation JavaScript
 * inside the print window.
 */

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function money(value) {
  const amount = Number(value || 0);
  return `Rs. ${(Number.isFinite(amount) ? amount : 0).toFixed(2)}`;
}

function clampMm(value, fallback, min, max) {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, n));
}

/**
 * Build the complete print document.
 *
 * Each label object should contain:
 * {
 *   name,
 *   price,
 *   barcode,
 *   barcodePng
 * }
 */
export function buildLabelPrintHtml({
  labels = [],
  widthMm = 38,
  heightMm = 25,
  autoPrint = true,
} = {}) {
  const w = clampMm(widthMm, 38, 20, 120);
  const h = clampMm(heightMm, 25, 15, 100);
  const pad = 0.7;

  const labelList = Array.isArray(labels) ? labels : [];

  const cards = labelList
    .map((label, index) => {
      const name = escapeHtml(label?.name || '');
      const price = escapeHtml(money(label?.price));

      // Keep barcode values as strings to preserve leading zeros.
      const code = escapeHtml(
        label?.barcode == null ? '' : String(label.barcode)
      );

      const barcodePng =
        typeof label?.barcodePng === 'string'
          ? label.barcodePng
          : '';

      const isLast = index === labelList.length - 1;


      const barcodeWidthMm = Math.min(
        w - pad * 2,
        Math.max(0, Number(label?.barcodeWidthMm) || 0)
      );

      const barcodeHeightMm = Math.max(
        0,
        Number(label?.barcodeHeightMm) || 0
      );

      const barcodeHtml = barcodePng && barcodeWidthMm > 0 && barcodeHeightMm > 0
        ? `
          <img
            class="barcode"
            src="${escapeHtml(barcodePng)}"
            alt=""
            draggable="false"
            style="width:${barcodeWidthMm}mm;height:${barcodeHeightMm}mm"
          />
        `
        : `
          <div class="barcode-missing">
            Barcode unavailable
          </div>
        `;


      return `
<div class="label${isLast ? ' last' : ''}">
  <div class="name">${name}</div>
  <div class="price">${price}</div>
  <div class="bars">${barcodeHtml}</div>
  <div class="code">${code}</div>
</div>
`;
    })
    .join('\n');

  const autoPrintScript = autoPrint
    ? `
<script>
window.addEventListener('load', () => {
  const images = Array.from(document.images);

  Promise.all(
    images.map((img) => {
      if (img.complete) {
        return Promise.resolve();
      }

      return new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    })
  ).then(() => {
    setTimeout(() => window.print(), 300);
  });
});
</script>
`
    : '';

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Barcode Labels</title>

<style>
/* PAGE */
@page {
  size: ${w}mm ${h}mm;
  margin: 0;
}

/* GLOBAL */
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  width: ${w}mm;
  background: #ffffff;
  color: #000000;
}

body {
  font-family: Arial, Helvetica, sans-serif;
}

/* LABEL */
.label {
  position: relative;
  width: ${w}mm;
  height: ${h}mm;
  min-width: ${w}mm;
  max-width: ${w}mm;
  min-height: ${h}mm;
  max-height: ${h}mm;
  margin: 0;
  padding: ${pad}mm;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  text-align: center;

  page-break-after: always;
  break-after: page;
  page-break-inside: avoid;
  break-inside: avoid;
}

.label.last {
  page-break-after: auto;
  break-after: auto;
}

/* PRODUCT NAME */
.name {
  flex: 0 0 5mm;
  width: 100%;
  height: 5mm;
  max-height: 5mm;
  overflow: hidden;

  font-size: 2.6mm;
  font-weight: 700;
  line-height: 1.05;

  word-break: break-word;
  overflow-wrap: anywhere;

  margin: 0 0 0.3mm 0;
}

/* PRICE */
.price {
  flex: 0 0 3.5mm;
  width: 100%;
  height: 3.5mm;
  max-height: 3.5mm;
  overflow: hidden;

  font-size: 3.2mm;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;

  margin: 0 0 0.6mm 0;
}

/* BARCODE CONTAINER */
.bars {
  flex: 0 0 11mm;
  width: 100%;
  height: 11mm;
  min-height: 11mm;
  max-height: 11mm;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
  margin: 0;
  padding: 0;
}

/* BARCODE PNG
   Keep its generated pixel dimensions.
   Do not force a fixed width or height. */


.barcode {
  flex: 0 0 auto;
  display: block;

  margin: 0;
  padding: 0;
  border: 0;

  max-width: none !important;
  max-height: none !important;

  image-rendering: pixelated;
  transform: none !important;
}



/* MISSING BARCODE */
.barcode-missing {
  font-size: 2mm;
  color: #000000;
}

/* BARCODE TEXT */
.code {
  flex: 0 0 3mm;
  width: 100%;
  height: 3mm;
  max-height: 3mm;
  overflow: hidden;

  font-size: 2.6mm;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0;
  white-space: nowrap;

  margin: 0.4mm 0 0 0;
}

/* PRINT */
@media print {
  html,
  body {
    width: ${w}mm;
    height: ${h}mm;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden;
    background: #ffffff;
  }


.barcode {
  flex: 0 0 auto;
  display: block;

  margin: 0;
  padding: 0;
  border: 0;

  max-width: none !important;
  max-height: none !important;

  image-rendering: pixelated;
  transform: none !important;
}

  .bars {
    flex: 0 0 11mm !important;
    height: 11mm !important;
    min-height: 11mm !important;
    max-height: 11mm !important;
  }

  .barcode {
    width: auto !important;
    height: auto !important;

    max-width: none !important;
    max-height: none !important;

    flex: 0 0 auto;
    transform: none !important;
  }
}

/* SCREEN PREVIEW */
@media screen {
  html,
  body {
    background: #e8e8e8;
  }

  body {
    width: auto;
    padding: 12px;
  }

  .label {
    background: #ffffff;
    margin: 0 auto 12px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  }
}
</style>
</head>

<body>
${cards}
${autoPrintScript}
</body>
</html>`;
}
