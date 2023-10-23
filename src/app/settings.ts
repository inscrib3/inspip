import { decrypt, encrypt } from "../lib/crypto";
import { generateFingerprint } from "../utils/fingerprint";

type Settings = {
  password: string;
  ttl: number;
  language: string;
  lastUpdate: number;
};

const save = (settings: Settings) => {
  const fingerprint = generateFingerprint();
  if(settings.password.length > 0) settings.password = encrypt(settings.password, fingerprint);
  localStorage.setItem("settings", JSON.stringify(settings));
};

const create = (password: string) => {
  const currentSettings: Settings = {
    password,
    ttl: 1000 * 60 * 60 * 3, // 3 hours
    language: navigator.language,
    lastUpdate: Date.now(),
  };

  save(currentSettings);
}

const get = (): Settings | null => {
  const settings = JSON.parse(localStorage.getItem("settings") || "null");
  if (settings && settings.lastUpdate + settings.ttl < Date.now()) {
    settings.password = '';
    settings.lastUpdate = Date.now();
    save(settings);
  } else if (settings && settings.password) {
    const fingerprint = generateFingerprint();
    settings.password = decrypt(settings.password, fingerprint);
  }

  return settings;
};

export const getPasswordFromSettings = () => {
  const settings = get();
  if (!settings?.language) create('');
  return settings?.password || '';
}

export const savePasswordInSettings = (password: string) => {
  const settings = get();
  if (!settings?.language) {
    create(password);
  } else {
    settings.password = password;
    save(settings);
  }
}
