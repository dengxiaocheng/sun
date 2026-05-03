# Mobile / Coarse Pointer Smoke 证据

## 自动检查（脚本）

1. 启动命令

```bash
node assets/context/mobile-coarse-pointer-smoke.mjs
```

检查点：

- 开始菜单标题层存在且包含 `startBtn`。
- `startBtn` 在代码中通过 `bindStartButton` 绑定交互。
- 标题页存在 `hometownQuickStartBtn`，并在 `bindStartButton` 中绑定到直接进入 `H00` 的启动函数。
- 脚本会校验快速支线入口文案/ID/绑定与 `resetGame('H00', { hometownTrip: true })` 路径存在。
- 启动路径会调用 `enterPlayMode`，并将标题层与竖屏提示层设置为不可点击。
- 对话框有点击推进事件，支持第一步推进文本。
- 进入游戏后 HUD 显示、提示按钮尺寸符合 44px 触控门槛。

输出日志示例用于 audit 归档。

## 人工复测（移动设备 / 模拟器）

1. 打开 `https://dengxiaocheng.github.io/sun/`（移动端或开启开发者工具的移动模拟）。
2. 点击开始。
3. 校验：标题界面完全不可见，不能继续拦截点击；对话框和选项可点。
4. 连续点击对话框，确认首幕至少可推进一段台词。

```bash
cd /home/openclaw/codex-projects/sun
python3 -m http.server 4173
# 打开 http://127.0.0.1:4173/ 并按上方步骤执行
```

### 额外核验：GitHub release 资产

1. 清空代理变量并执行：

```bash
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy
cd /home/openclaw/codex-projects/sun
node assets/context/verify-github-release-asset.mjs
```

2. 输出应包含：

- release API 可访问与 tag=sun。
- asset 名称/大小/digest 与任务要求一致。
- 资产被下载到临时目录并可解压读取 `02_images/manifest.json` 与 `01_docs/*`。
- 当前本地实现与支线清单比对无缺口（应显示 `trip branch gap list: none`）。
