import {htm} from "../../bits/utility.js";

const HCAPTCHA_SITEKEY = "a3524c06-9e6e-4856-a31b-98e565f80c78";

function field(tags, label, attrs, type = "input") {
  const labelEl = htm(tags, label, "label", { for: attrs.name });
  const inputEl = htm(tags, undefined, type, { id: attrs.name, ...attrs });
  return htm(tags, [labelEl, inputEl], "div", { class: "form-row" });
}

export default function Contact(tags) {
  const heading = htm(tags, "Interested?", "h1");
  const intro = htm(tags, "We accept your business here.", "p", { class: "intro" });
  const small = htm(tags,
    "We do not store any information, and only provide it for the contractor.",
    "p", { class: "small" });

  const fields = [
    field(tags, "Name",            { name: "name",     type: "text",  placeholder: "Ex: Ashley, Evan, Herman, Louise...", required: true, autocomplete: "name", autofocus: true }),
    field(tags, "Email Address",   { name: "email",    type: "email", placeholder: "Ex: arborlifedesigns@gmail.com",       required: true, autocomplete: "email" }),
    field(tags, "Location for Job",{ name: "location", type: "text",  placeholder: "Ex: 1787 Botanical Boulevard, Houston, TX #77027", required: true, autocomplete: "street-address" }),
    field(tags, "Phone Number",    { name: "phone",    type: "tel",   placeholder: "Ex: +1 (000)-000-0000",                required: true, minlength: "10", autocomplete: "tel" }),
    field(tags, "Comments",        { name: "mail",     placeholder: "Ex: I request your services to install Christmas lights...", required: true, minlength: "15", maxlength: "3000", rows: "5" }, "textarea")
  ];

  const tokenInput = htm(tags, undefined, "input", { type: "hidden", name: "token", id: "captcha-token" });

  const captcha = htm(tags, undefined, "h-captcha", {
    class: "h-captcha",
    "site-key": HCAPTCHA_SITEKEY,
    theme: "dark",
    size: "compact",
    "auto-render": "true"
  });

  const subscribeRow = htm(tags, [
    htm(tags, undefined, "input", { type: "checkbox", id: "subscribe", name: "subscribe", checked: true }),
    htm(tags, "Enroll for updates", "label", { for: "subscribe", class: "subscribe-label" })
  ], "div", { class: "form-subscribe" });

  const altText = htm(tags, [
    "Or alternatively, ",
    htm(tags, "text us.", "a", {
      class: "text-link",
      href: "sms:+1(281)-914-7788?body=Hello%2C%20I%20am%20interested%20in%20your%20services."
    })
  ], "p", { class: "form-alt" });

  const submitBtn = htm(tags, "Deliver Message", "button", {
    class: "pill-btn",
    type: "submit",
    id: "submit",
    disabled: true
  });
  const actions = htm(tags, submitBtn, "div", { class: "form-actions" });

  const status = htm(tags, undefined, "div", { class: "form-status", id: "form-status" });

  const form = htm(
    tags,
    [...fields, captcha, tokenInput, subscribeRow, altText, actions, status],
    "form",
    {
      id: "contact-form",
      action: "/go/send-mail",
      method: "POST",
      enctype: "multipart/form-data",
      novalidate: true
    }
  );

  const card = htm(tags, [heading, intro, small, form], "div", { class: "form-card" });

  return htm(tags, card, "section", { id: "contact", class: "form-view" });
}
