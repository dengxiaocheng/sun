# 雾线下的译者

一个基于提供的美术/文档资源实现的单页网页互动叙事游戏原型，使用纯 HTML/CSS/JS；支持中文剧情流程、数值演算、自动/手动存档。

## 可玩方式

- 公网游玩（已验证）：`https://dengxiaocheng.github.io/sun/`
- 本地启动（推荐）：

```bash
cd /home/openclaw/codex-projects/sun
python3 -m http.server 4173
```

然后在浏览器打开：

```text
http://127.0.0.1:4173/
```

资源说明：

- 本仓库正文游戏本体在 `game.js`/`index.html`/`style.css`。对应美术资源清单在 `assets/images/manifest.json`。
- 完整图片与素材定义在 `雾线下的译者_完整游戏文档_图片资源整合包.zip`，若本地缺少图像文件可从该压缩包解压 `assets/images/` 到仓库同名目录后启动以获得完整视觉。
- `assets` 目录下保留的是该整合包的文本化资源清单，当前仓库不要求额外构建流程。

## 控制

- 点击或轻触“开始”进入游戏。
- 对话框内点击进入下一句。
- 使用场景下方选项进行分支。
- 右上角按钮打开设置/存档。
