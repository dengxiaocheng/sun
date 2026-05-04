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
const scenesBlockMatch = files.js.match(/const scenes = \\{([\\s\\S]*?)\\n\\s*const ENDINGS = /);
const scenesBlock = scenesBlockMatch ? scenesBlockMatch[1] : files.js;

const SAFE_ASSET_REMAP_KEYS = [
  'backgrounds/bg_title_powerline_mist.png',
  'backgrounds/bg_dorm_0230.png',
  'backgrounds/bg_campus_morning_fog.png',
  'backgrounds/bg_rooftop_evening.png',
  'backgrounds/bg_exam_gate_dawn.png',
  'backgrounds/bg_library_stack.png',
  'backgrounds/bg_bus_stop_rain.png',
];

const REQUIRED_MAPPED_ASSET_FILES = [
  'assets/images/fix_patch/backgrounds_china_kaoyan/bg_rental_room_night.png',
  'assets/images/fix_patch/backgrounds_china_kaoyan/bg_china_university_library_winter.png',
  'assets/images/fix_patch/backgrounds_china_kaoyan/bg_campus_lake_evening.png',
  'assets/images/fix_patch/backgrounds_china_kaoyan/bg_subway_home.png',
  'assets/images/fix_patch/backgrounds_china_kaoyan/bg_kaoyan_exam_gate_china.png',
  'assets/images/fix_patch/backgrounds_china_kaoyan/bg_kaoyan_selfstudy_hall.png',
  'assets/images/fix_patch/backgrounds_china_kaoyan/bg_train_station_platform_winter.png',
];

const remapBlockMatch = files.js.match(/const ASSET_REMAP = \{([\s\S]*?)\n\s*const HOMETOWN_SCENE_REMAP = /);
const hometownRemapBlockMatch = files.js.match(/const HOMETOWN_SCENE_REMAP = \{([\s\S]*?)\n\s*const HOMETOWN_REMAP_PATHS =/);
const ASSET_REMAP_ENTRIES = remapBlockMatch
  ? Array.from(remapBlockMatch[1].matchAll(/'([^']+)': \{\s*remap:\s*'([^']+)'\s*,\s*fallback:\s*'([^']+)'/g))
  : [];
const ASSET_REMAP_MAP = Object.fromEntries(ASSET_REMAP_ENTRIES.map((entry) => [entry[1], { remap: entry[2], fallback: entry[3] }]));

const stripImagePrefix = (logicalPath) => String(logicalPath || '').replace(/^assets\/images\//, '');
const HOMETOWN_SCENE_REMAP_MAP = (() => {
  if (!hometownRemapBlockMatch) {
    return {};
  }

  const sceneMap = {};
  const sceneEntries = Array.from(hometownRemapBlockMatch[1].matchAll(/\b(H\d{2}):\s*\{([\s\S]*?)\n\s*\},/g));
  for (const [, sceneId, innerBlock] of sceneEntries) {
    const sceneMapEntries = Array.from(innerBlock.matchAll(/'([^']+)':\s*ASSET_REMAP\['([^']+)'\]/g));
    const pathMap = {};
    for (const [, scenePath, remapKey] of sceneMapEntries) {
      if (ASSET_REMAP_MAP[remapKey]) {
        pathMap[scenePath] = ASSET_REMAP_MAP[remapKey];
      }
    }
    sceneMap[sceneId] = pathMap;
  }
  return sceneMap;
})();

const getAssetCandidates = (logicalPath, sceneId = null) => {
  const originalPath = stripImagePrefix(logicalPath);
  const sceneRemap = (HOMETOWN_SCENE_REMAP_MAP[sceneId || ''] || {})[originalPath];
  const candidates = [];
  const add = (item) => {
    if (!item) return;
    const normalized = stripImagePrefix(item);
    if (!candidates.includes(normalized)) {
      candidates.push(normalized);
    }
  };
  add(originalPath);
  if (sceneRemap?.remap) {
    add(sceneRemap.remap);
    add(sceneRemap.fallback || originalPath);
  }
  return candidates;
};

const getSceneBg = (sceneId) => {
  const sceneMatch = new RegExp(`\\b${sceneId}:\\s*\\{[\\s\\S]*?\\n\\s*bg:\\s*'([^']+)'`).exec(scenesBlock);
  return sceneMatch?.[1] || '';
};

const hasPathOnDisk = (path) => fs.existsSync(`${repoRoot}/${path}`);

const HOMETOWN_SCENE_IDS = ['H00', 'H01', 'H02', 'H03', 'H04', 'H05', 'H06', 'H07', 'H08'];
const hasAllHometownNodes = HOMETOWN_SCENE_IDS.every((nodeId) => new RegExp(`\\b${nodeId}:`).test(files.js));
const hometwonSceneRemapKeys = Object.keys(HOMETOWN_SCENE_REMAP_MAP);
const hasExactHometownSceneMap = HOMETOWN_SCENE_IDS.every((sceneId) => hometwonSceneRemapKeys.includes(sceneId))
  && hometwonSceneRemapKeys.length === HOMETOWN_SCENE_IDS.length;

const hometownRemapCoverage = /const HOMETOWN_REMAP_PATHS\s*=/;
const requiredHometownRemapDirs = [
  'assets/images/fix_patch/backgrounds_china_kaoyan',
];

const getSceneAssetCandidates = (sceneId, logicalPath) => {
  const candidates = getAssetCandidates(logicalPath, sceneId);
  return candidates.map((path) => `assets/images/${stripImagePrefix(path)}`);
};
const getSceneFieldValue = (sceneId, fieldName) => {
  const sceneMatch = new RegExp(`\\\\b${sceneId}:\\\\s*\\\\{[\\\\s\\\\S]*?\\\\n\\\\s*${fieldName}:\\\\s*['\"]([^'"]+)['"]`).exec(scenesBlock);
  return sceneMatch?.[1] || '';
};
const getSceneFieldCandidates = (sceneId, fieldName) => {
  const logicalPath = getSceneFieldValue(sceneId, fieldName);
  if (!logicalPath) {
    return [];
  }
  return getSceneAssetCandidates(sceneId, logicalPath);
};
const hasAllPaths = (items) => items.length > 0 && items.every(hasPathOnDisk);

const remapMapHasRequiredKeys = SAFE_ASSET_REMAP_KEYS.every((key) => ASSET_REMAP_MAP[key]);
const remapAllHaveFallback = ASSET_REMAP_ENTRIES.every((entry) => Boolean(entry[2]) && Boolean(entry[3]));
const remapAssetsExist = SAFE_ASSET_REMAP_KEYS.every((logicalPath) => {
  const remapConfig = ASSET_REMAP_MAP[logicalPath];
  if (!remapConfig) {
    return false;
  }
  const remappedPath = `assets/images/${remapConfig.remap}`;
  const fallbackPath = `assets/images/${(remapConfig.fallback || logicalPath)}`;
  return hasPathOnDisk(remappedPath) && hasPathOnDisk(fallbackPath);
});
const hasNoCharacterOrCgRemap = SAFE_ASSET_REMAP_KEYS.every((key) => !key.startsWith('characters/') && !key.startsWith('cg/'));

const p00SceneCandidates = getSceneAssetCandidates('P00', getSceneBg('P00'));
const p01SceneCandidates = getSceneAssetCandidates('P01', getSceneBg('P01'));
const h00SceneCandidates = getSceneAssetCandidates('H00', getSceneBg('H00'));
const keySceneCandidates = getSceneAssetCandidates(null, 'backgrounds/bg_title_powerline_mist.png');
const p00ActorCandidates = getSceneFieldCandidates('P00', 'actor');
const h00ActorCandidates = getSceneFieldCandidates('H00', 'actor');
const hasMainlineOriginalFirstInP00 = p00SceneCandidates[0] === `assets/images/${stripImagePrefix(getSceneBg('P00'))}`;
const hasMainlineOriginalFirstInP01 = p01SceneCandidates[0] === `assets/images/${stripImagePrefix(getSceneBg('P01'))}`;
const sceneCandidatesExist = hasAllPaths;

const mapSceneKeysForHometown = HOMETOWN_SCENE_IDS.flatMap((sceneId) => {
  const bg = getSceneBg(sceneId);
  if (!bg) {
    return [];
  }
  const sceneMap = HOMETOWN_SCENE_REMAP_MAP[sceneId] || {};
  return Object.keys(sceneMap).filter(Boolean).map((path) => ({ sceneId, path }));
});

const hometownRemapOnlyFromAllowlist = (() => {
  const uniquePaths = new Set(mapSceneKeysForHometown.map(({ path }) => path));
  return Array.from(uniquePaths).every((path) => SAFE_ASSET_REMAP_KEYS.includes(path))
    && uniquePaths.size <= SAFE_ASSET_REMAP_KEYS.length;
})();
const h00UsesScopedFixPatch = Object.keys(HOMETOWN_SCENE_REMAP_MAP['H00'] || {}).length > 0;
const hasNoBlanketFixPatchInP00P01 = !p00SceneCandidates.some((path) => path.includes('assets/images/fix_patch/'))
  && !p01SceneCandidates.some((path) => path.includes('assets/images/fix_patch/'));

const fixPatchDirectoriesExist = requiredHometownRemapDirs.every((dir) => fs.existsSync(`${repoRoot}/${dir}`));
const requiredRemapFilesExist = REQUIRED_MAPPED_ASSET_FILES.every((assetPath) => hasPathOnDisk(assetPath));
const hasResolveImageMapPath = /function getAssetCandidates\(path,\s*sceneId\s*=\s*null\)|function resolveImagePath\(path,\s*sceneId\s*=\s*null\)/.test(files.js)
  && /function loadImage\(path,\s*sceneId\s*=\s*null\)/.test(files.js)
  && /function resolveImageLoadState\(logicalPath,\s*sceneId\s*=\s*null\)/.test(files.js);
const hasFixTitleStyle = /#titleScreen\s*\{[\s\S]*?assets\/images\/backgrounds\/bg_title_powerline_mist\.png[\s\S]*?assets\/images\/fix_patch\/backgrounds_china_kaoyan\/bg_china_university_library_winter\.png/.test(files.css);
const noTitleBlendMultiply = !/background-blend-mode:\s*multiply/.test(files.css);

const hasIds = (target, ids) => ids.every((id) => new RegExp(`id=["']${id}["']`).test(target));
const extractCssNumber = (css, selector, propertyName) => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const selectorBlock = new RegExp(`${escaped}\\s*\\{([\\s\\S]*?)\\}`).exec(css);
  if (!selectorBlock) {
    return null;
  }
  const match = new RegExp(`${propertyName}\\s*:\\s*(\\d+)`).exec(selectorBlock[1]);
  return match ? Number(match[1]) : null;
};
const actorLayerZ = extractCssNumber(files.css, '#actorLayer', 'z-index');
const actorSpriteLayerZ = extractCssNumber(files.css, '#actorSprite', 'z-index');
const hudZ = extractCssNumber(files.css, '#hud', 'z-index');
const dialogWrapperZ = extractCssNumber(files.css, '#dialogWrapper', 'z-index');
const choiceAreaZ = extractCssNumber(files.css, '#choiceArea', 'z-index');
const tripPackPanelZ = extractCssNumber(files.css, '.tripPackPanel', 'z-index');
const hasActorLayerIds = hasIds(files.html, ['actorLayer', 'actorSprite']);
const hasActorLayerStyle = /#actorLayer\s*[\s\S]*?pointer-events:\s*none/.test(files.css) && /#actorSprite\s*[\s\S]*?aspect-ratio:\s*96\s*\/\s*160/.test(files.css);
const hasActorLayerInRender = /function updateActorLayer\(activeScene\)/.test(files.js);
const hasActorLayerRenderBinding = /const hasActorLayer = updateActorLayer\(activeScene\);/.test(files.js);
const hasActorLayerUseSpriteSheetCss = /actorSpriteSheet/.test(files.css);
const hasSafeSpriteFrameOffsetFormula = files.js.includes('actorSprite.style.backgroundPosition = `${xOffset} 50%`;');
const hasNegativeCropFormula = files.js.includes('${-(frame * 25)}% 50%')
  || files.js.includes('backgroundPosition = `${-(frame *')
  || files.js.includes('const xOffset = `${-(frame')
const hasActorRemapDisabledForCharacters = !/fix_patch\/.*char/.test(files.js) && !/characters_transparent/.test(files.js);
const hasOriginalCharacterPrimaryPath = /resolveImagePath\(activeScene\.actor,\s*state\.current\)/.test(files.js);
const hasMobileStartActorLayer = /#actorLayer\.hidden/.test(files.css);
const hasMobileActorLayerZOrder = Boolean(
  Number.isFinite(actorLayerZ) && Number.isFinite(hudZ)
    && Number.isFinite(dialogWrapperZ)
    && Number.isFinite(choiceAreaZ)
    && actorLayerZ < hudZ
    && actorLayerZ < dialogWrapperZ
    && actorLayerZ < choiceAreaZ,
);

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
const checkHttpStatus200 = async (url) => {
  if (!url) return false;
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.status === 200;
  } catch {
    return false;
  }
};
const hasP00ActorPrimaryLocal = !p00ActorCandidates.length
  || (/^assets\/images\/characters\//.test(p00ActorCandidates[0] || '') && !/fix_patch/.test(p00ActorCandidates[0] || ''));
const hasH00ActorPrimaryLocal = !h00ActorCandidates.length
  || (/^assets\/images\/characters\//.test(h00ActorCandidates[0] || '') && !/fix_patch/.test(h00ActorCandidates[0] || ''));
const hasP00ActorLocalFiles = !p00ActorCandidates.length || hasAllPaths(p00ActorCandidates);
const hasH00ActorLocalFiles = !h00ActorCandidates.length || hasAllPaths(h00ActorCandidates);
const hasP00ActorPublic200 = !p00ActorCandidates[0] || await checkHttpStatus200(`https://dengxiaocheng.github.io/sun/${p00ActorCandidates[0]}`);
const hasH00ActorPublic200 = await checkHttpStatus200(`https://dengxiaocheng.github.io/sun/${h00ActorCandidates[0] || ''}`);

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
const syncBarsSource = (() => {
  const start = files.js.indexOf('function syncBars');
  if (start < 0) return '';
  const end = files.js.indexOf('\n\n  function', start + 1);
  const fallbackEnd = files.js.indexOf('function preloadScene', start + 1);
  const stop = end > start ? end : (fallbackEnd > start ? fallbackEnd : files.js.length);
  return files.js.slice(start, stop);
})();
const normalizeDeltaSource = (() => {
  const start = files.js.indexOf('function normalizeDelta');
  if (start < 0) return '';
  const end = files.js.indexOf('\n\n  function', start + 1);
  const stop = end > start ? end : files.js.length;
  return files.js.slice(start, stop);
})();
const statusBarHtmlIds = ['valueA', 'valueM', 'valueP', 'valueR', 'valueB', 'valueT', 'valueE'];
const statusBarDeltaIds = ['deltaA', 'deltaM', 'deltaP', 'deltaR', 'deltaB', 'deltaT', 'deltaE'];
const statusBarIds = ['barA', 'barM', 'barP', 'barR', 'barB', 'barT', 'barE'];
const debugTupleTextPattern = /A:\s*\$\{state\.values\.A\}|M:\s*\$\{state\.values\.M\}|P:\s*\$\{state\.values\.P\}|R:\s*\$\{state\.values\.R\}|B:\s*\$\{state\.values\.B\}|T:\s*\$\{state\.values\.T\}|E:\s*\$\{state\.values\.E\}/;
const chineseStatusLabels = ['焦虑雾', '动能', '复习进度', '恢复', '边界感', '关系温度', '理解/共情'];
const hasChineseStatusLabels = (targetHtml) => chineseStatusLabels.every((label) => targetHtml.includes(label));
const hasHometownQuickStartText = /回家支线：先去见他/.test(files.html);
const hasHometownQuickStartClass = /class=["'][^"']*hometownEntryCard[^"']*["']/.test(files.html);
const hasHometownQuickStartBtnClass = /class=["'][^"']*hometownEntryBtn[^"']*["']/.test(files.html);
const hasHometownQuickStartButtonId = /id=["']hometownQuickStartBtn["']/.test(files.html);
const hasHometownQuickStartBind = /bindStartButton\(hometownQuickStartBtn/.test(files.js);
const hasHometownQuickStartStart = /function startHometownBranchQuick\(\)/.test(files.js);
const hasHometownQuickStartReset = /resetGame\('H00',\s*\{\s*hometownTrip:\s*true\s*\}\)/.test(files.js);
const hasHometownTripEntryFromQuickPath = /function startHometownBranchQuick\([\s\S]*?resetGame\('H00',\s*\{\s*hometownTrip:\s*true\s*\}\)/.test(files.js)
  && /beginHometownTrip\(state\)/.test(files.js);
const hudTuplePattern = /[ABPMRTE]\\s*[:：]\\s*\\d{1,3}/;
const jsTupleTemplatePattern = /[`'\"].*?(?:A|M|P|R|B|T|E)\\s*[:：]\\s*\\$\\{state\\.values\\.(?:A|M|P|R|B|T|E)\\}.*?[`'\"']/;

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

const statusBarsSourceStart = files.js.indexOf('const statusBars = [');
const statusBarsSourceEnd = files.js.indexOf('const statusFlashTimers', statusBarsSourceStart + 1);
const statusBarsSource = statusBarsSourceStart >= 0 && statusBarsSourceEnd > statusBarsSourceStart
  ? files.js.slice(statusBarsSourceStart, statusBarsSourceEnd)
  : '';

const choiceAreaSourceStart = files.js.indexOf('for (const option of scene.choices)');
const choiceAreaSourceEnd = files.js.indexOf('function chooseStorageSlot', choiceAreaSourceStart + 1);
const choiceAreaSource = choiceAreaSourceStart >= 0 && choiceAreaSourceEnd > choiceAreaSourceStart
  ? files.js.slice(choiceAreaSourceStart, choiceAreaSourceEnd)
  : files.js;

const hasDefinedSevenStatusBars = /barA/.test(statusBarsSource)
  && /barM/.test(statusBarsSource)
  && /barP/.test(statusBarsSource)
  && /barR/.test(statusBarsSource)
  && /barB/.test(statusBarsSource)
  && /barT/.test(statusBarsSource)
  && /barE/.test(statusBarsSource);
const hasSevenStatusKeysInBars = /key:\s*['"]A['"]/.test(statusBarsSource)
  && /key:\s*['"]M['"]/.test(statusBarsSource)
  && /key:\s*['"]P['"]/.test(statusBarsSource)
  && /key:\s*['"]R['"]/.test(statusBarsSource)
  && /key:\s*['"]B['"]/.test(statusBarsSource)
  && /key:\s*['"]T['"]/.test(statusBarsSource)
  && /key:\s*['"]E['"]/.test(statusBarsSource);

const hasSevenBarDom = hasIds(files.html, statusBarIds);
const hasSevenValueDom = hasIds(files.html, statusBarHtmlIds);
const hasSevenDeltaDom = hasIds(files.html, statusBarDeltaIds);
const syncBarsUpdatesAllBars = /statusBars\.forEach/.test(syncBarsSource) && /--v/.test(syncBarsSource);
const syncBarsUpdatesAllValues = /textContent\s*=\s*/.test(syncBarsSource) && /valueEl/.test(syncBarsSource);
const hasVisibleChangeFeedback = /data-delta|changed|statusFlash/i.test(syncBarsSource);
const hasChoiceChoiceDeltaInput = /const delta = option\.delta \|\| \{\};/.test(choiceAreaSource);
const hasChoiceChoiceNormalizeDeltaCall = /normalizeDelta\(state, delta\);/.test(choiceAreaSource);
const normalizeTriggersSyncBars = /function normalizeDelta[\s\S]*?syncBars\(/.test(normalizeDeltaSource);
const normalizeReturnsChange = /return\s+changed;/.test(normalizeDeltaSource);
const normalizeReturnsRequestedDelta = /changed:\s*clamped\s*!==\s*before/.test(normalizeDeltaSource);
const syncBarsReceivesChangesOnly = /syncBars\(changed\)/.test(normalizeDeltaSource);

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
  { name: '标题页新增“回家支线”入口卡片', pass: hasHometownQuickStartClass && hasHometownQuickStartBtnClass && hasHometownQuickStartText && hasHometownQuickStartButtonId },
  { name: '标题页支线入口绑定点击与触控交互', pass: hasHometownQuickStartBind && /touchend/.test(files.js) && hasHometownQuickStartStart },
  { name: '支线入口启动路径会初始化 H00 直接入场', pass: hasHometownQuickStartReset && hasHometownTripEntryFromQuickPath },
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
    pass: !debugTupleTextPattern.test(files.js) && !jsTupleTemplatePattern.test(files.js),
  },
  {
    name: '七个中文状态标签均存在',
    pass: hasChineseStatusLabels(files.html),
  },
  {
    name: '主界面不出现裸 `A:52`/`A:${state.values.A}` 类态码数字展示',
    pass: !hudTuplePattern.test(files.html) && !/（(?:A|M|P|R|B|T|E)）/.test(files.html),
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
  {
    name: 'DOM 角色层存在且带可见样式（#actorLayer/#actorSprite）',
    pass: hasActorLayerIds && hasActorLayerStyle && hasMobileStartActorLayer,
  },
  {
    name: 'P00 / H00 角色资源解析为本地角色目录主资源',
    pass: hasP00ActorPrimaryLocal && hasH00ActorPrimaryLocal,
  },
  {
    name: 'P00 / H00 角色主资源文件存在',
    pass: hasP00ActorLocalFiles && hasH00ActorLocalFiles,
  },
  {
    name: 'P00 / H00 角色主资源 public 200 可达',
    pass: hasP00ActorPublic200 && hasH00ActorPublic200,
  },
  {
    name: '角色层 z-index 在 HUD/dialog/choice 之后（角色在下方）',
    pass: hasMobileActorLayerZOrder,
  },
  {
    name: '角色层更新源于当前场景 actor 且经过 render 调用',
    pass: hasActorLayerInRender && hasActorLayerRenderBinding && hasOriginalCharacterPrimaryPath,
  },
  {
    name: '角色路径不走 fix_patch 透明角色 remap',
    pass: hasActorRemapDisabledForCharacters,
  },
  {
    name: '角色 sprite-sheet 使用 4 帧裁切策略（400%+背景偏移）',
    pass: hasActorLayerUseSpriteSheetCss && hasSafeSpriteFrameOffsetFormula && !hasNegativeCropFormula,
  },
  { name: '资源映射配置存在', pass: !!remapBlockMatch && !!hometownRemapBlockMatch },
  { name: '图片候选链使用场景参数（非全局硬编码 remap）', pass: hasResolveImageMapPath },
  { name: 'ASSET_REMAP 键为允许列表（仅目标安全背景）', pass: remapMapHasRequiredKeys },
  { name: 'ASSET_REMAP 全部键位含 remap/fallback', pass: remapAllHaveFallback },
  { name: '角色/CG 映射被禁用', pass: hasNoCharacterOrCgRemap },
  { name: 'ASSET_REMAP remap/fallback 对应资源在本地', pass: remapAssetsExist },
  { name: 'Hometown 映射路径变量存在', pass: hometownRemapCoverage.test(files.js) },
  { name: 'Hometown 映射仅由 H00-H08 白名单定义', pass: hasExactHometownSceneMap },
  { name: 'Hometown 映射仅覆盖允许的背景键', pass: hometownRemapOnlyFromAllowlist },
  { name: '修复资源目录存在', pass: fixPatchDirectoriesExist },
  { name: '关键修复资源存在', pass: requiredRemapFilesExist },
  { name: 'Title 场景背景候选链素材在本地', pass: sceneCandidatesExist(keySceneCandidates) },
  { name: 'P00 场景候选链素材在本地', pass: sceneCandidatesExist(p00SceneCandidates) },
  { name: 'H00 场景候选链素材在本地', pass: sceneCandidatesExist(h00SceneCandidates) },
  { name: '标题背景优先使用原图，并提供原图 fallback', pass: hasFixTitleStyle },
  { name: '标题背景不使用背景叠加变暗策略', pass: noTitleBlendMultiply },
  { name: 'P00/P01 主线场景保留原始主图作为第一候选', pass: hasMainlineOriginalFirstInP00 && hasMainlineOriginalFirstInP01 },
  { name: '主线 P00/P01 未被全局 fix_patch 覆盖', pass: hasNoBlanketFixPatchInP00P01 },
  { name: 'H00/Hometown 使用 allowlist 场景映射到 fix_patch', pass: h00UsesScopedFixPatch },
  { name: '家乡分支节点 H00-H08 全量定义', pass: hasAllHometownNodes },
  { name: 'UI 有 7 条同源状态条 DOM', pass: hasSevenBarDom && hasSevenValueDom && hasSevenDeltaDom },
  { name: 'syncBars 统一更新所有 7 条条宽度与 7 条数值文案', pass: syncBarsUpdatesAllBars && syncBarsUpdatesAllValues },
  { name: 'statusBars 配置完整覆盖 7 个状态键', pass: hasSevenStatusKeysInBars && hasDefinedSevenStatusBars },
  { name: '同步函数提供变化反馈状态（changed/statusFlash/data-delta）', pass: hasVisibleChangeFeedback },
  { name: '选择点击必须经过 normalizeDelta 与 delta 输入对象', pass: hasChoiceChoiceDeltaInput && hasChoiceChoiceNormalizeDeltaCall },
  { name: 'normalizeDelta 返回变更细目并触发统一 syncBars(changed)', pass: normalizeReturnsRequestedDelta && normalizeReturnsChange && syncBarsReceivesChangesOnly },
  { name: 'normalizeDelta 会触发条目刷新', pass: normalizeTriggersSyncBars },
  { name: 'normalizeDelta 返回变化细目', pass: normalizeReturnsChange },
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
