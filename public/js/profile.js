const profileForm = document.getElementById("profileForm");
const firstNameInput = document.getElementById("first-name");
const lastNameInput = document.getElementById("last-name");
const passwordInput = document.getElementById("password");
const firstNameError = document.getElementById("firstNameError");
const lastNameError = document.getElementById("lastNameError");
const emailInput = document.getElementById("email");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const logoutBtn = document.getElementById("logoutBtn");

function validateName(name) {
  return /^[A-Za-z]{2,20}$/.test(name.trim());
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&_]).{8,}$/.test(password);
}

async function loadProfile() {
  try {
    const response = await fetch("/api/profile", { credentials: "include" });
    if (!response.ok) throw new Error("Could not fetch profile");

    const data = await response.json();
    firstNameInput.value = data.first_name || "";
    lastNameInput.value = data.last_name || "";
    emailInput.value = data.email || "";
  } catch (err) {
    console.error(err);
    alert("Failed to load profile.");
  }
}

profileForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  [firstNameError, lastNameError, passwordError].forEach((el) =>
    el.classList.remove("active")
  );

  let isValid = true;

  if (firstNameInput.value && !validateName(firstNameInput.value)) {
    firstNameError.textContent = "First name must be 2-20 letters.";
    firstNameError.classList.add("active");
    isValid = false;
  }

  if (lastNameInput.value && !validateName(lastNameInput.value)) {
    lastNameError.textContent = "Last name must be 2-20 letters.";
    lastNameError.classList.add("active");
    isValid = false;
  }

  if (emailInput.value && !validateEmail(emailInput.value)) {
    emailError.textContent = "Email is not valid.";
    emailError.classList.add("active");
    isValid = false;
  }

  if (passwordInput.value && !validatePassword(passwordInput.value)) {
    passwordError.textContent =
      "Password must be 8+ chars with letters, numbers & symbols.";
    passwordError.classList.add("active");
    isValid = false;
  }

  if (isValid) {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: firstNameInput.value.trim() || undefined,
          lastName: lastNameInput.value.trim() || undefined,
          email: emailInput.value.trim() || undefined,
          password: passwordInput.value || undefined,
        }),
      });

      const data = await response.json();
      alert(data.message);

      if (response.ok) {
        passwordInput.value = "";
        await loadProfile();
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Please try again later.");
    }
  }
});

logoutBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("/api/logout", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      window.location.href = "/index.html";
    }
  } catch (err) {
    console.error(err);
    alert("Error logging out.");
  }
});

loadProfile();
