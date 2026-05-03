#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';

const repoRoot = '/home/openclaw/codex-projects/sun';

const RELEASE_TAG_API = 'https://api.github.com/repos/dengxiaocheng/sun/releases/tags/sun';
const EXPECTED_ASSET = {
  name: 'sun._._._.zip',
  size: 51353472,
  digest: 'sha256:f0be642657321886653621397951c841277b8b254b8124aa12600f7eeb4a43c8',
  url: 'https://github.com/dengxiaocheng/sun/releases/download/sun/sun._._._.zip',
};

const quote = (value) => JSON.stringify(value);
const run = (command) => execSync(command, {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});

const checksumSha256 = (filePath) =>
  `sha256:${crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')}`;

const listFilesRelative = (dir) => {
  const raw = run(`find ${quote(dir)} -type f`);
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => path.relative(dir, line));
};

const getReleaseMetadata = () => {
  const responseText = run(`curl -sS -H 'Accept: application/vnd.github+json' ${quote(RELEASE_TAG_API)}`);
  const release = JSON.parse(responseText);
  const asset = (release.assets || []).find((entry) => entry.name === EXPECTED_ASSET.name);
  return {
    tag: release.tag_name,
    page: release.html_url,
    asset,
    release,
  };
};

const downloadAssetTo = (assetUrl, destination) => {
  run(`curl -fSL --http1.1 ${quote(assetUrl)} -o ${quote(destination)}`);
};

const getReleaseDocFiles = (extractedDir) => {
  const files = listFilesRelative(extractedDir);
  const docs = files.filter((file) => /01_docs[\\/]/.test(file) && /\.(md|sh|bundle|patch)$/i.test(file));
  const imagesManifest = files.find((file) => /02_images[\\/]+manifest\.json$/.test(file));
  const integration = files.find((file) =>
    /03_project_integration[\\/].*\.md$/i.test(file) || /README_/.test(path.basename(file)),
  );
  return { files, docs, imagesManifest, integration };
};

