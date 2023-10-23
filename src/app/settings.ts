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
  console.log("save fingerprint", fingerprint)

  settings.password = encrypt(settings.password, fingerprint);
  localStorage.setItem("settings", JSON.stringify(settings));
};

export const create = (password: string) => {
  if(!password) throw new Error("Password is required");
  
  const settings: Settings = {
    password: password,
    ttl: -1,
    language: navigator.language,
    lastUpdate: Date.now(),
  };
  save(settings);

  return settings;
};

export const get = () => {
  let settings = JSON.parse(localStorage.getItem("settings") || "{}");
  if(settings?.ttl > 0 && settings?.lastUpdate + settings?.ttl < Date.now()) {
    settings.password = ''
    edit(settings)
  } else if(settings?.password) {
    const fingerprint = generateFingerprint();
    settings.password = decrypt(settings.password, fingerprint);
  }

  return settings;
};

export const edit = (settings: Settings) => {
  const currentSettings = get();
  if(!currentSettings) throw new Error("Settings not found");
  
  const updatedSettings = { ...currentSettings, ...settings };
  Object.keys(updatedSettings).forEach(key => {
    if (settings[key as keyof Settings] == null) {
      delete updatedSettings[key as keyof Settings];
    }
  });
  settings.lastUpdate = Date.now();

  save(updatedSettings);
};
