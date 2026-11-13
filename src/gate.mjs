// usegate —— 技能/算力合规变现门闸（A组真空①组件化）
// 解决的真空白：需求端 69k★ 白嫖需求等着，中间没有任何「作者可声明条款、
// 使用者可机器校验、双方留痕可审计」的合规层。本组件做三件事：
//   1. manifest 声明（作者写条款）  2. check 判定（机器执行条款）
//   3. receipt 留痕（JSONL 哈希链，防篡改可审计）
// 零依赖。MIT。
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const LICENSE_COMMERCIAL = {
  MIT: 'allowed', 'Apache-2.0': 'allowed', 'BSD-3-Clause': 'allowed', 'CC0-1.0': 'allowed',
  'AGPL-3.0': 'sandbox-only', 'PolyForm-NC-1.0.0': 'nc', 'NOASSERTION': 'unknown',
};

const fp = s => crypto.createHash('sha256').update(String(s), 'utf8').digest('hex');

// ① 校验并加载 manifest（作者在技能包里写 skill.usegate.json）
export function loadManifest(dir) {
  const f = path.join(dir, 'skill.usegate.json');
  if (!fs.existsSync(f)) return { ok: false, reason: `缺少 manifest: ${f}` };
  let m;
  try { m = JSON.parse(fs.readFileSync(f, 'utf8')); }
  catch (e) { return { ok: false, reason: `manifest JSON 解析失败: ${e.message}` }; }
  for (const k of ['name', 'version', 'license', 'commercial']) {
    if (!m[k]) return { ok: false, reason: `manifest 缺必填字段 ${k}` };
  }
  return { ok: true, manifest: m };
}

// ② 判定：这次使用是否合规。返回决策 + 理由 + 附加条件，绝不静默放行
export function check(manifest, { commercialUse = false, declaredLicense = null } = {}) {
  if (!manifest) return { allowed: false, reason: 'manifest 缺失，默认拒绝' };
  // 许可交叉验证：manifest 声明的许可与实际 LICENSE 文件不一致 → 拒（防作者瞎标）
  if (declaredLicense && declaredLicense !== manifest.license) {
    return { allowed: false, reason: `许可不一致: manifest=${manifest.license} 实际=${declaredLicense}，默认拒绝` };
  }
  const comm = manifest.commercial;
  if (commercialUse) {
    if (comm === 'nc' || comm === 'forbidden') {
      return { allowed: false, reason: `许可为非商业(${comm})，商业使用被拒`, conditions: ['可联系作者获取商业授权'] };
    }
    if (comm === 'contact') {
      return { allowed: false, reason: '商业使用需先取得作者书面授权（contact 模式）', conditions: [`联系 ${manifest.author || '(未留联系方式)'}`] };
    }
    if (comm !== 'allowed') {
      return { allowed: false, reason: `commercial 字段=${comm} 无法判定，默认拒绝` };
    }
    return { allowed: true, reason: `商业使用已许可(${manifest.license})`, conditions: [] };
  }
  if (manifest.license === 'NOASSERTION' || comm === 'unknown') {
    return { allowed: false, reason: '许可不明(NOASSERTION)红线，任何使用都拒绝' };
  }
  return { allowed: true, reason: `个人使用允许(${manifest.license})`, conditions: [] };
}

// ③ 收据：JSONL 哈希链。每条含 prevHash，事后可验证未被篡改
export function issueReceipt(receiptsFile, usage) {
  const prevHash = lastHash(receiptsFile);
  const rec = {
    ts: new Date().toISOString(),
    skill: usage.skill, user: usage.user || 'anonymous',
    mode: usage.commercialUse ? 'commercial' : 'personal',
    decision: usage.decision,
    prevHash,
  };
  rec.hash = fp(JSON.stringify({ ...rec, hash: undefined }));
  fs.appendFileSync(receiptsFile, JSON.stringify(rec) + '\n');
  return rec;
}

export function lastHash(file) {
  if (!fs.existsSync(file)) return 'GENESIS';
  const lines = fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean);
  if (!lines.length) return 'GENESIS';
  return JSON.parse(lines[lines.length - 1]).hash;
}

// 审计：验证收据链完整性，返回被篡改的首条编号
export function verifyChain(receiptsFile) {
  if (!fs.existsSync(receiptsFile)) return { ok: true, count: 0 };
  const lines = fs.readFileSync(receiptsFile, 'utf8').trim().split('\n').filter(Boolean);
  let prev = 'GENESIS';
  for (let i = 0; i < lines.length; i++) {
    const rec = JSON.parse(lines[i]);
    const expect = fp(JSON.stringify({ ...rec, hash: undefined }));
    if (rec.prevHash !== prev) return { ok: false, count: i, tamperedAt: i, reason: `第${i}条 prevHash 断链` };
    if (rec.hash !== expect) return { ok: false, count: i, tamperedAt: i, reason: `第${i}条内容被改` };
    prev = rec.hash;
  }
  return { ok: true, count: lines.length };
}
