const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
    rootMargin: "0px 0px -30px 0px"
  }
);

function bindRevealElements() {
  document.querySelectorAll(".reveal:not(.in-view)").forEach((element) => {
    observer.observe(element);
  });
}

window.addEventListener("DOMContentLoaded", bindRevealElements);
window.addEventListener("contentRendered", bindRevealElements);
