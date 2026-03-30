console.log('main.js загрузился');
console.log('BALANCE:', BALANCE);
console.log('STORAGE_KEYS:', STORAGE_KEYS);

function createDefaultUIState() {
  return {
    currentType: 'scooter',
    currentSkinIndex: 0,
    currentSkinsList: [],
    startScreenMode: 'create',

    currentCustomizationFilter: 'all',
    currentInventoryFilter: 'all',
    currentShopFilter: 'all',

    selectedShopItem: null,
    selectedWorkshopItem: null,
    selectedInventoryKey: null,

    previewCustomization: null
  };
}

let uiState = createDefaultUIState();
let player = createDefaultPlayer();
let previousStats = createPreviousStatsSnapshot(player);

const achievements = [
  { id: 'first_trick', name: 'Первый трюк', desc: 'Сделать 1 успешный трюк', target: 1, rewardCoins: 20, rewardXP: 10, current: () => player.quests.trickStreakCount || 0 },
  { id: 'trick_master', name: 'Мастер трюков', desc: 'Сделать 10 успешных трюков', target: 10, rewardCoins: 100, rewardXP: 50, current: () => player.quests.trickStreakCount || 0 },
  { id: 'ride_lover_achievement', name: 'Любитель покатушек', desc: 'Проехать 20 кругов катания', target: 20, rewardCoins: 80, rewardXP: 40, current: () => player.quests.ridesCount },
  { id: 'rich', name: 'Богач', desc: 'Накопить 500 монет', target: 500, rewardCoins: 200, rewardXP: 100, current: () => player.coins },
  { id: 'high_level', name: 'Высокий уровень', desc: 'Достичь 5 уровня', target: 5, rewardCoins: 150, rewardXP: 75, current: () => player.level },
  {
  id: 'collector',
  name: 'Коллекционер',
  desc: 'Купить 3 предмета',
  target: 3,
  rewardCoins: 50,
  rewardXP: 25,
  current: () => (player.ownedShopItems || []).length + (player.ownedCustomization || []).length
},
  { id: 'combo_master', name: 'Мастер комбо', desc: 'Достичь комбо 5', target: 5, rewardCoins: 50, rewardXP: 25, current: () => player.combo }
];

const questDefinitions = [
  { id: 'trick_master', name: 'Мастер трюков', description: 'Сделайте 5 успешных трюков подряд (без падения)', target: 5, rewardCoins: 50, rewardXP: 20, check: (p) => p.quests.trickStreak >= 5, onProgress: (p) => p.quests.trickStreak },
  { id: 'ride_lover', name: 'Любитель покатушек', description: 'Проехать 10 кругов катания', target: 10, rewardCoins: 30, rewardXP: 10, check: (p) => p.quests.ridesCount >= 10, onProgress: (p) => p.quests.ridesCount },
  { id: 'rising_star', name: 'Восходящая звезда', description: 'Достигнуть 10 уровня', target: 10, rewardCoins: 100, rewardXP: 50, check: (p) => p.level >= 10, onProgress: (p) => p.level }
];

const shopItems = [
  {
    id: 'cap',
    type: 'clothes',
    category: 'head',
    name: 'КЕПКА',
    emoji: '🧢',
    price: 30,
    bonus: { startCombo: 2 },
    desc: '+2 к начальному комбо'
  },
  {
    id: 'hoodie',
    type: 'clothes',
    category: 'body',
    name: 'ХУДИ',
    emoji: '🧥',
    price: 50,
    bonus: { maxEnergy: 20 },
    desc: '+20 к макс. энергии'
  },
  {
    id: 'helmet',
    type: 'clothes',
    category: 'head',
    name: 'ШЛЕМ',
    emoji: '⛑️',
    price: 35,
    bonus: { trickEnergyDiscount: 0.15 },
    desc: '-15% расход энергии на трюки'
  },
  {
    id: 'jacket',
    type: 'clothes',
    category: 'body',
    name: 'КУРТКА',
    emoji: '🧥',
    price: 60,
    bonus: { coinsBonus: 0.10 },
    desc: '+10% монет'
  },
  {
    id: 'energy_drink',
    type: 'consumable',
    category: 'drink',
    name: 'ЭНЕРГЕТИК',
    emoji: '🥤',
    price: 15,
    effect: { energy: 25 },
    desc: '+25 энергии'
  },
  {
    id: 'juice',
    type: 'consumable',
    category: 'drink',
    name: 'СОК',
    emoji: '🧃',
    price: 12,
    effect: { drive: 15 },
    desc: '+15 драйва'
  }
];
const workshopItems = [
  {
    id: 'scooter_deck_red',
    type: 'custom',
    vehicleType: 'scooter',
    slot: 'deck',
    variant: 'red',
    name: 'Красная дека',
    price: 40,
    preview: 'assets/custom/scooter/cards/deck_red.png'
  },
  {
    id: 'scooter_bar_black',
    type: 'custom',
    vehicleType: 'scooter',
    slot: 'bar',
    variant: 'black',
    name: 'Чёрный руль',
    price: 35,
    preview: 'assets/custom/scooter/cards/bar_black.png'
  },
  {
    id: 'scooter_grips_red',
    type: 'custom',
    vehicleType: 'scooter',
    slot: 'grips',
    variant: 'red',
    name: 'Красные грипсы',
    price: 25,
    preview: 'assets/custom/scooter/cards/grips_red.png'
  },
  {
    id: 'scooter_headset_gold',
    type: 'custom',
    vehicleType: 'scooter',
    slot: 'headset',
    variant: 'gold',
    name: 'Золотая рулевая',
    price: 35,
    preview: 'assets/custom/scooter/cards/headset_gold.png'
  },
  {
    id: 'scooter_wheels_neon',
    type: 'custom',
    vehicleType: 'scooter',
    slot: 'wheels',
    variant: 'neon',
    name: 'Неоновые колёса',
    price: 50,
    preview: 'assets/custom/scooter/cards/wheels_neon.png'
  },
  {
    id: 'scooter_grip_flame',
    type: 'custom',
    vehicleType: 'scooter',
    slot: 'grip',
    variant: 'flame',
    name: 'Шкурка Flame',
    price: 45,
    preview: 'assets/custom/scooter/cards/grip_flame.png'
  },
  {
    id: 'scooter_sticker_star',
    type: 'custom',
    vehicleType: 'scooter',
    slot: 'sticker',
    variant: 'star',
    name: 'Наклейка Star',
    price: 20,
    preview: 'assets/custom/scooter/cards/sticker_star.png'
  },

  {
    id: 'upgrade_durability_1',
    type: 'upgrade',
    vehicleType: 'scooter',
    upgradeKey: 'durability',
    value: 1,
    name: 'Усиленная прочность I',
    price: 80,
    desc: 'Меньше износ самоката'
  },
  {
    id: 'upgrade_efficiency_1',
    type: 'upgrade',
    vehicleType: 'scooter',
    upgradeKey: 'efficiency',
    value: 1,
    name: 'Экономия энергии I',
    price: 75,
    desc: 'Меньше расход энергии'
  },
  {
    id: 'upgrade_reward_1',
    type: 'upgrade',
    vehicleType: 'scooter',
    upgradeKey: 'reward',
    value: 1,
    name: 'Бонус наград I',
    price: 90,
    desc: '+ больше монет и XP'
  }
];

let runnerInterval = null;
let ridingInterval = null;
let activeElement = null;
let currentTooltip = null;
let tooltipTimeout = null;
let tooltipHideTimeout = null;
let trickRoundActive = false;

let trickRoundState = {
  animationId: null,
  position: 0,
  direction: 1,
  speed: 520,
  lastTimestamp: 0,
  greenLeft: 0,
  greenWidth: 0,
  perfectLeft: 0,
  perfectWidth: 36,
  maxPosition: 0
};

const miniGame = document.getElementById('miniGame');
const runner = document.getElementById('runner');
const greenZone = document.getElementById('greenZone');
const trickOverlay = document.getElementById('trickOverlay');
const trickOverlayBackdrop = document.getElementById('trickOverlayBackdrop');
const trickModal = document.getElementById('trickModal');
const trickMiniGame = document.getElementById('trickMiniGame');
const trickRunner = document.getElementById('trickRunner');
const trickGreenZone = document.getElementById('trickGreenZone');
const trickPerfectZone = document.getElementById('trickPerfectZone');
const trickCloseBtn = document.getElementById('trickCloseBtn');

const trickEnergyFill = document.getElementById('trickEnergyFill');
const trickEnergyText = document.getElementById('trickEnergyText');
const trickScooterFill = document.getElementById('trickScooterFill');
const trickScooterText = document.getElementById('trickScooterText');
const trickComboText = document.getElementById('trickComboText');
const trickHelpText = document.getElementById('trickHelpText');
const trickResultText = document.getElementById('trickResultText');

const trickQuickRestBtn = document.getElementById('trickQuickRestBtn');
const trickQuickEnergyBtn = document.getElementById('trickQuickEnergyBtn');
const trickQuickRepairBtn = document.getElementById('trickQuickRepairBtn');
const ridingProgressContainer = document.getElementById('ridingProgressContainer');
const rideBtn = document.getElementById('rideBtn');
const trickBtn = document.getElementById('trickBtn');
const restBtn = document.getElementById('restBtn');
const workshopBtn = document.getElementById('workshopBtn');
const shopBtn = document.getElementById('shopBtn');
const inventoryBtn = document.getElementById('inventoryBtn');
const questsBtn = document.getElementById('questsBtn');
const achievementsBtn = document.getElementById('achievementsBtn');
const dailyBonusBtn = document.getElementById('dailyBonusBtn');
const progressFill = document.getElementById('ridingProgressFill');
const gearBtn = document.getElementById('settingsGear');
const dropdownMenu = document.getElementById('settingsDropdown');
const resetModal = document.getElementById('resetModal');
const warningModalElem = document.getElementById('warningModal');
const warningCloseBtn = document.getElementById('warningCloseBtn');
const startBtn = document.getElementById('startGameBtn');
const statsToggleBtn = document.getElementById('statsToggleBtn');
const topTabButtons = Array.from(document.querySelectorAll('.top-tab-btn'));

function resetUIStateFromPlayer() {
  uiState = createDefaultUIState();
  uiState.currentType = player.type || 'scooter';
}

function syncSkillFromLevel() {
  player.skill = player.level;
}

function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function safeSetImage(img, src, fallback) {
  img.src = src;
  img.onerror = function () {
    this.onerror = null;
    this.src = fallback;
  };
}

function getFallbackDataUri(label = '?') {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="#1f2f4f"/><text x="50" y="56" text-anchor="middle" font-size="22" fill="#f8e070" font-family="monospace">${label}</text></svg>`)}`;
}

function getSkinImageUrl(type, skinId) {
  if (type === 'scooter') {
    if (skinId === 'scooter1') return 'assets/scooter_rider_1_red.png';
    if (skinId === 'scooter2') return 'assets/scooter_rider_2_blue.png';
    if (skinId === 'scooter3') return 'assets/scooter_rider_3_black.png';
  } else if (type === 'skate') {
    if (skinId === 'skate1') return 'assets/skater_rider_1_red.png';
    if (skinId === 'skate2') return 'assets/skater_rider_1_blue.png';
    if (skinId === 'skate3') return 'assets/skater_rider_1_green.png';
  } else if (type === 'roller') {
    if (skinId === 'roller1') return 'assets/roller_rider_1_red.png';
    if (skinId === 'roller2') return 'assets/roller_rider_2_blue.png';
    if (skinId === 'roller3') return 'assets/roller_rider_3_black.png';
  }
  return getFallbackDataUri('RIDER');
}

function applySkin(type, skinId) {
  const riderImg = document.getElementById('riderImg');
  if (!riderImg) return;
  safeSetImage(riderImg, getSkinImageUrl(type, skinId), getFallbackDataUri('RIDER'));
}

function renderSkinCarousel() {
  if (uiState.currentType === 'scooter') {
    uiState.currentSkinsList = [
      { id: 'scooter1', name: 'Классик' },
      { id: 'scooter2', name: 'Спорт' },
      { id: 'scooter3', name: 'Граффити' }
    ];
  } else if (uiState.currentType === 'skate') {
    uiState.currentSkinsList = [
      { id: 'skate1', name: 'Стрит' },
      { id: 'skate2', name: 'Вертикалка' },
      { id: 'skate3', name: 'Фристайл' }
    ];
  } else {
    uiState.currentSkinsList = [
      { id: 'roller1', name: 'Агрессив' },
      { id: 'roller2', name: 'Слалом' },
      { id: 'roller3', name: 'Фристайл' }
    ];
  }

  if (uiState.currentSkinIndex >= uiState.currentSkinsList.length) uiState.currentSkinIndex = 0;
  if (uiState.currentSkinIndex < 0) uiState.currentSkinIndex = uiState.currentSkinsList.length - 1;

  const carouselImg = document.getElementById('carouselSkinImg');
  if (carouselImg) {
    const current = uiState.currentSkinsList[uiState.currentSkinIndex];
    safeSetImage(
      carouselImg,
      getSkinImageUrl(uiState.currentType, current.id),
      getFallbackDataUri(current.name)
    );
    carouselImg.alt = current.name;
  }
}

