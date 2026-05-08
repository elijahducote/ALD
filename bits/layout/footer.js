import {htm} from "../utility.js";

export default function Footer(tags) {
  const info = htm(tags, [
    htm(tags, "ALD", "div", { class: "brand" }),
    htm(tags, "arborlifedesigns@gmail.com", "a", { href: "mailto:arborlifedesigns@gmail.com" }),
    htm(tags, "Secondary Site", "span", { class: "label" }),
    htm(tags, "arborlife.blogspot.com", "a", {
      href: "https://arborlife.blogspot.com/",
      target: "_blank",
      rel: "noopener noreferrer"
    }),
    htm(tags, "Copyright (C) Ducote Industry", "div", { class: "copyright" })
  ], "div", { class: "footer-info" });

  const qr = htm(
    tags,
    htm(tags, undefined, "img", { src: "/web/icons/qrcode.svg", alt: "QR code" }),
    "div",
    { class: "footer-qr" }
  );

  return htm(tags, [info, qr], "div", { class: "site-footer" });
}
