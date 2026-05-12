import van from "vanjs-core";
import {htm} from "../utility.js";

const ASSETS = "/web/icons";

const SOCIAL = [
  { id: "instagram", href: "https://www.instagram.com/arborlifedesigns/", label: "Instagram", src: `${ASSETS}/insta.svg` },
  { id: "x",         href: "https://x.com/arborlife",                   label: "X",         src: `${ASSETS}/x.svg` },
  { id: "facebook",  href: "https://www.facebook.com/",                 label: "Facebook",  src: `${ASSETS}/facebook.svg` },
  { id: "youtube",   href: "https://yt.be/",                            label: "YouTube",   src: `${ASSETS}/youtube.svg` }
];

function buildNav(tags, currentPage) {
  const homeIcon = htm(tags, undefined, "img", {
    src: `${ASSETS}/home-svg.svg`,
    alt: ""
  });

  const homeLink = htm(tags, [
    homeIcon,
    htm(tags, "ome", "span")
  ], "a", { class: "nav-link", "data-link": "home", href: "/" });

  const servicesLink = htm(tags, "Services", "a", {
    class: "nav-link",
    href: "https://arborlife.blogspot.com/",
    target: "_blank",
    rel: "noopener noreferrer"
  });

  const navLinks = htm(tags, [homeLink, servicesLink], "div", { class: "nav-links" });

  const paymentBtn = htm(tags, htm(tags,"Payments"), "button", {
    class: "pill-btn",
    type: "button",
    "data-link": "payment"
  });

  const contactBtn = htm(tags, htm(tags,"Contact"), "button", {
    class: "pill-btn",
    type: "button",
    "data-link": "contact"
  });

  const socialLinks = htm(
    tags,
    SOCIAL.map((s) =>
      htm(tags,
        htm(tags, undefined, "img", { src: s.src, alt: s.label }),
        "a", {
          href: s.href,
          target: "_blank",
          rel: "noopener noreferrer",
          "aria-label": s.label
        }
      )
    ),
    "div",
    { class: "nav-social" }
  );

  const burgerSvg = htm(tags, [
    htm(tags, undefined, "line", { x1: "3", y1: "6",  x2: "21", y2: "6"  }),
    htm(tags, undefined, "line", { x1: "3", y1: "12", x2: "21", y2: "12" }),
    htm(tags, undefined, "line", { x1: "3", y1: "18", x2: "21", y2: "18" })
  ], "svg", {
    viewBox: "0 0 24 24",
    "stroke-linecap": "round"
  });

  const burgerBtn = htm(tags, burgerSvg, "button", {
    class: "nav-burger",
    type: "button",
    "aria-label": "Open menu",
    "data-burger": "open"
  });

  const navActions = htm(tags, [paymentBtn, contactBtn, socialLinks, burgerBtn], "div", {
    class: "nav-actions"
  });

  const navBar = htm(tags, [navLinks, navActions], "nav", {
    class: "wrapper topnav"
  });

  return htm(tags, navBar, "div", { class: "nav-wrap" });
}

function buildDrawer(tags) {
  const closeSvg = htm(tags, [
    htm(tags, undefined, "line", { x1: "5",  y1: "5",  x2: "19", y2: "19" }),
    htm(tags, undefined, "line", { x1: "5",  y1: "19", x2: "19", y2: "5"  })
  ], "svg", { viewBox: "0 0 24 24", "stroke-linecap": "round" });

  const closeBtn = htm(tags, closeSvg, "button", {
    class: "drawer-close",
    type: "button",
    "aria-label": "Close menu",
    "data-burger": "close"
  });

  const head = htm(tags, closeBtn, "div", { class: "drawer-head" });

  const links = htm(tags, [
    htm(tags, "Home",     "a",      { href: "/",         "data-link": "home" }),
    htm(tags, "Services", "a",      { href: "https://arborlife.blogspot.com/", target: "_blank", rel: "noopener noreferrer" }),
    htm(tags, "Payments", "button", { type: "button",    "data-link": "payment" }),
    htm(tags, "Contact",  "button", { type: "button",    "data-link": "contact" })
  ], "div", { class: "drawer-links" });

  const social = htm(
    tags,
    SOCIAL.map((s) =>
      htm(tags,
        htm(tags, undefined, "img", { src: s.src, alt: s.label }),
        "a", {
          href: s.href,
          target: "_blank",
          rel: "noopener noreferrer",
          "aria-label": s.label
        }
      )
    ),
    "div",
    { class: "drawer-social" }
  );

  return htm(tags, [head, links, social], "div", { class: "drawer", "data-drawer": "" });
}

export default function Interface(tags, tab, currentPage) {
  const navWrap = buildNav(tags, currentPage);
  const drawer  = buildDrawer(tags);

  const tabList = htm(tags, tab, "div", {
    class: "wrapper tab-list",
    "data-page": currentPage
  });

  const container = htm(tags, tabList, "div", { class: "container" });

  const root = htm(tags, undefined, "div", { class: "site-shell" });
  van.add(root, navWrap);
  van.add(root, drawer);
  van.add(root, container);
  return root;
}
