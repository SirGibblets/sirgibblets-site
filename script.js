const RANGES = {
  face: 12,
  nose: 20,
  pupil: 20
};

class CatHeadController {
  constructor() {
    this.elements = {
      face: document.querySelector('.cat-face'),
      nose: document.querySelector('.cat-nose'),
      pupils: document.querySelector('.cat-pupils'),
      pupilContainer: document.querySelector('.pupil-container'),
      container: document.querySelector('.cat-container')
    };

    this.mouse = { x: 0, y: 0 };
    this.catCenter = { x: 0, y: 0 };
    this.isInitialized = false;

    this.init();
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
  }

  bindEvents() {
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    window.addEventListener('resize', this.handleResize.bind(this));
    this.elements.container.addEventListener('click', this.handleCatClick.bind(this));
  }

  handleMouseMove(event) {
    if (!this.isInitialized) return;
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
    this.updateLayers();
  }

  handleCatClick() {
    const body = document.body;
    if (body.classList.contains('light-theme')) {
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
    }
  }

  handleResize() {
    this.calculateCatCenter();
    if (this.isInitialized) {
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
  }

  updateFace(deltaX, deltaY, normalizedDistance) {
    const moveX = (deltaX / window.innerWidth) * RANGES.face * normalizedDistance;
    const moveY = (deltaY / window.innerHeight) * RANGES.face * normalizedDistance;
    this.elements.face.style.transform = `translate(${moveX}px, ${moveY}px)`;
    this.elements.pupilContainer.style.transform = `translate(${moveX}px, ${moveY}px)`;
  }

  updateNose(deltaX, deltaY, normalizedDistance) {
    const moveX = (deltaX / window.innerWidth) * RANGES.nose * normalizedDistance;
    const moveY = (deltaY / window.innerHeight) * RANGES.nose * normalizedDistance;
    this.elements.nose.style.transform = `translate(${moveX}px, ${moveY}px)`;
  }

  updatePupils(deltaX, deltaY, normalizedDistance) {
    const moveX = (deltaX / window.innerWidth) * RANGES.pupil * normalizedDistance;
    const moveY = (deltaY / window.innerHeight) * RANGES.pupil * normalizedDistance;
    this.elements.pupils.style.transform = `translate(${moveX}px, ${moveY}px)`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new CatHeadController();
});