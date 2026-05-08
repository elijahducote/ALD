import {htm} from "../../bits/utility.js";

const SERVICES = ["consultations","inspections","landscape services","tree services"];

const MISSION_PARAGRAPHS = [
  "“Our mission is to create enduring and sustainable landscapes that enhance the environment, maximize resources, and inspire people.",
  "We strive to exceed our clients’ expectations by providing exceptional design, construction, and maintenance services with attention to detail, innovation, and integrity.",
  "Our goal is to contribute to the creation of healthy and vibrant communities through the responsible and thoughtful design and management of open spaces.”"
];

export default function Home(tags) {
  const heroImg = htm(tags, undefined, "img", {
    src: "/web/icons/al_designs.png",
    alt: "Arbor Life Designs"
  });
  const heroTree = htm(tags, heroImg, "div", { class: "hero-tree" });

  const servicesTitle = htm(tags, "SERVICES", "div", { class: "hero-services-title" });
  const servicesList = htm(
    tags,
    SERVICES.map((s) => htm(tags, s, "li")),
    "ul"
  );
  const heroServices = htm(tags, [servicesTitle, servicesList], "div", { class: "hero-services" });

  const heroRow = htm(tags, [heroTree, heroServices], "div", { class: "hero-row" });

  const missionTitle = htm(tags, "Mission Statement", "h2", { class: "mission-title" });
  const missionSection = htm(tags, missionTitle, "div", { class: "mission-section" });

  const missionImg = htm(tags, undefined, "img", {
    class: "mission-img",
    src: "/web/icons/landscape-1500w.png",
    alt: "Landscape work by Arbor Life Designs"
  });
  const missionQuote = htm(
    tags,
    MISSION_PARAGRAPHS.map((p) => htm(tags, p, "p")),
    "div",
    { class: "mission-quote" }
  );
  const missionRow = htm(tags, [missionImg, missionQuote], "div", { class: "mission-row" });

  const heroCard = htm(tags, [heroRow, missionSection, missionRow], "div", { class: "hero-card" });

  const heroSection = htm(tags, heroCard, "section", { class: "hero" });

  return htm(tags, [heroSection], "section", { id: "home" });
}
