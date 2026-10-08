import { mkdir, open, readFile, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { PaymentIntentStore } from './intents.js';

// Private, durable single-host journal. Never commit these signed authorizations.
export function fileIntentStore(directory = '.agentswap-payment-intents'): PaymentIntentStore {
  const root = path.resolve(directory);
  function file(id: string) {
    if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id)) throw new Error('Invalid paymentIntentId');
    return path.join(root, id + '.json');
  }
  return {
    async acquire(id) {
      await mkdir(root, { recursive: true, mode: 0o700 });
      const lockPath = file(id) + '.lock';
      let lock;
      try { lock = await open(lockPath, 'wx', 0o600); }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'EEXIST') throw new Error(`Intent ${id} is locked. Confirm no process is running and reconcile its receipt before removing ${lockPath}.`);
        throw error;
      }
      await lock.close();
      return async () => { await unlink(lockPath); };
    },
    async get(id) {
      try { return JSON.parse(await readFile(file(id), 'utf8')); }
      catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined; throw error; }
    },
    async set(id, state) {
      await mkdir(root, { recursive: true, mode: 0o700 });
      const target = file(id);
      const temporary = target + '.' + randomUUID() + '.tmp';
      const handle = await open(temporary, 'wx', 0o600);
      try { await handle.writeFile(JSON.stringify(state)); await handle.sync(); }
      finally { await handle.close(); }
      await rename(temporary, target);
      // Flush directory metadata before the SDK is allowed to broadcast.
      const directoryHandle = await open(root, 'r');
      try { await directoryHandle.sync(); } finally { await directoryHandle.close(); }
    },
  };
}
