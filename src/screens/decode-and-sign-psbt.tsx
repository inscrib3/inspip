import { useNavigate } from "react-router-dom";
import { Layout } from "../components";
import { Box, Button, Footer, Text } from "grommet";
import { useApp } from "../app";
import { useEffect, useState } from "react";
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from '@bitcoin-js/tiny-secp256k1-asmjs';
import { toXOnly } from "../bitcoin/helpers";
import { ECPairFactory, ECPairAPI} from 'ecpair';

const ECPair: ECPairAPI = ECPairFactory(ecc);

function tweakSigner(signer: bitcoin.Signer, opts: any = {}): bitcoin.Signer {
  // @ts-ignore
  let privateKey: Uint8Array | undefined = signer.privateKey!;
  if (!privateKey) {
    throw new Error('Private key is required for tweaking signer!');
  }
  if (signer.publicKey[0] === 3) {
    privateKey = ecc.privateNegate(privateKey);
  }

  const tweakedPrivateKey = ecc.privateAdd(
    privateKey,
    tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash),
  );
  if (!tweakedPrivateKey) {
    throw new Error('Invalid tweaked private key!');
  }

  return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
    network: opts.network,
  });
}

function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer {
  return bitcoin.crypto.taggedHash(
    'TapTweak',
    Buffer.concat(h ? [pubKey, h] : [pubKey]),
  );
}

export const DecodeAndSignPsbt = (): JSX.Element => {
  const app = useApp();
  const navigate = useNavigate();
  const [psbtToSign, setPsbtToSign] = useState<any>(undefined);

  const onSign = async () => {
    try {
      const tweakedSigner = tweakSigner(app.account.rootKey, { network: bitcoin.networks.testnet });
      console.log('tweakedSigner',tweakedSigner)
      const inputs = psbtToSign.data.inputs;
      for await (const input of inputs) {
        console.log('input',input)
        await psbtToSign.signInputAsync(input, tweakedSigner);
        console.log('### sign OK. Psbt:', psbtToSign.toBase64())
      }
      psbtToSign.finalizeAllInputs();
      console.log('after finalizeAllinputs');
      const tx = psbtToSign.extractTransaction();
      console.log('myTX: ',tx);
      const hex = tx.toHex();
      console.log('myTxHex: ', hex);
      return hex;
    } catch (e) {
        console.log((e as Error));
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  useEffect(()=>{
    if (app.signPsbt.account) {
      const network = app.signPsbt.account.network === "testnet" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
      try {
      const newPsbt = bitcoin.Psbt.fromBase64(app.signPsbt.psbt, {network});
      console.log('test NewPsbt result', newPsbt);
      setPsbtToSign(newPsbt);
      } catch (error){
        console.log('signpsbt error: ',error)
      }
    }
  },[app.signPsbt.account, app.signPsbt.psbt])

  return (
    <Layout showBack>
      <Box height="full" style={{ overflow: "scroll" }}>
        <Text>Ciaone</Text>
      </Box>
      <Footer pad="small">
        <Box flex>
          <Box direction="row" flex justify="between" gap="large">
            <Button
              secondary
              label="Reject"
              style={{ width: "100%" }}
              onClick={goBack}
            />
            <Button
              secondary
              label="Sign"
              style={{ width: "100%" }}
              onClick={onSign}
            />
          </Box>
        </Box>
      </Footer>
    </Layout>
  );
};