function nextSkin() {
  if (!uiState.currentSkinsList.length) return;
  uiState.currentSkinIndex = (uiState.currentSkinIndex + 1) % uiState.currentSkinsList.length;
  renderSkinCarousel();
}

function prevSkin() {
  if (!uiState.currentSkinsList.length) return;
  uiState.currentSkinIndex =
    (uiState.currentSkinIndex - 1 + uiState.currentSkinsList.length) % uiState.currentSkinsList.length;
  renderSkinCarousel();
}

function setupTypeButtons() {
  const typeBtns = document.querySelectorAll('.type-btn');
  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      uiState.currentType = btn.dataset.type;
      uiState.currentSkinIndex = 0;
      renderSkinCarousel();
    });
  });
}

function initSwipe() {
  const carouselImg = document.getElementById('carouselSkinImg');
  if (!carouselImg) return;

  let touchStartX = 0;
  carouselImg.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  carouselImg.addEventListener('touchend', (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) prevSkin();
      else nextSkin();
    }
  }, { passive: true });
}

function showTrickEffect(text) {
  const effect = document.createElement('div');
  effect.className = 'trick-effect';
  effect.textContent = text;
  document.body.appendChild(effect);

  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = (Math.random() * 50 - 25) + 'px';
    p.style.top = '0px';
    p.style.setProperty('--x', String(Math.random() * 60 - 30));
    effect.appendChild(p);
    setTimeout(() => p.remove(), 1500);
  }

  setTimeout(() => effect.remove(), 1200);
}
const AudioManager = {
  ctx: null,

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  },

  tone({
    frequency = 440,
    duration = 0.12,
    type = 'sine',
    gainValue = 0.04,
    frequencyEnd = null
  } = {}) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    if (frequencyEnd !== null) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(40, frequencyEnd),
        ctx.currentTime + duration
      );
    }

    gain.gain.setValueAtTime(gainValue, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  },

  good() {
    this.tone({
      frequency: 740,
      frequencyEnd: 900,
      duration: 0.11,
      type: 'triangle',
      gainValue: 0.035
    });
  },

  perfect() {
    this.tone({
      frequency: 920,
      frequencyEnd: 1320,
      duration: 0.16,
      type: 'triangle',
      gainValue: 0.05
    });

    setTimeout(() => {
      this.tone({
        frequency: 1320,
        frequencyEnd: 1580,
        duration: 0.12,
        type: 'triangle',
        gainValue: 0.04
      });
    }, 55);
  },

  miss() {
    this.tone({
      frequency: 280,
      frequencyEnd: 140,
      duration: 0.22,
      type: 'sawtooth',
      gainValue: 0.045
    });
  }
};

function vibrateFeedback(pattern) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

function flashTrickModal(type) {
  if (!trickModal) return;

  trickModal.classList.remove('flash-perfect', 'flash-good', 'flash-miss');
  void trickModal.offsetWidth;

  if (type === 'perfect') {
    trickModal.classList.add('flash-perfect');
  } else if (type === 'good') {
    trickModal.classList.add('flash-good');
  } else if (type === 'miss') {
    trickModal.classList.add('flash-miss');
  }
}

function isTrickOverlayOpen() {
  return !!(trickOverlay && trickOverlay.classList.contains('visible'));
}

function stopTrickRoundAnimation() {
  if (trickRoundState.animationId) {
    cancelAnimationFrame(trickRoundState.animationId);
    trickRoundState.animationId = null;
  }

  if (runnerInterval) {
    clearInterval(runnerInterval);
    runnerInterval = null;
  }

  trickRoundActive = false;
}

function updateTrickOverlayHUD() {
  if (!trickOverlay) return;

  if (trickEnergyFill) {
    trickEnergyFill.style.width = `${Math.max(0, Math.min(100, (player.energy / player.maxEnergy) * 100))}%`;
  }

  if (trickEnergyText) {
    trickEnergyText.textContent = `${player.energy}/${player.maxEnergy}`;
  }

  if (trickScooterFill) {
    trickScooterFill.style.width = `${Math.max(0, Math.min(100, player.scooter))}%`;
  }

  if (trickScooterText) {
    trickScooterText.textContent = `${player.scooter}%`;
  }

  if (trickComboText) {
    trickComboText.textContent = `🔥 x${player.combo || 0}`;
  }

  const energyDrinkEntry = (player.consumables || []).find(c => c.id === 'energy_drink');
  const energyDrinkCount = energyDrinkEntry?.count || 0;

  if (trickQuickEnergyBtn) {
    trickQuickEnergyBtn.textContent = energyDrinkCount > 0
      ? `🥤 ЭНЕРГЕТИК x${energyDrinkCount}`
      : '🥤 НЕТ ЭНЕРГ.';
    trickQuickEnergyBtn.disabled = energyDrinkCount <= 0 || player.energy >= player.maxEnergy;
  }

  if (trickQuickRestBtn) {
    trickQuickRestBtn.disabled = player.energy >= player.maxEnergy;
  }

  if (trickQuickRepairBtn) {
    trickQuickRepairBtn.disabled = player.scooter >= 100;
  }
}

function openTrickOverlay() {
  if (!trickOverlay) return;

  stopTrickRoundAnimation();
  
  trickOverlay.classList.add('visible');
  document.body.classList.add('trick-overlay-open');
  activeElement = trickOverlay;
  trickRoundActive = false;

  if (trickResultText) {
    trickResultText.textContent = '';
  }

  if (trickHelpText) {
    trickHelpText.textContent = 'ТАПНИ ПО ПОЛОСЕ, ЧТОБЫ ОСТАНОВИТЬ БЕГУНОК';
  }

  updateTrickOverlayHUD();

  requestAnimationFrame(() => {
    startTrickRound();
  });
}

function closeTrickOverlay() {
  if (!trickOverlay) return;

  stopTrickRoundAnimation();

  trickOverlay.classList.remove('visible');
  document.body.classList.remove('trick-overlay-open');
  activeElement = null;

  if (trickResultText) {
    trickResultText.textContent = '';
  }
}

function startTrickRound() {
  if (!isTrickOverlayOpen()) return;
  if (!trickMiniGame || !trickRunner || !trickGreenZone) return;

  if (player.isSleeping) {
    if (trickResultText) trickResultText.textContent = '💤 НУЖЕН ОТДЫХ';
    updateTrickOverlayHUD();
    return;
  }

  if (player.scooter === 0) {
    if (trickResultText) trickResultText.textContent = '🔧 САМОКАТ СЛОМАН';
    updateTrickOverlayHUD();
    return;
  }

  if (player.energy < BALANCE.trickEnergyCost) {
    if (trickResultText) trickResultText.textContent = '⚡ НЕДОСТАТОЧНО ЭНЕРГИИ';
    updateTrickOverlayHUD();
    return;
  }

  stopTrickRoundAnimation();

  if (trickResultText) {
    trickResultText.textContent = '';
    trickResultText.className = 'trick-result-text';
  }

  if (trickMiniGame) {
    trickMiniGame.classList.remove('round-start');
    void trickMiniGame.offsetWidth;
    trickMiniGame.classList.add('round-start');
  }

  setTimeout(() => {
    trickMiniGame?.classList.remove('round-start');
  }, 180);
  
  if (trickHelpText) {
    trickHelpText.textContent = 'ТАПНИ ПО ПОЛОСЕ, ЧТОБЫ ОСТАНОВИТЬ БЕГУНОК';
  }

  const gameWidth = trickMiniGame.offsetWidth;
  const runnerWidth = trickRunner.offsetWidth;
  if (gameWidth === 0 || runnerWidth === 0) return;

  const greenWidth = 80 + Math.random() * 140;
  const greenLeft = Math.random() * (gameWidth - greenWidth);
  const perfectWidth = 36;
  const perfectLeft = greenLeft + (greenWidth - perfectWidth) / 2;
  const maxPosition = gameWidth - runnerWidth;

  trickRoundState.position = 0;
  trickRoundState.direction = 1;
  trickRoundState.lastTimestamp = performance.now();
  trickRoundState.greenLeft = greenLeft;
  trickRoundState.greenWidth = greenWidth;
  trickRoundState.perfectLeft = perfectLeft;
  trickRoundState.perfectWidth = perfectWidth;
  trickRoundState.maxPosition = maxPosition;

  trickGreenZone.style.left = `${greenLeft}px`;
  trickGreenZone.style.width = `${greenWidth}px`;

  if (trickPerfectZone) {
    trickPerfectZone.style.left = `${perfectLeft}px`;
    trickPerfectZone.style.width = `${perfectWidth}px`;
  }

  trickRunner.style.left = '0px';

  trickRoundActive = true;

  function step(timestamp) {
    if (!isTrickOverlayOpen()) return;
    if (!trickRoundActive) return;

    const deltaSeconds = Math.min(0.032, (timestamp - trickRoundState.lastTimestamp) / 1000);
    trickRoundState.lastTimestamp = timestamp;

    trickRoundState.position += trickRoundState.direction * trickRoundState.speed * deltaSeconds;

    if (trickRoundState.position <= 0) {
      trickRoundState.position = 0;
      trickRoundState.direction = 1;
    } else if (trickRoundState.position >= trickRoundState.maxPosition) {
      trickRoundState.position = trickRoundState.maxPosition;
      trickRoundState.direction = -1;
    }

    trickRunner.style.left = `${trickRoundState.position}px`;
    trickRoundState.animationId = requestAnimationFrame(step);
  }

  trickRoundState.animationId = requestAnimationFrame(step);
}

function quickRestFromTrickOverlay() {
  if (player.energy >= player.maxEnergy) {
    showTrickEffect('⚡ MAX');
    updateTrickOverlayHUD();
    return;
  }

  player.energy = Math.min(player.maxEnergy, player.energy + BALANCE.restEnergyGain);
  player.drive = Math.max(0, player.drive - 10);
  if (player.energy > 0) player.isSleeping = false;

  showTrickEffect(`😴 +${BALANCE.restEnergyGain}⚡`);
  finalizePlayerUpdate();
  updateTrickOverlayHUD();

  if (isTrickOverlayOpen() && !trickRoundActive && !runnerInterval) {
    setTimeout(() => startTrickRound(), 150);
  }

  player.energy = Math.min(player.maxEnergy, player.energy + BALANCE.restEnergyGain);
  player.drive = Math.max(0, player.drive - 10);
  if (player.energy > 0) player.isSleeping = false;

  showTrickEffect(`😴 +${BALANCE.restEnergyGain}⚡`);
  finalizePlayerUpdate();
  updateTrickOverlayHUD();
}

function quickUseEnergyDrinkFromTrickOverlay() {
  const entry = (player.consumables || []).find(c => c.id === 'energy_drink');
  if (!entry || entry.count <= 0) {
    showWarning('❌ НЕТ ЭНЕРГЕТИКА!');
    updateTrickOverlayHUD();
    return;
  }

  player.energy = Math.min(player.maxEnergy, player.energy + 25);
  entry.count -= 1;

  if (entry.count <= 0) {
    player.consumables = player.consumables.filter(c => c.id !== 'energy_drink');
  }

  showTrickEffect('🥤 +25⚡');
  finalizePlayerUpdate();
  updateTrickOverlayHUD();

  if (isTrickOverlayOpen() && !trickRoundActive && !runnerInterval) {
    setTimeout(() => startTrickRound(), 150);
  }

  player.energy = Math.min(player.maxEnergy, player.energy + 25);
  entry.count -= 1;

  if (entry.count <= 0) {
    player.consumables = player.consumables.filter(c => c.id !== 'energy_drink');
  }

  showTrickEffect('🥤 +25⚡');
  finalizePlayerUpdate();
  updateTrickOverlayHUD();
}

