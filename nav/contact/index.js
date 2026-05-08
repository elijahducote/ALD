/* Browser-side wiring for the contact form. */

const SUCCESS_HTML = `
  <h2 class="success">Message delivered.</h2>
  <p>Thank you. We will be in touch within 24 hours.</p>
  <a class="text-link" href="/">Back to home</a>
`;
const PENDING_HTML = `
  <h2 class="pending">On hold.</h2>
  <p>Your message looks unusual to our spam filter. We will review it manually before responding.</p>
  <a class="text-link" href="/">Back to home</a>
`;
const FAIL_HTML = `
  <h2 class="fail">Could not deliver.</h2>
  <p>Something went wrong on our end. Please try again, or text us at +1 (281)-914-7788.</p>
  <a class="text-link" href="/">Back to home</a>
`;

function getStatusHtml(res) {
  if (res.ok) return SUCCESS_HTML;
  if (res.status === 202) return PENDING_HTML;
  return FAIL_HTML;
}

function init() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const submit = document.getElementById("submit");
  const status = document.getElementById("form-status");
  const captchaEl = form.querySelector("h-captcha, .h-captcha");
  const tokenField = document.getElementById("captcha-token");
  let captchaToken = null;

  const setReady = () => {
    submit.disabled = !captchaToken;
  };

  const applyToken = (token) => {
    captchaToken = token || null;
    if (tokenField) tokenField.value = captchaToken || "";
    setReady();
  };

  if (captchaEl) {
    captchaEl.addEventListener("verified", (e) => {
      const token = e?.token || (window.hcaptcha && window.hcaptcha.getResponse?.());
      applyToken(token);
    });
    captchaEl.addEventListener("error",   () => applyToken(null));
    captchaEl.addEventListener("expired", () => applyToken(null));
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!captchaToken) {
      status.textContent = "Please complete the captcha first.";
      return;
    }

    submit.disabled = true;
    status.textContent = "Delivering message...";

    const data = new FormData(form);
    if (!data.get("token")) data.set("token", captchaToken);
    const subscribe = data.get("subscribe") === "on";
    const email = String(data.get("email") || "");

    let res;
    try {
      res = await fetch("/go/send-mail", { method: "POST", body: data });
    } catch (_) {
      status.innerHTML = "";
      const card = form.closest(".form-card");
      const wrap = document.createElement("div");
      wrap.className = "form-result";
      wrap.innerHTML = FAIL_HTML;
      card.querySelector("form")?.remove();
      card.appendChild(wrap);
      return;
    }

    const card = form.closest(".form-card");
    card.querySelector("form").remove();
    const wrap = document.createElement("div");
    wrap.className = "form-result";
    wrap.innerHTML = getStatusHtml(res);
    card.appendChild(wrap);

    if (res.ok && subscribe && email) {
      try {
        const subData = new FormData();
        subData.append("email", email);
        await fetch("/go/subscribe-ald", { method: "POST", body: subData });
      } catch (_) { /* non-blocking */ }
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
