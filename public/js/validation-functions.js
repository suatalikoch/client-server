function validateName(name) {
  return /^[A-Za-z]{2,20}$/.test(name.trim());
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePassword(password) {
  return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(password);
}

function checkCaptcha(input, code) {
  return input.trim().toUpperCase() === code;
}

export default {
  validateName,
  validateEmail,
  validatePassword,
  checkCaptcha,
};
