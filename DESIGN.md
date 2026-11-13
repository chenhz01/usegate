# usegate · REV70 双七门禁逐维表（v1.1）

> 标准见组根 [REV70-双七门禁标准.md](../REV70-双七门禁标准.md)。**逐维列证据，禁综合分**（F13 数闸）。

## 工程尺 D1–D7

| 维 | 结果 | 证据 |
|---|---|---|
| D1 约束驱动 | ✅ PASS | NOASSERTION 红线代码化（`gate.mjs` OK_LICENSES 白名单）、fail-closed（manifest 缺失默认拒）、selftest 用例「NOASSERTION 红线」「manifest 缺失默认拒绝」 |
| D2 失效边界 | ✅ PASS | 每个拒绝分支带结构化 reason；selftest 9/9 exit=0 |
| D3 数据流可见 | ✅ PASS | check() 返回 reason+conditions；收据带 ts/hash/prevHash 链，verifyChain 定位篡改条目 |
| D4 零依赖 | ✅ PASS | 仅 node:crypto/fs/path；`node test/selftest.mjs` 直跑，无安装步骤 |
| D5 可测试性 | ✅ PASS | selftest 覆盖放行/拒绝(NC/contact/NOASSERTION/许可不一致)/篡改检出/缺文件，逐条 PASS/FAIL |
| D6 错误不静默 | ✅ PASS | 拒绝必有 reason 字符串；无空 catch；断链定位到第 N 条 |
| D7 演进留痕 | ✅ PASS | README/DESIGN/MIT/未做清单齐；git 提交粒度留痕（v1.0→v1.1 换门禁制） |

## 发表族 F1–F7

| 族 | 结果 | 证据 |
|---|---|---|
| F1 品类命名权 | ✅ PASS | 品类词「skill/算力合规变现门闸」精确串占位；不打大数字标语 |
| F2 对标实证 | ⚠️ N-A | 无外部竞品数字引用；README 只描述需求现象（69k★ 为公开榜面事实，标注来源与日期） |
| F3 机制差异×测试背书 | ✅ PASS | 3 机制（声明/判定/哈希链收据）各配 selftest 用例，9/9 |
| F4 数字口径诚实 | ✅ PASS | 未做任何性能声明；README badge 仅标 selftest 实跑结果 |
| F5 clone 即跑 | ✅ PASS | selftest 零依赖直跑实测通过（9/9 exit=0），非仅本机特例 |
| F6 Agent 可消费 | ✅ PASS | AGENTS.md 第二入口 + 本表即证据目录 + issue 钩子 |
| F7 发现性杠杆 | ✅ PASS | README 首屏可质疑钩子（跑出不同结果开 issue 对账）；无自问自答 |

## 推前清单

selftest 全绿 ✅ / 目标仓库待定（等善伦给全名）/ ahead=0 behind=0 推前核 / push 后 gh api 回读（未执行）
