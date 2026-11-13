# usegate — 技能/算力合规变现门闸

[![selftest](https://img.shields.io/badge/selftest-9%2F9%20PASS-brightgreen)](./test/selftest.mjs) [![license](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)

**解决什么问题**：AI 技能/Agent 工具的需求端已有 69k★ 级别的规模（白嫖与降本动机），但中间层空缺——作者没有机器可读的条款声明格式，使用者没有一键校验工具，双方没有防篡改的使用留痕。usegate 是这层缺失的中间件。

## 三件套

```
作者侧  skill.usegate.json  → 声明许可/商业条款/联系方式
机器侧  check(manifest, {commercialUse, declaredLicense}) → 决策+理由+条件
审计侧  issueReceipt / verifyChain → JSONL 哈希链收据，篡改必被检出
```

## 快速开始

```js
import { check } from './src/gate.mjs';
check({ name: 'my-skill', license: 'MIT', commercial: 'allowed' }, { commercialUse: true });
// → { allowed: true, reason: '商业使用已许可(MIT)', conditions: [] }

check({ name: 'their-skill', license: 'PolyForm-NC-1.0.0', commercial: 'nc' }, { commercialUse: true });
// → { allowed: false, reason: '许可为非商业(nc)，商业使用被拒', conditions: [...] }
```

运行自检：`node test/selftest.mjs`（零依赖，9/9 PASS，exit 0）

## 红线（内置，不可配置绕过）

- `NOASSERTION` / 许可不明 → **任何使用都拒绝**
- manifest 声明与实际 LICENSE 不一致 → 拒绝（防作者瞎标）
- manifest 缺失 → 默认拒绝（fail-closed）

## 复现挑战（欢迎来吵）

`node test/selftest.mjs` 一条命令复现 9/9。**跑出不同结果、或发现判定逻辑的边界漏洞（contact 模式？许可交叉验证的误伤？），直接开 issue，我们逐条对账**——真讨论比 star 有用。

## 设计

按 REV70 双七发表门禁逐维表自查（D1–D7 工程尺 × F1–F7 发表族，**无综合分**）见 [DESIGN.md](./DESIGN.md)；Agent 入口见 [AGENTS.md](./AGENTS.md)。

## 未做清单（边界）

- 不做支付/分成结算（那是支付平台的事，usegate 只管「允不允许」）
- 不做许可文本的法律解析（正则 + 白名单，人工确认兜底）
- 不联网验证许可（离线优先，交叉验证交给使用者）
