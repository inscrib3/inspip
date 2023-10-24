import { Outpoint, RPCClient } from 'rpc-bitcoin';

let client: RPCClient | undefined;

export type IAnalyzePSBTResult = {
  inputs: {
    has_utxo: boolean;
    is_final: boolean;
    next: string;
  }[];
  next: string;
};

export type ITestMempoolAcceptResult = {
  txid: string;
  wtxid: string;
  allowed: boolean;
  vsize: number;
  fees: {
    base: number;
  };
  'reject-reason': string;
}[];

export type IGetRawTransactionVerboseResult = {
  txid: string;
  hex: string;
  blochash: string;
  blocktime: number;
  confirmations: number;
  vin: {
    txid: string;
    vout: number;
    scriptSig: {
      asm: string;
      hex: string;
    };
    sequence: number;
    txinwitness: string[];
  }[];
  vout: {
    value: number;
    n: number;
  }[];
};

export class FullnodeRPC {
  static getClient(): RPCClient {
    if (client) return client;
    client = new RPCClient({
      url: `${import.meta.env.VITE_BITCOIN_RPC_HOST}`,
      user: `${import.meta.env.VITE_BITCOIN_RPC_USER}` || '',
      pass: `${import.meta.env.VITE_BITCOIN_RPC_PASS}` || '',
      timeout: parseInt(`${import.meta.env.VITE_BITCOIN_RPC_TIMEOUT}` || '15000'),
    });
    return client;
  }

  static async getrawtransaction(txid: string): Promise<string> {
    const client = this.getClient();
    const res = await client.getrawtransaction({ txid });
    return res as string;
  }

  static async getrawtransactionVerbose(
    txid: string,
  ): Promise<IGetRawTransactionVerboseResult> {
    const client = this.getClient();
    const res = await client.getrawtransaction({ txid, verbose: true });
    return res;
  }

  static async analyzepsbt(psbt: string): Promise<IAnalyzePSBTResult> {
    const client = this.getClient();
    const res = await client.analyzepsbt({ psbt });
    return res as IAnalyzePSBTResult;
  }

  static async finalizepsbt(psbt: string) {
    const client = this.getClient();
    const res = await client.finalizepsbt({ psbt, extract: true });
    return res as { hex: string; complete: boolean };
  }

  static async testmempoolaccept(
    rawtxs: string[],
  ): Promise<ITestMempoolAcceptResult> {
    const client = this.getClient();
    const res = await client.testmempoolaccept({ rawtxs });
    return res as ITestMempoolAcceptResult;
  }

  static async sendrawtransaction(rawtx: string): Promise<string> {
    const client = this.getClient();
    const res = await client.sendrawtransaction({ hexstring: rawtx });
    return res as string;
  }

  static async getrawmempool(): Promise<string[]> {
    const client = this.getClient();
    const res = await client.getrawmempool();
    return res;
  }

  static async getutxos(txids: Outpoint[]): Promise<any> {
    const client = this.getClient();
    const res = await client.getUtxos({ checkmempool: true, outpoints: txids });
    return res;
  }
}