function quickRepairFromTrickOverlay() {
  if (player.scooter >= 100) {
    showTrickEffect('✅ УЖЕ КАК НОВЫЙ');
    updateTrickOverlayHUD();
    return;
  }

  if (player.coins >= BALANCE.repairCoins) {
    player.coins -= BALANCE.repairCoins;
    player.scooter = 100;
    showTrickEffect('🔧 ПОЧИНЕН');
    finalizePlayerUpdate();
    updateTrickOverlayHUD();

    if (isTrickOverlayOpen() && !trickRoundActive && !runnerInterval) {
      setTimeout(() => startTrickRound(), 150);
    }
    return;
  }

  if (player.xp >= BALANCE.repairXP) {
    player.xp -= BALANCE.repairXP;
    player.scooter = 100;
    showTrickEffect('🔧 ПОЧИНЕН ЗА XP');
    finalizePlayerUpdate();
    updateTrickOverlayHUD();

    if (isTrickOverlayOpen() && !trickRoundActive && !runnerInterval) {
      setTimeout(() => startTrickRound(), 150);
    }
    return;
  }

  showWarning(`❌ НУЖНО ${BALANCE.repairCoins}💰 ИЛИ ${BALANCE.repairXP} XP`);
  updateTrickOverlayHUD();
}

function getRewardMultiplier() {
  let mult = 1 + (player.level / 50);
  if (player.combo > 0) mult *= (1 + Math.min(0.5, player.combo * 0.1));
  if (player.energy < 30) mult *= 0.5;
  if (player.equipped.body === 'jacket') mult *= 1.1;
  const rewardUpgrade = player.upgrades?.scooter?.reward || 0;
  mult *= (1 + rewardUpgrade * 0.1);
  return Math.max(0.5, mult);
}

function getRideXPMultiplier() {
  return 1;
}
function processLevelUps() {
  let leveledUp = false;

  while (player.xp >= player.xpToNext) {
    player.xp -= player.xpToNext;
    player.level++;
    player.xpToNext = BALANCE.xpBase + (player.level - 1) * BALANCE.xpIncrement;
    syncSkillFromLevel();
    leveledUp = true;
  }

  if (leveledUp) {
    player.energy = Math.min(player.maxEnergy, player.energy + 10);
    player.drive = Math.min(100, player.drive + 10);
    showTrickEffect(`✨ LEVEL UP! ${player.level} ✨`);

    const levelBox = document.querySelector('.level-box');
    if (levelBox) {
      levelBox.classList.add('level-up-glow');
      setTimeout(() => levelBox.classList.remove('level-up-glow'), 600);
    }
  }

  return leveledUp;
}

function addFlatXP(amount) {
  if (amount <= 0) return;

  player.xp += amount;
  showTrickEffect(`+${amount} XP`);
  processLevelUps();
}

function addFlatCoins(amount) {
  if (amount <= 0) return;

  player.coins += amount;
  showTrickEffect(`💰 +${amount}`);
}

function hydrateUIFromState() {
  resetUIStateFromPlayer();
  syncSkillFromLevel();
  applyEquipmentBonuses();
  syncPreviewCustomizationFromPlayer();

  if (player.skin) {
    applySkin(player.type, player.skin);
  }

  updateStats();
  updateVehiclePreview(player.customization?.scooter || null);

  const shopModal = document.getElementById('shopModal');
  const inventoryModal = document.getElementById('inventoryModal');
  const workshopPanel = document.getElementById('workshopPanel');

  if (shopModal && shopModal.style.display === 'flex') {
    renderShopModal();
  }

  if (inventoryModal && inventoryModal.style.display === 'flex') {
    renderInventoryModal();
  }

  if (workshopPanel && workshopPanel.style.display === 'flex') {
    renderCustomizationTabs();
    renderCustomizationShop();
    renderWorkshopSelectedItemInfo();
    updateVehiclePreview();
  }

  refreshTooltips();
}

function finalizePlayerUpdate() {
  checkQuests();
  checkAchievements();
  updateStats();

  syncPreviewCustomizationFromPlayer();

  if (document.getElementById('shopModal')?.style.display === 'flex') {
    renderShopModal();
  }

  if (document.getElementById('inventoryModal')?.style.display === 'flex') {
    renderInventoryModal();
  }

  if (document.getElementById('workshopPanel')?.style.display === 'flex') {
    renderCustomizationTabs();
    renderCustomizationShop();
    renderWorkshopSelectedItemInfo();
    updateVehiclePreview();
  }

  saveState();
}

function addXP(amount, fromRide = false) {
  if (amount <= 0) return;

  let finalAmount = amount;
  if (fromRide) {
    finalAmount = Math.floor(amount * getRideXPMultiplier());
  }

  const finalXP = Math.floor(finalAmount * getRewardMultiplier());
  player.xp += finalXP;
  showTrickEffect(`+${finalXP} XP`);

  processLevelUps();
  finalizePlayerUpdate();
}

function addCoins(amount) {
  if (amount <= 0) return;

  const finalCoins = Math.floor(amount * getRewardMultiplier());
  player.coins += finalCoins;
  showTrickEffect(`💰 +${finalCoins}`);

  finalizePlayerUpdate();
}

function animateStat(id, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('gain', 'loss');
  void el.offsetWidth;
  el.classList.add(type);
}

function applyEquipmentBonuses() {
  player.maxEnergy = 100;
  let startComboBonus = 0;

  if (player.equipped.body === 'hoodie') {
    player.maxEnergy = 120;
  }

  if (player.equipped.head === 'cap') {
    startComboBonus = 2;
  }

  if (player.energy > player.maxEnergy) {
    player.energy = player.maxEnergy;
  }

  if (startComboBonus > 0 && player.combo === 0) {
    player.combo = startComboBonus;
  }

  const energyBonusSpan = document.getElementById('energyBonus');
  if (energyBonusSpan) {
    energyBonusSpan.style.display = player.maxEnergy > 100 ? 'inline-block' : 'none';
    energyBonusSpan.textContent = player.maxEnergy > 100 ? `+${player.maxEnergy - 100} MAX` : '';
  }

  const coinsBonusSpan = document.getElementById('coinsBonus');
  if (coinsBonusSpan) {
    const hasJacket = player.equipped.body === 'jacket';
    coinsBonusSpan.style.display = hasJacket ? 'inline-block' : 'none';
    coinsBonusSpan.textContent = hasJacket ? '+10%' : '';
  }
}


function setActiveTopTab(panelId) {
  topTabButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.panel === panelId);
  });
}

function openPanelFromTab(panelId) {
  setActiveTopTab(panelId);

  if (panelId === 'shopModal') {
    handleShop();
    return;
  }
  if (panelId === 'inventoryModal') {
    openInventoryModal(true);
    return;
  }
  if (panelId === 'workshopPanel') {
    handleWorkshop();
    return;
  }
  if (panelId === 'questsPanel') {
    handleQuests();
    return;
  }
  if (panelId === 'achievementsPanel') {
    handleAchievements();
    return;
  }
  if (panelId === 'dailyBonusPanel') {
    handleDailyBonus();
  }
}

function openStatsPanel() {
  openPanelModal('statsPanel');
}

function updateStats() {
  const prev = { ...previousStats };

  const energyValue = document.querySelector('#energy .stat-value, #energy .stats-card-value');
  const driveValue = document.querySelector('#drive .stat-value, #drive .stats-card-value');
  const skillValue = document.querySelector('#skill .stat-value, #skill .stats-card-value');
  const scooterValue = document.querySelector('#scooter .stat-value, #scooter .stats-card-value');
  const coinsValue = document.querySelector('#coins .stat-value, #coins .stats-card-value');
  const workshopCoinsAmount = document.getElementById('workshopCoinsAmount');
  const repValue = document.querySelector('#rep .stat-value, #rep .stats-card-value');
  const headerCoins = document.getElementById('headerCoins');
  const energyBarFill = document.getElementById('energyBarFill');
  const transportBarFill = document.getElementById('transportBarFill');

  if (energyValue) energyValue.textContent = player.energy;
  if (driveValue) driveValue.textContent = player.drive;
  if (skillValue) skillValue.textContent = player.skill;
  if (scooterValue) scooterValue.textContent = player.scooter;
  if (coinsValue) coinsValue.textContent = player.coins;
  if (headerCoins) headerCoins.textContent = `💰 ${player.coins}`;
  if (workshopCoinsAmount) workshopCoinsAmount.textContent = player.coins;
  if (repValue) repValue.textContent = player.rep;

  const scooterStatus = document.getElementById('scooterStatus');
  const xpAmountSpan = document.getElementById('xpAmount');
  const sleepIcon = document.getElementById('sleepIcon');
  const brokenIcon = document.getElementById('brokenIcon');
  const levelText = document.getElementById('levelText');
  const xpBarFill = document.getElementById('xpBarFill');
  const comboText = document.getElementById('comboText');

  if (scooterStatus) scooterStatus.textContent = player.scooter;
  if (xpAmountSpan) xpAmountSpan.textContent = player.xp;
  if (sleepIcon) sleepIcon.style.display = player.isSleeping ? 'inline' : 'none';
  if (brokenIcon) brokenIcon.style.display = player.scooter === 0 ? 'inline' : 'none';
  if (levelText) levelText.textContent = `УРОВЕНЬ ${player.level}`;
  if (xpBarFill) xpBarFill.style.width = `${(player.xp / player.xpToNext) * 100}%`;
  if (comboText) comboText.textContent = player.combo > 0 ? `КОМБО x${player.combo}` : '';
  if (energyBarFill) energyBarFill.style.width = `${Math.max(0, Math.min(100, (player.energy / player.maxEnergy) * 100))}%`;
  if (transportBarFill) transportBarFill.style.width = `${Math.max(0, Math.min(100, player.scooter))}%`;

  if (player.energy > prev.energy) animateStat('energy', 'gain');
  else if (player.energy < prev.energy) animateStat('energy', 'loss');

  if (player.drive > prev.drive) animateStat('drive', 'gain');
  else if (player.drive < prev.drive) animateStat('drive', 'loss');

  if (player.skill > prev.skill) animateStat('skill', 'gain');
  else if (player.skill < prev.skill) animateStat('skill', 'loss');

  if (player.scooter > prev.scooter) animateStat('scooter', 'gain');
  else if (player.scooter < prev.scooter) animateStat('scooter', 'loss');

  if (player.coins > prev.coins) animateStat('coins', 'gain');
  else if (player.coins < prev.coins) animateStat('coins', 'loss');

  if (player.rep > prev.rep) animateStat('rep', 'gain');
  else if (player.rep < prev.rep) animateStat('rep', 'loss');

  previousStats = createPreviousStatsSnapshot(player);

  const notEnoughForTrick = player.energy < BALANCE.trickEnergyCost || player.isSleeping || player.scooter === 0;
  trickBtn.classList.toggle('low-energy', notEnoughForTrick);

  renderQuests();
  renderAchievements();
  renderDailyBonusPanel();
  updateTrickOverlayHUD();
}

function renderShopFilters() {
  const filtersContainer = document.getElementById('shopFilters');
  if (!filtersContainer) return;

  const filters = [
    { id: 'all', label: 'ВСЁ' },
    { id: 'clothes', label: 'ОДЕЖДА' },
    { id: 'consumable', label: 'РАСХОДНИКИ' }
  ];

  filtersContainer.innerHTML = '';

  filters.forEach(filter => {
    const btn = document.createElement('button');
    btn.className = 'customization-tab' + (uiState.currentShopFilter === filter.id ? ' active' : '');
    btn.textContent = filter.label;

btn.addEventListener('click', () => {
  uiState.currentShopFilter = filter.id;
  uiState.selectedShopItem = null;
  renderShopModal();
});

    filtersContainer.appendChild(btn);
  });
}

function renderShopModal() {
  const content = document.getElementById('shopModalContent');
  const balanceEl = document.getElementById('shopBalance');
  if (!content) return;

  renderShopFilters();
  content.innerHTML = '';

  const visibleItems = shopItems.filter(item => {
    const owned = player.ownedShopItems && player.ownedShopItems.includes(item.id);

    if (item.type === 'clothes' && owned) return false;
    if (uiState.currentShopFilter !== 'all' && item.type !== uiState.currentShopFilter) return false;

    return true;
  });

  if (balanceEl) {
    balanceEl.innerHTML = `💰 ${player.coins}`;
  }

  if (!visibleItems.length) {
    uiState.selectedShopItem = null;
    content.innerHTML = '<p style="text-align:center; padding:20px;">🛍️ НИЧЕГО НЕ НАЙДЕНО</p>';
    renderShopPreview();
    return;
  }

const selectedStillVisible = uiState.selectedShopItem
  && visibleItems.some(item => item.id === uiState.selectedShopItem.id);

if (!selectedStillVisible) {
  uiState.selectedShopItem = visibleItems[0];
}

  visibleItems.forEach(item => {
    const consumableCount = item.type === 'consumable'
      ? ((player.consumables || []).find(c => c.id === item.id)?.count || 0)
      : 0;

    const isSelected = uiState.selectedShopItem && uiState.selectedShopItem.id === item.id;

    const card = document.createElement('div');
    card.className = 'custom-item shop-card' + (isSelected ? ' selected' : '');

    card.innerHTML = `
      <div class="shop-master-icon">${item.emoji}</div>
      <div class="custom-item-title">${item.name}</div>
      <div class="custom-item-price">💰 ${item.price}</div>
      ${
        item.type === 'consumable'
          ? `<div class="equipped-badge shop-count-badge">x${consumableCount}</div>`
          : ''
      }
    `;

card.addEventListener('click', () => {
  uiState.selectedShopItem = item;
  renderShopModal();
});

    content.appendChild(card);
  });

  renderShopPreview();
}

