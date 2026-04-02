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
const TRICK_COMBOS = {
  'left>right': 'COMBO_LR',
  'up>right': 'COMBO_UR',
  'down>up': 'COMBO_DU'
};

const TRICK_CATEGORIES = {
  base: ['BUNNY HOP', 'BARSPIN', 'DOUBLE BARSPIN', 'BACKFLIP'],
  spin: ['180', '360', '540'],
  style: ['NO FOOTER', 'NO HANDER', 'MANUAL'],
  flip: ['FLAIR', 'BRI FLIP', 'CASH ROLL']
};