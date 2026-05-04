# 雾线下的译者

一个基于提供的美术/文档资源实现的单页网页互动叙事游戏原型，使用纯 HTML/CSS/JS；支持中文剧情流程、数值演算、自动/手动存档。

## 可玩方式

- 公网游玩（已验证）：`https://dengxiaocheng.github.io/sun/`

### 状态含义（中文）

| 缩写 | 中文标签 | 说明 |
| --- | --- | --- |
| A | 焦虑雾 | 压力与雾层强度。高时画面会更拥挤、抖动更明显，需先用休息/稳定动作降下来。 |
| M | 动能 | 能否把“下一步”继续做下去的能力。 |
| P | 复习进度 | 叙事中的学习连续性与准备程度。 |
| R | 恢复值 | 身体和作息恢复水平，影响焦虑增长与稳定速度。 |
| B | 边界感 | 能否设置边界、说清需求，关系更不容易失衡。 |
| T | 亲密温度 | 关系沟通的可触达度与实时理解度。 |
| E | 艺术回声 | 理想与现实关系是否能被同步理解。 |

主界面统一展示 7 条中文进度条（焦虑雾、动能、复习进度、恢复、边界感、关系温度、理解/共情）；
界面不显示 `A/M/P/R/B/T/E` 字母与数字串。

### 支线/分支入口速查

- 唐楚学姐线：在 `C1N01` 选择“岗位会变，能力可以换壳”或在 `C1N04` 选择“约她聊二十分钟”后，后续可触发《旧词典新页》相关结局加权。
- 咨询线：在 `C4N04` 选择“预约咨询”后，进入 `C4N05`，并在后续降低过载风险，影响《低频祷告》/《雾灯》判定。
- 固定陪伴线：`C3N05` 判定边界感达到阈值后标记，`C5N05` 若 `E>=55 && B>=40` 会追加提示；两者可触发《低频祷告》更高优先级。
- 断电自救线：在 `C6N04` 选“提出暂时拉开距离”或 `C7N02` 选“直接拒绝”后，会偏向《断电自救》结局。
- 家乡旅途支线（新增）：从标题页点击“回家支线：先去见他”即可直接进入 `H00`-`H08`；完成后按旅途 `trip` 状态结算，影响支线结局《长路抵达》《热水和出站口》《到达，但不献祭》《过载抵达》。
- 保底路径：在 `C7N05` 选择“回家支线：先去见他”仍可进入 `H00`，主线不受影响。

当前发布版本使用缓存失效参数：

- `style.css?v=sun-release-20260504-hometown-fixpatch-asset-map-fallback`
- `game.js?v=sun-release-20260504-hometown-fixpatch-asset-map-fallback`

- 说明：`game.js` 已新增资源路径重映射层（`ASSET_REMAP`），在不改动旧资源路径标识符的情况下，将角色/背景/CG 映射至 `assets/images/fix_patch/*` 中的最新整改包文件；标题页背景在 `style.css` 直接使用 `bg_china_university_library_winter.png`。

七个状态统一展示为中文进度条：焦虑雾、动能、复习进度、恢复、边界感、关系温度、理解/共情。
7 条进度条为同一套状态区，显示标签与实时百分比；选择后受影响条目会立即高亮并显示 +N/-N 提示。
家乡旅途线 `H00` 新增「打包」触控交互（最多 3 件道具），会实时映射到 `trip` 临时状态反馈，增强移动端主线体验。

## 机制核验（审计用）

- 主互动输入（Primary Input）：`H00` 场景出现打包面板后，玩家通过点击 `tripPackList` 中的道具按钮（可多选）并点击 `tripPackConfirm` 确认，形成“出发前打包”交互。
- 场景对象（Scene Object）：目标场景为 `scenes.H00`，其 `tripPack` 字段挂载 `TRIP_PACKS.H00`，运行时经 `renderScene → renderChoiceArea` 调用 `renderTripPackPanel`。
- 状态变化与反馈通道（State Delta / Feedback）：`applyTripPackSelection` 汇总 `tripDelta`（临时 `trip`）与 `main delta`（主状态 `delta`），分别通过 `applyTripDelta` 与 `normalizeDelta` 写入，并通过打包摘要提示、`tripStatusPanel` 与主条 `+N/-N` 闪烁即时展示；选择数与约束通过 `tripPackHint` 提示。
- 非选择题证据：该环节不属于纯二选一/三选一文本选项，而是点击式多选操作（最多 3 件）与资源组合决策，最终形成可叠加状态变化后再推进到 `H01`。