function renderShopPreview() {
  const preview = document.getElementById('shopPreview');
  if (!preview) return;

  if (!uiState.selectedShopItem) {
    preview.innerHTML = `
      <div class="shop-preview-empty">
        Выбери предмет
      </div>
    `;
    return;
  }

  const item = uiState.selectedShopItem;
  const consumableCount = (player.consumables || []).find(c => c.id === item.id)?.count || 0;
  const notEnough = player.coins < item.price;

  let statusText = '';
  if (item.type === 'consumable') {
    statusText = consumableCount > 0 ? `ЕСТЬ: x${consumableCount}` : 'НЕТ В ИНВЕНТАРЕ';
  }

  const typeText = item.type === 'clothes' ? 'ОДЕЖДА' : 'РАСХОДНИК';

  preview.innerHTML = `
    <div class="shop-preview-card">
      <div class="shop-preview-hero">
        <div class="shop-preview-visual">
          <div class="shop-preview-icon-wrap">
            <div class="shop-preview-icon">${item.emoji}</div>
          </div>
        </div>

        <div class="shop-preview-main">
          <div class="shop-preview-topline">
            <div class="shop-preview-type">${typeText}</div>
            ${
              statusText
                ? `<div class="shop-preview-status">${statusText}</div>`
                : ''
            }
          </div>

          <div class="shop-preview-title">${item.name}</div>

          <div class="shop-preview-desc">
            ${item.desc || 'Без описания'}
          </div>

          ${
            item.type === 'consumable'
              ? `
                <div class="shop-preview-badges">
                  <div class="shop-preview-count">x${consumableCount}</div>
                </div>
              `
              : ''
          }
        </div>
      </div>

      <div class="shop-preview-bottom">
        <button
          class="shop-buy-btn shop-buy-btn-inline ${notEnough ? 'not-enough' : ''}"
          ${notEnough ? 'disabled' : ''}
        >
          КУПИТЬ • <span class="price">💰 ${item.price}</span>
        </button>
      </div>
    </div>
  `;

  const btn = preview.querySelector('.shop-buy-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      buyShopItem(item.id);

      if (item.type === 'clothes') {
      uiState.selectedShopItem = null;
      }

      renderShopModal();
    });
  }
}

function openShopModal(openModal = true) {
  const modal = document.getElementById('shopModal');
  if (!modal) return;

  if (openModal) {
    openPanelModal('shopModal');
  }

  renderShopModal();
}

function buyShopItem(id) {
  const item = shopItems.find(i => i.id === id);
  if (!item) return;

  if (player.coins < item.price) {
    showWarning('❌ НЕ ХВАТАЕТ МОНЕТ!');
    return;
  }

  if (!player.ownedShopItems) player.ownedShopItems = [];
  if (!player.consumables) player.consumables = [];

  if (item.type === 'clothes') {
    if (player.ownedShopItems.includes(id)) {
      showWarning('⚠️ УЖЕ КУПЛЕНО!');
      return;
    }

    player.coins -= item.price;
    player.ownedShopItems.push(id);
    showTrickEffect(`🎒 ${item.name}`);
  }

  if (item.type === 'consumable') {
    player.coins -= item.price;

    const existing = player.consumables.find(c => c.id === id);
    if (existing) {
      existing.count += 1;
    } else {
      player.consumables.push({ id, count: 1 });
      showTrickEffect(`🎒 ${item.name}`);
    }
  }

  finalizePlayerUpdate();
  openShopModal(false);
}
function equipInventoryItem(id) {
  const item = shopItems.find(i => i.id === id);
  if (!item) return;

  if (item.type !== 'clothes') return;

  if (!player.ownedShopItems || !player.ownedShopItems.includes(id)) {
    showWarning('❌ СНАЧАЛА КУПИ ПРЕДМЕТ!');
    return;
  }

  if (!player.equipped) {
    player.equipped = {};
  }

  player.equipped[item.category] = item.id;
  applyEquipmentBonuses();
  finalizePlayerUpdate();
  openInventoryModal(false);
  openShopModal(false);
}
function equipShopItem(id) {
  equipInventoryItem(id);
}
function unequipShopItem(category) {
  if (!category) return;

  if (!player.equipped) {
    player.equipped = {};
  }

  player.equipped[category] = null;
  applyEquipmentBonuses();
  finalizePlayerUpdate();
  openInventoryModal(false);
  openShopModal(false);
}
function useConsumableItem(id) {
  const item = shopItems.find(i => i.id === id);
  if (!item) return;
  if (item.type !== 'consumable') return;

  if (!player.consumables) {
    player.consumables = [];
  }

  const existing = player.consumables.find(c => c.id === id);
  if (!existing || existing.count <= 0) {
    showWarning('❌ ЭТОГО ПРЕДМЕТА НЕТ!');
    return;
  }

  if (item.effect?.energy) {
    player.energy = Math.min(player.maxEnergy, player.energy + item.effect.energy);
    showTrickEffect(`⚡ +${item.effect.energy}`);
  }

  if (item.effect?.drive) {
    player.drive = Math.min(100, player.drive + item.effect.drive);
    showTrickEffect(`💥 +${item.effect.drive}`);
  }

  existing.count -= 1;

  if (existing.count <= 0) {
    player.consumables = player.consumables.filter(c => c.id !== id);
  }

  finalizePlayerUpdate();
  openInventoryModal(false);
  openShopModal(false);
}


function getInventoryEntries() {
  const entries = [];

  const ownedClothes = (player.ownedShopItems || [])
    .map(itemId => shopItems.find(i => i.id === itemId))
    .filter(Boolean);

  ownedClothes.forEach(item => {
    const equipped = !!(player.equipped && player.equipped[item.category] === item.id);

    entries.push({
      key: `clothes:${item.id}`,
      kind: 'clothes',
      item,
      equipped,
      count: 1
    });
  });

  (player.consumables || []).forEach(entry => {
    const item = shopItems.find(i => i.id === entry.id);
    if (!item) return;

    entries.push({
      key: `consumable:${item.id}`,
      kind: 'consumable',
      item,
      equipped: false,
      count: entry.count || 0
    });
  });

  return entries;
}

function getFilteredInventoryEntries() {
  return getInventoryEntries().filter(entry => {
    if (uiState.currentInventoryFilter === 'all') return true;
    if (uiState.currentInventoryFilter === 'clothes') return entry.kind === 'clothes';
    if (uiState.currentInventoryFilter === 'consumable') return entry.kind === 'consumable';
    if (uiState.currentInventoryFilter === 'equipped') return entry.kind === 'clothes' && entry.equipped;
    return true;
  });
}

function syncInventorySelection(entries) {
  const safeEntries = Array.isArray(entries) ? entries : getFilteredInventoryEntries();

  if (!safeEntries.length) {
    uiState.selectedInventoryKey = null;
    return null;
  }

  const exists = safeEntries.find(entry => entry.key === uiState.selectedInventoryKey);
  if (exists) return exists;

  uiState.selectedInventoryKey = safeEntries[0].key;
  return safeEntries[0];
}

function getSelectedInventoryEntry(entries) {
  const selected = syncInventorySelection(entries);
  return selected || null;
}

function renderInventoryRiderPreview() {
  const preview = document.getElementById('inventoryRiderPreview');
  if (!preview) return;

  const riderSrc = document.getElementById('riderImg')?.getAttribute('src') || '';
  const equippedEntries = getInventoryEntries().filter(entry => entry.kind === 'clothes' && entry.equipped);

  const chipsMarkup = equippedEntries.length
    ? `<div class="inventory-equipped-chips">${equippedEntries.map(entry => `<span class="inventory-equipped-chip">${entry.item.name}</span>`).join('')}</div>`
    : '';

  preview.innerHTML = `
    <div class="inventory-rider-stage">
      ${riderSrc ? `<img class="inventory-rider-image" src="${riderSrc}" alt="Райдер" onload="syncInventoryStickyOffsets()">` : ''}
    </div>
    ${chipsMarkup}
  `;
}

function renderInventorySelectedCard(selectedEntry) {
  const card = document.getElementById('inventorySelectedCard');
  if (!card) return;

  if (!selectedEntry) {
    card.innerHTML = '<div class="inventory-selected-empty">ВЫБЕРИ ПРЕДМЕТ</div>';
    return;
  }

  const item = selectedEntry.item;

  if (selectedEntry.kind === 'consumable') {
    card.innerHTML = `
      <div class="inventory-selected-name">${item.name}</div>
      <div class="inventory-selected-desc">• ${item.desc} •</div>
      <button class="inventory-selected-use" data-use-id="${item.id}">ИСПОЛЬЗОВАТЬ</button>
    `;
    return;
  }

  card.innerHTML = `
    <div class="inventory-selected-title-row">
      <div class="inventory-selected-title">${item.name}</div>
      <button class="inventory-selected-toggle" data-toggle-id="${item.id}">
        ${selectedEntry.equipped ? 'СНЯТЬ' : 'НАДЕТЬ'}
      </button>
    </div>
    <div class="inventory-selected-desc">• ${item.desc} •</div>
  `;
}

function updateInventoryHeaderBalance() {
  const el = document.getElementById('inventoryCoinsAmount');
  if (el) {
    el.textContent = `💰 ${player.coins}`;
  }
}

function syncInventoryStickyOffsets() {
  const panelBody = document.getElementById('inventoryPanelBody');
  const stickyTop = document.getElementById('inventoryStickyTop');
  if (!panelBody || !stickyTop) return;

  panelBody.style.setProperty('--inventory-sticky-offset', `${stickyTop.offsetHeight + 4}px`);
}

function renderInventoryFilters() {
  const filtersContainer = document.getElementById('inventoryFilters');
  if (!filtersContainer) return;

  const filters = [
    { id: 'all', label: 'ВСЁ' },
    { id: 'clothes', label: 'ОДЕЖДА' },
    { id: 'consumable', label: 'РАСХОДНИКИ' },
    { id: 'equipped', label: 'НАДЕТО' }
  ];

  filtersContainer.innerHTML = '';

  filters.forEach(filter => {
    const btn = document.createElement('button');
    btn.className = 'inventory-filter-btn' + (uiState.currentInventoryFilter === filter.id ? ' active' : '');
    btn.textContent = filter.label;

    btn.addEventListener('click', () => {
  uiState.currentInventoryFilter = filter.id;
  renderInventoryModal();
});

    filtersContainer.appendChild(btn);
  });
}
function renderInventoryModal() {
  const content = document.getElementById('inventoryModalContent');
  if (!content) return;

  try {
    updateInventoryHeaderBalance();
    renderInventoryFilters();
    renderInventoryRiderPreview();

    content.innerHTML = '';

    const visibleEntries = getFilteredInventoryEntries();
    const selectedEntry = getSelectedInventoryEntry(visibleEntries);

    renderInventorySelectedCard(selectedEntry);

    if (visibleEntries.length === 0) {
      content.innerHTML = '<p style="text-align:center; padding:20px;">🎒 НИЧЕГО НЕ НАЙДЕНО</p>';
      syncInventoryStickyOffsets();
      return;
    }

    visibleEntries.forEach(entry => {
      const { item } = entry;
      const div = document.createElement('button');
      div.type = 'button';
      div.className = 'inventory-card' + (uiState.selectedInventoryKey === entry.key ? ' selected' : '');
      div.dataset.selectKey = entry.key;

      div.innerHTML = `
        <div class="inventory-title">${item.name}</div>
        <div class="inventory-icon">${item.emoji}</div>
        <div class="inventory-card-meta">
          ${entry.kind === 'consumable'
            ? `<span class="inventory-badge">x${entry.count}</span>`
            : entry.equipped
              ? '<span class="inventory-badge">НАДЕТО</span>'
              : '<span class="inventory-badge inventory-badge-muted">В РЮКЗАКЕ</span>'}
        </div>
      `;

      content.appendChild(div);
    });

    content.querySelectorAll('[data-select-key]').forEach(card => {
      card.addEventListener('click', e => {
        uiState.selectedInventoryKey = e.currentTarget.dataset.selectKey;
        renderInventoryModal();
      });
    });

    document.querySelectorAll('#inventorySelectedCard [data-toggle-id]').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.toggleId;
        const item = shopItems.find(shopItem => shopItem.id === id);
        if (!item) return;

        const equipped = !!(player.equipped && player.equipped[item.category] === item.id);
        if (equipped) {
          unequipShopItem(item.category);
        } else {
          equipInventoryItem(item.id);
        }
      });
    });

    document.querySelectorAll('#inventorySelectedCard [data-use-id]').forEach(btn => {
      btn.addEventListener('click', e => {
        useConsumableItem(e.currentTarget.dataset.useId);
      });
    });

    syncInventoryStickyOffsets();
  } catch (error) {
    console.error('Ошибка в renderInventoryModal:', error);
    content.innerHTML = '<p style="text-align:center; padding:20px; color:#ff8080;">❌ Ошибка открытия инвентаря</p>';
  }
}
function openInventoryModal(openModal = true) {
  const modal = document.getElementById('inventoryModal');
  if (!modal) return;

  if (openModal) {
    openPanelModal('inventoryModal');
  }

  renderInventoryModal();
}
function getCustomizationFiltersForCurrentType() {
  if (player.type === 'scooter') {
    return ['all', 'deck', 'bar', 'grips', 'headset', 'wheels', 'grip', 'sticker', 'upgrades'];
  }
  return ['all'];
}

