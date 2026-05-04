# 雾线下的译者｜透明人物与中国考研修正版资源包

这个包专门修正两类问题：

1. 人物不透明、带灰框，无法与背景衔接。
2. 部分考试背景误成高考/国外语境，不符合“大三考研，中国大陆”的设定。

## 包内结构
- `assets/characters_transparent/`：透明 PNG 人物资源。
- `assets/backgrounds_china_kaoyan/`：中国大学与考研语境背景，180×320。
- `assets/cg_china_kaoyan/`：新增剧情 CG，180×320。
- `assets/ui/`、`assets/fx/`、`assets/palettes/`：沿用旧版 UI/特效/色板。
- `assets/_preview/`：透明人物叠加背景的预览图。
- `source_atlases_for_reference_do_not_use_directly/`：仅作为来源参考，不建议直接进游戏。
- `docs/`：问题说明、图层规范、替换清单。
- `manifest.json`：资源索引。

## 注意
透明人物是基于旧版角色图做抠像修正，适合进入原型开发。若后续进入正式美术生产，建议再由美术按同一角色设定重绘一版真正的分层 sprite。
