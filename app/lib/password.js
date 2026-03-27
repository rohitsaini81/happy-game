import crypto from "crypto";

const KEYLEN = 64;
const SALT_BYTES = 16;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

const toBase64Url = (buffer) =>
  buffer
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const fromBase64Url = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(normalized + "=".repeat(padLength), "base64");
};

export const hashPassword = async (password) => {
  const salt = crypto.randomBytes(SALT_BYTES);
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      KEYLEN,
      { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P },
      (err, key) => {
        if (err) return reject(err);
        resolve(key);
      }
    );
  });

  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    toBase64Url(salt),
    toBase64Url(derivedKey),
  ].join("$");
};

export const verifyPassword = async (password, hash) => {
  const parts = String(hash || "").split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") {
    return false;
  }

  const [, nRaw, rRaw, pRaw, saltRaw, storedKeyRaw] = parts;
  const n = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);

  if (!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(p)) {
    return false;
  }

  const salt = fromBase64Url(saltRaw);
  const storedKey = fromBase64Url(storedKeyRaw);

  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, storedKey.length, { N: n, r, p }, (err, key) => {
      if (err) return reject(err);
      resolve(key);
    });
  });

  if (derivedKey.length !== storedKey.length) {
    return false;
  }

  return crypto.timingSafeEqual(derivedKey, storedKey);
};
