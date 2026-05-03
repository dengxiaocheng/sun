# 09｜开发接入说明（无代码版）

## 建议数据结构

新增一组剧情节点，命名空间为：

```text
hometown_trip.T00
hometown_trip.T01
...
hometown_trip.T08
```

每个节点建议包含：

- `id`
- `title`
- `background`
- `characters`
- `dialogue`
- `choices`
- `effects`
- `temporaryStateEffects`
- `mainStateEffects`
- `next`

## 临时状态存储

进入支线时创建：

```text
trip.U 旅程余裕
trip.F 体力
trip.C 手机电量
trip.L 行李负担
trip.K 连接感
```

离开支线时根据结算规则折算回主状态，然后清除临时状态。

## UI 插入点

现有 sun 主界面有 7 条中文进度条。本支线建议在旅途章节中额外显示一个小型“旅途面板”：

```text
当前段：机场候机
旅程：学校 → 地铁 → 机场 → 飞机 → 地铁 → 火车 → 小站
旅程余裕：■■■■□□
体力：■■■□□□
电量：■■■■□□
连接感：■■□□□
```

## 不写代码时的落地步骤

1. 先把本目录作为文档支线提交。
2. 再将 `03_node_flow.md` 拆成剧情数据表。
3. 将 `07_image_resource_manifest.md` 拆成资源制作任务。
4. 将 `04_state_and_balance.md` 拆成数值配置。
5. 完成资源后，再接入 Canvas 渲染和选项系统。

## 最小可实现版本

最小版本只需要：

- 9 个剧情节点。
- 5 个临时状态。
- 1 个旅途进度 UI。
- 3 张背景：机场、飞机、火车窗外。
- 2 个角色立绘：孙铭欣旅途、邓孝程接站。
- 1 张 CG：小站见面。
