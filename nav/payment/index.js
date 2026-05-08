/* Stripe payment page browser logic. Ported from OG_project/payment.js */

const STRIPE_PUBLISHABLE_KEY =
  (typeof window !== "undefined" && window.__STRIPE_PK__) ||
  "pk_live_51PVFAM07xQtIlHl5nneheqyHshNmnrBOzRIgxXQs6GYp7cmtOWsgQnRlQYwUFez0teYb8OYUlIKi91XLMvEm4gts00iISFGmfg";

function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function calculateGrossAmount(net) {
  if (!isFinite(net) || net <= 0) return 0;
  return Math.round(((net + 0.30) / (1 - 0.029)) * 100) / 100;
}

function formatCurrency(input, blur) {
  let value = input.value;
  if (!value) return;
  const original_len = value.length;
  let caret_pos = input.selectionStart;

  if (value.includes(".")) {
    const decimal_pos = value.indexOf(".");
    let left = value.substring(0, decimal_pos).replace(/\D/g, "");
    let right = value.substring(decimal_pos).replace(/\D/g, "");
    if (blur) right += "00";
    left = formatNumber(left || "0");
    right = right.substring(0, 2);
    value = `US$ ${left}.${right}`;
  } else {
    value = `US$ ${formatNumber(value.replace(/\D/g, "") || "0")}`;
    if (blur) value += ".00";
  }

  input.value = value;
  const updated_len = value.length;
  caret_pos = updated_len - original_len + caret_pos;
  input.setSelectionRange(caret_pos, caret_pos);
}

function parseAmount(value) {
  if (!value) return 0;
  const numeric = value.replace(/[^0-9.]/g, "");
  return parseFloat(numeric) || 0;
}

async function init() {
  const form    = document.getElementById("payment-form");
  if (!form) return;

  const submit  = document.getElementById("submit");
  const status  = document.getElementById("payment-message");
  const amount  = document.getElementById("amount");
  const email   = document.getElementById("email");
  const captchaEl = form.querySelector("h-captcha, .h-captcha");

  amount.addEventListener("input", () => formatCurrency(amount, false));
  amount.addEventListener("blur",  () => formatCurrency(amount, true));

  if (typeof Stripe !== "function") {
    status.textContent = "Stripe failed to load. Please refresh and try again.";
    return;
  }

  const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

  const elements = stripe.elements({
    mode: "payment",
    amount: 100,
    currency: "usd",
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#d8c569",
        colorBackground: "#14110d",
        colorText: "#f4ecd8",
        colorDanger: "#bf2626",
        fontFamily: '"Open Sans", system-ui, sans-serif',
        borderRadius: "0.375em"
      }
    }
  });

  const paymentElement = elements.create("payment", { layout: "tabs" });
  paymentElement.mount("#payment-element");

  let paymentReady = false;
  let captchaToken = null;

  const setReady = () => {
    submit.disabled = !(paymentReady && captchaToken);
  };

  paymentElement.on("change", (e) => {
    paymentReady = e.complete;
    setReady();
  });

  if (captchaEl) {
    captchaEl.addEventListener("verified", (e) => {
      captchaToken = e.token || (window.hcaptcha && window.hcaptcha.getResponse());
      setReady();
    });
    captchaEl.addEventListener("error",   () => { captchaToken = null; setReady(); });
    captchaEl.addEventListener("expired", () => { captchaToken = null; setReady(); });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    submit.disabled = true;
    status.textContent = "Confirming...";

    const net = parseAmount(amount.value);
    if (net < 1) {
      status.textContent = "Please enter an amount of at least US$ 1.00.";
      submit.disabled = false;
      return;
    }
    const grossCents = Math.round(calculateGrossAmount(net) * 100);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      status.textContent = submitError.message || "Could not validate the payment form.";
      submit.disabled = false;
      return;
    }

    let confirmationToken;
    try {
      const ct = await stripe.createConfirmationToken({ elements });
      if (ct.error) {
        status.textContent = ct.error.message || "Could not tokenize payment details.";
        submit.disabled = false;
        return;
      }
      confirmationToken = ct.confirmationToken;
    } catch (err) {
      status.textContent = "Could not reach Stripe. Please try again.";
      submit.disabled = false;
      return;
    }

    const idempotencyKey  = (crypto.randomUUID && crypto.randomUUID()) || `${Date.now()}-${Math.random()}`;
    const idempotencyKey1 = (crypto.randomUUID && crypto.randomUUID()) || `${Date.now()}-${Math.random()}-1`;

    let payload;
    try {
      const res = await fetch("/go/create-intent-ald", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmation_token: confirmationToken.id,
          amount: grossCents,
          email: email.value,
          idempotencyKey,
          idempotencyKey1
        })
      });
      payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Server error");
    } catch (err) {
      status.textContent = err.message || "Server could not create the payment intent.";
      submit.disabled = false;
      return;
    }

    if (payload.status === "requires_action" && payload.client_secret) {
      const { error } = await stripe.handleNextAction({ clientSecret: payload.client_secret });
      if (error) {
        status.textContent = error.message || "Authentication failed.";
        submit.disabled = false;
        return;
      }
    }

    const username = (email.value.split("@")[0] || "client");
    const paymentId = payload.id || "";
    window.location.href = `/go/response-ald?payment_intent=${encodeURIComponent(paymentId)}&username=${encodeURIComponent(username)}`;
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
