import { generateCaptcha } from "./captcha.js";

const loginForm = document.getElementById("loginForm");
const email = document.getElementById("email");
const password = document.getElementById("password");
const captchaContainer = document.getElementById("captchaContainer");
const captchaInputField = document.getElementById("captchaInput");
const captchaCode = document.getElementById("captchaCode");

captchaContainer.style.display = "flex";
let currentCaptcha = generateCaptcha();
captchaCode.textContent = currentCaptcha;

const clearErrors = () => {
  document
    .querySelectorAll(".input-group input, .input-label, .error-message")
    .forEach((el) => el.classList.remove("error", "active"));
};

const validate = () => {
  clearErrors();

  let isValid = true;

  const setError = (input, message) => {
    const label = input.parentElement.querySelector(".input-label");
    const errorMessage = input.parentElement.querySelector(".error-message");

    input.classList.add("error");

    if (label) {
      label.classList.add("error");
    }

    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.classList.add("active");
    }

    isValid = false;
  };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    setError(email, "Invalid email address.");
  }

  if (!password.value.trim()) {
    setError(password, "Password cannot be empty.");
  }

  if (captchaInputField.value.trim().toUpperCase() !== currentCaptcha) {
    setError(captchaInputField, "CAPTCHA does not match.");
  }

  if (!isValid) {
    resetCaptcha();
  }

  return isValid;
};

const resetCaptcha = () => {
  currentCaptcha = generateCaptcha();
  captchaCode.textContent = currentCaptcha;
  captchaInputField.value = "";
};

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!validate()) {
    return;
  }

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.value.trim(),
        password: password.value.trim(),
      }),
    });
    const data = await response.json();

    if (response.ok) {
      loginForm.reset();
      window.location.href = "/profile.html";
    } else {
      alert(data.error);
      password.value = "";
      resetCaptcha();
    }
  } catch (err) {
    console.error(err);
    resetCaptcha();
  }
});
