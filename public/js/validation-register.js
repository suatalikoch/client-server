const registerForm = document.getElementById("registerForm");
const firstName = document.getElementById("first-name");
const lastName = document.getElementById("last-name");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirm-password");
const firstNameError = document.getElementById("firstNameError");
const lastNameError = document.getElementById("lastNameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");

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

  if (!/^[A-Za-z]{2,20}$/.test(firstName.value.trim())) {
    setError(firstName, "First name must be 2-20 letters.");
  }

  if (!/^[A-Za-z]{2,20}$/.test(lastName.value.trim())) {
    setError(lastName, "Last name must be 2-20 letters.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    setError(email, "Invalid email address.");
  }

  if (!password.value.trim()) {
    setError(password, "Password cannot be empty.");
  }

  if (
    !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&_])[A-Za-z\d@$!%*#?&_]{8,}$/.test(
      password.value
    )
  ) {
    setError(
      password,
      "Password must be 8+ chars with letters, numbers & symbols."
    );
  }

  if (password.value !== confirmPassword.value) {
    setError(confirmPassword, "Passwords do NOT match.");
  }

  if (!isValid) {
    resetCaptcha();
  }

  return isValid;
};

registerForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  clearErrors();

  let isValid = true;

  if (!validate()) {
    return;
  }

  if (isValid) {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.value.trim(),
          lastName: lastName.value.trim(),
          email: email.value.trim(),
          password: password.value,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = "/index.html";
        registerForm.reset();
      } else {
        alert(data.error);
        email.value = "";
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again later.");
    }
  }
});
