let arcadeLoopId = null;
let arcadeLastTime = 0;
let arcadeRoundActive = false;
let arcadeRoundResolved = false;
let arcadeMarkerPosition = 0;
let arcadeMarkerDirection = 1;

const ARCADE_MARKER_SPEED = 0.00115;
const ARCADE_NEXT_ROUND_DELAY = 850;

let trickRuntimeRefs = {
  scene: null,
  timingBar: null,
  timingBarMarker: null,
  getPlayer: null,
  updateHUD: null,
  canStartRound: null,
  applyRoundResult: null,
  isOverlayOpen: null,
  resetRider: null,
  getDifficulty: null
};

function setTrickRuntimeRefs(refs) {
  trickRuntimeRefs = { ...trickRuntimeRefs, ...refs };
}

function arcadeClamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updateMarkerVisual() {
  const { timingBar, timingBarMarker } = trickRuntimeRefs;
  if (!timingBar || !timingBarMarker) return;

  const barWidth = timingBar.clientWidth;
  const markerWidth = timingBarMarker.clientWidth || 10;
  const maxX = Math.max(0, barWidth - markerWidth);

  timingBarMarker.style.transform = `translateX(${arcadeMarkerPosition * maxX}px)`;
}

function resetMarker() {
  arcadeMarkerPosition = 0;
  arcadeMarkerDirection = 1;
  updateMarkerVisual();
}

function stopArcadeLoop() {
  if (arcadeLoopId) {
    cancelAnimationFrame(arcadeLoopId);
    arcadeLoopId = null;
  }
  arcadeLastTime = 0;
}

function getArcadeTimingResult() {
  if (arcadeMarkerPosition >= 0.46 && arcadeMarkerPosition <= 0.54) return 'perfect';
  if (arcadeMarkerPosition >= 0.34 && arcadeMarkerPosition <= 0.66) return 'good';
  return 'fail';
}

function updateArcadeWorld(delta) {
  if (!arcadeRoundActive || arcadeRoundResolved) return;

  arcadeMarkerPosition += arcadeMarkerDirection * delta * ARCADE_MARKER_SPEED;

  if (arcadeMarkerPosition >= 1) {
    arcadeMarkerPosition = 1;
    arcadeMarkerDirection = -1;
  } else if (arcadeMarkerPosition <= 0) {
    arcadeMarkerPosition = 0;
    arcadeMarkerDirection = 1;
  }

  updateMarkerVisual();
}

function arcadeGameLoop(timestamp) {
  if (!arcadeLastTime) arcadeLastTime = timestamp;
  const delta = timestamp - arcadeLastTime;
  arcadeLastTime = timestamp;

  updateArcadeWorld(delta);

  if (arcadeRoundActive) {
    arcadeLoopId = requestAnimationFrame(arcadeGameLoop);
  }
}

function startArcadeLoop() {
  if (arcadeLoopId) {
    cancelAnimationFrame(arcadeLoopId);
    arcadeLoopId = null;
  }

  arcadeLastTime = 0;
  arcadeLoopId = requestAnimationFrame(arcadeGameLoop);
}

function scheduleNextArcadeRound() {
  const { isOverlayOpen } = trickRuntimeRefs;

  setTimeout(() => {
    if (isOverlayOpen && isOverlayOpen()) {
      startArcadeRound();
    }
  }, ARCADE_NEXT_ROUND_DELAY);
}

function startArcadeRound() {
  const {
    isOverlayOpen,
    canStartRound,
    updateHUD,
    resetRider
  } = trickRuntimeRefs;

  if (!isOverlayOpen || !isOverlayOpen()) return;

  if (!canStartRound || !canStartRound()) {
    arcadeRoundActive = false;
    arcadeRoundResolved = true;
    if (updateHUD) updateHUD();
    return;
  }

  arcadeRoundResolved = false;
  arcadeRoundActive = true;

  clearTrickInputBuffer();
  enableTrickInputBufferRecording();
  hideSwipeHint();

  resetMarker();
  if (resetRider) resetRider();
  startArcadeLoop();
}

function handleArcadeTap() {
  const {
    isOverlayOpen,
    applyRoundResult,
    getDifficulty,
    resetRider
  } = trickRuntimeRefs;

  if (!isOverlayOpen || !isOverlayOpen()) return;

  if (!arcadeRoundActive) {
    startArcadeRound();
    return;
  }

    arcadeRoundResolved = true;
    arcadeRoundActive = false;
    disableTrickInputBufferRecording();

    const result = getArcadeTimingResult();
    stopArcadeLoop();

  if (applyRoundResult) {
    applyRoundResult(result);
  }

  if (result === 'fail') {
    animateArcadeFail();
  } else {
    const difficulty = getDifficulty ? getDifficulty() : 'beginner';
    const sequence = getTrickInputSequence();
    const resolvedTrickName = getTrickNameByInput(difficulty, sequence);

    animateArcadeSuccess({
      result,
      currentDifficulty: difficulty,
      resolvedTrickName,
      onInputOpen: null,
      onInputClose: null
    });
  }

  scheduleNextArcadeRound();
}

function setupTrickGame() {
  const { scene } = trickRuntimeRefs;
  setupTrickSceneInput(scene, handleArcadeTap);
  resetMarker();
}

function closeTrickGame() {
  arcadeRoundActive = false;
  arcadeRoundResolved = true;
  stopArcadeLoop();
  disableTrickInputBufferRecording();
  closeTrickInput();
}

function getTrickGameState() {
  return {
    arcadeRoundActive,
    arcadeRoundResolved,
    arcadeMarkerPosition,
    arcadeMarkerDirection
  };
}