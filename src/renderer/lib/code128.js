
/**
 * Code128-B Barcode Generator
 *
 * Printer: Xprinter XP-365B
 * Resolution: 203 DPI
 * Label: 38 x 25 mm
 *
 * Uses integer-width modules to prevent distorted bars.
 * Preserves leading zeros, e.g. "001".
 */

const PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222',
  '122213', '122312', '132212', '221213', '221312', '231212',
  '112232', '122132', '122231', '113222', '123122', '123221',
  '223211', '221132', '221231', '213212', '223112', '312131',
  '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321',
  '112313', '132113', '132311', '211313', '231113', '231311',
  '112133', '112331', '132131', '113123', '113321', '133121',
  '313121', '211331', '231131', '213113', '213311', '213131',
  '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124',
  '121421', '141122', '141221', '112214', '112412', '122114',
  '122411', '142112', '142211', '241211', '221114', '413111',
  '241112', '134111', '111242', '121142', '121241', '114212',
  '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113',
  '114311', '411113', '411311', '113141', '114131', '311141',
  '411131', '211412', '211214', '211232', '2331112',
];

const START_B = 104;
const STOP = 106;

export const PRINTER_DPI = 203;

// Three printer dots per narrow module for short barcodes.
// The generator reduces to two dots when needed to fit.
export const BARCODE_MODULE_DOTS = 3;
export const QUIET_MODULES = 10;

// Nominal compatibility constants for a short barcode.
export const BARCODE_DATA_DOTS = 204;
export const QUIET_DOTS = BARCODE_MODULE_DOTS * QUIET_MODULES;

// Approximately 11 mm high, matching the label HTML container.
export const BARCODE_HEIGHT_DOTS = Math.round(
  (11 / 25.4) * PRINTER_DPI
);

// Available width inside a 38 mm label with 0.7 mm padding
// on each side.
const MAX_WIDTH_DOTS = Math.floor(
  ((38 - 1.4) / 25.4) * PRINTER_DPI
);

/**
 * Convert a Code128-B character to its symbol value.
 * Only printable ASCII characters are supported.
 */
function charValue(character) {
  const code = character.charCodeAt(0);

  if (code < 32 || code > 126) {
    throw new Error(
      `Code128-B cannot encode character code ${code}. ` +
      'Use printable ASCII characters.'
    );
  }

  return code - 32;
}

/**
 * Encode text into alternating bar/space run widths.
 */
export function encodeCode128B(text) {
  const raw = String(text ?? '');

  if (!raw) {
    return [];
  }

  const values = [START_B];

  for (let i = 0; i < raw.length; i += 1) {
    values.push(charValue(raw[i]));
  }

  let checksum = START_B;

  for (let i = 1; i < values.length; i += 1) {
    checksum += values[i] * i;
  }

  values.push(checksum % 103);
  values.push(STOP);

  const modules = [];

  for (const value of values) {
    const pattern = PATTERNS[value];

    if (!pattern) {
      throw new Error(`Invalid Code128 value: ${value}`);
    }

    for (const digit of pattern) {
      modules.push(Number(digit));
    }
  }

  return modules;
}

/**
 * Convert run widths to exact integer printer dots.
 * Every narrow module has the same physical width.
 */
function modulesToDots(modules, moduleDots) {
  if (!modules.length) {
    return [];
  }

  if (!Number.isInteger(moduleDots) || moduleDots < 1) {
    throw new Error('Module width must be a positive integer.');
  }

  return modules.map((width) => width * moduleDots);
}

/**
 * Generate a barcode PNG data URL.
 *
 * @param {string|number} text Barcode value.
 * @param {object} options Rendering options.
 * @param {number} options.heightDots Barcode height in printer dots.
 * @param {number} options.maxWidthDots Maximum total image width.
 * @param {number} options.moduleDots Preferred narrow-bar width.
 * @param {number} options.quietModules Quiet-zone width on each side,
 *                                      measured in narrow modules.
 */
export function code128PngDataUrl(
  text,
  {
    heightDots = BARCODE_HEIGHT_DOTS,
    maxWidthDots = MAX_WIDTH_DOTS,
    moduleDots = BARCODE_MODULE_DOTS,
    quietModules = QUIET_MODULES,
  } = {}
) {
  // Do not convert barcode strings to numbers:
  // "001" must remain "001".
  const raw = String(text ?? '');

  if (!raw) {
    return '';
  }

  if (
    !Number.isInteger(heightDots) ||
    heightDots <= 0 ||
    !Number.isInteger(maxWidthDots) ||
    maxWidthDots <= 0 ||
    !Number.isInteger(moduleDots) ||
    moduleDots <= 0 ||
    !Number.isInteger(quietModules) ||
    quietModules < 10
  ) {
    throw new Error('Invalid barcode dimensions or quiet-zone settings.');
  }

  // Invalid characters should produce an error rather than
  // silently printing a different value.
  const modules = encodeCode128B(raw);

  if (!modules.length) {
    return '';
  }

  const totalModules = modules.reduce(
    (sum, width) => sum + width,
    0
  );

  // Prefer 3 dots per narrow module. If the barcode is too
  // wide, try 2 dots. Never squeeze bars using fractional scaling.
  let selectedModuleDots = moduleDots;

  let dataDots = totalModules * selectedModuleDots;
  let quietDots = quietModules * selectedModuleDots;
  let canvasWidth = dataDots + quietDots * 2;

  if (canvasWidth > maxWidthDots && selectedModuleDots > 2) {
    selectedModuleDots = 2;

    dataDots = totalModules * selectedModuleDots;
    quietDots = quietModules * selectedModuleDots;
    canvasWidth = dataDots + quietDots * 2;
  }

  if (canvasWidth > maxWidthDots) {
    throw new Error(
      `Barcode "${raw}" is too long for a ${maxWidthDots}-dot label ` +
      'at a minimum 2-dot bar width. Use a shorter barcode or a wider label.'
    );
  }

  const widths = modulesToDots(modules, selectedModuleDots);

  const canvas = document.createElement('canvas');

  canvas.width = canvasWidth;
  canvas.height = heightDots;

  const ctx = canvas.getContext('2d', { alpha: false });

  if (!ctx) {
    throw new Error('Could not create the barcode canvas.');
  }

  ctx.imageSmoothingEnabled = false;

  // White background and required quiet zones.
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasWidth, heightDots);

  ctx.fillStyle = '#000000';

  let x = quietDots;
  let isBar = true;

  for (const width of widths) {
    if (isBar) {
      ctx.fillRect(x, 0, width, heightDots);
    }

    x += width;
    isBar = !isBar;
  }

  return canvas.toDataURL('image/png');
}

/**
 * Estimate the PNG width for a particular barcode.
 * Returns millimetres, including quiet zones.
 */
export function getBarcodeWidthMm(
  text,
  {
    moduleDots = BARCODE_MODULE_DOTS,
    quietModules = QUIET_MODULES,
  } = {}
) {
  const modules = encodeCode128B(String(text ?? ''));

  if (!modules.length) {
    return 0;
  }

  const totalModules = modules.reduce(
    (sum, width) => sum + width,
    0
  );

  let dots = (totalModules + quietModules * 2) * moduleDots;

  if (dots > MAX_WIDTH_DOTS && moduleDots > 2) {
    dots = (totalModules + quietModules * 2) * 2;
  }

  return (dots / PRINTER_DPI) * 25.4;
}

/**
 * Return barcode image height in millimetres.
 */
export function getBarcodeHeightMm({
  heightDots = BARCODE_HEIGHT_DOTS,
} = {}) {
  return (heightDots / PRINTER_DPI) * 25.4;
}
