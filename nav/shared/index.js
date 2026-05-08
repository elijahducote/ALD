/* Shared browser-side script. Loaded by every page. */

const SCROLL_DELTA = 8;
const SCROLL_THROTTLE_MS = 80;

function throttle(fn, ms) {
  let last = 0, t;
  return function throttled(...args) {
    const now = Date.now();
    const remaining = ms - (now - last);
    if (remaining <= 0) {
      clearTimeout(t);
      t = null;
      last = now;
      fn.apply(this, args);
    } else if (!t) {
      t = setTimeout(() => {
        last = Date.now();
        t = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

function navigateTo(path) {
  if (!path) return;
  const url = path.startsWith("/") ? path : `/${path === "home" ? "" : path}`;
  document.body.classList.add("page-leaving");
  setTimeout(() => { window.location.href = url; }, 140);
}

function bindLinkClicks() {
  document.addEventListener("click", (e) => {
    const target = e.target.closest("[data-link]");
    if (!target) return;
    const link = target.dataset.link;
    if (!link) return;
    if (target.tagName === "A" && target.hasAttribute("href")) return;
    e.preventDefault();
    navigateTo(link);
  });
}

function bindScrollHide() {
  const navWrap = document.querySelector(".nav-wrap");
  if (!navWrap) return;
  let lastY = window.scrollY;

  const handler = throttle(() => {
    const y = window.scrollY;
    const dy = y - lastY;
    if (Math.abs(dy) < SCROLL_DELTA) return;
    if (dy > 0 && y > 80) navWrap.classList.add("is-hidden");
    else                  navWrap.classList.remove("is-hidden");
    lastY = y;
  }, SCROLL_THROTTLE_MS);

  window.addEventListener("scroll", handler, { passive: true });
}

function bindBurger() {
  const drawer = document.querySelector("[data-drawer]");
  if (!drawer) return;
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-burger]");
    if (!trigger) return;
    const action = trigger.dataset.burger;
    if (action === "open") {
      drawer.classList.add("is-open");
      document.body.style.overflow = "hidden";
    } else if (action === "close") {
      drawer.classList.remove("is-open");
      document.body.style.overflow = "";
    }
  });
}

function setActivePage() {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "") || "home";
  document.querySelectorAll("[data-link]").forEach((el) => {
    if (el.dataset.link === path) el.classList.add("is-active");
  });
}

function init() {
  bindLinkClicks();
  bindScrollHide();
  bindBurger();
  setActivePage();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

window.addEventListener("pageshow", (e) => {
  if (e.persisted) document.body.classList.remove("page-leaving");
});
