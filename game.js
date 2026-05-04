(() => {
  'use strict';

  const BASE_W = 360;
  const BASE_H = 640;
  const STORAGE_VERSION = 'sun-v1';
  const AUTO_SLOT = `${STORAGE_VERSION}:auto`;
  const saveKey = (slot) => `${STORAGE_VERSION}:slot:${slot}`;

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const titleScreen = document.getElementById('titleScreen');
  const startBtn = document.getElementById('startBtn');
  const hometownQuickStartBtn = document.getElementById('hometownQuickStartBtn');
  const loadBtn = document.getElementById('loadBtn');
  const hud = document.getElementById('hud');
  const barA = document.getElementById('barA');
  const barM = document.getElementById('barM');
  const barP = document.getElementById('barP');
  const barR = document.getElementById('barR');
  const barB = document.getElementById('barB');
  const barT = document.getElementById('barT');
  const barE = document.getElementById('barE');
  const valueA = document.getElementById('valueA');
  const valueM = document.getElementById('valueM');
  const valueP = document.getElementById('valueP');
  const valueR = document.getElementById('valueR');
  const valueB = document.getElementById('valueB');
  const valueT = document.getElementById('valueT');
  const valueE = document.getElementById('valueE');
  const deltaA = document.getElementById('deltaA');
  const deltaM = document.getElementById('deltaM');
  const deltaP = document.getElementById('deltaP');
  const deltaR = document.getElementById('deltaR');
  const deltaB = document.getElementById('deltaB');
  const deltaT = document.getElementById('deltaT');
  const deltaE = document.getElementById('deltaE');

  const statusBars = [
    { key: 'A', label: '焦虑雾', bar: barA, valueEl: valueA, deltaEl: deltaA },
    { key: 'M', label: '动能', bar: barM, valueEl: valueM, deltaEl: deltaM },
    { key: 'P', label: '复习进度', bar: barP, valueEl: valueP, deltaEl: deltaP },
    { key: 'R', label: '恢复', bar: barR, valueEl: valueR, deltaEl: deltaR },
    { key: 'B', label: '边界感', bar: barB, valueEl: valueB, deltaEl: deltaB },
    { key: 'T', label: '关系温度', bar: barT, valueEl: valueT, deltaEl: deltaT },
    { key: 'E', label: '理解/共情', bar: barE, valueEl: valueE, deltaEl: deltaE },
  ];
  const statusFlashTimers = {};
  const STATUS_FLASH_MS = 800;

  const STATUS_LABELS = new Set(statusBars.map((item) => item.key));
  const DEFAULT_TRIP_STATE = { U: 60, F: 75, C: 80, L: 20, K: 40 };
  const HOMETOWN_TRIP_PATH = ['H00', 'H01', 'H02', 'H03', 'H04', 'H05', 'H06', 'H07', 'H08'];

  const speaker = document.getElementById('speaker');
  const dialogText = document.getElementById('dialogText');
  const hint = document.getElementById('hint');
  const choiceArea = document.getElementById('choiceArea');
  const dialogWrapper = document.getElementById('dialogWrapper');
  const tripPackPanel = document.getElementById('tripPackPanel');
  const tripPackTitle = document.getElementById('tripPackTitle');
  const tripPackHint = document.getElementById('tripPackHint');
  const tripPackList = document.getElementById('tripPackList');
  const tripPackConfirm = document.getElementById('tripPackConfirm');
  const tripStatusPanel = document.getElementById('tripStatusPanel');
  const tripStatusTitle = document.getElementById('tripStatusTitle');
  const tripProgressText = document.getElementById('tripProgressText');
  const tripBarU = document.getElementById('tripBarU');
  const tripBarF = document.getElementById('tripBarF');
  const tripBarC = document.getElementById('tripBarC');
  const tripBarK = document.getElementById('tripBarK');
  const tripValueU = document.getElementById('tripValueU');
  const tripValueF = document.getElementById('tripValueF');
  const tripValueC = document.getElementById('tripValueC');
  const tripValueK = document.getElementById('tripValueK');

  const menuBtn = document.getElementById('menuBtn');
  const storageBtn = document.getElementById('storageBtn');
  const historyBtn = document.getElementById('historyBtn');
  const systemPanel = document.getElementById('systemPanel');
  const storagePanel = document.getElementById('storagePanel');
  const closeSettings = document.getElementById('closeSettings');
  const closeStorage = document.getElementById('closeStorage');

  const toggleFog = document.getElementById('toggleFog');
  const toggleJitter = document.getElementById('toggleJitter');
  const toggleLowFreq = document.getElementById('toggleLowFreq');
  const toggleLargeText = document.getElementById('toggleLargeText');
  const speedSelect = document.getElementById('speedSelect');

  const saveButtons = document.getElementById('saveButtons');
  const loadButtons = document.getElementById('loadButtons');

  const TRIP_PACK_LABELS = {
    U: '旅程余裕',
    F: '体力',
    C: '手机电量',
    L: '行李负担',
    K: '连接感',
  };
  const TRIP_STATUS_METERS = {
    U: { bar: tripBarU, valueEl: tripValueU, label: '旅程余裕' },
    F: { bar: tripBarF, valueEl: tripValueF, label: '体力' },
    C: { bar: tripBarC, valueEl: tripValueC, label: '手机电量' },
    K: { bar: tripBarK, valueEl: tripValueK, label: '连接感' },
  };

  const TRIP_PACKS = {
    H00: {
      title: '行前打包（最多选 3 件）',
      maxSelect: 3,
      next: 'H01',
      items: [
        {
          id: 'routeNote',
          text: '纸质路线单：先确认行程，减少误会',
          tripDelta: { U: 15, K: 2 },
          delta: { B: 4, A: -3 },
        },
        {
          id: 'powerBank',
          text: '充电宝：为黑暗留一口电',
          tripDelta: { C: 22, K: 2, U: 3 },
          delta: { A: -4 },
        },
        {
          id: 'snack',
          text: '补给小零食：给体力留一根支点',
          tripDelta: { F: 8, U: 4 },
          delta: { A: -2 },
        },
        {
          id: 'headphone',
          text: '耳机：减少环境噪音干扰',
          tripDelta: { U: -2, F: 2 },
          delta: { A: -2, M: 2 },
        },
        {
          id: 'photoGift',
          text: '给他的礼物：把关系提前翻译成行动',
          tripDelta: { L: 15, K: -4, F: -3 },
          delta: { T: 4, A: 3, B: 1 },
        },
        {
          id: 'extraNotes',
          text: '带过量复习资料：准备不是不被抛弃',
          tripDelta: { L: 26, U: -12, F: -6 },
          delta: { P: 4, A: 8 },
          note: '高负担会压低体力，慎选。',
        },
      ],
    },
  };

  function resetTripState(target = state) {
    target.trip = { ...DEFAULT_TRIP_STATE };
  }

  function ensureTripState(target = state) {
    if (!target.trip || typeof target.trip !== 'object') {
      resetTripState(target);
      return;
    }

    const next = { ...target.trip };
    Object.keys(DEFAULT_TRIP_STATE).forEach((key) => {
      const value = Number(next[key]);
      next[key] = Number.isFinite(value) ? value : DEFAULT_TRIP_STATE[key];
    });
    target.trip = next;
  }

  function applyTripDelta(target, delta = {}) {
    if (!delta || typeof delta !== 'object') return;
    ensureTripState(target);

    Object.entries(delta).forEach(([key, value]) => {
      if (!Object.prototype.hasOwnProperty.call(DEFAULT_TRIP_STATE, key)) return;
      const num = Number(value);
      if (!Number.isFinite(num)) return;
      const before = Number(target.trip[key]) || 0;
      const next = Math.max(0, Math.min(100, before + Math.round(num)));
      target.trip[key] = next;
    });
  }

  function setHometownTripResult(target, result) {
    target.flags = target.flags || {};
    target.flags.hometownTripResult = result;
    target.flags.hometownTripActive = false;
    target.flags.hometownTripSettled = false;
  }

  function resetHometownTripMetadata(target = state) {
    if (!target.flags) target.flags = {};
    target.flags.hometownTripActive = false;
    target.flags.hometownTripStarted = false;
    target.flags.hometownTripSettled = false;
    target.flags.hometownTripResult = null;
    target.flags.hometownTripScene = null;
    target.flags.hometownTripProgress = 0;
    target.flags.hometownTripCurrentScene = null;
    target.flags.hometownTripOverload = false;
    target.flags.hometownTripFinalTrip = null;
  }

  function markHometownTripStep(target = state, sceneId) {
    if (!target.flags) target.flags = {};
    if (!target.flags.hometownTripActive) {
      target.flags.hometownTripActive = true;
      target.flags.hometownTripStarted = true;
    }

    target.flags.hometownTripCurrentScene = sceneId;
    const index = HOMETOWN_TRIP_PATH.indexOf(sceneId);
    if (index >= 0) {
      target.flags.hometownTripProgress = Math.max(target.flags.hometownTripProgress || 0, index + 1);
    } else {
      target.flags.hometownTripProgress = (target.flags.hometownTripProgress || 0) + 1;
    }
  }

  function clearTripState(target = state) {
    target.trip = null;
    resetHometownTripMetadata(target);
    hideTripStatusPanel(target);
  }

  function beginHometownTrip(target = state) {
    resetTripState(target);
    target.flags = target.flags || {};
    target.flags.hometownTripOverload = false;
    target.flags.hometownTripProgress = 0;
    target.flags.hometownTripCurrentScene = 'H00';
    target.flags.hometownTripFinalTrip = null;
    target.flags.hometownTripActive = true;
    target.flags.hometownTripResult = null;
    target.flags.hometownTripStarted = true;
    target.flags.hometownTripSettled = false;
  }

  function settleHometownTrip(target = state) {
    if (!target.flags || !target.flags.hometownTripResult || target.flags.hometownTripSettled) {
      return false;
    }

    ensureTripState(target);
    const trip = target.trip || DEFAULT_TRIP_STATE;
    const tripProgress = Number(target.flags.hometownTripProgress) || 0;
    const completed = tripProgress >= HOMETOWN_TRIP_PATH.length;
    const delta = {};

    if (!completed || trip.F < 20 || trip.U < 20) {
      target.flags.hometownTripOverload = true;
    }

    if (completed) {
      if (trip.U >= 60) {
        delta.A = (delta.A || 0) - 5;
        delta.M = (delta.M || 0) + 5;
      }
      if (trip.F >= 50) {
        delta.R = (delta.R || 0) + 10;
      }
      if (trip.F < 25) {
        delta.R = (delta.R || 0) - 15;
        delta.A = (delta.A || 0) + 10;
      }
      if (trip.C < 15) {
        delta.A = (delta.A || 0) + 5;
      }
      if (trip.K >= 70) {
        delta.T = (delta.T || 0) + 15;
        delta.E = (delta.E || 0) + 10;
      }
      if (trip.K < 30) {
        delta.T = (delta.T || 0) - 10;
        delta.A = (delta.A || 0) + 10;
      }
      if (target.flags.hometownTripResult === 'warmArrival' && target.values.B >= 60) {
        delta.B = (delta.B || 0) + 10;
        delta.T = (delta.T || 0) + 10;
      }
      delta.M = (delta.M || 0) + 15;
    }

    target.flags.hometownTripFinalTrip = {
      U: trip.U,
      F: trip.F,
      C: trip.C,
      L: trip.L,
      K: trip.K,
    };

    normalizeDelta(target, delta);
    target.flags.hometownTripSettled = true;
    target.flags.hometownTripActive = false;
    target.trip = null;
    return true;
  }

  let currentTripPackConfig = null;

  function hideTripPackPanel() {
    if (!tripPackPanel || !tripPackTitle || !tripPackHint || !tripPackList || !tripPackConfirm) {
      return;
    }

    tripPackPanel.classList.add('hidden');
    tripPackTitle.textContent = '出发前打包';
    tripPackHint.textContent = '点击道具并确认后继续';
    tripPackList.innerHTML = '';
    tripPackConfirm.disabled = true;
    tripPackConfirm.onclick = null;
  }

  function formatSignedDelta(deltaValue) {
    return `${deltaValue > 0 ? '+' : ''}${deltaValue}`;
  }

  function hideTripStatusPanel() {
    if (!tripStatusPanel) return;
    tripStatusPanel.classList.add('hidden');
    if (tripStatusTitle) {
      tripStatusTitle.textContent = '家乡之行 · 临时状态';
    }
    if (tripProgressText) {
      tripProgressText.textContent = '';
    }
  }

  function syncTripStatusPanel(target = state) {
    if (!tripStatusPanel || !tripStatusTitle || !tripProgressText) {
      return;
    }

    if (!target || !target.trip || typeof target.trip !== 'object') {
      hideTripStatusPanel();
      return;
    }

    const hometownStarted = target.flags?.hometownTripStarted;
    const hometownActive = target.flags?.hometownTripActive;
    const hometownSettled = target.flags?.hometownTripSettled;
    if (!hometownStarted && !hometownActive && !hometownSettled) {
      hideTripStatusPanel();
      return;
    }

    ensureTripState(target);
    tripStatusPanel.classList.remove('hidden');
    const progressStep = Number(target.flags?.hometownTripProgress) || 0;
    const progressText = `行程 ${Math.min(progressStep, HOMETOWN_TRIP_PATH.length)}/${HOMETOWN_TRIP_PATH.length} 段`;
    tripProgressText.textContent = progressText;
    tripStatusTitle.textContent = '家乡之行 · 临时状态';

    Object.entries(TRIP_STATUS_METERS).forEach(([key, payload]) => {
      const value = Math.max(0, Math.min(100, Math.round(Number(target.trip[key]) || 0)));
      if (payload.bar) {
        payload.bar.style.setProperty('--t', `${value}%`);
      }
      if (payload.valueEl) {
        payload.valueEl.textContent = `${value}%`;
      }
    });
  }

  function buildTripPackSummary(config, selectedItems) {
    const mainDelta = {};
    const tripDelta = {};
    const selectedNames = [];
    selectedItems.forEach((itemIdOrObj) => {
      const item = itemIdOrObj.id
        ? itemIdOrObj
        : config.items.find((candidate) => candidate.id === itemIdOrObj);
      if (!item) return;

      selectedNames.push(item.text.split('：')[0]);
      Object.entries(item.tripDelta || {}).forEach(([key, value]) => {
        const num = Number(value);
        if (!Number.isFinite(num)) return;
        tripDelta[key] = (tripDelta[key] || 0) + num;
      });
      Object.entries(item.delta || {}).forEach(([key, value]) => {
        const num = Number(value);
        if (!Number.isFinite(num)) return;
        mainDelta[key] = (mainDelta[key] || 0) + num;
      });
    });

    const tripParts = Object.entries(tripDelta)
      .map(([key, value]) => `${TRIP_PACK_LABELS[key]}${formatSignedDelta(value)}`)
      .join('，');
    const mainParts = Object.entries(mainDelta)
      .map(([key, value]) => `${key}${formatSignedDelta(value)}`)
      .join('，');
    const note = tripParts && mainParts
      ? `预计变化：${tripParts}；主线 ${mainParts}`
      : tripParts || mainParts || '暂无明显状态变化';
    return {
      note,
      selectedNames,
    };
  }

  function renderTripPackPanel(packConfig, onConfirm) {
    if (!tripPackPanel || !tripPackTitle || !tripPackHint || !tripPackList || !tripPackConfirm) {
      onConfirm([]);
      return;
    }

    tripPackPanel.classList.remove('hidden');
    tripPackTitle.textContent = packConfig.title || '出发前打包';
    tripPackList.innerHTML = '';
    currentTripPackConfig = {
      packConfig,
      selected: new Set(),
    };

    const maxSelect = Number(packConfig.maxSelect) || 3;

    const updateSummary = () => {
      const selectedNames = Array.from(currentTripPackConfig.selected);
      const selectedItems = packConfig.items.filter((item) => currentTripPackConfig.selected.has(item.id));
      const summary = buildTripPackSummary(packConfig, selectedItems);
      const selectedText = selectedNames.length
        ? `已选 ${selectedNames.length}/${maxSelect} 件：${summary.selectedNames.join('、')}`
        : `请先选 1 到 ${maxSelect} 件道具`;
      tripPackHint.textContent = `${selectedText}。${summary.note}`;
      tripPackConfirm.disabled = selectedNames.length === 0;
    };

    packConfig.items.forEach((item) => {
      const itemBtn = document.createElement('button');
      itemBtn.type = 'button';
      itemBtn.className = 'tripPackBtn';
      itemBtn.setAttribute('aria-pressed', 'false');
      itemBtn.textContent = `${item.text} ${item.note ? `（${item.note}）` : ''}`;
      itemBtn.addEventListener('click', () => {
        const selected = currentTripPackConfig.selected;
        const isSelected = selected.has(item.id);
        if (!isSelected && selected.size >= maxSelect) {
          return;
        }

        if (isSelected) {
          selected.delete(item.id);
          itemBtn.setAttribute('aria-pressed', 'false');
          itemBtn.classList.remove('selected');
        } else {
          selected.add(item.id);
          itemBtn.setAttribute('aria-pressed', 'true');
          itemBtn.classList.add('selected');
        }

        updateSummary();
      });
      tripPackList.appendChild(itemBtn);
    });

    updateSummary();

    tripPackConfirm.onclick = () => {
      if (currentTripPackConfig.selected.size === 0) return;
      if (tripPackConfirm.disabled) return;
      tripPackConfirm.disabled = true;
      const chosen = Array.from(currentTripPackConfig.selected);
      onConfirm(chosen);
      hideTripPackPanel();
    };
  }

  function applyTripPackSelection(config, selectedIds = []) {
    const tripDelta = {};
    const mainDelta = {};
    const names = [];

    selectedIds.forEach((id) => {
      const item = (config.items || []).find((candidate) => candidate.id === id);
      if (!item) return;

      names.push(item.text.split('：')[0]);
      Object.entries(item.tripDelta || {}).forEach(([key, value]) => {
        const num = Number(value);
        if (!Number.isFinite(num)) return;
        tripDelta[key] = (tripDelta[key] || 0) + num;
      });
      Object.entries(item.delta || {}).forEach(([key, value]) => {
        const num = Number(value);
        if (!Number.isFinite(num)) return;
        mainDelta[key] = (mainDelta[key] || 0) + num;
      });
      if (typeof item.onChoose === 'function') {
        item.onChoose(state, selectedIds);
      }
    });

    applyTripDelta(state, tripDelta);
    normalizeDelta(state, mainDelta);

    state.history.push(`→ 打包选择：${names.join('、')}`);
    return config.next || 'H01';
  }

  const scenes = {
    P00: {
      id: 'P00',
      title: '序章 · 电塔合照',
      bg: 'cg/cg_powerline_couple.png',
      lines: [
        '电塔背后白雾慢慢拢起。',
        '她把手机捧到额前，点进那张合照，两个身体很近，彼此却都很冷。',
        '先把指尖慢下来。',
      ],
      choices: [
        { text: '保存合照：先留一盏临时灯', delta: { T: 5, A: 3 }, next: 'P01' },
        { text: '删除合照：先放下旧温度', delta: { B: 5, A: 8 }, next: 'P01' },
        { text: '发给他：先问一句“你在吗”', delta: { T: 3, A: 5, B: 1 }, next: 'P01' },
      ],
    },
    P01: {
      id: 'P01',
      title: '序章 · 未眠宿舍',
      bg: 'backgrounds/bg_dorm_0230.png',
      actor: 'characters/char_smx_daily_sheet.png',
      lines: [
        '凌晨两点半，旧词典亮着蓝光。',
        '她盯着一页又一页回到起点，脑袋先把自己翻译成了“没用”。',
      ],
      choices: [
        { text: '我想靠得更近一点确认他还在', delta: { T: 3, A: 5 }, next: 'P02' },
        { text: '先让它过去：今天我先撑住', delta: { A: 8, B: 2 }, next: 'P02' },
        { text: '把照片里的自己拉回今天', delta: { M: 8, A: -3 }, next: 'P02' },
      ],
    },
    P02: {
      id: 'P02',
      title: '序章 · 未回消息',
      bg: 'ui/ui_phone_frame.png',
      lines: [
        '他没有回。',
        '手机发出轻响，她一秒又一秒把同一页消息往上划。',
      ],
      choices: [
        { text: '反复刷新：先把不安看完再说', delta: { A: 10, R: -5, badLoop: 1 }, next: 'P03' },
        { text: '把手机翻面，先做一个今天任务', delta: { M: 5, R: 3 }, next: 'P03' },
        { text: '写一句今日目标', delta: { M: 8, P: 2 }, next: 'P03' },
      ],
    },
    P03: {
      id: 'P03',
      title: '序章 · 雾中的校园路',
      bg: 'backgrounds/bg_campus_morning_fog.png',
      lines: [
        '她出门时天色像蒙了一层细网。',
        '雾是客观的，还是她把整条路都塞进脑内警报了？',
      ],
      choices: [
        {
          text: '继续前行',
          delta: {},
          next: (state) => {
            state.flags.campusSeen = true;
            if (state.values.A > 60) {
              state.flags.fogInstruction = true;
            }
            return 'C1N01';
          },
        },
      ],
    },
    C1N01: {
      id: 'C1N01',
      title: '第一章 · 专业失语',
      bg: 'backgrounds/bg_library_stack.png',
      actor: 'characters/char_smx_daily_sheet.png',
      lines: [
        '刷子里一条帖子把她看到了底：翻译专业已死。',
        '书页不厚，胃口却空得发响。',
      ],
      choices: [
        { text: '市场不要我', delta: { A: 15, M: -10, badLoop: 1 }, next: 'C1N02' },
        {
          text: '岗位会变，能力还在',
          delta: { M: 10 },
          onChoose: (state) => {
            state.flags.tangchuUnlocked = true;
          },
          next: 'C1N02',
        },
        { text: '先做一件事：下午先做一件', delta: { A: -8, M: 6 }, next: 'C1N02' },
      ],
    },
    C1N02: {
      id: 'C1N02',
      title: '第一章 · 专业失语',
      bg: 'backgrounds/bg_selfstudy_room_cold.png',
      actor: 'characters/char_smx_exam_sheet.png',
      lines: [
        '院校表摊开在桌上，课程编号像一串铁钉。',
        '她把它当地图，但每个格子都像把她往后推。',
      ],
      choices: [
        { text: '继续刷帖：至少不是一个人', delta: { A: 10, P: -2, badLoop: 1 }, next: 'C1N03' },
        { text: '先整理三所院校：先给目标命名', delta: { P: 8, M: 6 }, next: 'C1N03' },
        { text: '只标一个不确定项', delta: { A: -5, M: 5 }, next: 'C1N03' },
      ],
    },
    C1N03: {
      id: 'C1N03',
      title: '第一章 · 家庭回响',
      bg: 'ui/ui_phone_frame.png',
      actor: 'characters/char_mother_avatar.png',
      lines: [
        '妈妈在电话里说：你要照顾好自己。',
        '她知道那句里有担心，也有未表达的焦虑。',
      ],
      choices: [
        { text: '只报喜不报忧', delta: { A: 8, R: -3 }, next: 'C1N04' },
        { text: '说今天状态很差', delta: { B: 5, A: -3 }, next: 'C1N04' },
        { text: '挂掉后又刷了一整夜', delta: { A: 12, R: -8, badLoop: 1 }, next: 'C1N04' },
      ],
    },
    C1N04: {
      id: 'C1N04',
      title: '第一章 · 唐楚',
      bg: 'backgrounds/bg_library_stack.png',
      actor: 'characters/char_tangchu_sheet.png',
      lines: ['唐楚发来一句消息：岗位会变，能力可以换场。', '第一步总比情绪先到。'],
      choices: [
          {
            text: '约她聊二十分钟',
            delta: { P: 5, M: 10 },
            onChoose: (state) => {
              state.flags.tangchuTalk = true;
              state.flags.tangchuUnlocked = true;
            },
            next: 'C1N05',
          },
        { text: '她是不是也很脆弱？', delta: { A: 6 }, next: 'C1N05' },
        { text: '先存下建议', delta: { M: 4 }, next: 'C1N05' },
      ],
    },
    C1N05: {
      id: 'C1N05',
      title: '夜间回看',
      bg: 'cg/cg_translation_note.png',
      lines: ['夜里回看一次：', '把“专业完了”翻成“能力可以换场”，今天先放过自己。'],
      onEnter(state) {
        if ((state.badLoop || 0) >= 3) {
          state.values.A += 5;
        } else {
          state.values.M = Math.min(100, state.values.M + 8);
          state.values.A = Math.max(0, state.values.A - 5);
        }
        state.flags.translationLog = true;
      },
      choices: [{ text: '继续', next: 'C2N01' }],
    },
    C2N01: {
      id: 'C2N01',
      title: '第二章 · 自习室低气压',
      bg: 'backgrounds/bg_selfstudy_room_cold.png',
      actor: 'characters/char_smx_study_sheet.png',
      lines: ['自习室半小时，她只读完两行。', '眼前不是字，是反复出现的“我做不到”。'],
      choices: [
        { text: '我注意力废了', delta: { A: 12, M: -8, badLoop: 1 }, next: 'C2N02' },
        { text: '不是不想，只是太重', delta: { A: -4, M: 7 }, next: 'C2N02' },
        { text: '先做 25 分钟阅读', delta: { M: 10 }, next: 'C2N02' },
      ],
    },
    C2N02: {
      id: 'C2N02',
      title: '第二章 · 学习是否可见',
      bg: 'backgrounds/bg_selfstudy_room_cold.png',
      actor: 'characters/char_smx_exam_sheet.png',
      lines: ['倒计时器像一个小型哨兵，盯着她的每一秒。', '她到底在学，还是在证明自己要学到天亮。'],
      choices: [
        { text: '伪装努力，写到三十页后再睡', delta: { P: 2, A: 5 }, next: 'C2N03' },
        { text: '25 分钟阅读', delta: { P: 10, M: 5 }, next: 'C2N03' },
        { text: '离开喝水并放慢呼吸', delta: { R: 8, A: -8 }, next: 'C2N03' },
      ],
    },
    C2N03: {
      id: 'C2N03',
      title: '第二章 · 空腹与食堂',
      bg: 'backgrounds/bg_cafeteria_grey_noon.png',
      actor: 'characters/char_mother_avatar.png',
      lines: ['她错过了饭点，在空凳边坐下。', '肚子叫得很实，在那一刻不是坏消息。'],
      choices: [
        { text: '不吃直接回去学', delta: { P: 3, R: -12, A: 5, badLoop: 1 }, next: 'C2N04' },
        { text: '吃完再回去', delta: { R: 10, M: 3 }, next: 'C2N04' },
        { text: '发消息给林栀', delta: { R: 5, B: 3 }, next: 'C2N04' },
      ],
    },
    C2N04: {
      id: 'C2N04',
      title: '第二章 · 林栀',
      bg: 'backgrounds/bg_selfstudy_room_cold.png',
      actor: 'characters/char_linzhi_sheet.png',
      lines: ['林栀给她了一杯热水，像给神经递了一根线。', '“先让身体落地，再决定是否复习。”'],
      choices: [
        { text: '接受热水和吐槽', delta: { R: 8, A: -4 }, next: 'C2N05' },
        { text: '嘴硬，说没事', delta: { A: 5 }, next: 'C2N05' },
        { text: '我怕我没路：说出来', delta: { B: 5, M: 5 }, next: 'C2N05' },
      ],
    },
    C2N05: {
      id: 'C2N05',
      title: '夜间回看',
      bg: 'cg/cg_translation_note.png',
      lines: ['她把当天原句改写：今天很乱，但至少今天有下一步。', '明天先做 25 分钟，再决定要不要加码。'],
      choices: [{ text: '继续', next: 'C3N01' }],
    },
    C3N01: {
      id: 'C3N01',
      title: '第三章 · 未读消息',
      bg: 'ui/ui_phone_frame.png',
      lines: ['晚饭取消。', '“今晚展练。”他发了消息后没再打字。'],
      choices: [
        { text: '他不爱我', delta: { A: 12, T: -5 }, next: 'C3N02' },
        { text: '我可以失望，但不自毁', delta: { B: 8, A: -3 }, next: 'C3N02' },
        { text: '他的理想不是我的敌人', delta: { E: 6, A: -2 }, next: 'C3N02' },
      ],
    },
    C3N02: {
      id: 'C3N02',
      title: '第三章 · 雨夜公交站',
      bg: 'backgrounds/bg_bus_stop_rain.png',
      actor: 'characters/char_smx_daily_sheet.png',
      lines: ['伞沿上的雨点像电流，时间在手机信号里发虚。', '她抬头看向站牌，像看一座没写人的地图。'],
      choices: [
        { text: '发长篇质问', delta: { A: 8, T: -10 }, next: 'C3N03' },
        { text: '装没事，先收住', delta: { T: 2, B: -12, A: 10 }, next: 'C3N03' },
        { text: '约 20 分钟电话并说清需求', delta: { B: 12, T: 5 }, next: 'C3N03' },
      ],
    },
    C3N03: {
      id: 'C3N03',
      title: '第三章 · 作品未懂',
      bg: 'backgrounds/bg_deng_studio_chapel.png',
      actor: 'characters/char_dxc_daily_sheet.png',
      lines: ['他发了一个链接，问：听懂了吗？', '她先把呼吸放慢，再做自己的判断。'],
      choices: [
        { text: '认真听后说真实感受', delta: { E: 8, T: 4 }, next: 'C3N04' },
        { text: '敷衍一句“挺好”', delta: { T: 1, B: -3 }, next: 'C3N04' },
        { text: '我现在更需要你听我', delta: { B: 10 }, next: 'C3N04' },
      ],
    },
    C3N04: {
      id: 'C3N04',
      title: '第三章 · 关系边界',
      bg: 'backgrounds/bg_dorm_0230.png',
      actor: 'characters/char_smx_exam_sheet.png',
      lines: ['电话里他聊到作品，她的今天仍在门口。', '她先说出：你先听完我的三分钟。'],
      choices: [
        { text: '继续听', delta: { E: 4, B: -8 }, next: 'C3N05' },
        { text: '打断并说三分钟需求', delta: { B: 12, T: 4 }, next: 'C3N05' },
        { text: '挂断后哭', delta: { A: 10, R: -5, badLoop: 1 }, next: 'C3N05' },
      ],
    },
    C3N05: {
      id: 'C3N05',
      title: '夜间回看',
      bg: 'cg/cg_translation_note.png',
      lines: ['她在回看里写：我需要可见的陪伴，不是无限等待。', '“被冷落”翻成了“我需要明确时间”。'],
      onEnter(state) {
        if (state.values.B >= 45) {
          state.flags.fixedCompanion = true;
        } else {
          state.flags.fixBackfire = true;
        }
      },
      choices: [{ text: '继续', next: 'C4N01' }],
    },
    C4N01: {
      id: 'C4N01',
      title: '第四章 · 模考塌方',
      bg: 'backgrounds/bg_mock_exam_room.png',
      actor: 'characters/char_smx_exam_sheet.png',
      lines: ['模考完后，她把答题卡翻来覆去。', '红字不是结果，像警报灯。'],
      choices: [
        { text: '我肯定考不上', delta: { A: 18, M: -10, badLoop: 1 }, next: 'C4N02' },
        { text: '分数是信息，不是审判', delta: { M: 10, P: 3 }, next: 'C4N02' },
        { text: '先让身体落地', delta: { R: 8, A: -10 }, next: 'C4N02' },
      ],
    },
    C4N02: {
      id: 'C4N02',
      title: '第四章 · 身体化反应',
      bg: 'cg/cg_smx_toilet_panic.png',
      actor: 'characters/char_unknown_crowd_sheet.png',
      lines: ['洗手间里灯光发白，手在抖。', '心跳不等于失败，它只是在提醒：先处理现在。'],
      choices: [
        { text: '继续盯着分数', delta: { A: 12 }, next: 'C4N03' },
        { text: '洗手并做五个物体', delta: { A: -12, R: 6 }, next: 'C4N03' },
        { text: '给林栀发消息', delta: { R: 8, B: 4 }, next: 'C4N03' },
      ],
    },
    C4N03: {
      id: 'C4N03',
      title: '第四章 · 重新回到桌前',
      bg: 'backgrounds/bg_selfstudy_room_cold.png',
      actor: 'characters/char_smx_study_sheet.png',
      lines: ['卷子在桌上，错题像针脚。', '她不是没努力，是今天的身体先在说不行。'],
      choices: [
        { text: '撕掉卷子', delta: { A: 5, P: -5 }, next: 'C4N04' },
        { text: '只复盘三道错题', delta: { P: 10, M: 8 }, next: 'C4N04' },
        { text: '把卷子夹起来明天看', delta: { R: 5, A: -5 }, next: 'C4N04' },
      ],
    },
    C4N04: {
      id: 'C4N04',
      title: '第四章 · 咨询预约',
      bg: 'backgrounds/bg_counseling_corridor.png',
      actor: 'characters/char_counselor_sheet.png',
      lines: ['咨询中心页面停在半天前。', '“先让脚回到地面”一闪而过。'],
      choices: [
        {
          text: '预约咨询',
          delta: { R: 12, M: 5 },
          onChoose: (state) => {
            state.flags.consultation = true;
          },
          next: 'C4N05',
        },
        { text: '收藏页面，不预约', delta: { M: 2 }, next: 'C5N01' },
        { text: '关闭页面', delta: { A: 5 }, next: 'C5N01' },
      ],
    },
    C4N05: {
      id: 'C4N05',
      title: '第四章 · 稳定身体',
      bg: 'backgrounds/bg_counseling_corridor.png',
      actor: 'characters/char_counselor_sheet.png',
      lines: ['咨询老师说：先让明天可执行，再谈人生。', '先写出今天可做的一行。'],
      choices: [{ text: '继续', delta: { R: 10, A: -15 }, next: 'C5N01' }],
    },
    C5N01: {
      id: 'C5N01',
      title: '第五章 · 电子圣礼三号',
      bg: 'backgrounds/bg_deng_studio_chapel.png',
      actor: 'characters/char_dxc_studio_sheet.png',
      lines: ['他发来展演邀请。', '她有想去，也有想把今天留给复习。'],
      choices: [
        { text: '不去就是不支持他', delta: { A: 8, B: -8 }, next: 'C5N02' },
        { text: '支持不等于消失', delta: { B: 10, M: 5 }, next: 'C5N02' },
        { text: '我也想被看见', delta: { B: 8 }, next: 'C5N02' },
      ],
    },
    C5N02: {
      id: 'C5N02',
      title: '第五章 · 展演现场',
      bg: 'cg/cg_dxc_electronic_liturgy.png',
      actor: 'characters/char_dxc_tender_sheet.png',
      lines: ['展演里的电子圣礼很美。', '危险的美不是问题，危险的是被她逼着‘不允许她不舒服’。'],
      choices: [
        { text: '陪展到很晚', delta: { E: 12, T: 5, R: -15, P: -8 }, next: 'C5N03' },
        { text: '去 30 分钟后离开', delta: { E: 6, B: 10, P: 3 }, next: 'C5N03' },
        { text: '不去且冷处理', delta: { B: 2, T: -12 }, next: 'C5N03' },
      ],
    },
    C5N03: {
      id: 'C5N03',
      title: '第五章 · 他问她',
      bg: 'backgrounds/bg_deng_studio_chapel.png',
      actor: 'characters/char_dxc_tender_sheet.png',
      lines: ['“你觉得像不像一种没有神的祷告？”', '先回应作品，也回应自己。'],
      choices: [
        { text: '作品很好，也说自己很累', delta: { E: 8, B: 8, T: 6 }, next: 'C5N04' },
        { text: '只夸作品', delta: { E: 5, B: -5 }, next: 'C5N04' },
        { text: '先说“你是借口”', delta: { T: -10, B: 5 }, next: 'C5N04' },
      ],
    },
    C5N04: {
      id: 'C5N04',
      title: '第五章 · 回程',
      bg: 'backgrounds/bg_bus_stop_rain.png',
      actor: 'characters/char_smx_daily_sheet.png',
      lines: ['回到路上，计划又被打乱。', '她现在有一条线：明天从哪里开始。'],
      choices: [
        { text: '补偿式熬夜', delta: { P: 3, R: -15 }, next: 'C5N05' },
        { text: '明天重排计划', delta: { M: 8, R: 4 }, next: 'C5N05' },
        { text: '发边界说明', delta: { B: 10 }, next: 'C5N05' },
      ],
    },
    C5N05: {
      id: 'C5N05',
      title: '夜间回看',
      bg: 'cg/cg_translation_note.png',
      lines: ['夜里把当天写进小卡片：', '“理想很美，但现实也需要被看见。”'],
      onEnter(state) {
        if (state.values.E >= 55 && state.values.B >= 40) {
          state.flags.lowPrayerHint = true;
        }
      },
      choices: [{ text: '继续', next: 'C6N01' }],
    },
    C6N01: {
      id: 'C6N01',
      title: '第六章 · 电塔下散步',
      bg: 'backgrounds/bg_title_powerline_mist.png',
      actor: 'characters/char_smx_exam_sheet.png',
      lines: ['他们又站在电塔附近。', '她这次先从身体里听起。'],
      choices: [
        { text: '我也许说了也没用', delta: { A: 8, B: -6 }, next: 'C6N02' },
        { text: '我要不被打断地表达', delta: { B: 12, M: 6 }, next: 'C6N02' },
        { text: '我们都在逃避现实', delta: { E: 5, B: 5 }, next: 'C6N02' },
      ],
    },
    C6N02: {
      id: 'C6N02',
      title: '第六章 · 说出身体',
      bg: 'cg/cg_powerline_couple.png',
      actor: 'characters/char_smx_exam_sheet.png',
      lines: ['她把心率、失眠、反复确认说出来。', '他沉默后，第一次没有用沉默盖住问题。'],
      choices: [
        { text: '只说一半又收回', delta: { T: 2, A: 6 }, next: 'C6N03' },
        { text: '完整说出感受', delta: { B: 10, T: 6 }, next: 'C6N03' },
        { text: '转而安慰他', delta: { E: 3, B: -8 }, next: 'C6N03' },
      ],
    },
    C6N03: {
      id: 'C6N03',
      title: '第六章 · 他沉默后',
      bg: 'backgrounds/bg_deng_studio_chapel.png',
      actor: 'characters/char_dxc_tender_sheet.png',
      lines: ['他说：“我以为你懂。”', '这句话像借口，也像窗口。'],
      choices: [
        { text: '我懂不等于不用陪', delta: { B: 12, T: 8 }, next: 'C6N04' },
        { text: '算了，你忙吧', delta: { B: -10, A: 8 }, next: 'C6N04' },
        { text: '你也在怕现实', delta: { E: 8, T: 5 }, next: 'C6N04' },
      ],
    },
    C6N04: {
      id: 'C6N04',
      title: '第六章 · 约定',
      bg: 'backgrounds/bg_rooftop_evening.png',
      lines: ['夜色像压扁的纸。', '陪伴是被安排的，还是被消耗的？'],
      choices: [
        { text: '每周两次固定通话', delta: { T: 10, B: 8 }, next: 'C6N05' },
        { text: '不约定，只靠感觉', delta: { T: 2, A: 5 }, next: 'C6N05' },
        {
          text: '提出暂时拉开距离',
          delta: { B: 15, T: -8 },
          onChoose: (state) => {
            state.flags.distanceUnlocked = true;
          },
          next: 'C6N05',
        },
      ],
    },
    C6N05: {
      id: 'C6N05',
      title: '夜间回看',
      bg: 'cg/cg_translation_note.png',
      lines: ['她把今晚写进一句：', '关系不是天平，不是比赛，先有边界才有稳定。'],
      onEnter(state) {
        if (state.values.B >= 60) {
          state.flags.preExamBoundary = true;
        }
      },
      choices: [{ text: '继续', next: 'C7N01' }],
    },
    C7N01: {
      id: 'C7N01',
      title: '第七章 · 考前夜',
      bg: 'backgrounds/bg_dorm_0230.png',
      actor: 'characters/char_smx_exam_sheet.png',
      lines: ['准考证和两支笔躺在桌角。', '明天会不完美，但今天要有一个不带内耗的选择。'],
      choices: [
        { text: '明天会决定我一辈子', delta: { A: 14 }, next: 'C7N02' },
        { text: '明天只是一次考试', delta: { A: -8, M: 6 }, next: 'C7N02' },
        { text: '害怕也能睡觉', delta: { R: 8, A: -5 }, next: 'C7N02' },
      ],
    },
    C7N02: {
      id: 'C7N02',
      title: '第七章 · 校对请求',
      bg: 'ui/ui_phone_frame.png',
      lines: ['他临时说作品校对有问题，要她帮忙。', '这条消息把关系中的“边界”再次放大。'],
      choices: [
        {
          text: '熬夜帮他',
          delta: { E: 8, T: 5, R: -22, P: -10, B: -10 },
          onChoose: (state) => {
            state.flags.burnoutSacrifice = true;
          },
          next: 'C7N03',
        },
        {
          text: '直接拒绝',
          delta: { B: 12, T: -8, R: 5 },
          onChoose: (state) => {
            state.flags.distanceUnlocked = true;
          },
          next: 'C7N03',
        },
        { text: '帮 15 分钟并设闹钟', delta: { B: 10, T: 4, R: -4 }, next: 'C7N03' },
      ],
    },
    C7N03: {
      id: 'C7N03',
      title: '第七章 · 焦虑翻译',
      bg: 'cg/cg_translation_note.png',
      lines: ['她把“我必须救他”写进纸上。', '然后把字改成“我不能用崩溃换亲密”。'],
      choices: [
        { text: '选择健康翻译', delta: { B: 10, A: -8 }, next: 'C7N04' },
        { text: '选择献祭翻译', delta: { T: 3, B: -12, A: 8 }, onChoose: (state) => (state.flags.burnoutSacrifice = true), next: 'C7N04' },
        { text: '选择冷断翻译', delta: { B: 8, T: -6 }, next: 'C7N04' },
      ],
    },
    C7N04: {
      id: 'C7N04',
      title: '第七章 · 回应',
      bg: 'characters/char_dxc_tender_sheet.png',
      actor: 'characters/char_dxc_tender_sheet.png',
      lines: ['电话那头安静了十秒。', '她第一次听见自己的心跳比噪音更真实。'],
      choices: [
        {
          text: '继续',
          next: (state) => {
            if (state.values.B >= 60 && state.values.E >= 50 && state.values.T >= 35) {
              state.flags.hisResponsibility = true;
            } else if (state.values.B >= 60 && state.values.T < 40) {
              state.flags.sleepProtect = true;
            }
            return 'C7N05';
          },
        },
      ],
    },
    C7N05: {
      id: 'C7N05',
      title: '第七章 · 睡前结算',
      bg: 'backgrounds/bg_dorm_0230.png',
      lines: ['她记录了最终状态。', 'A、M、R、P、B、T、E 都没清零。'],
      onEnter(state) {
        state.flags.endReadied = true;
        if (state.values.A > 85 && state.values.R < 25) {
          state.flags.safetyAlert = true;
        }
      },
      choices: [
        {
          text: '继续主线',
          delta: { M: 4 },
          next: 'END01',
        },
        {
          text: '先去见他（支线）',
          onChoose: (state) => {
            beginHometownTrip(state);
            state.history.push('→ 选择家乡支线');
          },
          next: 'H00',
        },
      ],
    },
    H00: {
      id: 'H00',
      title: '支线 · 行前一夜：打包',
      bg: 'backgrounds/bg_dorm_0230.png',
      actor: 'characters/char_smx_exam_sheet.png',
      onEnter(state) {
        markHometownTripStep(state, 'H00');
      },
      lines: [
        '她把包往床上倒了一圈，试图把可控和不可控分开。',
        '长途不是“去见你”一句话，而是八小时要被自己照顾完。',
      ],
      tripPack: TRIP_PACKS.H00,
    },
    H01: {
      id: 'H01',
      title: '支线 · 学校门口',
      bg: 'backgrounds/bg_campus_morning_fog.png',
      actor: 'characters/char_smx_daily_sheet.png',
      onEnter(state) {
        markHometownTripStep(state, 'H01');
      },
      lines: [
        '出租车门合上的一瞬间，熟悉的灯条被甩在后面。',
        '她先把呼吸放慢到“能走完下一段”的长度。',
      ],
      choices: [
        {
          text: '我太夸张了，为了见他跑这么远',
          tripDelta: { C: -8 },
          delta: { A: 10, B: -5 },
          next: 'H02',
        },
        {
          text: '我有权被认真对待，先到地铁站',
          tripDelta: { B: 10, M: 5 },
          delta: { B: 10, M: 5 },
          next: 'H02',
        },
        {
          text: '不评价整趟人生，先看一次导航',
          tripDelta: { U: 5, C: -2 },
          delta: { A: -5 },
          next: 'H02',
        },
        {
          text: '刷恋爱帖子分散恐惧',
          tripDelta: { C: -12, K: -5 },
          delta: { A: 15, T: -5 },
          next: 'H02',
        },
      ],
    },
    H02: {
      id: 'H02',
      title: '支线 · 地铁去机场',
      bg: 'backgrounds/bg_title_powerline_mist.png',
      actor: 'characters/char_smx_exam_sheet.png',
      onEnter(state) {
        markHometownTripStep(state, 'H02');
      },
      lines: [
        '地铁像一节延长的隧道，节奏稳得可怕。',
        '每一站都在提醒：她只要继续下一格。',
      ],
      choices: [
        {
          text: '背 15 个单词撑过去',
          tripDelta: { F: -5, C: -5 },
          delta: { P: 3 },
          next: 'H03',
        },
        {
          text: '听白噪音闭眼休息',
          tripDelta: { F: 5, A: -8 },
          delta: { A: -8, R: 4 },
          next: 'H03',
        },
        {
          text: '看窗外，借景呼吸',
          tripDelta: { M: 3, A: -5 },
          delta: { M: 3, A: -5 },
          next: 'H03',
        },
        {
          text: '反复看他有没有回',
          tripDelta: { C: -8, A: 10, U: -5 },
          delta: { A: 10 },
          next: 'H03',
        },
      ],
    },
    H03: {
      id: 'H03',
      title: '支线 · 飞机候机',
      bg: 'backgrounds/bg_rooftop_evening.png',
      actor: 'characters/char_dxc_daily_sheet.png',
      onEnter(state) {
        markHometownTripStep(state, 'H03');
      },
      lines: [
        '机场候机像一处放大耐受的走廊，补给、充电和确认同时出现。',
        '她知道如果不主动说清，她只会把不安当成答案。',
      ],
      choices: [
        {
          text: '找充电口，把电量补到位',
          tripDelta: { C: 30 },
          delta: { A: -4, M: 3 },
          next: 'H04',
        },
        {
          text: '候机椅坐下，先把呼吸变慢',
          tripDelta: { F: 10, A: -5 },
          delta: { R: 6 },
          next: 'H04',
        },
        {
          text: '给他发一句到机场了，我有点久站',
          tripDelta: { K: 10, C: -6 },
          delta: { B: 4 },
          next: 'H04',
        },
        {
          text: '不停盯登机口屏，越看越焦躁',
          tripDelta: { U: 10, A: 5, C: -4 },
          delta: { A: 5 },
          next: 'H04',
        },
      ],
    },
    H04: {
      id: 'H04',
      title: '支线 · 飞机',
      bg: 'backgrounds/bg_title_powerline_mist.png',
      actor: 'characters/char_smx_exam_sheet.png',
      onEnter(state) {
        markHometownTripStep(state, 'H04');
      },
      lines: [
        '飞机不能联网，关系也不能被即时确认。',
        '她开始把每一段想法写下来，而不是拿自己的价值去换一句“他在吗”。',
      ],
      choices: [
        {
          text: '睡一会儿，给自己补一段体力',
          tripDelta: { F: 20, A: -5 },
          delta: { A: -5, R: 6 },
          next: 'H05',
        },
        {
          text: '看考研资料，白天在空中也得努力',
          tripDelta: { F: -10 },
          delta: { P: 5 },
          next: 'H05',
        },
        {
          text: '写一封不一定发出去的信',
          tripDelta: { B: 10, M: 10 },
          delta: { B: 8, M: 4 },
          next: 'H05',
        },
        {
          text: '想象最坏结果，替自己加码惩罚',
          tripDelta: { A: 20, F: -2 },
          delta: { A: 15 },
          next: 'H05',
        },
      ],
    },
    H05: {
      id: 'H05',
      title: '支线 · 目的省份机场',
      bg: 'backgrounds/bg_exam_gate_dawn.png',
      actor: 'characters/char_smx_study_sheet.png',
      onEnter(state) {
        markHometownTripStep(state, 'H05');
      },
      lines: [
        '下了飞机，机场入口像另一套规则。',
        '手机电量和心跳都掉了一个档，下一站她要开始靠自己走出来。',
      ],
      choices: [
        {
          text: '先联系他，确认接站和车次',
          tripDelta: { C: -8, K: 10 },
          delta: { B: 2, T: 2 },
          next: 'H06',
        },
        {
          text: '先去地铁口再联系，别把电掉太快',
          tripDelta: { U: 5, C: -3 },
          delta: { A: -4 },
          next: 'H06',
        },
        {
          text: '原地慌十分钟：越等越累',
          tripDelta: { U: -10, A: 10 },
          delta: { A: 10 },
          next: 'H06',
        },
        {
          text: '问工作人员问路，先把方向定下来',
          tripDelta: { U: 10, M: 5, A: -5 },
          delta: { B: 6, M: 4 },
          next: 'H06',
        },
      ],
    },
    H06: {
      id: 'H06',
      title: '支线 · 地铁去火车站',
      bg: 'backgrounds/bg_library_stack.png',
      actor: 'characters/char_smx_daily_sheet.png',
      onEnter(state) {
        markHometownTripStep(state, 'H06');
      },
      lines: [
        '第二段地铁更慢更挤，肩带开始摩擦。',
        '她开始知道，关系要落地，不是为了消解每一份恐慌。',
      ],
      choices: [
        {
          text: '靠边站稳，闭眼听报站',
          tripDelta: { F: 5, A: -5 },
          delta: { A: -5, R: 3 },
          next: 'H07',
        },
        {
          text: '继续背单词，先把复习做完',
          tripDelta: { F: -8 },
          delta: { P: 3, A: 4 },
          next: 'H07',
        },
        {
          text: '给他发一句“我现在很累”',
          tripDelta: { B: 5, K: 10 },
          delta: { B: 5, T: 2 },
          next: 'H07',
        },
        {
          text: '刷短视频麻痹自己',
          tripDelta: { C: -12, A: -3 },
          delta: { A: -3 },
          next: 'H07',
        },
      ],
    },
    H07: {
      id: 'H07',
      title: '支线 · 火车开往家乡附近',
      bg: 'backgrounds/bg_rooftop_evening.png',
      actor: 'characters/char_dxc_tender_sheet.png',
      onEnter(state) {
        markHometownTripStep(state, 'H07');
      },
      lines: [
        '火车开出城市，窗外先是水泥，再是树，再是低矮房子。',
        '她第一次敢把“快到了”当成一种可以停下来的许可。',
      ],
      choices: [
        {
          text: '睡一会儿，给自己补一段体力',
          tripDelta: { F: 15, A: -5 },
          delta: { R: 2 },
          next: 'H08',
        },
        {
          text: '看窗外，呼吸和节奏一起变慢',
          tripDelta: { M: 10, A: -15 },
          delta: { M: 4, A: -15 },
          next: 'H08',
        },
        {
          text: '写下“我已经走到这里了”',
          tripDelta: { M: 15, A: -2 },
          delta: { M: 5 },
          next: 'H08',
        },
        {
          text: '给他发窗外照片，先试一次温和接近',
          tripDelta: { T: 5, K: 5 },
          delta: { T: 5 },
          next: 'H08',
        },
      ],
    },
    H08: {
      id: 'H08',
      title: '支线 · 小站见面',
      bg: 'backgrounds/bg_bus_stop_rain.png',
      actor: 'characters/char_dxc_tender_sheet.png',
      onEnter(state) {
        markHometownTripStep(state, 'H08');
      },
      lines: [
        '站台的风比消息更冷，出站口却亮着一盏黄灯。',
        '她把一句开场话放轻：今天我先把自己的状态放在前面。',
      ],
      choices: [
        {
          text: '他在出站口等我，先把今天收起来',
          tripDelta: { K: 20, F: 4, U: 4, C: -2 },
          delta: { T: 15, B: 10, E: 8, R: 5 },
          onChoose: (state) => {
            setHometownTripResult(state, 'warmArrival');
            state.flags.hometownTripScene = 'warm';
          },
          next: 'END01',
        },
        {
          text: '他说“到时候看吧”，我先自己订房',
          tripDelta: { K: -12, F: 2, U: -2 },
          delta: { B: 12, A: 2, R: 6 },
          onChoose: (state) => {
            setHometownTripResult(state, 'selfCare');
            state.flags.hometownTripScene = 'selfCare';
          },
          next: 'END01',
        },
        {
          text: '他先带我去吃点饭再休息',
          tripDelta: { K: 10, F: 6, U: 4 },
          delta: { T: 8, B: 5, R: 4 },
          onChoose: (state) => {
            setHometownTripResult(state, 'warmArrival');
            state.flags.hometownTripScene = 'warm';
          },
          next: 'END01',
        },
        {
          text: '我今天真的很累，先休息',
          tripDelta: { K: -8, F: 4, U: 3 },
          delta: { B: 15, A: 2 },
          onChoose: (state) => {
            setHometownTripResult(state, 'selfCare');
            state.flags.hometownTripScene = 'selfCare';
          },
          next: 'END01',
        },
      ],
    },
    END01: {
      id: 'END01',
      title: '终章 · 雾线之后',
      bg: 'backgrounds/bg_exam_gate_dawn.png',
      onEnter(state) {
        settleHometownTrip(state);
      },
      lines: ['考试清晨，雾线边缘有一点暖黄。', '她听见自己：害怕还是会来，但我先走出门。'],
      choices: [
        { text: '我还是害怕', delta: { A: 3 }, next: 'END02' },
        { text: '害怕也能出门', delta: { M: 8 }, next: 'END02' },
        { text: '我带着雾往前走', delta: { M: 10, A: -5 }, next: 'END02' },
      ],
    },
    END02: {
      id: 'END02',
      title: '终章 · 结局前夜',
      bg: 'cg/cg_exam_morning_hands.png',
      lines: ['她的掌心仍发抖。', '这一次选一个离开的方式。'],
      choices: [
        {
          text: '先进入考场',
          delta: { P: 5 },
          next: (state) => {
            state.flags.endPath = 'exam';
            return 'END03';
          },
        },
        {
          text: '先去安全点',
          delta: { R: 8 },
          next: (state) => {
            state.flags.endPath = 'safe';
            return 'END03';
          },
        },
        {
          text: '给他留言后关机',
          delta: { B: 5 },
          next: (state) => {
            state.flags.endPath = 'note';
            return 'END03';
          },
        },
      ],
    },
    END03: {
      id: 'END03',
      title: '终章 · 结局',
      bg: 'cg/cg_ending_new_page.png',
      end: true,
      lines: [],
      onEnter(state) {
        const ending = getEnding(state);
        state.flags.ending = ending;
      },
      choices: [{ text: '重新开始', next: 'P00' }],
    },
  };

  const ENDINGS = {
    hometownArrival: {
      title: '《长路抵达》',
      image: 'cg/cg_ending_low_prayer.png',
      lines: [
        '她走完了长路，却没把自己推着过线，',
        '而是把每一段路都当作“照顾自己也能去见你”。',
        '这条线没有神化任何人，只把可承接的关系放在现实里。',
      ],
    },
    hometownArrivalWarm: {
      title: '《热水和出站口》',
      image: 'cg/cg_ending_foglamp.png',
      lines: [
        '他不再只说抽象情绪，而是具体接住她的疲惫。',
        '热水、面包和一段可以继续的呼吸，',
        '让她确信：被看到，往往先从“先休息”开始。',
      ],
    },
    hometownSelfCare: {
      title: '《到达，但不献祭》',
      image: 'cg/cg_ending_foglamp.png',
      lines: [
        '她到站了，也不把今天变成证明。',
        '她可以先关掉自己，不再把情绪硬扛。',
        '下一段路由她决定走法和节奏。',
      ],
    },
    hometownOverload: {
      title: '《过载抵达》',
      image: 'cg/cg_ending_poweroff.png',
      lines: [
        '她几乎没有力气继续解释。',
        '这趟路没有赢，没有输，只是把过载从“必须证明”换成了“先让身体有边界”。',
        '她还在途中，今天先回到自己身边。',
      ],
    },
    fogLamp: {
      title: '《雾灯》',
      image: 'cg/cg_ending_foglamp.png',
      lines: [
        '她没有全然变强，只是把恐惧从“不能继续”降为“可以先走”。',
        '复习没变神话，但她开始把焦虑留在雾里，而不是放大在自己身上。',
        '她不是停住了，是有意识地往前一步。',
      ],
    },
    lowPrayer: {
      title: '《低频祷告》',
      image: 'cg/cg_ending_low_prayer.png',
      lines: [
        '他也把作品放下几秒，试着听她的句子。', '理想与关系不必互斥。', '她学会了把现实放进高压线下的日常里。',
      ],
    },
    powerOff: {
      title: '《断电自救》',
      image: 'cg/cg_ending_poweroff.png',
      lines: [
        '她不是不爱他，她先把电源放回自己。', '先把边界说清，再谈被看见。', '下一次对话从“能不能”变成“我需要”。',
      ],
    },
    stopMarch: {
      title: '《停在三月》',
      image: 'cg/cg_ending_march_loop.png',
      lines: [
        '今天她没有跑动，也没有崩坏。', '雾很重，恢复仍低，循环还在。', '但她仍能写下：明天只做十分钟。',
      ],
    },
    newPage: {
      title: '《旧词典新页》',
      image: 'cg/cg_ending_new_page.png',
      lines: [
        '她把旧能力重新贴上用途：语言、判断、表达。', '考研不再是“证明人生”的唯一出口。', '她开始把旧词典翻开，而不是当作审判。',
      ],
    },
  };

  const state = {
    current: 'P00',
    lineIndex: 0,
    flags: {},
    trip: null,
    history: [],
    badLoop: 0,
    values: {
      A: 52,
      M: 38,
      P: 24,
      R: 42,
      B: 30,
      T: 55,
      E: 25,
    },
    settings: {
      fog: true,
      jitter: true,
      lowFreq: true,
      largeText: false,
      speed: 'normal',
    },
    running: false,
    ended: false,
  };

  let imageCache = {};
  let rafId;
  let pressTimer;

  const ASSET_REMAP = {
    // Transparent characters from the整改包
    'characters/char_smx_daily_sheet.png': 'fix_patch/characters_transparent/char_smx_daily_sheet.png',
    'characters/char_smx_pinkcoat_sheet.png': 'fix_patch/characters_transparent/char_smx_pinkcoat_sheet.png',
    'characters/char_smx_study_sheet.png': 'fix_patch/characters_transparent/char_smx_study_sheet.png',
    'characters/char_smx_exam_sheet.png': 'fix_patch/characters_transparent/char_smx_exam_sheet.png',
    'characters/char_dxc_daily_sheet.png': 'fix_patch/characters_transparent/char_dxc_daily_sheet.png',
    'characters/char_dxc_studio_sheet.png': 'fix_patch/characters_transparent/char_dxc_studio_sheet.png',
    'characters/char_dxc_tender_sheet.png': 'fix_patch/characters_transparent/char_dxc_tender_sheet.png',
    'characters/char_linzhi_sheet.png': 'fix_patch/characters_transparent/char_linzhi_sheet.png',
    'characters/char_tangchu_sheet.png': 'fix_patch/characters_transparent/char_tangchu_sheet.png',
    'characters/char_counselor_sheet.png': 'fix_patch/characters_transparent/char_counselor_sheet.png',
    'characters/char_unknown_crowd_sheet.png': 'fix_patch/characters_transparent/char_unknown_crowd_sheet.png',
    'characters/char_mother_avatar.png': 'fix_patch/characters_transparent/char_mother_avatar.png',

    // Hometown/mainline backgrounds remapped to 中国考研整改包
    'backgrounds/bg_dorm_0230.png': 'fix_patch/backgrounds_china_kaoyan/bg_rental_room_night.png',
    'backgrounds/bg_campus_morning_fog.png': 'fix_patch/backgrounds_china_kaoyan/bg_campus_lake_evening.png',
    'backgrounds/bg_library_stack.png': 'fix_patch/backgrounds_china_kaoyan/bg_kaoyan_selfstudy_hall.png',
    'backgrounds/bg_selfstudy_room_cold.png': 'fix_patch/backgrounds_china_kaoyan/bg_kaoyan_selfstudy_hall.png',
    'backgrounds/bg_cafeteria_grey_noon.png': 'fix_patch/backgrounds_china_kaoyan/bg_offcampus_teashop.png',
    'backgrounds/bg_bus_stop_rain.png': 'fix_patch/backgrounds_china_kaoyan/bg_train_station_platform_winter.png',
    'backgrounds/bg_deng_studio_chapel.png': 'fix_patch/backgrounds_china_kaoyan/bg_translation_lab.png',
    'backgrounds/bg_mock_exam_room.png': 'fix_patch/backgrounds_china_kaoyan/bg_postgrad_registration_office.png',
    'backgrounds/bg_rooftop_evening.png': 'fix_patch/backgrounds_china_kaoyan/bg_subway_home.png',
    'backgrounds/bg_counseling_corridor.png': 'fix_patch/backgrounds_china_kaoyan/bg_translation_lab.png',
    'backgrounds/bg_exam_gate_dawn.png': 'fix_patch/backgrounds_china_kaoyan/bg_kaoyan_exam_gate_china.png',
    'backgrounds/bg_title_powerline_mist.png': 'fix_patch/backgrounds_china_kaoyan/bg_china_university_library_winter.png',

    // CG 映射：优先使用最新考研修正版替代旧语境CG
    'cg/cg_powerline_couple.png': 'fix_patch/cg_china_kaoyan/cg_bus_stop_argument.png',
    'cg/cg_translation_note.png': 'fix_patch/cg_china_kaoyan/cg_consultation_breathing.png',
    'cg/cg_dxc_electronic_liturgy.png': 'fix_patch/cg_china_kaoyan/cg_kaoyan_admission_ticket.png',
    'cg/cg_smx_toilet_panic.png': 'fix_patch/cg_china_kaoyan/cg_first_freelance_payment.png',
    'cg/cg_exam_morning_hands.png': 'fix_patch/cg_china_kaoyan/cg_consultation_breathing.png',
    'cg/cg_ending_new_page.png': 'fix_patch/cg_china_kaoyan/cg_first_freelance_payment.png',
    'cg/cg_ending_low_prayer.png': 'fix_patch/cg_china_kaoyan/cg_consultation_breathing.png',
    'cg/cg_ending_foglamp.png': 'fix_patch/cg_china_kaoyan/cg_kaoyan_admission_ticket.png',
    'cg/cg_ending_poweroff.png': 'fix_patch/cg_china_kaoyan/cg_reserved_blank_slot.png',
    'cg/cg_ending_march_loop.png': 'fix_patch/cg_china_kaoyan/cg_bus_stop_argument.png',
  };

  const HOMETOWN_REMAP_PATHS = [
    'fix_patch/characters_transparent/char_smx_exam_sheet.png',
    'fix_patch/characters_transparent/char_smx_daily_sheet.png',
    'fix_patch/characters_transparent/char_dxc_daily_sheet.png',
    'fix_patch/characters_transparent/char_dxc_tender_sheet.png',
    'fix_patch/backgrounds_china_kaoyan/bg_rental_room_night.png',
    'fix_patch/backgrounds_china_kaoyan/bg_campus_lake_evening.png',
    'fix_patch/backgrounds_china_kaoyan/bg_subway_home.png',
    'fix_patch/backgrounds_china_kaoyan/bg_kaoyan_exam_gate_china.png',
    'fix_patch/backgrounds_china_kaoyan/bg_kaoyan_selfstudy_hall.png',
    'fix_patch/backgrounds_china_kaoyan/bg_train_station_platform_winter.png',
    'fix_patch/cg_china_kaoyan/cg_first_freelance_payment.png',
  ];

  function resolveImagePath(path) {
    const mapped = ASSET_REMAP[path] || path;
    return `assets/images/${mapped}`;
  }

  function isPortraitLayout() {
    return true;
  }

  function isMobileTouchPointerLayout() {
    return false;
  }

  function hidePortraitLock() {
    return;
  }

  function showPortraitLockHint() {
    hidePortraitLock();
  }

  function enterPlayMode() {
    titleScreen.classList.add('hidden');
    titleScreen.setAttribute('aria-hidden', 'true');
    titleScreen.setAttribute('inert', '');
    titleScreen.style.pointerEvents = 'none';
  }

  function loadImage(path) {
    if (imageCache[path]?.status === 'ready' || imageCache[path]?.status === 'error') {
      return Promise.resolve(imageCache[path].img);
    }
    if (imageCache[path]?.promise) {
      return imageCache[path].promise;
    }

    const entry = { status: 'loading', img: null, promise: null };
    entry.promise = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        entry.status = 'ready';
        entry.img = img;
        resolve(img);
      };
      img.onerror = () => {
        entry.status = 'error';
        entry.img = null;
        resolve(null);
      };
      img.src = path;
    });
    imageCache[path] = entry;
    return entry.promise;
  }

  function getStateFromSnapshot(snapshot) {
    if (!snapshot || snapshot.v !== STORAGE_VERSION) return false;
    Object.assign(state, {
      current: snapshot.current || 'P00',
      lineIndex: snapshot.lineIndex || 0,
      badLoop: snapshot.badLoop || 0,
      values: snapshot.values || state.values,
      flags: snapshot.flags || {},
      trip: snapshot.trip || null,
      history: snapshot.history || [],
      settings: { ...state.settings, ...(snapshot.settings || {}) },
      running: false,
      ended: false,
    });
    ensureTripState(state);
    return true;
  }

  function makeSnapshot() {
    return {
      v: STORAGE_VERSION,
      current: state.current,
      lineIndex: state.lineIndex,
      badLoop: state.badLoop,
      values: state.values,
      flags: state.flags,
      trip: state.trip,
      history: state.history,
      settings: state.settings,
      ts: Date.now(),
    };
  }

  function save(slot = 'auto') {
    const key = slot === 'auto' ? AUTO_SLOT : saveKey(slot);
    const payload = JSON.stringify(makeSnapshot());
    try {
      localStorage.setItem(key, payload);
    } catch (err) {
      console.error('存档失败', err);
    }
  }

  function load(slot = 'auto') {
    const key = slot === 'auto' ? AUTO_SLOT : saveKey(slot);
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    try {
      const payload = JSON.parse(raw);
      return getStateFromSnapshot(payload);
    } catch (err) {
      console.error('读取存档失败', err);
      return false;
    }
  }

  function clampValues() {
    Object.keys(state.values).forEach((key) => {
      const v = Number(state.values[key]);
      state.values[key] = Math.max(0, Math.min(100, Math.round(v || 0)));
    });
    if (state.trip) {
      ensureTripState(state);
      Object.keys(state.trip).forEach((key) => {
        const v = Number(state.trip[key]);
        state.trip[key] = Math.max(0, Math.min(100, Math.round(v || 0)));
      });
    }
  }

  function normalizeDelta(stateItem, delta) {
    if (!delta) return [];
    const changed = [];

    Object.entries(delta).forEach(([key, value]) => {
      if (key === 'badLoop') {
        state.badLoop = Math.max(0, (state.badLoop || 0) + value);
        return;
      }

      if (typeof value === 'number' && Object.prototype.hasOwnProperty.call(state.values, key)) {
        const before = Number(state.values[key]) || 0;
        const normalized = Number.isFinite(value) ? Math.round(value) : 0;
        const next = Math.max(0, Math.min(100, before + normalized));
        const clamped = Math.round(next);
        if (clamped !== before || normalized !== 0) {
          changed.push({ key, delta: normalized, before, changed: clamped !== before });
        }
        state.values[key] = clamped;
      }
    });

    clampValues();
    if (changed.length > 0) {
      syncBars(changed);
    } else {
      syncBars();
    }
    return changed;
  }

  function getEnding() {
    const values = state.values;
    const hometownProgress = Number(state.flags.hometownTripProgress) || 0;
    const tripResult = state.flags.hometownTripResult;
    const trip = state.flags.hometownTripFinalTrip || state.trip || DEFAULT_TRIP_STATE;

    if (tripResult) {
      if (hometownProgress < HOMETOWN_TRIP_PATH.length) {
        return ENDINGS.hometownOverload;
      }
      if (state.flags.hometownTripOverload || values.A > 85 || trip.F < 20) {
        return ENDINGS.hometownOverload;
      }
      if (tripResult === 'warmArrival' && values.T >= 60 && trip.K >= 75) {
        return ENDINGS.hometownArrivalWarm;
      }
      if (tripResult === 'warmArrival') {
        return ENDINGS.hometownArrival;
      }
      if (tripResult === 'selfCare') {
        return ENDINGS.hometownSelfCare;
      }
    }

    if (
      (values.A >= 85 && values.R <= 25)
      || (state.badLoop >= 3 && !state.flags.consultation)
      || (state.flags.burnoutSacrifice && values.R <= 20)
    ) {
      return ENDINGS.stopMarch;
    }
    if ((state.flags.distanceUnlocked && values.B >= 70) || (values.B >= 70 && values.T < 50)) {
      return ENDINGS.powerOff;
    }
    if (
      (state.flags.fixedCompanion || state.flags.lowPrayerHint || state.flags.hisResponsibility)
      && values.T >= 65
      && values.B >= 60
      && values.E >= 55
      && !state.flags.burnoutSacrifice
    ) {
      return ENDINGS.lowPrayer;
    }
    if (state.flags.tangchuUnlocked && values.P >= 55 && values.M >= 55 && values.B >= 45) {
      return ENDINGS.newPage;
    }
    if (values.P >= 60 && values.M >= 55 && values.R >= 40 && values.A < 80) {
      return ENDINGS.fogLamp;
    }
    if (values.B >= 60) {
      return values.P >= 55 ? ENDINGS.fogLamp : ENDINGS.powerOff;
    }
    return ENDINGS.stopMarch;
  }

  function syncBars(changes = []) {
    const requestedDeltaLookup = Object.create(null);
    const effectiveDeltaLookup = Object.create(null);

    for (const item of changes || []) {
      const { key, delta, changed = false } = item;
      if (key && STATUS_LABELS.has(key)) {
        const requestedDelta = Number.isFinite(delta) ? Math.round(delta) : 0;
        requestedDeltaLookup[key] = requestedDelta;
        if (changed) {
          effectiveDeltaLookup[key] = requestedDelta;
        }
      }
    }

    statusBars.forEach((item) => {
      const { key, bar, valueEl, deltaEl } = item;
      if (!bar) return;

      const meter = bar.parentElement;
      const value = Math.round(Number(state.values[key] || 0));
      bar.style.setProperty('--v', `${value}%`);
      if (valueEl) {
        valueEl.textContent = `${value}%`;
      }

      const hasDeltaForKey = Object.prototype.hasOwnProperty.call(requestedDeltaLookup, key);
      const requestedDelta = Number.isFinite(requestedDeltaLookup[key]) ? requestedDeltaLookup[key] : 0;
      if (!hasDeltaForKey || !deltaEl || !meter) {
        if (!statusFlashTimers[key]) {
          if (deltaEl) deltaEl.textContent = '';
          bar.removeAttribute('data-delta');
          meter.classList.remove('changed', 'statusFlash', 'statusUp', 'statusDown');
        }
        return;
      }

      const deltaText = requestedDelta > 0 ? `+${requestedDelta}` : `${requestedDelta}`;
      bar.setAttribute('data-delta', deltaText);
      deltaEl.textContent = `${deltaText}%`;
      meter.classList.remove('statusUp', 'statusDown');
      if (requestedDelta > 0) {
        meter.classList.add('statusUp');
      } else if (requestedDelta < 0) {
        meter.classList.add('statusDown');
      }

      meter.classList.add('changed', 'statusFlash');
      if (!Object.prototype.hasOwnProperty.call(effectiveDeltaLookup, key) && requestedDelta !== 0) {
        meter.classList.add('statusClamp');
      } else {
        meter.classList.remove('statusClamp');
      }

      if (statusFlashTimers[key]) {
        clearTimeout(statusFlashTimers[key]);
      }
      statusFlashTimers[key] = window.setTimeout(() => {
        meter.classList.remove('statusFlash');
        meter.classList.remove('changed');
        meter.classList.remove('statusUp', 'statusDown', 'statusClamp');
        bar.removeAttribute('data-delta');
        if (deltaEl) {
          deltaEl.textContent = '';
        }
        statusFlashTimers[key] = 0;
      }, STATUS_FLASH_MS);
    });
  }

  function applySceneIntro(scene) {
    if (scene.onEnter) {
      scene.onEnter(state);
    }
  }

  function loadScene(id) {
    const scene = scenes[id];
    if (!scene) return;

    state.current = id;
    state.lineIndex = 0;

    const sceneToRender = scene.end ? { ...scene } : scene;
    if (sceneToRender.end) {
      const ending = getEnding();
      sceneToRender.title = ending.title;
      sceneToRender.bg = ending.image;
      sceneToRender.lines = ending.lines.slice();
      state.flags.ending = ending;
    }

    applySceneIntro(sceneToRender);

    if (sceneToRender.onEnter && sceneToRender.onEnter !== scene.onEnter) {
      sceneToRender.onEnter(state);
    }

    if (!state.ended && scene.end) {
      state.ended = true;
      state.flags.ending = getEnding();
    }

    renderChoiceArea();
    showScene();
    save('auto');
  }

  function showScene() {
    const scene = scenes[state.current];
    if (!scene) return;

    const currentScene = scene.end ? { ...scene } : scene;
    if (currentScene.end) {
      const ending = state.flags.ending || getEnding();
      currentScene.title = ending.title;
      currentScene.bg = ending.image;
      currentScene.lines = ending.lines;
    }

    const line = currentScene.lines[state.lineIndex] || '';
    speaker.textContent = currentScene.title;
    dialogText.textContent = line;
    const hasTripPackAction = Boolean(currentScene.tripPack);
    hint.textContent = (hasTripPackAction && state.lineIndex >= currentScene.lines.length - 1)
      ? '选择道具后继续'
      : currentScene.choices?.length && state.lineIndex >= currentScene.lines.length - 1
      ? '选择一项继续'
      : '点按对话框继续';
    dialogText.classList.toggle('large', state.settings.largeText);

    syncBars();
    syncTripStatusPanel(scene);
    if (state.history && (line || currentScene.lines.length === 0)) {
      if (state.lineIndex === 0) {
        if (scene.end) {
          const ending = state.flags.ending || getEnding();
          state.history.push(`【${ending.title}】${line}`);
        } else {
          state.history.push(`【${currentScene.title}】${line}`);
        }
      }
    }

    render();
    if (state.lineIndex >= currentScene.lines.length - 1) {
      renderChoiceArea();
    }
  }

  function nextLine() {
    const scene = scenes[state.current];
    if (!scene || scene.end) return;
    const lines = scene.lines || [];
    if (state.lineIndex < lines.length - 1) {
      state.lineIndex += 1;
      showScene();
    }
  }

  function renderChoiceArea() {
    hideTripPackPanel();
    choiceArea.innerHTML = '';
    const scene = scenes[state.current];
    if (!scene) return;

    if (scene.tripPack) {
      const tripPackConfig = TRIP_PACKS[scene.id] || scene.tripPack;
      if (tripPackConfig) {
        renderTripPackPanel(tripPackConfig, (selectedIds) => {
          const next = applyTripPackSelection(tripPackConfig, selectedIds);
          loadScene(next || 'END03');
        });
      }
      return;
    }

    if (scene.end && scene.lines.length > 0 && state.lineIndex < scene.lines.length - 1) {
      return;
    }

    if (!scene.choices || !scene.choices.length || state.current === 'END03' && state.flags.endingShown) {
      return;
    }

    if (state.current === 'END03') {
      state.flags.endingShown = true;
    }

    for (const option of scene.choices) {
      const button = document.createElement('button');
      button.className = 'choiceBtn';
      button.textContent = option.text;
      button.addEventListener('click', async () => {
        const sceneBefore = scenes[state.current];
        const delta = option.delta || {};
        const tripDelta = option.tripDelta || {};
        normalizeDelta(state, delta);
        applyTripDelta(state, tripDelta);
        if (option.onChoose) option.onChoose(state);
        if (option.flagSet) {
          state.flags[option.flagSet] = true;
        }

        if (option.text) {
          state.history.push(`→ ${option.text}`);
        }

        const next = typeof option.next === 'function' ? option.next(state) : option.next;
        if (sceneBefore.end || option.text === '重新开始') {
          if (option.text === '重新开始') {
            resetGame();
            return;
          }
        }
        loadScene(next || 'END03');
      });
      choiceArea.appendChild(button);
    }
  }

  function chooseStorageSlot(slot) {
    state.current = 'P00';
    state.lineIndex = 0;
    state.values = { A: 52, M: 38, P: 24, R: 42, B: 30, T: 55, E: 25 };
    state.flags = {};
    clearTripState();
    state.badLoop = 0;
    state.history = [];
    state.ended = false;
    state.flags.endingShown = false;
    state.running = true;
    state.ended = false;
    loadScene(state.current);
    storagePanel.classList.add('hidden');
    systemPanel.classList.add('hidden');
  }

  function resetGame(targetScene = 'P00', options = {}) {
    state.current = targetScene || 'P00';
    state.lineIndex = 0;
    state.values = { A: 52, M: 38, P: 24, R: 42, B: 30, T: 55, E: 25 };
    state.flags = {};
    clearTripState();
    state.history = [];
    state.badLoop = 0;
    state.ended = false;
    state.flags.endingShown = false;
    if (options.hometownTrip) {
      state.current = 'H00';
      beginHometownTrip(state);
    }
    loadScene(state.current);
  }

  function startHometownBranchQuick() {
    if (state.running) return;
    resetGame('H00', { hometownTrip: true });
    state.running = true;
    enterPlayMode();
    hud.classList.remove('hidden');
    preloadScene(state.current).then(() => loadScene(state.current));
    renderLoop();
  }

  function render() {
    const scene = scenes[state.current];
    const activeScene = scene
      ? scene.end
        ? { ...scene, bg: (state.flags.ending || getEnding()).image, lines: (state.flags.ending || getEnding()).lines }
        : scene
      : null;
    if (!activeScene) return;

    ctx.clearRect(0, 0, BASE_W, BASE_H);

    const bgPath = resolveImagePath(activeScene.bg);
    const bgCache = imageCache[bgPath];
    if (bgCache && bgCache.status === 'ready' && bgCache.img) {
      ctx.drawImage(bgCache.img, 0, 0, BASE_W, BASE_H);
    } else {
      ctx.fillStyle = '#1c1f2d';
      ctx.fillRect(0, 0, BASE_W, BASE_H);
    }

    const actorPath = activeScene.actor ? resolveImagePath(activeScene.actor) : null;
    const actorCache = actorPath ? imageCache[actorPath] : null;
    if (actorCache && actorCache.status === 'ready' && actorCache.img) {
      const sw = 96;
      const sh = 160;
      const frame = Math.floor((Date.now() / 240) % 4);
      const dw = 178;
      const dh = 296;
      const x = (BASE_W - dw) / 2;
      const y = 292;
      ctx.drawImage(actorCache.img, sw * frame, 0, sw, sh, x, y, dw, dh);
    }

    if (state.values.A > 42 && state.settings.fog) {
      const fogPath = resolveImagePath('fx/fx_fog_overlay_sheet.png');
      const fog = imageCache[fogPath];
      if (fog && fog.status === 'ready' && fog.img) {
        const frame = Math.floor(Date.now() / 240) % 4;
        const sw = 180;
        const sh = 320;
        ctx.globalAlpha = state.settings.lowFreq ? 0.26 : 0.18;
        ctx.drawImage(fog.img, 0, frame * sh, sw, sh, 0, 0, BASE_W, BASE_H);
        ctx.globalAlpha = 1;
      }

      if (state.values.A >= 70) {
        const rainPath = resolveImagePath('fx/fx_rain_sheet.png');
        const rain = imageCache[rainPath];
        if (state.settings.lowFreq && rain && rain.status === 'ready' && rain.img) {
          const frame = Math.floor(Date.now() / 220) % 4;
          ctx.globalAlpha = 0.2;
          ctx.drawImage(rain.img, 0, frame * 320, 180, 320, 0, 0, BASE_W, BASE_H);
          ctx.globalAlpha = 1;
        }
      }

      if (state.values.A >= 80 && state.settings.lowFreq) {
        const noisePath = resolveImagePath('fx/fx_crt_noise_sheet.png');
        const noise = imageCache[noisePath];
        if (noise && noise.status === 'ready' && noise.img) {
          const frame = Math.floor(Date.now() / 120) % 6;
          ctx.globalAlpha = 0.07;
          ctx.drawImage(noise.img, (frame * 180) % (noise.img.width - 180), 0, 180, 320, 0, 0, BASE_W, BASE_H);
          ctx.globalAlpha = 1;
        }
      }
    }

    if (state.settings.jitter && state.values.A >= 60) {
      const shift = Math.max(1, Math.floor((state.values.A - 50) / 12));
      ctx.save();
      ctx.translate((Math.random() * shift) - shift / 2, (Math.random() * shift) - shift / 2);
      // 保留高焦虑动效，不再叠加数值 HUD，避免调试信息泄露。
      ctx.restore();
    }
  }

  function drawDebugStatus() {
    return;
  }

  function preloadScene(id) {
    const scene = scenes[id];
    if (!scene) return Promise.resolve();
    const list = [resolveImagePath(scene.bg)];
    if (scene.actor) list.push(resolveImagePath(scene.actor));
    list.push(resolveImagePath('fx/fx_fog_overlay_sheet.png'));
    list.push(resolveImagePath('fx/fx_rain_sheet.png'));
    list.push(resolveImagePath('fx/fx_crt_noise_sheet.png'));

    if (scene.end) {
      const ending = getEnding();
      if (ending?.image) {
        list.push(resolveImagePath(ending.image));
      }
    }

    return Promise.all(list.map(loadImage));
  }

  function preloadAll() {
    const paths = new Set();
    Object.values(scenes).forEach((scene) => {
      if (scene.bg) paths.add(resolveImagePath(scene.bg));
      if (scene.actor) paths.add(resolveImagePath(scene.actor));
    });
    Object.values(ENDINGS).forEach((ending) => {
      if (ending.image) paths.add(resolveImagePath(ending.image));
    });
    ['fx/fx_fog_overlay_sheet.png', 'fx/fx_rain_sheet.png', 'fx/fx_crt_noise_sheet.png'].forEach((name) => {
      paths.add(resolveImagePath(name));
    });
    return Promise.all(Array.from(paths).map(loadImage));
  }

  function renderLoop() {
    if (!state.running) return;
    render();
    rafId = requestAnimationFrame(renderLoop);
  }

  function startGame(useAuto = false) {
    if (state.running) return;

    const hasAuto = useAuto && load('auto');
    if (!hasAuto) {
      resetGame();
    }

    state.running = true;
    enterPlayMode();
    hud.classList.remove('hidden');

    preloadScene(state.current).then(() => loadScene(state.current));
    renderLoop();
  }

  function setupPanels() {
    applySettingsToUI();
    syncBars();

    for (let i = 1; i <= 3; i += 1) {
      const saveBtn = document.createElement('button');
      saveBtn.textContent = `存档 ${i}`;
      saveBtn.addEventListener('click', () => save(i));
      saveButtons.appendChild(saveBtn);

      const loadBtn = document.createElement('button');
      loadBtn.textContent = `读档 ${i}`;
      loadBtn.addEventListener('click', () => {
        if (!load(i)) {
          alert('该存档不可用。');
          return;
        }
        if (state.running) loadScene(state.current);
        else {
          state.running = true;
          titleScreen.classList.add('hidden');
          hud.classList.remove('hidden');
          renderLoop();
        }
        storagePanel.classList.add('hidden');
      });
      loadButtons.appendChild(loadBtn);
    }

    storageBtn.addEventListener('click', () => {
      systemPanel.classList.add('hidden');
      storagePanel.classList.toggle('hidden');
    });

    menuBtn.addEventListener('click', () => {
      storagePanel.classList.add('hidden');
      systemPanel.classList.toggle('hidden');
    });

    historyBtn.addEventListener('click', () => {
      alert((state.history || []).slice(-24).join('\n') || '尚无历史。');
    });

    closeSettings.addEventListener('click', () => {
      systemPanel.classList.add('hidden');
    });
    closeStorage.addEventListener('click', () => {
      storagePanel.classList.add('hidden');
    });

    toggleFog.addEventListener('change', () => {
      state.settings.fog = toggleFog.checked;
    });
    toggleJitter.addEventListener('change', () => {
      state.settings.jitter = toggleJitter.checked;
    });
    toggleLowFreq.addEventListener('change', () => {
      state.settings.lowFreq = toggleLowFreq.checked;
    });
    toggleLargeText.addEventListener('change', () => {
      state.settings.largeText = toggleLargeText.checked;
      dialogText.classList.toggle('large', state.settings.largeText);
    });
    speedSelect.addEventListener('change', () => {
      state.settings.speed = speedSelect.value;
    });

    dialogWrapper.addEventListener('click', () => {
      const scene = scenes[state.current];
      if (!scene || !state.running) return;
      if (scene.choices.length && state.lineIndex < scene.lines.length - 1) {
        nextLine();
      }
    });

    dialogWrapper.addEventListener('touchstart', (e) => {
      clearTimeout(pressTimer);
      pressTimer = setTimeout(() => {
        alert((state.history || []).slice(-24).join('\n') || '尚无历史。');
        e.preventDefault();
      }, 650);
    });

    dialogWrapper.addEventListener('touchend', () => clearTimeout(pressTimer));
    dialogWrapper.addEventListener('touchmove', () => clearTimeout(pressTimer));
  }

  function applySettingsToUI() {
    toggleFog.checked = state.settings.fog;
    toggleJitter.checked = state.settings.jitter;
    toggleLowFreq.checked = state.settings.lowFreq;
    toggleLargeText.checked = state.settings.largeText;
    speedSelect.value = state.settings.speed;
  }

  function checkOrientation() {
    return;
  }

  // 竖屏提示层移除后不再阻断方向提示；保留函数以兼容旧逻辑引用。

  function init() {
    preloadAll().catch(() => undefined);
    setupPanels();
    load('auto');
    dialogText.textContent = '点击“开始”进入游戏。';
    speaker.textContent = '系统';
    hint.textContent = '';
  }

  function bindStartButton(button, handler) {
    button.addEventListener('click', handler);
    button.addEventListener(
      'touchend',
      (event) => {
        event.preventDefault();
        handler();
      },
      { passive: false },
    );
  }

  bindStartButton(startBtn, () => {
    startGame(false);
  });

  bindStartButton(hometownQuickStartBtn, () => {
    startHometownBranchQuick();
  });

  bindStartButton(loadBtn, () => {
    if (!load('auto')) {
      alert('无可用自动存档，开始新游戏。');
      resetGame();
    }
    startGame(true);
  });

  init();
})();
