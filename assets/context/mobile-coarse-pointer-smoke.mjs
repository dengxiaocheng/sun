#!/usr/bin/env node
import fs from 'node:fs';

const files = {
  html: fs.readFileSync('/home/openclaw/codex-projects/sun/index.html', 'utf8'),
  js: fs.readFileSync('/home/openclaw/codex-projects/sun/game.js', 'utf8'),
  css: fs.readFileSync('/home/openclaw/codex-projects/sun/style.css', 'utf8'),
};

const checks = [
  { name: 'CSS/JS 资源带版本 query', pass: /style\.css\?v=dec7e0b1/.test(files.html) && /game\.js\?v=dec7e0b1/.test(files.html) },
  { name: 'title screen 有开始按钮', pass: /id="titleScreen"[\s\S]*id="startBtn"/.test(files.html) },
  { name: '开始按钮绑定点击与触控事件', pass: /bindStartButton\(startBtn,[\s\S]*\)\s*;/.test(files.js) && /touchend/.test(files.js) },
  { name: 'title/hud/systemPanel/storage/portraitLock 关键层有高优先级 hidden CSS 覆盖', pass: /#titleScreen\.hidden,\s*#hud\.hidden,\s*#systemPanel\.hidden,\s*#storagePanel\.hidden,\s*#portraitLock\.hidden\s*\{[\s\S]*?display:\s*none\s*!important\s*;[\s\S]*?\}/.test(files.css) },
  { name: '进入游戏会隐藏并禁用标题层点击', pass: /function enterPlayMode\([\s\S]*?titleScreen\.classList\.add\('hidden'\)[\s\S]*?titleScreen\.style\.pointerEvents\s*=\s*'none'/m.test(files.js) },
  { name: '进入游戏会移除竖屏提示层', pass: /function enterPlayMode\([\s\S]*?hidePortraitLock\(\)/m.test(files.js) },
  { name: '游戏启动后显示 HUD', pass: /hud\.classList\.remove\('hidden'\)/.test(files.js) },
  { name: '点击对话框可推进到下一句', pass: /dialogWrapper\.addEventListener\('click',[\s\S]*?state\.lineIndex < scene\.lines\.length - 1/.test(files.js) },
  { name: '指针粗糙模式可见化处理方向判断', pass: /function isPortraitLayout\([\s\S]*?window\.innerHeight >= window\.innerWidth/.test(files.js) },
  { name: '竖屏提示为短时非阻塞提示', pass: /PORTRAIT_LOCK_HINT_DURATION_MS/.test(files.js) && /function showPortraitLockHint\([\s\S]*?setTimeout\(\s*\(\)\s*=>\s*\{\s*hidePortraitLock\(\);\s*\}\s*,\s*PORTRAIT_LOCK_HINT_DURATION_MS\)/m.test(files.js) },
  { name: '运行中会立即隐藏竖屏提示', pass: /function checkOrientation\([\s\S]*?if \(state\.running\)\s*\{[\s\S]*?return;\s*\}/.test(files.js) && /if \(portrait\)\s*\{\s*hidePortraitLock\(\);\s*return;\s*\}/.test(files.js) },
  { name: 'portraitLock 非阻塞提示 pointer-events 处理', pass: /#portraitLock\s*\{[\s\S]*?pointer-events:\s*none;[\s\S]*?\}/.test(files.css) && /#portraitLock\.open\s*\{[\s\S]*?pointer-events:\s*none;[\s\S]*?\}/.test(files.css) },
  { name: 'HUD 按钮高度不低于 44px', pass: /button\s*\{[\s\S]*?min-height:\s*44px/.test(files.css) },
];

let failed = 0;
for (const item of checks) {
  if (!item.pass) {
    failed += 1;
  }
}

console.log('mobile coarse-pointer smoke checks', new Date().toISOString());
for (const item of checks) {
  console.log(`- ${item.name}: ${item.pass ? 'PASS' : 'FAIL'}`);
}

process.exitCode = failed ? 1 : 0;
