const STORAGE_KEYS = {
  game: 'scooterGame',
  tutorial: 'tutorialCompleted'
};

function createDefaultPlayer() {
  return {
    name: '',
    type: 'scooter',
    skin: '',

    energy: 100,
    maxEnergy: 100,
    drive: 100,
    skill: 1,
    scooter: 100,
    coins: 50,
    rep: 0,
    combo: 0,

    equipped: {
      head: null,
      body: null,
      drink: null,
      special: null
    },

    customization: {
      scooter: {
        deck: 'default',
        bar: 'default',
        grips: 'default',
        headset: 'default',
        wheels: 'default',
        grip: 'default',
        sticker: 'none'
      },
      skate: {},
      roller: {}
    },

    upgrades: {
      scooter: {
        durability: 0,
        efficiency: 0,
        reward: 0
      }
    },

    ownedCustomization: [],
    ownedUpgrades: [],
    ownedShopItems: ['cap', 'hoodie', 'helmet', 'backpack', 'gloves', 'jacket'],
    consumables: [{ id: 'energy_drink', count: 3 }, { id: 'juice', count: 2 }, { id: 'protein_bar', count: 2 }],

    lastVisit: Date.now(),
    isSleeping: false,

    level: 1,
    xp: 0,
    xpToNext: BALANCE.xpBase,

    quests: {
      trickStreak: 0,
      ridesCount: 0,
      trickStreakCount: 0
    },

    completedQuests: [],
    achievements: [],

    lastLoginDate: '',
    loginStreak: 0,
    dailyBonusClaimed: false,
    tutorialCompleted: false
  };
}

function createPreviousStatsSnapshot(sourcePlayer) {
  return {
    energy: sourcePlayer.energy,
    drive: sourcePlayer.drive,
    skill: sourcePlayer.skill,
    scooter: sourcePlayer.scooter,
    coins: sourcePlayer.coins,
    rep: sourcePlayer.rep
  };
}