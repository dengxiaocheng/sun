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

主界面仅持续显示三条核心条（焦虑雾、动能、复习进度）；
不再在画面顶部显示 `A/M/P/R/B/T/E` 字母与数值串。
剩余状态（R/B/T/E）在设置面板的“状态说明”中以中文简述呈现（无精确数值）；
A/M/P 对应的状态含义见上方说明表，便于教学型说明不与对话/选项重叠。

当前发布版本使用缓存失效参数：

- `style.css?v=sun-release-20260502-layout-top`
- `game.js?v=sun-release-20260502-layout-top`

- 本地启动（推荐）：

```bash
cd /home/openclaw/codex-projects/sun
python3 -m http.server 4173
```

然后在浏览器打开：

```text
http://127.0.0.1:4173/
```

## 本地验证（移动端 / coarse-pointer）

```bash
cd /home/openclaw/codex-projects/sun
node assets/context/mobile-coarse-pointer-smoke.mjs
```

回归点：

- 开始按钮点击后不应被任何覆盖层拦截，游戏画面应进入可交互状态。

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

快速验收（本次修复后）：

```bash
cd /home/openclaw/codex-projects/sun
node assets/context/mobile-coarse-pointer-smoke.mjs
curl -sS -o /dev/null -w "local game -> %{http_code}\n" http://127.0.0.1:4173/
curl -sS -o /dev/null -w "public game -> %{http_code}\n" https://dengxiaocheng.github.io/sun/
```

手工核验：使用手机浏览器或开发者工具移动模拟，点击“开始”后确认标题层与开始后覆盖层不再拦截点击，并完成首幕对话框至少一次点击推进。

资源说明：

- 本仓库正文游戏本体在 `game.js`/`index.html`/`style.css`。对应美术资源清单在 `assets/images/manifest.json`。
- 完整图片与素材定义在 `雾线下的译者_完整游戏文档_图片资源整合包.zip`，若本地缺少图像文件可从该压缩包解压 `assets/images/` 到仓库同名目录后启动以获得完整视觉。
- `assets` 目录下保留的是该整合包的文本化资源清单，当前仓库不要求额外构建流程。

## 控制

- 点击或轻触“开始”进入游戏。
- 对话框内点击进入下一句。
- 使用场景下方选项进行分支。
- 右上角按钮打开设置/存档。
