// сложности
const TRICK_DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'pro'];

// базовые трюки по направлениям
const TRICK_SETS = {
  beginner: { base: 'BUNNY HOP', left: 'NO FOOTER', right: 'NO HANDER', up: '180', down: 'MANUAL' },
  intermediate: { base: 'BARSPIN', left: 'TAILWHIP', right: 'HEELWHIP', up: '360', down: 'INDY GRAB' },
  advanced: { base: 'DOUBLE BARSPIN', left: 'DOUBLE TAILWHIP', right: 'VARIAL HEELWHIP', up: '540', down: 'SMITH' },
  pro: { base: 'BACKFLIP', left: 'FLAIR', right: 'BRI FLIP', up: 'CASH ROLL', down: 'ROTOR WHIP' }
};

// комбинации (заготовка)
const TRICK_COMBO_SETS = {
  beginner: {
    'left>right': 'BAR TWIST',
    'right>left': 'SWITCH CUT',
    'up>down': 'AIR RESET',
    'down>up': 'KICK LIFT'
  },
  intermediate: {
    'left>right': 'WHIP LINE',
    'right>left': 'REWIND BAR',
    'up>right': 'SPIN KICK',
    'down>up': 'BOOSTER'
  },
  advanced: {
    'left>right': 'DOUBLE FLOW',
    'right>left': 'REVERSE VARIAL',
    'up>right': 'AIR COMBO',
    'down>up': 'LIFT TWIST'
  },
  pro: {
    'left>right': 'FLAIR LINE',
    'right>left': 'BRI REWIND',
    'up>right': 'CASH LINK',
    'down>up': 'ROTOR COMBO'
  }
};

function getTrickNameByInput(difficulty, sequence) {
  const safeDifficulty = TRICK_SETS[difficulty] ? difficulty : 'beginner';
  const inputs = Array.isArray(sequence) ? sequence.filter(Boolean) : [];

  if (inputs.length >= 2) {
    const comboKey = inputs.slice(-2).join('>');
    const comboSet = TRICK_COMBO_SETS[safeDifficulty] || {};

    if (comboSet[comboKey]) {
      return comboSet[comboKey];
    }
  }

  if (inputs.length >= 1) {
    const direction = inputs[inputs.length - 1];
    const set = TRICK_SETS[safeDifficulty];

    if (set[direction]) {
      return set[direction];
    }
  }

  return TRICK_SETS[safeDifficulty].base;
}

const TRICK_CATEGORIES = {
  base: ['BUNNY HOP', 'BARSPIN', 'DOUBLE BARSPIN', 'BACKFLIP'],
  spin: ['180', '360', '540'],
  style: ['NO FOOTER', 'NO HANDER', 'MANUAL'],
  flip: ['FLAIR', 'BRI FLIP', 'CASH ROLL']
};