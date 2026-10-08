import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileIntentStore } from '../dist/file-intent-store.js';

test('file journal persists atomic private state and locks the same intent across instances', async () => {
  const root=await mkdtemp(path.join(tmpdir(),'agentswap-intents-'));
  try {
    const first=fileIntentStore(root), second=fileIntentStore(root);
    assert.equal(await first.get('order-1'),undefined);
    const release=await first.acquire('order-1');
    await assert.rejects(()=>second.acquire('order-1'),/locked/);
    const state={receipt:{intentId:'order-1',funding:{signature:'original-signature'}},paymentHeaders:{'PAYMENT-SIGNATURE':'public-fixture-authorization'}};
    await first.set('order-1',state);
    assert.deepEqual(await second.get('order-1'),state);
    assert.equal((await stat(path.join(root,'order-1.json'))).mode & 0o777,0o600);
    await release();
    const releaseAgain=await second.acquire('order-1');
    await releaseAgain();
    await assert.rejects(()=>first.get('../escape'),/Invalid paymentIntentId/);
  } finally { await rm(root,{recursive:true,force:true}); }
});
