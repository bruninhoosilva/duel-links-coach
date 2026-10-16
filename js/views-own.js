import { esc } from './dom.js';

// Export, import and clear controls, a one-time status message, and the backup reminder.
// ctx.owned: the collection; ctx.ownMsg: result of the last import; ctx.backupNote: text from backupNudge().
export function renderOwnTools(ctx) {
  const any = Object.keys(ctx.owned ?? {}).length > 0;
  return `<div class="own-tools">
    <button type="button" class="linklike" data-own-export${any ? '' : ' disabled'}>Export my collection</button>
    <label class="linklike own-import">Import a collection<input type="file" accept="application/json,.json" data-own-import class="sr-only"></label>
    ${any ? '<button type="button" class="linklike" data-own-clear>Clear my collection</button>' : ''}
    
  </div>${ctx.ownMsg ? `<p class="own-status ${ctx.ownMsgKind === 'warn' ? 'warn' : 'ok'}" role="status">${esc(ctx.ownMsg)}</p>` : ''}${ctx.backupNote ? `<p class="small backup-note" role="note">${esc(ctx.backupNote)}</p>` : ''}`;
}
