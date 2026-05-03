# 07｜图片资源清单

## 资源总原则

- 背景：纯场景，不带主角、不带 UI、不带标题文字。
- 角色：必须从源头在透明 RGBA 图层上绘制，不抠图，不带灰框，不带棋盘格。
- CG：可以是完整画面，不要求透明。
- UI/FX：独立叠加层。

## A. 旅途背景资源

统一规格建议：`180×320 PNG` 像素风基础图，游戏内放大到 `360×640`。

| 资源名 | 规格 | 内容说明 |
|---|---|---|
| `bg_school_gate_taxi_morning.png` | 180×320 PNG | 学校门口打车场景。清晨/上午，校门、网约车、行李箱。 |
| `bg_taxi_interior_city.png` | 180×320 PNG | 出发去地铁站的出租车内景。前挡风玻璃、导航屏、城市路面。 |
| `bg_metro_station_entrance_city.png` | 180×320 PNG | 城市地铁入口。人流、扶梯、路线牌。 |
| `bg_metro_carriage_to_airport.png` | 180×320 PNG | 去机场的地铁车厢。行李、人群、冷白灯、机场线提示。 |
| `bg_metro_window_tunnel.png` | 180×320 PNG | 地铁车窗与隧道倒影。用于焦虑翻译。 |
| `bg_airport_departure_hall_china.png` | 180×320 PNG | 中国机场出发大厅。值机柜台、安检入口、航班屏。 |
| `bg_airport_security_queue.png` | 180×320 PNG | 安检排队场景。行李筐、队伍、冷光。 |
| `bg_airport_gate_waiting.png` | 180×320 PNG | 登机口候机区。座椅、充电口、登机牌、玻璃窗。 |
| `bg_airplane_cabin_day.png` | 180×320 PNG | 飞机客舱内。靠窗座、头顶行李架、柔和光线。 |
| `bg_airplane_window_clouds.png` | 180×320 PNG | 飞机窗外云层。用于离线内心段落。 |
| `bg_destination_airport_arrival.png` | 180×320 PNG | 邓孝程所在省份机场到达大厅。陌生城市感。 |
| `bg_destination_metro_platform.png` | 180×320 PNG | 目的地机场地铁站台。疲惫、手机低电量。 |
| `bg_destination_metro_carriage.png` | 180×320 PNG | 去火车站的一小时地铁车厢。 |
| `bg_railway_station_hall_evening.png` | 180×320 PNG | 火车站候车大厅。电子屏、检票口、人群、行李。 |
| `bg_train_platform_evening.png` | 180×320 PNG | 火车站站台。傍晚或夜色，车灯、站牌、风。 |
| `bg_train_carriage_window.png` | 180×320 PNG | 火车车厢靠窗座。窗外从城市变成乡野。 |
| `bg_train_window_fields.png` | 180×320 PNG | 火车窗外田野、油菜花、电线、低矮房子。 |
| `bg_small_station_near_home.png` | 180×320 PNG | 邓孝程家附近的小站。站台、出站口、乡镇气息。 |
| `bg_hometown_road_rapeseed.png` | 180×320 PNG | 家乡乡路。油菜花田、水泥路、电线杆、远处房屋。 |
| `bg_hometown_pond_fields.png` | 180×320 PNG | 家乡池塘与油菜花田。 |
| `bg_hometown_lantern_tree_path.png` | 180×320 PNG | 挂红灯笼的树、乡村步道、黄昏暖光。 |
| `bg_hometown_flower_arch.png` | 180×320 PNG | 花丛、老砖墙、拱门。第二天轻松场景。 |
| `bg_dxc_family_house_exterior.png` | 180×320 PNG | 邓孝程家外景。普通中国乡镇/村镇住宅。 |
| `bg_hometown_evening_walk.png` | 180×320 PNG | 傍晚乡路散步。油菜花、远山、电线、天光。 |

## B. 角色透明资源

统一规格建议：单帧 `96×160 PNG`，透明 RGBA；四帧表情表 `384×160 PNG`，透明 RGBA。

| 资源名 | 规格 | 内容说明 |
|---|---|---|
| `char_smx_travel_idle.png` | 96×160 PNG 透明底 | 孙铭欣旅途站立。黑发、圆框眼镜、浅粉外套、背包。 |
| `char_smx_travel_bag.png` | 96×160 PNG 透明底 | 背包/拿行李状态，肩膀微塌。 |
| `char_smx_travel_phone.png` | 96×160 PNG 透明底 | 看手机导航/消息状态。 |
| `char_smx_travel_tired.png` | 96×160 PNG 透明底 | 疲惫状态。 |
| `char_smx_travel_relief.png` | 96×160 PNG 透明底 | 抵达后松一口气。 |
| `char_smx_hometown_soft.png` | 96×160 PNG 透明底 | 第二天家乡散步，表情柔和。 |
| `char_smx_flower_hair.png` | 96×160 PNG 透明底 | 戴花/整理头发状态。 |
| `char_smx_hometown_looking_far.png` | 96×160 PNG 透明底 | 看向远处田野。 |
| `char_smx_travel_sheet.png` | 384×160 PNG 透明底 | 四表情：平静、焦虑、疲惫、放松。 |
| `char_smx_hometown_sheet.png` | 384×160 PNG 透明底 | 四表情：好奇、轻松、害羞、释然。 |
| `char_dxc_hometown_waiting.png` | 96×160 PNG 透明底 | 邓孝程在小站等她。24岁青年状态。 |
| `char_dxc_hometown_with_water.png` | 96×160 PNG 透明底 | 手里拿水/小面包，表现具体照顾。 |
| `char_dxc_hometown_apology.png` | 96×160 PNG 透明底 | 愧疚、认真听她说话。 |
| `char_dxc_hometown_soft.png` | 96×160 PNG 透明底 | 表情柔和。 |
| `char_dxc_hometown_pointing.png` | 96×160 PNG 透明底 | 介绍家乡路、田、池塘。 |
| `char_dxc_hometown_sheet.png` | 384×160 PNG 透明底 | 四表情：等待、关心、愧疚、轻松。 |
| `char_station_crowd_sheet.png` | 384×160 PNG 透明底 | 火车站/机场人群剪影。 |

