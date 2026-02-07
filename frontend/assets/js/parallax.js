const isMobile = window.matchMedia("(max-width: 767px)").matches;
const isTablet = window.matchMedia("(max-width: 1023px)").matches;

const layers = Array.from(document.querySelectorAll("[data-parallax]"));

function getScaledSpeed(speed) {
  if (isMobile) return speed * 0.3;
  if (isTablet) return speed * 0.6;
  return speed;
}

function applyParallax() {
  const scrollY = window.scrollY;
  layers.forEach((layer) => {
    const speed = getScaledSpeed(Number(layer.dataset.parallax || 0));
    layer.style.transform = `translateY(${scrollY * speed}px)`;
  });
}

let ticking = false;

function onScroll() {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      applyParallax();
      ticking = false;
    });
    ticking = true;
  }
}

if (layers.length) {
  applyParallax();
  window.addEventListener("scroll", onScroll, { passive: true });
}
