# 08｜图层与资产规范

## 角色资源必须从源头透明

旧资源的问题是：先生成带灰框/棋盘格/展示板的图，再后期抠图，导致边缘破碎、头发损失、像素噪点残留、与背景不衔接。

本支线所有角色资源必须遵循：

1. 直接在透明 RGBA 画布上绘制角色。
2. PNG 文件必须保留 alpha 通道。
3. 文件中不得出现灰色展示框、棋盘格背景、面板标题、边框、阴影底板。
4. 阴影如有需要，应作为单独 `shadow` 层，而不是烘焙在角色图里。
5. 角色图可叠在任意背景上，边缘不应出现白边、灰边或缺口。

## 背景资源

背景必须是纯场景。

不允许：

- 主角站在背景里。
- UI 文本烘焙在背景里。
- 大段说明文字写在画面上。
- 把 CG 当背景反复使用。

允许：

- 远景人群剪影。
- 环境标识，例如机场、火车站、地铁站的合理中文标牌。
- 情绪光影和天气效果。

## CG 资源

CG 是完整叙事画面，可以含人物和背景。CG 不用于自由叠加，不要求透明。

## UI/FX 资源

UI 和特效应单独叠加，不与背景混合。

示例层级：

```text
背景层 bg_hometown_road_rapeseed.png
前景环境层 optional_foreground_flowers.png
角色阴影层 char_shadow_soft.png
角色层 char_smx_hometown_soft.png
角色层 char_dxc_hometown_pointing.png
特效层 fx_hometown_warm_light.png
UI层 dialog_box / choice_buttons / meters
```
