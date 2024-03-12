import { scrypt, randomBytes, timingSafeEqual } from "node:crypto";

// NOTE: https://dev.to/farnabaz/hash-your-passwords-with-scrypt-using-nodejs-crypto-module-316k

const KEY_LENGTH = 64;

export async function hash(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");
    scrypt(password, salt, KEY_LENGTH, (error, derivedKey) => {
      if (error) reject(error);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

export const compare = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const [salt, hashKey] = hash.split(":");
    // we need to pass buffer values to timingSafeEqual
    const hashKeyBuff = Buffer.from(hashKey, "hex");
    scrypt(password, salt, KEY_LENGTH, (err, derivedKey) => {
      if (err) reject(err);
      // compare the new supplied password with the hashed password using timeSafeEqual
      console.log(password, hash);
      resolve(timingSafeEqual(hashKeyBuff, derivedKey));
    });
  });
};