function getCustomizationFilterLabel(filter) {
  const labels = {
    all: 'ВСЁ',
    deck: 'ДЕКИ',
    bar: 'РУЛИ',
    grips: 'ГРИПСЫ',
    headset: 'РУЛЕВЫЕ',
    wheels: 'КОЛЁСА',
    grip: 'ШКУРКИ',
    sticker: 'НАКЛЕЙКИ',
    upgrades: 'АПГРЕЙДЫ'
  };
  return labels[filter] || filter.toUpperCase();
}

function renderCustomizationTabs() {
  const tabsContainer = document.getElementById('customizationTabs');
  if (!tabsContainer) return;

  const filters = getCustomizationFiltersForCurrentType();
  tabsContainer.innerHTML = '';

  filters.forEach(filter => {
    const btn = document.createElement('button');
    btn.className = 'customization-tab' + (uiState.currentCustomizationFilter === filter ? ' active' : '');
    btn.textContent = getCustomizationFilterLabel(filter);

    btn.addEventListener('click', () => {
uiState.currentCustomizationFilter = filter;
renderCustomizationTabs();
renderCustomizationShop();
    });

    tabsContainer.appendChild(btn);
  });
}

function getFilteredCustomizationItems() {
  return workshopItems.filter(item => {
    if (item.vehicleType !== player.type) return false;
    if (item.type !== 'custom') return false;
if (uiState.currentCustomizationFilter === 'all') return true;
return item.slot === uiState.currentCustomizationFilter;
  });
}

function renderWorkshopSelectedItemInfo() {
  const info = document.getElementById('workshopSelectedItemInfo');
  if (!info) return;

  if (!uiState.selectedWorkshopItem) {
    info.innerHTML = `
      <div class="workshop-selected-item-empty">
        Выбери предмет
      </div>
    `;
    return;
  }

  const item = uiState.selectedWorkshopItem;
  const isUpgrade = item.type === 'upgrade';

  const owned = isUpgrade
    ? (player.ownedUpgrades || []).includes(item.id)
    : (player.ownedCustomization || []).includes(item.id);

  const equipped = !isUpgrade &&
    player.customization &&
    player.customization[item.vehicleType] &&
    player.customization[item.vehicleType][item.slot] === item.variant;

  const notEnough = player.coins < item.price;
  const typeText = isUpgrade ? 'АПГРЕЙД' : getCustomizationFilterLabel(item.slot || 'all');
  const desc = item.desc || (isUpgrade ? 'Улучшение транспорта' : 'Деталь для кастомизации');

  let statusHtml = '';
  if (equipped) {
    statusHtml = `<div class="workshop-selected-item-status">НАДЕТО</div>`;
  } else if (owned) {
    statusHtml = `<div class="workshop-selected-item-status">КУПЛЕНО</div>`;
  }

  let actionHtml = '';

  if (isUpgrade) {
    if (owned) {
      actionHtml = `<div class="workshop-selected-item-badge">КУПЛЕНО</div>`;
    } else {
      actionHtml = `
        <button class="workshop-selected-item-btn ${notEnough ? 'not-enough' : ''}" ${notEnough ? 'disabled' : ''}>
          КУПИТЬ • <span class="price">💰 ${item.price}</span>
        </button>
      `;
    }
  } else {
    if (equipped) {
      actionHtml = `<div class="workshop-selected-item-badge">НАДЕТО</div>`;
    } else if (owned) {
      actionHtml = `
        <button class="workshop-selected-item-btn">
          НАДЕТЬ
        </button>
      `;
    } else {
      actionHtml = `
        <button class="workshop-selected-item-btn ${notEnough ? 'not-enough' : ''}" ${notEnough ? 'disabled' : ''}>
          КУПИТЬ • <span class="price">💰 ${item.price}</span>
        </button>
      `;
    }
  }

  info.innerHTML = `
    <div class="workshop-selected-item-card">
      <div class="workshop-selected-item-top">
        <div class="workshop-selected-item-type">${typeText}</div>
        ${statusHtml}
      </div>

      <div class="workshop-selected-item-title">${item.name}</div>

      <div class="workshop-selected-item-desc">
        ${desc}
      </div>

      <div class="workshop-selected-item-bottom">
        ${actionHtml}
      </div>
    </div>
  `;

  const btn = info.querySelector('.workshop-selected-item-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (isUpgrade) {
      if (!owned) {
        buyWorkshopUpgrade(item.id);
      }
      return;
    }

    if (owned) {
      equipCustomizationItem(item.id);
    } else {
      buyCustomizationItem(item.id);
    }
  });
}

function syncPreviewCustomizationFromPlayer() {
  uiState.previewCustomization = {
    ...(player.customization?.scooter || {})
  };
}

function updateVehiclePreview(customState = null) {
  if (player.type !== 'scooter') return;
  if (!player.customization || !player.customization.scooter) return;

  const c = customState || uiState.previewCustomization || player.customization.scooter;
  if (!c) return;

  const baseLayer = document.getElementById('baseLayer');
  const deckLayer = document.getElementById('deckLayer');
  const barLayer = document.getElementById('barLayer');
  const gripsLayer = document.getElementById('gripsLayer');
  const headsetLayer = document.getElementById('headsetLayer');
  const wheelsLayer = document.getElementById('wheelsLayer');
  const gripLayer = document.getElementById('gripLayer');
  const stickerLayer = document.getElementById('stickerLayer');

  const fallbackBase = getFallbackDataUri('BASE');
  const fallbackDeck = getFallbackDataUri('DECK');
  const fallbackBar = getFallbackDataUri('BAR');
  const fallbackGrips = getFallbackDataUri('GRIPS');
  const fallbackHeadset = getFallbackDataUri('HEAD');
  const fallbackWheels = getFallbackDataUri('WHEEL');
  const fallbackGrip = getFallbackDataUri('GRIP');
  const fallbackSticker = getFallbackDataUri('STICK');

  if (baseLayer) {
    safeSetImage(baseLayer, 'assets/custom/scooter/base/default.png', fallbackBase);
  }

  if (deckLayer) {
    safeSetImage(deckLayer, `assets/custom/scooter/deck/${c.deck}.png`, fallbackDeck);
  }

  if (barLayer) {
    safeSetImage(barLayer, `assets/custom/scooter/bar/${c.bar}.png`, fallbackBar);
  }

  if (gripsLayer) {
    safeSetImage(gripsLayer, `assets/custom/scooter/grips/${c.grips}.png`, fallbackGrips);
  }

  if (headsetLayer) {
    safeSetImage(headsetLayer, `assets/custom/scooter/headset/${c.headset}.png`, fallbackHeadset);
  }

  if (wheelsLayer) {
    safeSetImage(wheelsLayer, `assets/custom/scooter/wheels/${c.wheels}.png`, fallbackWheels);
  }

  if (gripLayer) {
    safeSetImage(gripLayer, `assets/custom/scooter/grip/${c.grip}.png`, fallbackGrip);
  }

  if (stickerLayer) {
    safeSetImage(stickerLayer, `assets/custom/scooter/sticker/${c.sticker}.png`, fallbackSticker);
  }
}

function buyCustomizationItem(itemId) {
  const item = workshopItems.find(i => i.id === itemId);
  if (!item) return;

  if (!player.ownedCustomization) player.ownedCustomization = [];

  if (player.ownedCustomization.includes(itemId)) {
    showWarning('⚠️ УЖЕ КУПЛЕНО!');
    return;
  }

  if (player.coins < item.price) {
    showWarning('❌ НЕ ХВАТАЕТ МОНЕТ!');
    return;
  }

  player.coins -= item.price;
  player.ownedCustomization.push(itemId);
  if (item.vehicleType === 'scooter') {
  if (!uiState.previewCustomization) {
    syncPreviewCustomizationFromPlayer();
  }
  uiState.previewCustomization[item.slot] = item.variant;
}

  finalizePlayerUpdate();
  openWorkshopPanel(false);
}

function equipCustomizationItem(itemId) {
  const item = workshopItems.find(i => i.id === itemId);
  if (!item) return;

  if (!player.ownedCustomization || !player.ownedCustomization.includes(itemId)) {
    showWarning('❌ СНАЧАЛА КУПИ ПРЕДМЕТ!');
    return;
  }

  if (!player.customization) return;
  if (!player.customization[item.vehicleType]) return;

  player.customization[item.vehicleType][item.slot] = item.variant;

  if (item.vehicleType === 'scooter') {
    syncPreviewCustomizationFromPlayer();
  }

  finalizePlayerUpdate();
  openWorkshopPanel(false);
}

function renderWorkshopUpgrades() {
  const grid = document.getElementById('customizationGrid');
  if (!grid) return;

  grid.innerHTML = '';

  const upgradeItems = workshopItems.filter(item =>
    item.vehicleType === player.type && item.type === 'upgrade'
  );

  if (!upgradeItems.length) {
    uiState.selectedWorkshopItem = null;
    renderWorkshopSelectedItemInfo();
    grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">ПРЕДМЕТЫ НЕ НАЙДЕНЫ</p>';
    return;
  }

  const selectedStillVisible = uiState.selectedWorkshopItem &&
  upgradeItems.some(item => item.id === uiState.selectedWorkshopItem.id);

if (!selectedStillVisible) {
  uiState.selectedWorkshopItem = upgradeItems[0];
}

  upgradeItems.forEach(item => {
    const owned = player.ownedUpgrades && player.ownedUpgrades.includes(item.id);
    const isSelected = uiState.selectedWorkshopItem && uiState.selectedWorkshopItem.id === item.id;

    const card = document.createElement('div');
    card.className = 'custom-item workshop-select-card' + (isSelected ? ' selected' : '');

    card.innerHTML = `
      <div class="custom-item-title">${item.name}</div>
      <div class="item-bonus">${item.desc || ''}</div>
      ${owned ? '<span class="equipped-badge">КУПЛЕНО</span>' : ''}
    `;

    card.addEventListener('click', () => {
      uiState.selectedWorkshopItem = item;
      renderCustomizationShop();
      renderWorkshopSelectedItemInfo();
      updateVehiclePreview();
    });

    grid.appendChild(card);
  });

  renderWorkshopSelectedItemInfo();
}

function buyWorkshopUpgrade(itemId) {
  const item = workshopItems.find(i => i.id === itemId);
  if (!item) return;

  if (!player.ownedUpgrades) player.ownedUpgrades = [];

  if (player.ownedUpgrades.includes(itemId)) {
    showWarning('⚠️ УЖЕ КУПЛЕНО!');
    return;
  }

  if (player.coins < item.price) {
    showWarning('❌ НЕ ХВАТАЕТ МОНЕТ!');
    return;
  }

  player.coins -= item.price;
  player.ownedUpgrades.push(itemId);

  if (!player.upgrades) player.upgrades = { scooter: { durability: 0, efficiency: 0, reward: 0 } };
  if (!player.upgrades.scooter) player.upgrades.scooter = { durability: 0, efficiency: 0, reward: 0 };

  if (item.upgradeKey) {
    player.upgrades.scooter[item.upgradeKey] += item.value || 1;
  }

  finalizePlayerUpdate();
  openWorkshopPanel(false);
}

