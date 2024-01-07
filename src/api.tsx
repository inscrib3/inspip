import { useEffect } from "react";

export function Api() {
  const sendMessage = (data: any) => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(data, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message);
        } else {
          console.log("Response:", response);
          resolve(response);
        }
      });
    });
  };

  const login = async () => {
    await sendMessage({ action: 'login' });
  };

  const sign = async (message: string) => {
    await sendMessage({ action: 'signature', message });
  };

  const sendSats = async (to: string, amount: string) => {
    await sendMessage({ action: 'sendSats', to, amount });
  };

  const sendTokens = async (ticker: string, id: number, to: string, amount: string) => {
    await sendMessage({ action: 'sendTokens', ticker, id, to, amount });
  };

  useEffect(() => {
    const handler = {
      set: (target: any, property: any, value: any) => {
        console.log(`Setting property ${String(property)}`);
        target[property] = value;
        return true;
      },
    };

    window.pipe = new Proxy(window.pipe || {}, handler);
    window.pipe.login = login;
    window.pipe.sign = sign;
    window.pipe.sendSats = sendSats;
    window.pipe.sendTokens = sendTokens;
  }, []);

  return null;
}
