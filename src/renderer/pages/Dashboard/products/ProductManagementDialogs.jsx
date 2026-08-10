import React from 'react';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog';
import { cn } from '../../../lib/utils';
import { inputClassName } from './productFormUtils';

export function ProductManagementDialogs({
  categoryDialogOpen,
  setCategoryDialogOpen,
  setDialogError,
  categoryForm,
  setCategoryForm,
  dialogError,
  handleSaveCategory,
  categories,
  saving,
  stockDialogOpen,
  setStockDialogOpen,
  handleAdjustStock,
  stockForm,
  setStockForm,
  stockVariantOptions,
  inventoryHistory,
  user,
  deleteProductDialogOpen,
  setDeleteProductDialogOpen,
  setDeleteTarget,
  deleteTarget,
  handleDeleteProduct,
  deleteCategoryDialogOpen,
  setDeleteCategoryDialogOpen,
  categoryDeleteTarget,
  handleDeleteCategory,
  navigate,
}) {
  return (
    <>
          <Dialog
            open={categoryDialogOpen}
            onOpenChange={(open) => {
              setCategoryDialogOpen(open);
              if (!open) setDialogError('');
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{categoryForm.mode === 'edit' ? 'Edit Category' : 'New Category'}</DialogTitle>
                <DialogDescription>
                  Category names must be unique under the same parent (case does not matter).
                </DialogDescription>
              </DialogHeader>

              {dialogError && (
                <Alert variant="destructive">
                  <AlertDescription>{dialogError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category name</label>
                  <input
                    className={inputClassName}
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Parent category</label>
                  <select
                    className={inputClassName}
                    value={categoryForm.parentId}
                    onChange={(e) => setCategoryForm({ ...categoryForm, parentId: e.target.value })}
                    disabled={categoryForm.mode === 'edit'}
                  >
                    <option value="">None (top level)</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {`${'— '.repeat(category.depth || 0)}${category.name}`}
                      </option>
                    ))}
                  </select>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : categoryForm.mode === 'edit' ? 'Save Category' : 'Create Category'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={stockDialogOpen}
            onOpenChange={(open) => {
              setStockDialogOpen(open);
              if (!open) setDialogError('');
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adjust Inventory</DialogTitle>
                <DialogDescription>
                  Enter a quantity to add or remove. For Sale / Transfer out / Return out, enter a positive number and stock is reduced automatically.
                </DialogDescription>
              </DialogHeader>

              {dialogError && (
                <Alert variant="destructive">
                  <AlertDescription>{dialogError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleAdjustStock} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Variant</label>
                  <select
                    className={inputClassName}
                    value={stockForm.variantId}
                    onChange={(e) => setStockForm({ ...stockForm, variantId: e.target.value })}
                  >
                    {stockVariantOptions.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.name || variant.sku} — on hand: {Number(variant.inventory?.onHand || 0)}
                        {variant.barcode ? ` (${variant.barcode})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-2">Transaction type</label>
                    <select
                      className={inputClassName}
                      value={stockForm.transactionType}
                      onChange={(e) => setStockForm({ ...stockForm, transactionType: e.target.value })}
                    >
                      <option value="purchase">Purchase (add)</option>
                      <option value="initial">Initial stock (add)</option>
                      <option value="return_in">Return in (add)</option>
                      <option value="transfer_in">Transfer in (add)</option>
                      <option value="sale">Sale (remove)</option>
                      <option value="return_out">Return out (remove)</option>
                      <option value="transfer_out">Transfer out (remove)</option>
                      <option value="adjustment">Adjustment (+/- signed)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity</label>
                    <input
                      type="number"
                      step="0.01"
                      className={inputClassName}
                      value={stockForm.quantity}
                      onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                      placeholder="e.g. 10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Unit cost (Rs.)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      Rs.
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={cn(inputClassName, 'pl-10')}
                      value={stockForm.unitCost}
                      onChange={(e) => setStockForm({ ...stockForm, unitCost: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    className={cn(inputClassName, 'min-h-24')}
                    value={stockForm.notes}
                    onChange={(e) => setStockForm({ ...stockForm, notes: e.target.value })}
                  />
                </div>

                {inventoryHistory.length > 0 && <div className="rounded-lg border border-border p-3"><p className="mb-2 text-sm font-semibold">Recent inventory history</p><div className="space-y-1 text-xs text-muted-foreground">{inventoryHistory.slice(0, 5).map((entry) => <div key={entry.id} className="flex justify-between gap-2"><span>{entry.transactionType} ({entry.quantity})</span><span>{entry.performedBy === user?.id ? 'You' : (entry.performerName || 'System')}</span></div>)}</div></div>}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setStockDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Record Stock Change'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog
            open={deleteProductDialogOpen}
            onOpenChange={(open) => {
              setDeleteProductDialogOpen(open);
              if (!open) {
                setDialogError('');
                setDeleteTarget(null);
              }
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {deleteTarget?.kind === 'variant' ? 'Delete Variant' : 'Delete Product'}
                </DialogTitle>
                <DialogDescription>
                  {deleteTarget?.kind === 'variant'
                    ? `This will archive only "${deleteTarget?.name || 'this variant'}". Other variants of the product stay active. Inventory transactions stay in the ledger.`
                    : `This will archive ${deleteTarget?.name || 'this product'} and all of its variants. Inventory transactions stay in the ledger.`}
                </DialogDescription>
              </DialogHeader>

              {dialogError && (
                <Alert variant="destructive">
                  <AlertDescription>{dialogError}</AlertDescription>
                </Alert>
              )}

              {!dialogError && deleteTarget?.stock === 0 && (
                <p className="text-sm text-muted-foreground">
                  Stock is 0 — safe to archive.
                </p>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteProductDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteProduct}
                  disabled={saving || Boolean(dialogError)}
                >
                  {saving
                    ? 'Deleting...'
                    : deleteTarget?.kind === 'variant'
                      ? 'Delete Variant'
                      : 'Delete Product'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={deleteCategoryDialogOpen}
            onOpenChange={(open) => {
              setDeleteCategoryDialogOpen(open);
              if (!open) setDialogError('');
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Category</DialogTitle>
                <DialogDescription>
                  {categoryDeleteTarget?.productCount
                    ? `${categoryDeleteTarget.name} contains ${categoryDeleteTarget.productCount} product${categoryDeleteTarget.productCount === 1 ? '' : 's'}. Choose what to do with them.`
                    : `This will archive ${categoryDeleteTarget?.name || 'this category'}.`}
                </DialogDescription>
              </DialogHeader>

              {dialogError && (
                <Alert variant="destructive">
                  <AlertDescription>{dialogError}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteCategoryDialogOpen(false)}>
                  Cancel
                </Button>
                {categoryDeleteTarget?.productCount ? <>
                  <Button variant="outline" onClick={() => { setDeleteCategoryDialogOpen(false); navigate('/products'); }}>
                    Go to Products List
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteCategory} disabled={saving}>
                    {saving ? 'Moving...' : 'Move to Uncategorized'}
                  </Button>
                </> : <Button variant="destructive" onClick={handleDeleteCategory} disabled={saving}>
                  {saving ? 'Deleting...' : 'Delete Category'}
                </Button>}
              </DialogFooter>
            </DialogContent>
          </Dialog>
    </>
  );
}

