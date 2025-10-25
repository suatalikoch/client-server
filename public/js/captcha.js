export function generateCaptcha(options = {}) {
  const {
    length = 6,
    charset = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
    toUpper = true,
  } = options;

  if (!charset || charset.length === 0 || length === 0) {
    return "";
  }

  let captcha = "";
  const randomValues = new Uint32Array(length);

  window.crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    captcha += charset[randomValues[i] % charset.length];
  }

  return toUpper ? captcha.toUpperCase() : captcha.toLowerCase();
}
