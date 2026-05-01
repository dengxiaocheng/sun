# 雾线下的译者

一个基于提供的美术/文档资源实现的单页网页互动叙事游戏原型，使用纯 HTML/CSS/JS；支持中文剧情流程、数值演算、自动/手动存档。

## 可玩方式

- 公网游玩：`https://dengxiaocheng.github.io/sun/`（请先确认 GitHub Pages 已配置并完成发布，配置后应返回可用页面）。
- 本地启动（推荐）：

```bash
cd /home/openclaw/codex-projects/sun
python3 -m http.server 4173
```

然后在浏览器打开：

```text
http://127.0.0.1:4173/
```

## 控制

- 点击或轻触“开始”进入游戏。
- 对话框内点击进入下一句。
- 使用场景下方选项进行分支。
- 右上角按钮打开设置/存档。
