import { ipcMain } from 'electron';
import cashSessionService from '../services/cashSessionService.js';
import { extractToken, requirePermission, validateSession } from '../lib/sessionAuth.js';
import { writeAuditLog } from '../lib/auditLog.js';

export function registerCashSessionHandlers() {
  ipcMain.handle('cashSession:getOpen', async (event, payload = {}) => {
    try {
      const session = validateSession(extractToken(payload));
      if (!session.success) return session;
      return { success: true, data: cashSessionService.getOpenSession() };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('cashSession:open', async (event, payload = {}) => {
    try {
      const session = validateSession(extractToken(payload));
      if (!session.success) return session;
      const permCheck = requirePermission(session, 'dayClose');
      if (!permCheck.success) return permCheck;

      const data = cashSessionService.openDay({
        userId: session.user.id,
        openingFloat: payload.openingFloat,
        notes: payload.notes,
      });
      writeAuditLog(`cash_open:${data.id}`, session.user.id);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('cashSession:xReport', async (event, payload = {}) => {
    try {
      const session = validateSession(extractToken(payload));
      if (!session.success) return session;
      const permCheck = requirePermission(session, 'dayClose');
      if (!permCheck.success) return permCheck;
      return { success: true, data: cashSessionService.getXReport(payload.sessionId) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('cashSession:close', async (event, payload = {}) => {
    try {
      const session = validateSession(extractToken(payload));
      if (!session.success) return session;
      const permCheck = requirePermission(session, 'dayClose');
      if (!permCheck.success) return permCheck;

      const data = cashSessionService.closeDay({
        userId: session.user.id,
        countedCash: payload.countedCash,
        notes: payload.notes,
      });
      writeAuditLog(`cash_close:${data.session.id}`, session.user.id);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

}
