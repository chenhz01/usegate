// usegate selftest —— 全部 PASS 则 exit 0
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert';
import { check, issueReceipt, verifyChain, loadManifest } from '../src/gate.mjs';

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'usegate-'));
const receipts = path.join(tmp, 'receipts.jsonl');
const results = [];
const t = (name, fn) => { try { fn(); results.push(['PASS', name]); } catch (e) { results.push(['FAIL', `${name} :: ${e.message}`]); } };

t('MIT 个人使用放行', () => {
  const r = check({ name: 'x', license: 'MIT', commercial: 'allowed' });
  assert.equal(r.allowed, true);
});
t('NC 许可商业使用拒绝且给条件', () => {
  const r = check({ name: 'x', license: 'PolyForm-NC-1.0.0', commercial: 'nc' }, { commercialUse: true });
  assert.equal(r.allowed, false);
  assert.ok(r.conditions.length >= 1);
});
t('contact 模式商业使用拒绝', () => {
  const r = check({ name: 'x', license: 'MIT', commercial: 'contact', author: 'a@b.c' }, { commercialUse: true });
  assert.equal(r.allowed, false);
  assert.ok(r.reason.includes('书面授权'));
});
t('NOASSERTION 红线：个人使用也拒', () => {
  const r = check({ name: 'x', license: 'NOASSERTION', commercial: 'unknown' });
  assert.equal(r.allowed, false);
  assert.ok(r.reason.includes('红线'));
});
t('manifest 与 LICENSE 实际不一致 → 拒', () => {
  const r = check({ name: 'x', license: 'MIT', commercial: 'allowed' }, { declaredLicense: 'AGPL-3.0' });
  assert.equal(r.allowed, false);
});
t('manifest 缺失默认拒绝', () => {
  const r = check(null);
  assert.equal(r.allowed, false);
});
t('收据链：3 条收据哈希链可验证', () => {
  for (let i = 0; i < 3; i++) issueReceipt(receipts, { skill: 'demo', user: `u${i}`, commercialUse: false, decision: 'allowed' });
  const v = verifyChain(receipts);
  assert.equal(v.ok, true);
  assert.equal(v.count, 3);
});
t('收据链：篡改第 2 条被检出', () => {
  const lines = fs.readFileSync(receipts, 'utf8').trim().split('\n');
  const rec = JSON.parse(lines[1]); rec.user = 'attacker';
  lines[1] = JSON.stringify(rec);
  fs.writeFileSync(receipts, lines.join('\n') + '\n');
  const v = verifyChain(receipts);
  assert.equal(v.ok, false);
  assert.equal(v.tamperedAt, 1);
});
t('loadManifest：缺文件给明确 reason', () => {
  const r = loadManifest(path.join(tmp, 'not-exist'));
  assert.equal(r.ok, false);
  assert.ok(r.reason.includes('缺少 manifest'));
});

let fail = 0;
for (const [s, n] of results) { console.log(`${s}  ${n}`); if (s === 'FAIL') fail++; }
console.log(`usegate selftest: ${results.length - fail}/${results.length} PASS`);
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