function renderWorkshopCustomItems() {
  const grid = document.getElementById('customizationGrid');
  if (!grid) return;

  const items = getFilteredCustomizationItems();

  if (!items.length) {
    uiState.selectedWorkshopItem = null;
    renderWorkshopSelectedItemInfo();
    grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">ПРЕДМЕТЫ НЕ НАЙДЕНЫ</p>';
    return;
  }

  grid.innerHTML = '';

  const selectedStillVisible = uiState.selectedWorkshopItem &&
  items.some(item => item.id === uiState.selectedWorkshopItem.id);

if (!selectedStillVisible) {
  uiState.selectedWorkshopItem = items[0];
}

if (
  uiState.selectedWorkshopItem &&
  uiState.selectedWorkshopItem.type === 'custom' &&
  uiState.selectedWorkshopItem.vehicleType === 'scooter'
) {
  if (!uiState.previewCustomization) {
    syncPreviewCustomizationFromPlayer();
  }

  uiState.previewCustomization[uiState.selectedWorkshopItem.slot] = uiState.selectedWorkshopItem.variant;
  updateVehiclePreview(uiState.previewCustomization);
}

  items.forEach(item => {
    const owned = player.ownedCustomization && player.ownedCustomization.includes(item.id);
    const equipped =
      player.customization &&
      player.customization[item.vehicleType] &&
      player.customization[item.vehicleType][item.slot] === item.variant;

    const isSelected = uiState.selectedWorkshopItem && uiState.selectedWorkshopItem.id === item.id;

    const card = document.createElement('div');
    card.className = 'custom-item workshop-select-card' + (isSelected ? ' selected' : '');

    const previewImg = document.createElement('img');
    previewImg.alt = item.name;
    safeSetImage(previewImg, item.preview, getFallbackDataUri('PART'));

    const title = document.createElement('div');
    title.className = 'custom-item-title';
    title.textContent = item.name;

    card.appendChild(previewImg);
    card.appendChild(title);

    if (equipped) {
      const badge = document.createElement('span');
      badge.className = 'equipped-badge';
      badge.textContent = 'НАДЕТО';
      card.appendChild(badge);
    } else if (owned) {
      const badge = document.createElement('span');
      badge.className = 'equipped-badge';
      badge.textContent = 'КУПЛЕНО';
      card.appendChild(badge);
    }

card.addEventListener('click', () => {
  uiState.selectedWorkshopItem = item;

  if (item.type === 'custom' && item.vehicleType === 'scooter') {
    if (!uiState.previewCustomization) {
      syncPreviewCustomizationFromPlayer();
    }

    uiState.previewCustomization[item.slot] = item.variant;
    updateVehiclePreview(uiState.previewCustomization);
  } else {
    updateVehiclePreview();
  }

  renderCustomizationShop();
  renderWorkshopSelectedItemInfo();
});

    grid.appendChild(card);
  });

  renderWorkshopSelectedItemInfo();
}

function renderCustomizationShop() {
  const grid = document.getElementById('customizationGrid');
  if (!grid) return;

  grid.innerHTML = '';

  if (uiState.currentCustomizationFilter === 'upgrades') {
    renderWorkshopUpgrades();
    return;
  }

  renderWorkshopCustomItems();
}

function openWorkshopPanel(openModal = true) {
  const panel = document.getElementById('workshopPanel');
  if (!panel) return;

  const availableFilters = getCustomizationFiltersForCurrentType();

  if (!availableFilters.includes(uiState.currentCustomizationFilter)) {
  uiState.currentCustomizationFilter = 'all';
}

  syncPreviewCustomizationFromPlayer();

  const visibleItems = uiState.currentCustomizationFilter === 'upgrades'
    ? workshopItems.filter(item => item.vehicleType === player.type && item.type === 'upgrade')
    : getFilteredCustomizationItems();

if (!uiState.selectedWorkshopItem || !visibleItems.some(item => item.id === uiState.selectedWorkshopItem.id)) {
  uiState.selectedWorkshopItem = visibleItems[0] || null;
}

if (
  uiState.selectedWorkshopItem &&
  uiState.selectedWorkshopItem.type === 'custom' &&
  uiState.selectedWorkshopItem.vehicleType === 'scooter'
) {
  uiState.previewCustomization[uiState.selectedWorkshopItem.slot] = uiState.selectedWorkshopItem.variant;
}

  updateStats();
  renderCustomizationTabs();
  renderCustomizationShop();
  renderWorkshopSelectedItemInfo();
  updateVehiclePreview();

  if (openModal) {
    openPanelModal('workshopPanel');
  }
}

function renderQuests() {
  const questsDiv = document.getElementById('questsList');
  const emptyMsg = document.getElementById('questsEmpty');
  if (!questsDiv || !emptyMsg) return;

  const activeQuests = questDefinitions.filter(q => !player.completedQuests.includes(q.id));
  if (activeQuests.length === 0) {
    questsDiv.innerHTML = '';
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';
  questsDiv.innerHTML = '';
  activeQuests.forEach(q => {
    const progress = q.onProgress(player);
    const div = document.createElement('div');
    div.className = 'quest-item';
    div.innerHTML = `
      <div style="flex:2; text-align:left;">
        <strong>${q.name}</strong><br>
        <small>${q.description}</small>
      </div>
      <div style="text-align:right;">
        <div class="quest-progress">${progress}/${q.target}</div>
        <div>💰+${q.rewardCoins} ✨+${q.rewardXP}</div>
      </div>
    `;
    questsDiv.appendChild(div);
  });
}

function renderAchievements() {
  const achDiv = document.getElementById('achievementsList');
  const emptyMsg = document.getElementById('achievementsEmpty');
  if (!achDiv || !emptyMsg) return;

  const completed = achievements.filter(a => player.achievements.includes(a.id));
  const pending = achievements.filter(a => !player.achievements.includes(a.id));
  const all = [...pending, ...completed];

  achDiv.innerHTML = '';
  if (all.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';

  all.forEach(ach => {
    const current = ach.current();
    const completedFlag = player.achievements.includes(ach.id);
    const div = document.createElement('div');
    div.className = 'achievement-item';

    div.innerHTML = `
      <div style="flex:1 1 auto; min-width:0; text-align:left;">
        <strong>${ach.name}</strong><br>
        <small>${ach.desc}</small>
        <div class="achievement-progress">${current}/${ach.target}</div>
      </div>

      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px; text-align:right;">
        <div style="line-height:1.25; font-size:0.85rem;">
          💰+${ach.rewardCoins} ✨+${ach.rewardXP}${ach.rewardItem ? ` 🎁+${ach.rewardItemDesc}` : ''}
        </div>
        ${completedFlag
          ? '<span class="equipped-badge">ВЫПОЛНЕНО</span>'
          : '<span class="quest-progress" style="white-space:nowrap;">В ПРОЦЕССЕ</span>'}
      </div>
    `;

    achDiv.appendChild(div);
  });
}

function getDailyBonusAmount(day) {
  const rewards = [
    { coins: 20, xp: 10 },
    { coins: 25, xp: 12 },
    { coins: 30, xp: 15 },
    { coins: 35, xp: 17 },
    { coins: 40, xp: 20 },
    { coins: 45, xp: 22 },
    { coins: 50, xp: 25 }
  ];
  if (day >= 7) return rewards[6];
  return rewards[Math.max(0, day - 1)];
}

function renderDailyBonusPanel() {
  const today = getLocalDateString();
  const canClaim = player.lastLoginDate === today && !player.dailyBonusClaimed;
  const bonus = getDailyBonusAmount(player.loginStreak || 1);
  const infoDiv = document.getElementById('dailyBonusInfo');
  if (!infoDiv) return;

  infoDiv.innerHTML = `
    <div style="font-size:1.2rem; margin-bottom:10px;">День ${player.loginStreak || 1}</div>
    <div>🎁 Награда: ${bonus.coins}💰 + ${bonus.xp} XP</div>
    <div style="margin-top:10px;">${canClaim ? '✅ Бонус доступен!' : '❌ Бонус уже получен сегодня'}</div>
  `;
}

function checkDailyBonus() {
  const today = getLocalDateString();
  if (player.lastLoginDate === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  if (player.lastLoginDate === yesterdayStr) {
    player.loginStreak = Math.min(7, (player.loginStreak || 1) + 1);
  } else {
    player.loginStreak = 1;
  }

  player.lastLoginDate = today;
  player.dailyBonusClaimed = false;
  saveState();

  const bonus = getDailyBonusAmount(player.loginStreak);
  showTrickEffect(`🎁 День ${player.loginStreak}: +${bonus.coins}💰 +${bonus.xp}XP`);
}

function claimDailyBonus() {
  const today = getLocalDateString();
  if (player.lastLoginDate !== today) {
    checkDailyBonus();
  }

  if (player.lastLoginDate === today && !player.dailyBonusClaimed) {
    const bonus = getDailyBonusAmount(player.loginStreak);

    addFlatCoins(bonus.coins);
    addFlatXP(bonus.xp);

    player.dailyBonusClaimed = true;

    finalizePlayerUpdate();
    renderDailyBonusPanel();
    showTrickEffect(`🎉 БОНУС +${bonus.coins}💰 +${bonus.xp}XP`);
  } else {
    showTrickEffect('❌ Бонус уже получен');
  }
}

function checkQuests() {
  let changed = false;

  questDefinitions.forEach(quest => {
    if (player.completedQuests.includes(quest.id)) return;
    if (!quest.check(player)) return;

    player.completedQuests.push(quest.id);

    addFlatCoins(quest.rewardCoins || 0);
    addFlatXP(quest.rewardXP || 0);

    showTrickEffect(`🏆 ${quest.name}`);
    changed = true;
  });

  if (!changed) return;
}

function checkAchievements() {
  let changed = false;

  achievements.forEach(ach => {
    if (player.achievements.includes(ach.id)) return;
    if (ach.current() < ach.target) return;

    player.achievements.push(ach.id);

    addFlatCoins(ach.rewardCoins || 0);
    addFlatXP(ach.rewardXP || 0);

    showTrickEffect(`🏆 ДОСТИЖЕНИЕ: ${ach.name}`);
    changed = true;
  });

  if (!changed) return;

  applyEquipmentBonuses();
}

function applyTimePenalty() {
  const now = Date.now();
  const hoursPassed = Math.floor((now - player.lastVisit) / (1000 * 60 * 60));
  if (hoursPassed <= 0) return;

  player.energy = Math.max(0, player.energy - hoursPassed * 7);
  player.drive = Math.max(0, player.drive - hoursPassed * 3);
  player.isSleeping = player.energy === 0;

  if (hoursPassed >= 24) {
    const welcomeBonus = Math.floor(hoursPassed / 24) * 20;
    player.coins += welcomeBonus;
    showTrickEffect(`🎁 Возвращение: +${welcomeBonus}💰`);
  }

  player.lastVisit = now;
  saveState();
  showTrickEffect(`⏳ +${hoursPassed} ч.`);
}

function saveState() {
  player.lastVisit = Date.now();
  localStorage.setItem(STORAGE_KEYS.game, JSON.stringify(player));
  localStorage.setItem(STORAGE_KEYS.tutorial, String(player.tutorialCompleted));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEYS.game);

  if (saved) {
    try {
      const old = JSON.parse(saved);
      const defaults = createDefaultPlayer();

      player = { ...defaults, ...old };
      player.equipped = { ...defaults.equipped, ...(old.equipped || {}) };
      player.quests = { ...defaults.quests, ...(old.quests || {}) };

      player.customization = {
        ...defaults.customization,
        ...(old.customization || {})
      };

      player.customization.scooter = {
        ...defaults.customization.scooter,
        ...((old.customization && old.customization.scooter) || {})
      };

      player.ownedCustomization = old.ownedCustomization || [];
      player.ownedUpgrades = old.ownedUpgrades || [];
      player.ownedShopItems = old.ownedShopItems || [];
      player.consumables = old.consumables || [];
      player.completedQuests = old.completedQuests || [];
      player.achievements = old.achievements || [];
      player.upgrades = {
        ...defaults.upgrades,
        ...(old.upgrades || {})
      };

      player.upgrades.scooter = {
        ...defaults.upgrades.scooter,
        ...((old.upgrades && old.upgrades.scooter) || {})
      };
    } catch (error) {
      console.error('Не удалось прочитать сохранение:', error);
    }
  }

  if (player.level === undefined) player.level = Math.max(1, player.skill || 1);
  if (player.xp === undefined) player.xp = 0;
  if (!player.xpToNext) player.xpToNext = BALANCE.xpBase + (player.level - 1) * BALANCE.xpIncrement;

  uiState.currentType = player.type || 'scooter';

  const tutorialFlag = localStorage.getItem(STORAGE_KEYS.tutorial);
  if (tutorialFlag === 'true') player.tutorialCompleted = true;

syncSkillFromLevel();
applyTimePenalty();
applyEquipmentBonuses();
checkDailyBonus();

previousStats = createPreviousStatsSnapshot(player);
hydrateUIFromState();

if (!player.name) {
  openStartScreen('create');
} else {
  hideStartScreen();
  if (!player.tutorialCompleted) showTutorial();
}
}
function openStartScreen(mode = 'create') {
  uiState.startScreenMode = mode;
  const startScreen = document.getElementById('startScreen');
  if (!startScreen) return;

  startScreen.style.display = 'flex';
  document.querySelectorAll('.top-bar, .level-box, .stats-row, .rider-container, .game-actions, .game-title, .footer-note, .mini-game').forEach(el => {
    if (el) el.style.opacity = '0.3';
  });

  document.getElementById('riderNameInput').value = player.name || '';
  uiState.currentType = player.type || 'scooter';

  const typeBtns = document.querySelectorAll('.type-btn');
  typeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === uiState.currentType);
  });

  const skinIds = uiState.currentType === 'scooter'
    ? ['scooter1', 'scooter2', 'scooter3']
    : currentType === 'skate'
      ? ['skate1', 'skate2', 'skate3']
      : ['roller1', 'roller2', 'roller3'];

  uiState.currentSkinIndex = Math.max(0, skinIds.indexOf(player.skin));
  renderSkinCarousel();
}