## C. CG 资源

| 资源名 | 规格 | 内容说明 |
|---|---|---|
| `cg_route_map_long_trip.png` | 180×320 PNG | 手机长途路线图：学校、地铁、机场、飞机、火车、小站。 |
| `cg_packing_before_trip.png` | 180×320 PNG | 行前打包：充电宝、单词册、保温杯、车票。 |
| `cg_taxi_departure_hand.png` | 180×320 PNG | 车窗边的手、手机导航、学校渐远。 |
| `cg_airport_waiting_message.png` | 180×320 PNG | 候机椅上看邓孝程消息。 |
| `cg_boarding_pass_and_exam_notes.png` | 180×320 PNG | 登机牌、考研小册、路线纸、充电线。 |
| `cg_airplane_window_inner_voice.png` | 180×320 PNG | 飞机窗外云层，叠加没发出去的文字。 |
| `cg_destination_airport_lost.png` | 180×320 PNG | 目的机场到达口，人流中找地铁方向。 |
| `cg_train_window_fields.png` | 180×320 PNG | 火车窗外油菜花田、电线、池塘。 |
| `cg_small_station_reunion.png` | 180×320 PNG | 小站出站口，邓孝程等她，手里拿水。 |
| `cg_hometown_first_meal.png` | 180×320 PNG | 抵达后简单吃饭：热汤、纸巾、安静休息。 |
| `cg_hometown_road_talk.png` | 180×320 PNG | 第二天乡路散步，两人认真说话。 |
| `cg_flower_hair_soft_moment.png` | 180×320 PNG | 花丛边，孙铭欣把花别在头发旁。 |
| `cg_rapeseed_field_realization.png` | 180×320 PNG | 油菜花田边，孙铭欣独自看远方。 |
| `cg_hometown_evening_arrival.png` | 180×320 PNG | 傍晚乡路二人背影，电线和远山。 |

## D. UI 与特效资源

| 资源名 | 规格 | 内容说明 |
|---|---|---|
| `ui_trip_progress_bar.png` | 160×16 PNG | 长途进度条：打车、地铁、机场、飞机、地铁、火车、小站。 |
| `ui_trip_segment_card_9slice.png` | 32×32 PNG 九宫格 | 旅途段落卡片底图。 |
| `ui_icon_taxi.png` | 16×16 PNG | 打车图标。 |
| `ui_icon_metro.png` | 16×16 PNG | 地铁图标。 |
| `ui_icon_airport.png` | 16×16 PNG | 机场图标。 |
| `ui_icon_plane.png` | 16×16 PNG | 飞机图标。 |
| `ui_icon_train.png` | 16×16 PNG | 火车图标。 |
| `ui_icon_small_station.png` | 16×16 PNG | 小站/抵达图标。 |
| `ui_meter_time_buffer.png` | 96×12 PNG | 旅程余裕状态条。 |
| `ui_meter_stamina.png` | 96×12 PNG | 体力状态条。 |
| `ui_meter_battery.png` | 96×12 PNG | 手机电量状态条。 |
| `ui_meter_connection.png` | 96×12 PNG | 连接感状态条。 |
| `ui_item_powerbank.png` | 32×32 PNG | 充电宝。 |
| `ui_item_thermos.png` | 32×32 PNG | 保温杯。 |
| `ui_item_earphones.png` | 32×32 PNG | 耳机。 |
| `ui_item_exam_notes.png` | 32×32 PNG | 考研单词册。 |
| `ui_item_route_paper.png` | 32×32 PNG | 纸质路线单。 |
| `ui_item_snack.png` | 32×32 PNG | 小零食。 |
| `ui_item_gift.png` | 32×32 PNG | 给邓孝程家的小礼物。 |
| `fx_train_window_reflection_sheet.png` | 720×320 PNG，4帧 | 火车窗反光动画。 |
| `fx_airport_light_flicker_sheet.png` | 720×320 PNG，4帧 | 机场冷白灯闪烁。 |
| `fx_plane_cloud_scroll_sheet.png` | 720×320 PNG，4帧 | 飞机窗外云层移动。 |
| `fx_metro_motion_blur_sheet.png` | 720×320 PNG，4帧 | 地铁移动模糊。 |
| `fx_fatigue_vignette.png` | 180×320 PNG | 疲惫暗角。 |
| `fx_hometown_warm_light.png` | 180×320 PNG | 家乡暖光叠层。 |
| `fx_rapeseed_petal_sheet.png` | 720×320 PNG，4帧 | 花瓣/油菜花轻微飘动。 |
