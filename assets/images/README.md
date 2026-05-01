# 雾线下的译者｜切割版图片资源包

本包已从生成的像素风图集切割、缩放并按前一版规格整理为独立资源文件。

目录：
- backgrounds/：14 张背景，均为 180×320 PNG。
- characters/：11 张角色四帧表，均为 384×160 PNG；另有 char_mother_avatar.png 为 64×64 PNG。
- cg/：10 张剧情/结局 CG，均为 180×320 PNG。
- ui/：对话框、按钮、状态条、图标、手机界面、存档槽等 UI PNG。
- fx/：雾、CRT 噪声、雨、火花、文字抖动特效 PNG。
- palettes/：palette_mist_32.gpl、palette_mist_32.png、palette_anxiety_states.png。
- _source_atlases/：保留原始生成图集，方便你二次精修或重新裁切。

处理说明：
- 所有背景和 CG 已按手机竖屏 9:16 中心裁切并缩放为 180×320。
- 角色表已按 4 帧重组为 384×160，每帧 96×160。
- 由于原始生成图为深色图集而非透明分层文件，角色资源保留了深色像素底，未强行抠透明，以免误删黑发、格纹外套和深色轮廓。
- 精确规格、来源和备注见 manifest.json。
