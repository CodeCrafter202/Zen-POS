import React from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { cn } from '../../lib/utils';

const inputClassName =
  'w-full p-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring';

export default function PrinterSettingsPanel({
  form,
  setForm,
  printers,
  testingPrint,
  onTestPrint,
  onTestReturnPrint,
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Printing</CardTitle>
          <CardDescription>Receipt printer and paper size.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Receipt printer</label>
              <select
                className={inputClassName}
                value={form.printerPort || ''}
                onChange={(e) => setForm({ ...form, printerPort: e.target.value })}
              >
                <option value="">— Manual print dialog —</option>
                {printers.map((printer) => (
                  <option key={printer.name} value={printer.name}>
                    {printer.name}{printer.isDefault ? ' (default)' : ''}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Choose <strong>Xprinter XP-80</strong> (paper width 80). Uses ESC/POS raw print.
                Cash drawer opens automatically on cash sales when wired to the printer (RJ11).
              </p>
              <input
                className={cn(inputClassName, 'mt-2')}
                value={form.printerPort || ''}
                onChange={(e) => setForm({ ...form, printerPort: e.target.value })}
                placeholder="Or type name / COM3"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={testingPrint || !form.printerPort}
                  onClick={onTestPrint}
                >
                  {testingPrint ? 'Printing test…' : 'Print test page'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={testingPrint || !form.printerPort}
                  onClick={onTestReturnPrint}
                >
                  Test return receipt
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Paper width (mm)</label>
              <select
                className={inputClassName}
                value={form.paperWidth}
                onChange={(e) => setForm({ ...form, paperWidth: Number(e.target.value) })}
              >
                <option value={80}>80 (XP-80)</option>
                <option value={58}>58</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Price labels</CardTitle>
          <CardDescription>Default size for XP-365B label printing.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">Label width (mm)</label>
              <input
                type="number"
                min={20}
                max={120}
                step={0.1}
                className={inputClassName}
                value={form.labelWidthMm ?? 38}
                onChange={(e) => setForm({ ...form, labelWidthMm: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Label height (mm)</label>
              <input
                type="number"
                min={15}
                max={100}
                step={0.1}
                className={inputClassName}
                value={form.labelHeightMm ?? 25}
                onChange={(e) => setForm({ ...form, labelHeightMm: Number(e.target.value) })}
              />
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">
                Default <strong>38 × 25 mm</strong> (1.5&quot; × 1&quot;) for XP-365B price labels.
                Match Windows printer Preferences to the same size. When printing labels, select{' '}
                <strong>Xprinter XP-365B</strong>, use scale <strong>100%</strong> (do not Fit to page).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