function hideStartScreen() {
  const startScreen = document.getElementById('startScreen');
  if (startScreen) startScreen.style.display = 'none';
  document.querySelectorAll('.top-bar, .level-box, .stats-row, .rider-container, .game-actions, .game-title, .footer-note, .mini-game').forEach(el => {
    if (el) el.style.opacity = '';
  });
}

function startGameHandler() {
  const nameInput = document.getElementById('riderNameInput');
  const name = nameInput.value.trim();
  if (!name) {
    showWarning('❌ Введите имя райдера!');
    nameInput.focus();
    return;
  }

  player.name = name;
  player.type = currentType;
  player.type = uiState.currentType;
player.skin =
  uiState.currentSkinsList[uiState.currentSkinIndex]?.id ||
  (uiState.currentType === 'scooter'
    ? 'scooter1'
    : uiState.currentType === 'skate'
      ? 'skate1'
      : 'roller1');

  applySkin(player.type, player.skin);
  saveState();
  hideStartScreen();
  updateStats();
  updateVehiclePreview();
  refreshTooltips();

  if (uiState.startScreenMode === 'create' && !player.tutorialCompleted) {
    showTutorial();
  }
}

function showWarning(message) {
  const msgSpan = document.getElementById('warningMessage');
  if (!warningModalElem || !msgSpan) return;
  msgSpan.textContent = message;
  warningModalElem.classList.add('visible');
}

function closeActiveElement() {
  if (!activeElement) return;
  if (activeElement === trickOverlay) {
    closeTrickOverlay();
    return;
  }
if (activeElement === miniGame) {
  stopTrickRoundAnimation();
  miniGame.style.display = 'none';
}  
  else if (activeElement === ridingProgressContainer) {
    if (ridingInterval) clearInterval(ridingInterval);
    ridingInterval = null;
    ridingProgressContainer.style.display = 'none';
    rideBtn.disabled = false;
    trickBtn.disabled = false;
    restBtn.disabled = false;
  } else {
    activeElement.style.display = 'none';
  }

  activeElement = null;
}

function closeAllPanels() {
  [
    'workshopPanel',
    'questsPanel',
    'achievementsPanel',
    'dailyBonusPanel',
    'shopModal',
    'inventoryModal'
  ].forEach(id => {
    const panel = document.getElementById(id);
    if (panel) panel.style.display = 'none';
  });
}

function resetPlayerState() {
  player = createDefaultPlayer();
  previousStats = createPreviousStatsSnapshot(player);
uiState = createDefaultUIState();
uiState.currentType = 'scooter';

  localStorage.removeItem(STORAGE_KEYS.game);
  localStorage.removeItem(STORAGE_KEYS.tutorial);

  closeActiveElement();
  closeAllPanels();
  closeShopModal();
  closeInventoryModal();
  hideResetModal();

  if (warningModalElem) warningModalElem.classList.remove('visible');
  if (dropdownMenu) dropdownMenu.style.display = 'none';

  const shopModalContent = document.getElementById('shopModalContent');
  const inventoryModalContent = document.getElementById('inventoryModalContent');
  if (shopModalContent) shopModalContent.innerHTML = '';
  if (inventoryModalContent) inventoryModalContent.innerHTML = '';

  renderSkinCarousel();
  applyEquipmentBonuses();
  updateStats();
  updateVehiclePreview();
  openStartScreen('create');
}

function handleTrickClick() {
  if (isTrickOverlayOpen()) return;

  closeActiveElement();

  if (player.isSleeping) {
    showTrickEffect('💤 СПИТ');
    return;
  }

  if (player.scooter === 0) {
    showTrickEffect('🔧 СЛОМАН');
    return;
  }

  if (player.energy < BALANCE.trickEnergyCost) {
    showTrickEffect('⚡ НЕТ ЭНЕРГИИ');
    return;
  }

  openTrickOverlay();
}

function handleRideClick() {
  if (ridingProgressContainer.style.display === 'block') {
    closeActiveElement();
    return;
  }

  closeActiveElement();
  if (player.isSleeping) return showTrickEffect('💤 СПИТ');
  if (player.scooter === 0) return showTrickEffect('🔧 СЛОМАН');
  if (player.energy < BALANCE.rideEnergyCost) return showTrickEffect('⚡ НЕТ ЭНЕРГИИ');

  rideBtn.disabled = true;
  trickBtn.disabled = true;
  restBtn.disabled = true;
  ridingProgressContainer.style.display = 'block';
  activeElement = ridingProgressContainer;
  progressFill.style.width = '0%';

  const start = Date.now();
  const duration = 3000;

  if (ridingInterval) clearInterval(ridingInterval);
  ridingInterval = setInterval(() => {
    const elapsed = Date.now() - start;
    const percent = Math.min(100, (elapsed / duration) * 100);
    progressFill.style.width = `${percent}%`;

    if (elapsed < duration) return;

    clearInterval(ridingInterval);
    ridingInterval = null;

  player.energy = Math.max(0, player.energy - BALANCE.rideEnergyCost);
  player.drive = Math.min(100, player.drive + 10);
  player.quests.ridesCount++;

  addXP(BALANCE.rideBaseXP, true);
  addCoins(BALANCE.rideBaseCoins);
  showTrickEffect('🚴');

  rideBtn.disabled = false;
  trickBtn.disabled = false;
  restBtn.disabled = false;
  ridingProgressContainer.style.display = 'none';
  activeElement = null;
  }, 100);
}

function handleRest() {
  if (activeElement) closeActiveElement();
  if (player.energy >= player.maxEnergy) return showTrickEffect('⚡ MAX');

  player.energy = Math.min(player.maxEnergy, player.energy + BALANCE.restEnergyGain);
  player.drive = Math.max(0, player.drive - 10);
  if (player.energy > 0) player.isSleeping = false;

  showTrickEffect(`😴 +${BALANCE.restEnergyGain}⚡`);
  finalizePlayerUpdate();
}

function repairScooter() {
  if (player.scooter >= 100) return showTrickEffect('✅ УЖЕ КАК НОВЫЙ');
  if (player.coins < BALANCE.repairCoins) return showTrickEffect('💰 НЕТ МОНЕТ');

  player.coins -= BALANCE.repairCoins;
  player.scooter = 100;
  showTrickEffect('🔧 ПОЧИНЕН');
  finalizePlayerUpdate();
}

function repairWithXP() {
  if (player.scooter >= 100) return showTrickEffect('✅ УЖЕ КАК НОВЫЙ');
  if (player.xp < BALANCE.repairXP) return showTrickEffect(`❌ НУЖНО ${BALANCE.repairXP} XP`);

  player.xp -= BALANCE.repairXP;
  player.scooter = 100;
  showTrickEffect('🔧 ПОЧИНЕН ЗА XP');
  finalizePlayerUpdate();
}

function openPanelModal(panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return;

  const panelIds = [
    'workshopPanel',
    'questsPanel',
    'achievementsPanel',
    'dailyBonusPanel',
    'shopModal',
    'inventoryModal',
    'statsPanel'
  ];

  panelIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = id === panelId ? 'flex' : 'none';
  });

  setActiveTopTab(panelId === 'statsPanel' ? null : panelId);
}

function closePanelModal(panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return;

  if (panelId === 'workshopPanel') {
    syncPreviewCustomizationFromPlayer();
    updateVehiclePreview(player.customization?.scooter || null);
  }

  panel.style.display = 'none';

  if (panelId !== 'statsPanel') {
    setActiveTopTab(null);
  }
}

function handleWorkshop() {
  openWorkshopPanel(true);
}

function handleQuests() {
  renderQuests();
  openPanelModal('questsPanel');
}

function handleAchievements() {
  renderAchievements();
  openPanelModal('achievementsPanel');
}

function handleDailyBonus() {
  renderDailyBonusPanel();
  openPanelModal('dailyBonusPanel');
}

function handleShop() {
  openShopModal(true);
}

function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const clockDiv = document.getElementById('clock');
  if (clockDiv) clockDiv.textContent = `🕒 ${hours}:${minutes}`;
}

function updateBackgroundByTime() {
  const hour = new Date().getHours();
  let bgClass = 'bg-night';
  if (hour >= 6 && hour < 12) bgClass = 'bg-morning';
  else if (hour >= 12 && hour < 18) bgClass = 'bg-day';
  else if (hour >= 18 && hour < 21) bgClass = 'bg-evening';

  document.body.classList.remove('bg-morning', 'bg-day', 'bg-evening', 'bg-night');
  document.body.classList.add(bgClass);
  updateClock();
}

function showTutorial() {
  const tutorialDiv = document.createElement('div');
  tutorialDiv.className = 'tutorial-overlay';
  tutorialDiv.innerHTML = `
    <div class="tutorial-card">
      <h2>🎓 ДОБРО ПОЖАЛОВАТЬ, ${player.name}!</h2>
      <p>🛴 <strong>Тамагочи-Самокатер / Скейтер / Роллер</strong> — живи, катайся и становись легендой.</p>
      <p>⚡ Энергия тратится на трюки и катание.<br>
      💥 Драйв растёт от успешных действий.<br>
      🛴 Транспорт изнашивается — чини в мастерской.<br>
      🎯 В мини-игре «Трюк» попади в зелёную зону, чтобы получить комбо и бонусы.<br>
      🛍️ Предметы из магазина дают постоянные бонусы.<br>
      📜 Выполняй квесты и достижения.<br>
      🎁 Заходи каждый день за бонусом.</p>
      <p>Наведи курсор на элемент — появится подсказка.</p>
      <button id="closeTutorial">ПОНЯЛ, ПОГНАЛИ!</button>
    </div>
  `;
  document.body.appendChild(tutorialDiv);
  document.getElementById('closeTutorial').addEventListener('click', () => {
    tutorialDiv.remove();
    player.tutorialCompleted = true;
    saveState();
  });
}

function showTooltip(element, text) {
  if (tooltipTimeout) clearTimeout(tooltipTimeout);
  if (tooltipHideTimeout) clearTimeout(tooltipHideTimeout);
  if (currentTooltip) {
    currentTooltip.remove();
    currentTooltip = null;
  }

  tooltipTimeout = setTimeout(() => {
    const tooltip = document.createElement('div');
    tooltip.className = 'dynamic-tooltip visible';
    tooltip.textContent = text;
    document.body.appendChild(tooltip);

    const rect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
    let top = rect.top - tooltipRect.height - 8;

    if (left < 5) left = 5;
    if (left + tooltipRect.width > window.innerWidth - 5) left = window.innerWidth - tooltipRect.width - 5;
    if (top < 5) top = rect.bottom + 8;

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    currentTooltip = tooltip;

    tooltipHideTimeout = setTimeout(() => {
      if (currentTooltip) {
        currentTooltip.remove();
        currentTooltip = null;
      }
    }, 3000);
  }, 300);
}

function tooltipMouseLeave() {
  if (tooltipTimeout) clearTimeout(tooltipTimeout);
  if (tooltipHideTimeout) clearTimeout(tooltipHideTimeout);
  if (currentTooltip) {
    currentTooltip.remove();
    currentTooltip = null;
  }
}

function tooltipMouseEnter(e) {
  const el = e.currentTarget;
  const text = el.getAttribute('data-tooltip');
  if (text) showTooltip(el, text);
}


