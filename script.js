const RANGES = {
  face: 12,
  nose: 20,
  pupil: 22
};

class CatHeadController {
  constructor() {
    this.elements = {
      face: document.querySelector('.cat-face'),
      nose: document.querySelector('.cat-nose'),
      pupils: document.querySelector('.cat-pupils'),
      pupilContainer: document.querySelector('.pupil-container'),
      container: document.querySelector('.cat-container'),
      textElements: {
        sirGibblets: document.querySelector('.text-sir-gibblets'),
        doesntLike: document.querySelector('.text-doesnt-like'),
        yourFace: document.querySelector('.text-your-face')
      }
    };

    this.mouse = { x: 0, y: 0 };
    this.catCenter = { x: 0, y: 0 };
    this.catScale = 1;
    this.isInitialized = false;

    this.textRevealOrder = ['sirGibblets', 'doesntLike', 'yourFace'];
    this.revealedTexts = new Set();
    this.nextRevealTime = 0;

    this.idleTimeout = null;
    this.idleInterval = null;
    this.isIdle = false;
    this.isMobile = this.detectMobile();

    this.init();
  }

  detectMobile() {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.matchMedia && window.matchMedia("(pointer: coarse)").matches)
    );
  }

  init() {
    this.waitForImages().then(() => {
      this.calculateCatCenter();
      this.bindEvents();
      this.isInitialized = true;
    });
  }

  waitForImages() {
    const images = document.querySelectorAll('.cat-layer');
    const promises = Array.from(images).map(img => {
      return new Promise(resolve => {
        if (img.complete) {
          resolve();
        } else {
          img.addEventListener('load', resolve);
          img.addEventListener('error', resolve);
        }
      });
    });

    return Promise.all(promises);
  }

  calculateCatCenter() {
    const containerRect = this.elements.container.getBoundingClientRect();
    this.catCenter = {
      x: containerRect.left + containerRect.width / 2,
      y: containerRect.top + containerRect.height / 2
    };
    const catSize = parseFloat(getComputedStyle(this.elements.container).getPropertyValue('--cat-size'));
    this.catScale = catSize / 400;
  }

  bindEvents() {
    this.handleUserActivity = this.handleUserActivity.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);

    document.addEventListener('mousemove', this.handleUserActivity);
    window.addEventListener('resize', this.handleResize.bind(this));

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.handleViewportResize.bind(this));
    }

    this.elements.container.addEventListener('click', this.handleCatClick.bind(this));
    document.addEventListener('touchmove', this.handleUserActivity);

    this.resetIdleTimer();

    if (this.isMobile) {
      this.startIdleAnimation();
    }
  }

  handleUserActivity(event) {
    if (this.isIdle) {
      this.stopIdleAnimation();
    }
    this.resetIdleTimer();

    if (event.type === 'mousemove') {
      this.handleMouseMove(event);
    } else if (event.type === 'touchmove' && event.touches && event.touches.length > 0) {
      const touch = event.touches[0];
      this.handleTouchMove(touch);
    }
  }

  handleMouseMove(event) {
    if (!this.isInitialized) return;
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
    this.updateLayers();
  }

  handleTouchMove(touch) {
    if (!this.isInitialized) return;
    this.mouse.x = touch.clientX;
    this.mouse.y = touch.clientY;
    this.updateLayers();
  }

  handleCatClick() {
    const html = document.documentElement;
    if (html.classList.contains('light-mode')) {
      html.classList.remove('light-mode');
      html.classList.add('dark-mode');
    } else {
      html.classList.remove('dark-mode');
      html.classList.add('light-mode');
    }
  }

  handleResize() {
    this.calculateCatCenter();
    if (this.isInitialized) {
      this.updateLayers();
    }
  }

  handleViewportResize() {
    this.calculateCatCenter();
    if (this.isInitialized) {
      this.mouse.x = this.catCenter.x;
      this.mouse.y = this.catCenter.y;
      this.updateLayers();
    }
  }

  updateLayers() {
    const deltaX = this.mouse.x - this.catCenter.x;
    const deltaY = this.mouse.y - this.catCenter.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = Math.min(window.innerWidth, window.innerHeight) * 0.5;
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    this.updateFace(deltaX, deltaY, normalizedDistance);
    this.updateNose(deltaX, deltaY, normalizedDistance);
    this.updatePupils(deltaX, deltaY, normalizedDistance);
    this.checkTextReveal();
  }

  resetIdleTimer() {
    if (this.idleTimeout) clearTimeout(this.idleTimeout);
    if (this.isIdle) this.stopIdleAnimation();
    const timeout = this.isMobile ? 2000 : 5000;
    this.idleTimeout = setTimeout(() => {
      this.startIdleAnimation();
    }, timeout);
  }

  startIdleAnimation() {
    if (this.isIdle) return;
    this.isIdle = true;
    document.body.style.cursor = 'none';
    this.runIdleStep(true);
  }

  stopIdleAnimation() {
    this.isIdle = false;
    document.body.style.cursor = '';
    if (this.idleInterval) clearTimeout(this.idleInterval);
    this.idleInterval = null;
  }

  runIdleStep(reset = false) {
    if (!this.isIdle) return;
    const padding = 40;
    if (reset || Math.random() < 0.2) {
      this.mouse.x = this.catCenter.x;
      this.mouse.y = this.catCenter.y;
    } else {
      const x = Math.random() * (window.innerWidth - 2 * padding) + padding;
      const y = Math.random() * (window.innerHeight - 2 * padding) + padding;
      this.mouse.x = x;
      this.mouse.y = y;
    }
    this.updateLayers();

    const nextDelay = 500 + Math.random() * 1500;
    this.idleInterval = setTimeout(() => this.runIdleStep(), nextDelay);
  }

  updateFace(deltaX, deltaY, normalizedDistance) {
    const range = RANGES.face * this.catScale;
    const moveX = (deltaX / window.innerWidth) * range * normalizedDistance;
    const moveY = (deltaY / window.innerHeight) * range * normalizedDistance;
    this.elements.face.style.transform = `translate(${moveX}px, ${moveY}px)`;
    this.elements.pupilContainer.style.transform = `translate(${moveX}px, ${moveY}px)`;
  }

  updateNose(deltaX, deltaY, normalizedDistance) {
    const range = RANGES.nose * this.catScale;
    const moveX = (deltaX / window.innerWidth) * range * normalizedDistance;
    const moveY = (deltaY / window.innerHeight) * range * normalizedDistance;
    this.elements.nose.style.transform = `translate(${moveX}px, ${moveY}px)`;
  }

  updatePupils(deltaX, deltaY, normalizedDistance) {
    const range = RANGES.pupil * this.catScale;
    const moveX = (deltaX / window.innerWidth) * range * normalizedDistance;
    const moveY = (deltaY / window.innerHeight) * range * normalizedDistance;
    this.elements.pupils.style.transform = `translate(${moveX}px, ${moveY}px)`;
  }

  checkTextReveal() {
    if (Date.now() < this.nextRevealTime) return;
    for (let i = 0; i < this.textRevealOrder.length; i++) {
      const textKey = this.textRevealOrder[i];
      const textElement = this.elements.textElements[textKey];

      if (this.revealedTexts.has(textKey)) {
        continue;
      }

      const canReveal = i === 0 || this.revealedTexts.has(this.textRevealOrder[i - 1]);

      if (canReveal && this.isMouseOverElement(textElement)) {
        this.revealText(textKey, textElement);
        this.nextRevealTime = Date.now() + 1000;
        break;
      }
    }
  }

  isMouseOverElement(element) {
    const rect = element.getBoundingClientRect();
    return (
      this.mouse.x >= rect.left &&
      this.mouse.x <= rect.right &&
      this.mouse.y >= rect.top &&
      this.mouse.y <= rect.bottom
    );
  }

  revealText(textKey, textElement) {
    textElement.classList.add('revealed');
    this.revealedTexts.add(textKey);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CatHeadController();
});