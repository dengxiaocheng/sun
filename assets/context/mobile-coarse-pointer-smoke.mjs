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

const publicHtml = await (async () => {
  try {
    const response = await fetch('https://dengxiaocheng.github.io/sun/');
    if (!response.ok) return '';
    return await response.text();
  } catch (err) {
    console.error('公开页面抓取失败', err.message);
    return '';
  }
})();

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

const drawDebugSlice = (() => {
  const start = files.js.indexOf('function drawDebugStatus');
  if (start < 0) return '';
  const end = files.js.indexOf('\n\n  function preloadScene', start);
  return files.js.slice(start, end > start ? end : files.js.length);
})();
const debugTupleTextPattern = /A:\s*\$\{state\.values\.A\}|M:\s*\$\{state\.values\.M\}|P:\s*\$\{state\.values\.P\}|R:\s*\$\{state\.values\.R\}|B:\s*\$\{state\.values\.B\}|T:\s*\$\{state\.values\.T\}|E:\s*\$\{state\.values\.E\}/;

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

const hudFlexStartForMobileMatch = /@media\s*\(\s*max-width:\s*600px[^)]*\)\s*\{[\s\S]*?#hud\s*\{[\s\S]*?justify-content:\s*flex-start;[\s\S]*?\}/.test(files.css);
const choiceAreaMarginTopAutoMatch = /@media\s*\(\s*max-width:\s*600px[^)]*\)\s*\{[\s\S]*?#choiceArea:not\(:empty\)\s*\{[\s\S]*?margin-top:\s*auto;[\s\S]*?\}/.test(files.css);
const choiceAreaEmptyHiddenMatch = /#choiceArea:empty\s*\{[\s\S]*?display:\s*none;[\s\S]*?\}/.test(files.css);

const checks = [
  { name: 'CSS/JS/README 版本参数可解析', pass: Boolean(htmlCacheVersion) && Boolean(readmeCacheVersion) },
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
  {
    name: 'drawDebugStatus 不再绘制A/M/P/R/B/T/E裸字母数值串',
    pass: drawDebugSlice
      && !/A:\\s*\$\{state\.values\.A\}/.test(drawDebugSlice)
      && !/M:\\s*\$\{state\.values\.M\}/.test(drawDebugSlice)
      && !/P:\\s*\$\{state\.values\.P\}/.test(drawDebugSlice)
      && !/R:\\s*\$\{state\.values\.R\}/.test(drawDebugSlice)
      && !/B:\\s*\$\{state\.values\.B\}/.test(drawDebugSlice)
      && !/T:\\s*\$\{state\.values\.T\}/.test(drawDebugSlice)
      && !/E:\\s*\$\{state\.values\.E\}/.test(drawDebugSlice),
  },
  {
    name: '源码不再保留通过模板字符串输出 A/M/P/R/B/T/E 状态裸数值',
    pass: !debugTupleTextPattern.test(files.js),
  },
  { name: 'title/hud/systemPanel/storage 关键层有高优先级 hidden CSS 覆盖', pass: /#titleScreen\.hidden,\s*#hud\.hidden,\s*#systemPanel\.hidden,\s*#storagePanel\.hidden\s*\{[\s\S]*?display:\s*none\s*!important\s*;[\s\S]*?\}/.test(files.css) },
  { name: '进入游戏会隐藏并禁用标题层点击', pass: /function enterPlayMode\([\s\S]*?titleScreen\.classList\.add\('hidden'\)[\s\S]*?titleScreen\.style\.pointerEvents\s*=\s*'none'/m.test(files.js) },
  { name: '对话框点击可推进到下一句', pass: /dialogWrapper\.addEventListener\('click',[\s\S]*?state\.lineIndex < scene\.lines\.length - 1/.test(files.js) },
  { name: 'HUD 按钮高度不低于 44px', pass: /button\s*\{[\s\S]*?min-height:\s*44px/.test(files.css) },
  { name: '横屏提示文案不在 index', pass: !/请保持竖屏/.test(files.html) },
  { name: '横屏提示文案不在 game.js', pass: !/请保持竖屏/.test(files.js) },
  { name: '横屏提示文案不在 style.css', pass: !/请保持竖屏/.test(files.css) },
  { name: '发布页 HTML 可抓取', pass: /<\s*html/.test(publicHtml) },
  { name: '横屏提示文案不在发布页', pass: !/请保持竖屏/.test(publicHtml) },
  { name: '发布页不再有 portraitLock 关键字', pass: !/portraitLock/.test(publicHtml) && !/portraitLock/.test(files.css) },
  { name: 'release.version 与 index/query 一致', pass: releaseVersionFromFile && htmlCacheVersion === releaseVersionFromFile },
  { name: 'release.version 与 README 一致', pass: releaseVersionFromFile && readmeCacheVersion === releaseVersionFromFile },
  { name: '#hud: justify-content:flex-start', pass: hudFlexStartForMobileMatch },
  { name: '#choiceArea:not(:empty) margin-top:auto', pass: choiceAreaMarginTopAutoMatch },
  { name: '#choiceArea:empty display:none', pass: choiceAreaEmptyHiddenMatch },
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