function autoAssignTooltips() {
  const labelMap = {
    resetGameBtn: 'Полный сброс прогресса',
    changeRiderBtn: 'Вернуться к выбору райдера',
    statsToggleBtn: 'Открыть статы райдера',
    claimDailyBonusBtn: 'Забрать ежедневный бонус',
    repairMainBtn: 'Открыть варианты ремонта',
    repairCoinsBtn: 'Починить транспорт за монеты',
    repairXPBtn: 'Починить транспорт за опыт',
    prevSkinBtn: 'Предыдущий скин',
    nextSkinBtn: 'Следующий скин',
    startGameBtn: 'Начать игру',
    resetConfirmYes: 'Подтвердить сброс',
    resetConfirmNo: 'Отменить',
    warningCloseBtn: 'Закрыть сообщение',
    trickBtn: 'Сделать трюк: попади в зелёную зону!',
    rideBtn: 'Катание: даёт XP и монеты, тратит энергию.',
    restBtn: 'Отдых: восстанавливает энергию.'
  };

  document.querySelectorAll('button').forEach(btn => {
    if (btn.dataset.tooltip) return;

    if (btn.id && labelMap[btn.id]) {
      btn.dataset.tooltip = labelMap[btn.id];
      return;
    }

    if (btn.classList.contains('close-btn')) {
      btn.dataset.tooltip = 'Закрыть';
      return;
    }

    if (btn.classList.contains('inventory-btn')) {
      btn.dataset.tooltip = btn.textContent.trim();
      return;
    }

    if (btn.classList.contains('customization-tab') || btn.classList.contains('inventory-filter-btn') || btn.classList.contains('type-btn')) {
      btn.dataset.tooltip = btn.textContent.trim();
      return;
    }

    const text = btn.textContent.replace(/\s+/g, ' ').trim();
    const aria = btn.getAttribute('aria-label');
    if (aria) {
      btn.dataset.tooltip = aria;
    } else if (text) {
      btn.dataset.tooltip = text;
    }
  });
}

function initTooltips() {
  autoAssignTooltips();
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.removeEventListener('mouseenter', tooltipMouseEnter);
    el.removeEventListener('mouseleave', tooltipMouseLeave);
    el.addEventListener('mouseenter', tooltipMouseEnter);
    el.addEventListener('mouseleave', tooltipMouseLeave);
  });
}

function refreshTooltips() {
  initTooltips();
}

function toggleDropdown(e) {
  e.stopPropagation();
  dropdownMenu.style.display = dropdownMenu.style.display === 'flex' ? 'none' : 'flex';
}

function closeDropdown(e) {
  if (!dropdownMenu.contains(e.target) && e.target !== gearBtn) {
    dropdownMenu.style.display = 'none';
  }
}

function showResetModal() {
  resetModal.classList.add('visible');
}

function hideResetModal() {
  resetModal.classList.remove('visible');
}

function closeShopModal() {
  closePanelModal('shopModal');
}

function closePanelModalByOverlay(event, panelId) {
  if (event.target.id === panelId) closePanelModal(panelId);
}

function closeInventoryModal() {
  closePanelModal('inventoryModal');
}

function setupStartScreen() {
  setupTypeButtons();
  initSwipe();
  document.getElementById('prevSkinBtn').addEventListener('click', prevSkin);
  document.getElementById('nextSkinBtn').addEventListener('click', nextSkin);
  startBtn.addEventListener('click', startGameHandler);
}

function setupMainEvents() {
    const unlockAudio = () => {
    AudioManager.ensureContext();
    document.removeEventListener('pointerdown', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
  };

  document.addEventListener('pointerdown', unlockAudio, { once: true });
  document.addEventListener('keydown', unlockAudio, { once: true });
  gearBtn.addEventListener('click', toggleDropdown);
  document.addEventListener('click', closeDropdown);

  document.getElementById('resetConfirmYes').addEventListener('click', () => {
    try {
      resetPlayerState();
      showWarning('✅ Игра сброшена');
    } catch (error) {
      console.error('Ошибка при сбросе игры:', error);
      location.reload();
    }
  });
  document.getElementById('resetConfirmNo').addEventListener('click', hideResetModal);
  document.getElementById('resetGameBtn').addEventListener('click', () => {
    dropdownMenu.style.display = 'none';
    showResetModal();
  });
  document.getElementById('changeRiderBtn').addEventListener('click', () => {
    dropdownMenu.style.display = 'none';
    openStartScreen('edit');
  });

  if (warningCloseBtn) {
    warningCloseBtn.addEventListener('click', () => warningModalElem.classList.remove('visible'));
  }

  if (warningModalElem) {
    warningModalElem.addEventListener('click', (e) => {
      if (e.target === warningModalElem) warningModalElem.classList.remove('visible');
    });
  }

  document.getElementById('shopModal').addEventListener('click', (e) => closePanelModalByOverlay(e, 'shopModal'));
  document.getElementById('inventoryModal').addEventListener('click', (e) => closePanelModalByOverlay(e, 'inventoryModal'));

  document.getElementById('workshopPanel').addEventListener('click', (e) => closePanelModalByOverlay(e, 'workshopPanel'));
  document.getElementById('questsPanel').addEventListener('click', (e) => closePanelModalByOverlay(e, 'questsPanel'));
  document.getElementById('achievementsPanel').addEventListener('click', (e) => closePanelModalByOverlay(e, 'achievementsPanel'));
  document.getElementById('dailyBonusPanel').addEventListener('click', (e) => closePanelModalByOverlay(e, 'dailyBonusPanel'));
  document.getElementById('statsPanel').addEventListener('click', (e) => closePanelModalByOverlay(e, 'statsPanel'));

  trickBtn.addEventListener('click', handleTrickClick);
    if (trickCloseBtn) {
    trickCloseBtn.addEventListener('click', closeTrickOverlay);
  }

  if (trickOverlayBackdrop) {
    trickOverlayBackdrop.addEventListener('click', closeTrickOverlay);
  }

  if (trickQuickRestBtn) {
    trickQuickRestBtn.addEventListener('click', quickRestFromTrickOverlay);
  }

  if (trickQuickEnergyBtn) {
    trickQuickEnergyBtn.addEventListener('click', quickUseEnergyDrinkFromTrickOverlay);
  }

  if (trickQuickRepairBtn) {
    trickQuickRepairBtn.addEventListener('click', quickRepairFromTrickOverlay);
  }
  rideBtn.addEventListener('click', handleRideClick);
  restBtn.addEventListener('click', handleRest);
  if (workshopBtn) workshopBtn.addEventListener('click', handleWorkshop);
  if (shopBtn) shopBtn.addEventListener('click', handleShop);
  if (questsBtn) questsBtn.addEventListener('click', handleQuests);
  if (achievementsBtn) achievementsBtn.addEventListener('click', handleAchievements);
  if (dailyBonusBtn) dailyBonusBtn.addEventListener('click', handleDailyBonus);

  topTabButtons.forEach(btn => {
    btn.addEventListener('click', () => openPanelFromTab(btn.dataset.panel));
  });

  if (statsToggleBtn) {
    statsToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openStatsPanel();
    });
  }

  const repairMainBtn = document.getElementById('repairMainBtn');
const repairOptions = document.getElementById('repairOptions');
const repairCoinsBtn = document.getElementById('repairCoinsBtn');
const repairXPBtn = document.getElementById('repairXPBtn');

if (repairMainBtn && repairOptions && repairCoinsBtn && repairXPBtn) {
  repairMainBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    repairOptions.style.display =
      repairOptions.style.display === 'flex' ? 'none' : 'flex';
  });

  repairCoinsBtn.addEventListener('click', () => {
    repairScooter();
    repairOptions.style.display = 'none';
  });

  repairXPBtn.addEventListener('click', () => {
    repairWithXP();
    repairOptions.style.display = 'none';
  });

  document.addEventListener('click', (e) => {
    if (!repairOptions.contains(e.target) && e.target !== repairMainBtn) {
      repairOptions.style.display = 'none';
    }
  });
}

document.getElementById('claimDailyBonusBtn').addEventListener('click', claimDailyBonus);


  if (inventoryBtn) {
    inventoryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openInventoryModal(true);
    });
  }

trickMiniGame.addEventListener('click', () => {
  if (!isTrickOverlayOpen()) return;
  if (!trickRoundActive) return;

  stopTrickRoundAnimation();

  const runnerCenter = trickRoundState.position + trickRunner.offsetWidth / 2;

  const greenLeft = trickRoundState.greenLeft;
  const greenRight = trickRoundState.greenLeft + trickRoundState.greenWidth;

  const perfectLeft = trickRoundState.perfectLeft;
  const perfectRight = trickRoundState.perfectLeft + trickRoundState.perfectWidth;

  let trickResult = 'miss';

  if (runnerCenter >= perfectLeft && runnerCenter <= perfectRight) {
    trickResult = 'perfect';
  } else if (runnerCenter >= greenLeft && runnerCenter <= greenRight) {
    trickResult = 'good';
  }

  let energyCost = BALANCE.trickEnergyCost;
  const efficiency = player.upgrades?.scooter?.efficiency || 0;
  energyCost *= Math.max(0.5, 1 - efficiency * 0.1);
  energyCost = Math.floor(energyCost);

  if (player.equipped.head === 'helmet') {
    energyCost = Math.floor(energyCost * 0.85);
  }

  flashTrickModal('perfect');
  AudioManager.perfect();
  vibrateFeedback([20, 30, 45]);

  if (trickResult === 'perfect') {
    player.drive = Math.min(100, player.drive + 25);
    player.combo = Math.min(20, player.combo + 1);
    player.quests.trickStreakCount = (player.quests.trickStreakCount || 0) + 1;
    player.quests.trickStreak = player.combo;

    addXP(Math.floor(BALANCE.trickBaseXP * 1.5));
    addCoins(Math.floor(BALANCE.trickBaseCoins * 1.5));

    if (trickResultText) {
      trickResultText.className = 'trick-result-text result-perfect';
      trickResultText.textContent = `🌟 PERFECT! КОМБО x${player.combo} 🌟`;
    }
  } else if (trickResult === 'good') {
    player.drive = Math.min(100, player.drive + 20);
    player.combo = Math.min(20, player.combo + 1);
    player.quests.trickStreakCount = (player.quests.trickStreakCount || 0) + 1;
    player.quests.trickStreak = player.combo;

    addXP(BALANCE.trickBaseXP);
    addCoins(BALANCE.trickBaseCoins);

    flashTrickModal('good');
    AudioManager.good();
    vibrateFeedback(18);

    if (trickResultText) {
      trickResultText.className = 'trick-result-text result-good';
      trickResultText.textContent = `✨ GOOD! КОМБО x${player.combo}`;
    }
  } else {
    player.drive = Math.max(0, player.drive - 20);
    player.scooter = Math.max(0, player.scooter - BALANCE.penaltyScooter);
    player.combo = 0;
    player.quests.trickStreak = 0;
    player.coins = Math.max(0, player.coins - BALANCE.penaltyCoins);

    flashTrickModal('miss');
    AudioManager.miss();
    vibrateFeedback(80);
    if (trickResultText) {
      trickResultText.className = 'trick-result-text result-miss';
      trickResultText.textContent = `💥 MISS! -${BALANCE.penaltyCoins}💰`;
    }
  }

  player.energy = Math.max(0, player.energy - energyCost);

  let wear = 10;

  if (trickResult === 'perfect') {
    wear = 6;
  } else if (trickResult === 'good') {
    wear = 10;
  } else {
    wear = 14;
  }

  const durability = player.upgrades?.scooter?.durability || 0;
  wear *= Math.max(0.5, 1 - durability * 0.15);
  player.scooter = Math.max(0, player.scooter - Math.floor(wear));

  finalizePlayerUpdate();
  updateTrickOverlayHUD();

  const nextRoundDelay =
    trickResult === 'perfect'
      ? 750
      : trickResult === 'good'
        ? 550
        : 650;

  setTimeout(() => {
    if (!isTrickOverlayOpen()) return;
    startTrickRound();
  }, nextRoundDelay);
});

  document.querySelectorAll('img:not(#riderImg):not(#carouselSkinImg)').forEach(img => {
    img.addEventListener('error', () => {
      img.onerror = null;
      img.src = getFallbackDataUri('IMG');
    });
  });

  window.addEventListener('beforeunload', saveState);
  window.addEventListener('resize', tooltipMouseLeave);
}

setupMainEvents();
setupStartScreen();
loadState();
updateVehiclePreview();
renderCustomizationTabs();
renderCustomizationShop();
renderShopModal();
updateBackgroundByTime();
refreshTooltips();
setInterval(updateBackgroundByTime, 60000);

window.addEventListener('resize', () => {
  syncInventoryStickyOffsets();
});
