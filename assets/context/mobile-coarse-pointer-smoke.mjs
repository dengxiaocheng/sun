#!/usr/bin/env node
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const repoRoot = '/home/openclaw/codex-projects/sun';

const files = {
  html: fs.readFileSync(`${repoRoot}/index.html`, 'utf8'),
  js: fs.readFileSync(`${repoRoot}/game.js`, 'utf8'),
  css: fs.readFileSync(`${repoRoot}/style.css`, 'utf8'),
  readme: fs.readFileSync(`${repoRoot}/README.md`, 'utf8'),
};

const currentReleaseMatch = (() => {
  try {
    return execSync('git rev-parse --short HEAD', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
})();

const releaseVersionFromFile = (() => {
  try {
    return fs.readFileSync(`${repoRoot}/assets/context/release.version`, 'utf8').trim();
  } catch {
    return '';
  }
})();

const cacheVersionPattern = /[a-zA-Z0-9._-]{4,64}/;
const htmlStyleMatch = files.html.match(new RegExp(`style\\.css\\?v=(${cacheVersionPattern.source})`));
const htmlGameMatch = files.html.match(new RegExp(`game\\.js\\?v=(${cacheVersionPattern.source})`));
const readmeStyleMatch = files.readme.match(new RegExp(`\`style\\.css\\?v=(${cacheVersionPattern.source})\``));
const readmeGameMatch = files.readme.match(new RegExp(`\`game\\.js\\?v=(${cacheVersionPattern.source})\``));

const releaseVersion = releaseVersionFromFile || currentReleaseMatch;
const legacyStaleVersions = new Set(['0586471', 'dec7e0b1']);

const htmlCacheVersion = htmlStyleMatch && htmlGameMatch && htmlStyleMatch[1] === htmlGameMatch[1] ? htmlStyleMatch[1] : '';
const readmeCacheVersion = readmeStyleMatch && readmeGameMatch && readmeStyleMatch[1] === readmeGameMatch[1]
  ? readmeStyleMatch[1]
  : '';
const expectedCacheVersion = releaseVersion || htmlCacheVersion || readmeCacheVersion;

const checks = [
  { name: 'CSS/JS 资源版本参数可解析', pass: Boolean(htmlCacheVersion) && Boolean(readmeCacheVersion) },
  {
    name: 'index 与 README 的版本参数一致',
    pass: htmlCacheVersion && readmeCacheVersion && htmlCacheVersion === readmeCacheVersion,
  },
  { name: '版本参数不是旧 hash', pass: htmlCacheVersion && !legacyStaleVersions.has(htmlCacheVersion) },
  {
    name: 'index 与 README 版本参数一致于发布版本',
    pass: Boolean(expectedCacheVersion) && htmlCacheVersion === expectedCacheVersion && readmeCacheVersion === expectedCacheVersion,
  },
  {
    name: 'CSS/JS 资源 query 与发布版本一致',
    pass: /style\.css\?v=/.test(files.html)
      && /game\.js\?v=/.test(files.html)
      && htmlStyleMatch[1] === htmlGameMatch[1]
      && htmlStyleMatch[1] === expectedCacheVersion,
  },
  { name: 'title screen 有开始按钮', pass: /id="titleScreen"[\s\S]*id="startBtn"/.test(files.html) },
  { name: '开始按钮绑定点击与触控事件', pass: /bindStartButton\(startBtn,[\s\S]*\)\s*;/.test(files.js) && /touchend/.test(files.js) },
  { name: 'title/hud/systemPanel/storage/portraitLock 关键层有高优先级 hidden CSS 覆盖', pass: /#titleScreen\.hidden,\s*#hud\.hidden,\s*#systemPanel\.hidden,\s*#storagePanel\.hidden,\s*#portraitLock\.hidden\s*\{[\s\S]*?display:\s*none\s*!important\s*;[\s\S]*?\}/.test(files.css) },
  { name: '进入游戏会隐藏并禁用标题层点击', pass: /function enterPlayMode\([\s\S]*?titleScreen\.classList\.add\('hidden'\)[\s\S]*?titleScreen\.style\.pointerEvents\s*=\s*'none'/m.test(files.js) },
  { name: '进入游戏会移除竖屏提示层', pass: /function enterPlayMode\([\s\S]*?hidePortraitLock\(\)/m.test(files.js) },
  { name: '横屏提示仅在粗触控场景触发', pass: /function isMobileTouchPointerLayout\([\s\S]*?\(pointer: coarse\)[\s\S]*?\(hover: none\)/m.test(files.js) },
  { name: 'checkOrientation 在非运行态且非竖屏时才弹提示', pass: /function checkOrientation\([\s\S]*?const shouldShowPortraitHint[\s\S]*?if \(state\.running \|\| !shouldShowPortraitHint\)[\s\S]*?return;/.test(files.js) && /showPortraitLockHint\(\);/.test(files.js) },
  { name: '游戏启动后显示 HUD', pass: /hud\.classList\.remove\('hidden'\)/.test(files.js) },
  { name: '点击对话框可推进到下一句', pass: /dialogWrapper\.addEventListener\('click',[\s\S]*?state\.lineIndex < scene\.lines\.length - 1/.test(files.js) },
  { name: '指针粗糙模式可见化处理方向判断', pass: /function isPortraitLayout\([\s\S]*?window\.innerHeight >= window\.innerWidth/.test(files.js) },
  { name: '竖屏提示为短时非阻塞提示', pass: /PORTRAIT_LOCK_HINT_DURATION_MS/.test(files.js) && /function showPortraitLockHint\([\s\S]*?setTimeout\(\s*\(\)\s*=>\s*\{\s*hidePortraitLock\(\);\s*\}\s*,\s*PORTRAIT_LOCK_HINT_DURATION_MS\)/m.test(files.js) },
  { name: '运行中会立即隐藏竖屏提示', pass: /function checkOrientation\([\s\S]*?if \(state\.running \|\| !shouldShowPortraitHint\)\s*\{[\s\S]*?return;\s*\}/.test(files.js) && /if \(state\.running \|\| !shouldShowPortraitHint\)\s*\{[\s\S]*?return;\s*\}/.test(files.js) },
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
