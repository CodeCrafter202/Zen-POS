import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

const inputClassName =
  'w-full p-3 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring';

export default function PoliciesSettingsPanel({ form, setForm }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Settings</CardTitle>
          <CardDescription>Cash day rules and staff discount limits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold">Cash day past midnight</p>
              <p className="text-xs text-muted-foreground mt-1">
                If yesterday&apos;s cash day was left open, choose whether billing is blocked until close &amp; reopen.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                If cash day left open past midnight
              </label>
              <select
                className={inputClassName}
                value={form.staleDayPolicy || 'block'}
                onChange={(e) => setForm({ ...form, staleDayPolicy: e.target.value })}
              >
                <option value="block">Block selling (recommended)</option>
                <option value="warn">Warn only</option>
              </select>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <div>
              <p className="text-sm font-semibold">Discount limits</p>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum discount staff can apply on an item or whole bill (percent of price). Admins have no limit.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">Cashier max discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className={inputClassName}
                  value={form.cashierMaxDiscountPct}
                  onChange={(e) => setForm({ ...form, cashierMaxDiscountPct: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Manager max discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className={inputClassName}
                  value={form.managerMaxDiscountPct}
                  onChange={(e) => setForm({ ...form, managerMaxDiscountPct: e.target.value })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
