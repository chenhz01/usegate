# usegate · Agent 第二入口

- **这是什么**：技能/算力合规变现门闸。作者用 `skill.usegate.json` 声明条款，使用者用 `check()` 机器校验，双方收据走 JSONL 哈希链防篡改。
- **入口**：人类读 [README.md](./README.md)；机器先跑 `node test/selftest.mjs`（9/9 PASS exit=0）再读 `src/gate.mjs`。
- **证据目录**：逐维门禁表 [DESIGN.md](./DESIGN.md)（REV70 双七制，无综合分）。
- **改动约定**：改 `gate.mjs` 必须同步补 selftest 用例；许可白名单增删必须留 git 提交说明理由。
- **讨论入口**：欢迎质疑判定逻辑的边界（如 contact 模式、许可交叉验证）——直接开 issue，附复现输入，逐条对账。请勿刷 issue。
