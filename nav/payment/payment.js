import {htm} from "../../bits/utility.js";

const HCAPTCHA_SITEKEY = "a3524c06-9e6e-4856-a31b-98e565f80c78";

function field(tags, label, attrs) {
  const labelEl = htm(tags, label, "label", { for: attrs.name });
  const inputEl = htm(tags, undefined, "input", { id: attrs.name, ...attrs });
  return htm(tags, [labelEl, inputEl], "div", { class: "form-row" });
}

export default function Payment(tags) {
  const heading = htm(tags, "Ready to hire us?", "h1");
  const intro1 = htm(tags, "We accept US residents in the Houston-Galveston area.", "p", { class: "intro" });
  const intro2 = htm(tags, "Your business with us begins here.", "p", { class: "intro" });
  const small  = htm(tags,
    "We do not store any account details, and only forward them to our payment processor.",
    "p", { class: "small" });

  const emailField = field(tags, "Email Address", {
    name: "email",
    type: "email",
    placeholder: "Ex: info@arborlifedesigns.net",
    required: true,
    autocomplete: "email"
  });

  const amountField = field(tags, "Amount Due", {
    name: "amount",
    type: "text",
    inputmode: "decimal",
    placeholder: "Ex: US$ 1,000,000.00...",
    required: true,
    pattern: "[0-9US\\$,\\.\\s]*"
  });

  const stripeMount = htm(tags, undefined, "div", { id: "payment-element" });
  const stripeRow = htm(tags, [
    htm(tags, "Card / Wallet Details", "label"),
    stripeMount
  ], "div", { class: "form-row stripe-row" });

  const captcha = htm(tags, undefined, "h-captcha", {
    class: "h-captcha",
    "site-key": HCAPTCHA_SITEKEY,
    theme: "dark",
    size: "compact",
    "auto-render": "true"
  });

  const note = htm(tags,
    "When you’re finished, refer to the button below.",
    "p", { class: "form-alt" });

  const submitBtn = htm(tags, "Make Payment", "button", {
    class: "pill-btn",
    type: "submit",
    id: "submit",
    disabled: true
  });
  const actions = htm(tags, submitBtn, "div", { class: "form-actions" });

  const status = htm(tags, undefined, "div", { class: "form-status", id: "payment-message" });

  const form = htm(
    tags,
    [emailField, amountField, stripeRow, captcha, note, actions, status],
    "form",
    { id: "payment-form", method: "POST", novalidate: true }
  );

  const card = htm(tags, [heading, intro1, intro2, small, form], "div", { class: "form-card" });

  return htm(tags, card, "section", { id: "payment", class: "form-view" });
}
