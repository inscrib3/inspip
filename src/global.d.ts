declare global {
  interface Window {
    pipe: {
      sendSats: (to: string, amount: string) => void;
      sendTokens: (ticker: string, id: number, to: string, amount: string) => void;
      login: () => Promise<void>;
      sign: (message: string) => Promise<void>;
    }
  }
}

export {};