- 本地启动（推荐）：

```bash
cd /home/openclaw/codex-projects/sun
python3 -m http.server 4173
```

然后在浏览器打开：

```text
http://127.0.0.1:4173/
```

### 文档资源

- 支线文档（与本次 release 资产一致）：
  - `docs/sun_hometown_route/README.md`
  - `docs/sun_hometown_route/03_node_flow.md`
  - `docs/sun_hometown_route/06_endings_and_mainline_integration.md`

## 本地验证（移动端 / coarse-pointer）

```bash
cd /home/openclaw/codex-projects/sun
node assets/context/mobile-coarse-pointer-smoke.mjs
```

回归点：

- 开始按钮点击后不应被任何覆盖层拦截，游戏画面应进入可交互状态。
- 标题页“回家支线：先去见他”文案可见，点击后应直接进入 `H00` 的 `支线 · 行前一夜：打包` 并出现打包面板（含“确认打包”）。

## 发布与回归检查

公网入口（可用）：

```text
https://dengxiaocheng.github.io/sun/
```

本地 200 检查（可用于快速回归）：

```bash
cd /home/openclaw/codex-projects/sun && python3 -m http.server 4173 >/tmp/sun-http.log 2>&1 & echo $!
curl -sS -o /dev/null -w "local game http://127.0.0.1:4173/ -> %{http_code}\n" http://127.0.0.1:4173/
kill $!
curl -sS -o /dev/null -w "public url -> %{http_code}\n" https://dengxiaocheng.github.io/sun/
```

## release 资产核验（任务要求）

- release 地址：`https://github.com/dengxiaocheng/sun/releases/tag/sun`
- 目标资产名：`sun._._._.zip`
- 目标大小：`51353472`
- 目标 digest：`sha256:f0be642657321886653621397951c841277b8b254b8124aa12600f7eeb4a43c8`
- 目标下载链接：`https://github.com/dengxiaocheng/sun/releases/download/sun/sun._._._.zip`

强制读取/校验命令（无代理）：

```bash
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy
cd /home/openclaw/codex-projects/sun
node assets/context/verify-github-release-asset.mjs
```

如果你已有同 digest 的缓存文件，可设置：

```bash
SUN_RELEASE_ASSET_FILE=/tmp/sun-release-direct-NeLvUI/sun._._._.zip node assets/context/verify-github-release-asset.mjs
```

快速验收（本次修复后）：

```bash
cd /home/openclaw/codex-projects/sun
node assets/context/mobile-coarse-pointer-smoke.mjs
curl -sS -o /dev/null -w "local game -> %{http_code}\n" http://127.0.0.1:4173/
curl -sS -o /dev/null -w "public game -> %{http_code}\n" https://dengxiaocheng.github.io/sun/
```

手工核验：使用手机浏览器或开发者工具移动模拟，点击“开始”后确认标题层与开始后覆盖层不再拦截点击，并完成首幕对话框至少一次点击推进。

### 直接进入家乡支线（精确步骤）

1. 打开 `https://dengxiaocheng.github.io/sun/`。
2. 点击标题页按钮 **回家支线：先去见他**。
3. 确认进入 `H00`-`支线 · 行前一夜：打包`，`tripPackPanel` 显示 6 个打包选项并可点“确认打包”。
4. 或在本地服务器 `http://127.0.0.1:4173/` 重复以上步骤。

资源说明：

- 本仓库正文游戏本体在 `game.js`/`index.html`/`style.css`。对应美术资源清单在 `assets/images/manifest.json`。
- 完整图片与素材定义在 `雾线下的译者_完整游戏文档_图片资源整合包.zip`，若本地缺少图像文件可从该压缩包解压 `assets/images/` 到仓库同名目录后启动以获得完整视觉。
- `assets` 目录下保留的是该整合包的文本化资源清单，当前仓库不要求额外构建流程。
- `docs/sun_hometown_route/` 为本次实现依据 release 资产文档同步落库的最小支线资料集。

## 控制

- 点击或轻触“开始”进入游戏。
- 对话框内点击进入下一句。
- 使用场景下方选项进行分支。
- 右上角按钮打开设置/存档。
