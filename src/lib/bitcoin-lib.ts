//const _bitcoin = (window as any).bitcoin;
import * as _bitcoin from 'bitcoinjs-lib';

interface Bitcoin {
    address: any;
    networks: {
        bitcoin: any;
        testnet: any;
    };
    payments: {
        p2tr: (options: any) => { address: string, output: any  };
        p2wpkh: (options: any) => { address: string, output: any  };
        p2pkh: (options: any) => { address: string, output: any  };
        p2sh: (options: any) => { address: string, output: any };
    };
    ECPair: {
        fromWIF: (key: string, network: any) => any;
    };
    Psbt: any;
    script: {
        fromASM: (asm: string) => any;
    };
    crypto: any;
    initEccLib: (ecc: any) => void;
}
export const bitcoin: Bitcoin = _bitcoin as unknown as Bitcoin;