const checkTripBranch = () => {
  const gameJs = fs.readFileSync(path.join(repoRoot, 'game.js'), 'utf8');
  const requiredNodes = ['H00', 'H01', 'H02', 'H03', 'H04', 'H05', 'H06', 'H07', 'H08'];
  const missingNodes = requiredNodes.filter((nodeId) => !new RegExp(`\\b${nodeId}\\b\\s*:`).test(gameJs));
  const hasEntryFromMainline = /C7N05[\s\S]*next:\s*["']H00["']/.test(gameJs);
  const hasSettlement = /(hometownArrival|hometownArrivalWarm|hometownSelfCare|hometownOverload)/.test(gameJs);
  return {
    missingNodes,
    hasEntryFromMainline,
    hasSettlement,
    missingTripNodesCount: missingNodes.length,
    ready: missingNodes.length === 0 && hasEntryFromMainline && hasSettlement,
  };
};

const runChecks = () => {
  const checks = [];
  let failed = 0;

  const releaseMeta = {
    pageUrl: '',
    assetFound: false,
    metadataMatch: false,
    downloaded: false,
    checksumMatch: false,
    manifestRead: false,
    docsRead: false,
    branchMatch: false,
  };
  let extractedDir = '';
  let manifestTopLevelKeys = null;
  let releaseDocFiles = [];
  let assetSource = 'network';
  const gaps = [];

  try {
    const release = getReleaseMetadata();
    releaseMeta.pageUrl = release.page || EXPECTED_ASSET.url;
    releaseMeta.assetFound = !!release.asset;
    if (!release.asset) throw new Error(`missing asset ${EXPECTED_ASSET.name}`);
    const assetSize = Number(release.asset.size);
    const assetDigest = release.asset.digest;
    releaseMeta.metadataMatch =
      assetSize === EXPECTED_ASSET.size &&
      assetDigest === EXPECTED_ASSET.digest &&
      release.tag === 'sun';
    checks.push({ name: 'GitHub release tag API 可访问', pass: true });
    checks.push({ name: 'release tag 与任务目标一致（tag=sun）', pass: release.tag === 'sun' });
    checks.push({
      name: `release 资产存在（${EXPECTED_ASSET.name}）`,
      pass: releaseMeta.assetFound,
    });
    checks.push({
      name: `release 资产 size=${EXPECTED_ASSET.size} 验证`,
      pass: assetSize === EXPECTED_ASSET.size,
    });
    checks.push({
      name: `release 资产 digest=${EXPECTED_ASSET.digest} 验证`,
      pass: assetDigest === EXPECTED_ASSET.digest,
    });

    const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sun-release-asset-'));
    const downloadedAsset = path.join(workDir, EXPECTED_ASSET.name);

    const cacheCandidate = process.env.SUN_RELEASE_ASSET_FILE;
    if (cacheCandidate) {
      if (!fs.existsSync(cacheCandidate)) {
        throw new Error(`SUN_RELEASE_ASSET_FILE 不存在: ${cacheCandidate}`);
      }
      fs.copyFileSync(cacheCandidate, downloadedAsset);
      assetSource = `cache:${cacheCandidate}`;
    } else {
      downloadAssetTo(release.asset.browser_download_url || EXPECTED_ASSET.url, downloadedAsset);
      assetSource = 'network';
    }

    const actualSize = fs.statSync(downloadedAsset).size;
    const actualDigest = checksumSha256(downloadedAsset);
    releaseMeta.downloaded = true;
    releaseMeta.checksumMatch = actualSize === EXPECTED_ASSET.size && actualDigest === EXPECTED_ASSET.digest;

    checks.push({
      name: `release 资产下载到临时目录（source=${assetSource}）`,
      pass: releaseMeta.downloaded,
    });
    checks.push({
      name: 'release 资产 size 与任务目标一致',
      pass: actualSize === EXPECTED_ASSET.size,
    });
    checks.push({
      name: 'release 资产 sha256 与任务目标一致',
      pass: actualDigest === EXPECTED_ASSET.digest,
    });

    extractedDir = path.join(workDir, 'extracted');
    run(`unzip -q ${quote(downloadedAsset)} -d ${quote(extractedDir)}`);
    const { files, docs, imagesManifest, integration } = getReleaseDocFiles(extractedDir);
    releaseDocFiles = docs;
    releaseMeta.docsRead = Boolean(docs.length);
    checks.push({ name: 'release 资产解压成功', pass: files.length > 0 });

    if (imagesManifest) {
      try {
        const manifestPath = path.join(extractedDir, imagesManifest);
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        manifestTopLevelKeys = Object.keys(manifest).length;
        releaseMeta.manifestRead = Array.isArray(manifest.characters) || manifestTopLevelKeys > 0;
      } catch (err) {
        releaseMeta.manifestRead = false;
      }
    }

    checks.push({
      name: 'release 资源清单可读取（02_images/manifest.json）',
      pass: releaseMeta.manifestRead,
    });
    checks.push({
      name: 'release 文档清单可读取（01_docs/*）',
      pass: releaseMeta.docsRead && !!integration,
    });

    const branch = checkTripBranch();
    releaseMeta.branchMatch = branch.ready;
    checks.push({
      name: '本地家乡旅途支线节点 H00-H08 全量实现',
      pass: branch.missingNodes.length === 0,
    });
    checks.push({
      name: '本地支线入口 H00 从 C7N05 连通',
      pass: branch.hasEntryFromMainline,
    });
    checks.push({
      name: '本地家乡结局落地逻辑存在',
      pass: branch.hasSettlement,
    });

    if (branch.missingNodes.length > 0) {
      gaps.push(`missing trip nodes: ${branch.missingNodes.join(', ')}`);
    }
    if (!branch.hasEntryFromMainline) {
      gaps.push('mainline entry C7N05 -> H00 not found');
    }
    if (!branch.hasSettlement) {
      gaps.push('hometown settlement/ending logic not found');
    }
    if (!releaseMeta.docsRead) {
      gaps.push('release docs not read');
    }
    if (!releaseMeta.manifestRead) {
      gaps.push('release manifest not read');
    }
  } catch (err) {
    checks.push({ name: 'release 资产验收失败', pass: false });
    failed += 1;
    console.error('release verification failed:', err.message);
  }

  for (const item of checks) {
    if (!item.pass) failed += 1;
  }

  console.log(`release verification started: ${new Date().toISOString()}`);
  for (const item of checks) {
    console.log(`- ${item.name}: ${item.pass ? 'PASS' : 'FAIL'}`);
  }
  console.log(`release meta page: ${releaseMeta.pageUrl}`);
  console.log(`release asset source: ${assetSource}`);
  if (releaseMeta.checksumMatch) {
    console.log(`release asset sha256: ${EXPECTED_ASSET.digest}`);
    console.log(`release asset size: ${EXPECTED_ASSET.size}`);
  }
  console.log(`release extract dir: ${extractedDir || '[not extracted]'}`);
  if (releaseDocFiles.length) {
    console.log(`release 01_docs files (${releaseDocFiles.length}):`);
    for (const file of releaseDocFiles) {
      console.log(`  - ${file}`);
    }
  }
  if (manifestTopLevelKeys !== null) {
    console.log(`release manifest top level keys: ${manifestTopLevelKeys}`);
  }
  if (gaps.length > 0) {
    console.log('trip branch gap list:');
    for (const gap of gaps) {
      console.log(`  - ${gap}`);
    }
  } else {
    console.log('trip branch gap list: none');
  }
  console.log(`branch sync status: ${releaseMeta.branchMatch ? 'SYNCED' : 'DRIFT'}`);

  process.exitCode = failed ? 1 : 0;
};

runChecks();
