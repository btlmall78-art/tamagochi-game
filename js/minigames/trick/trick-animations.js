let trickAnimationRefs = {
  scene: null,
  rider: null,
  riderShadow: null,
  resultPopup: null,
  swipeHint: null,
  sceneFlash: null
};

function setTrickAnimationRefs(refs) {
  trickAnimationRefs = { ...trickAnimationRefs, ...refs };
}

function showResult(text) {
  const { resultPopup } = trickAnimationRefs;
  if (!resultPopup) return;
  resultPopup.textContent = text;
  resultPopup.classList.add('show');
  setTimeout(() => resultPopup.classList.remove('show'), 650);
}

function showSwipeHint() {
  const { swipeHint } = trickAnimationRefs;
  if (swipeHint) swipeHint.classList.add('show');
}

function hideSwipeHint() {
  const { swipeHint } = trickAnimationRefs;
  if (swipeHint) swipeHint.classList.remove('show');
}

function flashScene(type = 'good') {
  const { sceneFlash } = trickAnimationRefs;
  if (!sceneFlash) return;

  sceneFlash.style.background =
    type === 'perfect'
      ? 'rgba(255,255,180,0.72)'
      : type === 'fail'
        ? 'rgba(255,80,80,0.58)'
        : 'rgba(255,255,255,0.55)';

  sceneFlash.classList.add('active');
  setTimeout(() => sceneFlash.classList.remove('active'), 110);
}

function shakeScene() {
  const { scene } = trickAnimationRefs;
  if (!scene) return;

  scene.classList.remove('is-shaking');
  void scene.offsetWidth;
  scene.classList.add('is-shaking');
}

function setRiderSprite(state) {
  const { rider } = trickAnimationRefs;
  if (!rider) return;

  rider.classList.remove('sprite-ride', 'sprite-crouch', 'sprite-jump', 'sprite-trick');

  if (state === 'crouch') rider.classList.add('sprite-crouch');
  else if (state === 'jump') rider.classList.add('sprite-jump');
  else if (state === 'trick') rider.classList.add('sprite-trick');
  else rider.classList.add('sprite-ride');
}

function setRiderVisual(y = 0, shadowScale = 1, shadowOpacity = 0.28) {
  const { rider, riderShadow } = trickAnimationRefs;

  if (rider) {
    rider.style.transform = `translateX(-50%) translateY(${y}px)`;
  }

  if (riderShadow) {
    riderShadow.style.transform = `translateX(-50%) scaleX(${shadowScale})`;
    riderShadow.style.opacity = String(shadowOpacity);
  }
}

function resetRider() {
  setRiderSprite('ride');
  setRiderVisual(0, 1, 0.28);
  hideSwipeHint();
}

function animateArcadeSuccess({
  result,
  currentDifficulty,
  getDirection,
  getTrickName,
  onInputOpen,
  onInputClose
}) {
  if (onInputOpen) onInputOpen();

  showSwipeHint();
  setRiderSprite('crouch');
  setRiderVisual(10, 1.12, 0.36);

  setTimeout(() => {
    setRiderSprite('jump');
    setRiderVisual(result === 'perfect' ? -68 : -58, 0.84, 0.24);
  }, 110);

  setTimeout(() => {
    setRiderSprite('trick');
    setRiderVisual(result === 'perfect' ? -96 : -82, 0.70, 0.16);
  }, 240);

  setTimeout(() => {
    if (onInputClose) onInputClose();
    hideSwipeHint();
  }, 700);

  setTimeout(() => {
    const trickName = getTrickName(currentDifficulty);

    setRiderSprite('ride');
    setRiderVisual(8, 1.08, 0.34);
    flashScene(result === 'perfect' ? 'perfect' : 'good');
    showResult(`${result === 'perfect' ? 'PERFECT' : 'GOOD'} • ${trickName}`);
    shakeScene();
  }, 650);

  setTimeout(() => {
    resetRider();
    resetTrickInputState();
  }, 820);
}

function animateArcadeFail() {
  hideSwipeHint();
  flashScene('fail');
  shakeScene();
  showResult('MISS');
  resetRider();
  resetTrickInputState();
}