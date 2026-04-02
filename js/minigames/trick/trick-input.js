let selectedDirection = 'base';
let trickInputOpen = false;

let trickTouchStartX = 0;
let trickTouchStartY = 0;
let trickTouchMoved = false;

function resetTrickInputState() {
  selectedDirection = 'base';
  trickInputOpen = false;
  trickTouchStartX = 0;
  trickTouchStartY = 0;
  trickTouchMoved = false;
}

function openTrickInput() {
  selectedDirection = 'base';
  trickInputOpen = true;
}

function closeTrickInput() {
  trickInputOpen = false;
}

function setTrickDirection(direction) {
  selectedDirection = direction;
}

function getSelectedTrickDirection() {
  return selectedDirection;
}

function isTrickInputOpen() {
  return trickInputOpen;
}

document.addEventListener('keydown', (e) => {
  if (!isTrickInputOpen()) return;

  if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
    setTrickDirection('left');
  } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
    setTrickDirection('right');
  } else if (e.code === 'KeyW' || e.code === 'ArrowUp') {
    setTrickDirection('up');
  } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
    setTrickDirection('down');
  } else {
    return;
  }
});

function setupTrickSceneInput(sceneElement, onTap) {
  if (!sceneElement) return;

  sceneElement.addEventListener('click', onTap);

  sceneElement.addEventListener('touchstart', (e) => {
    const touch = e.changedTouches[0];
    if (!touch) return;

    trickTouchStartX = touch.clientX;
    trickTouchStartY = touch.clientY;
    trickTouchMoved = false;
  }, { passive: true });

  sceneElement.addEventListener('touchmove', (e) => {
    if (!isTrickInputOpen()) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - trickTouchStartX;
    const dy = touch.clientY - trickTouchStartY;

    if (Math.abs(dx) > 12 || Math.abs(dy) > 12) {
      trickTouchMoved = true;
    }
  }, { passive: true });

  sceneElement.addEventListener('touchend', (e) => {
    const touch = e.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - trickTouchStartX;
    const dy = touch.clientY - trickTouchStartY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (isTrickInputOpen() && trickTouchMoved && (absX > 24 || absY > 24)) {
      if (absX > absY) {
        setTrickDirection(dx > 0 ? 'right' : 'left');
      } else {
        setTrickDirection(dy > 0 ? 'down' : 'up');
      }
      return;
    }

    e.preventDefault();
    onTap();
  }, { passive: false });
}