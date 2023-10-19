import { hashToString } from "./hash-to-string";

export const generateName = async (password: string) => {
  const uuid = self.crypto.randomUUID();
  const now = Date.now().toString();

  const hash = await self.crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password + uuid + now)
  );

  const name = hashToString(hash);

  return {
    name,
    uuid,
    now,
  }
};
