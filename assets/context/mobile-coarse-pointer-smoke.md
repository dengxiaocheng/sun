# Mobile / Coarse Pointer Smoke 证据

## 自动检查（脚本）

1. 启动命令

```bash
node assets/context/mobile-coarse-pointer-smoke.mjs
```

检查点：

- 开始菜单标题层存在且包含 `startBtn`。
- `startBtn` 在代码中通过 `bindStartButton` 绑定交互。
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
