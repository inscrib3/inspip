import { useNavigate } from "react-router-dom";
import { Layout } from "../components";
import { Box, Button, Footer, Text } from "grommet";
import { useApp } from "../app";
import { useEffect, useState } from "react";
import * as bitcoin from 'bitcoinjs-lib';

export const DecodeAndSignPsbt = (): JSX.Element => {
  const app = useApp();
  const navigate = useNavigate();
  const [psbtToSign, setPsbtToSign] = useState<bitcoin.Psbt>();

  const onSign = async () => {
    if(!psbtToSign) return;
    try {
      const inputs = psbtToSign.data.inputs;
      const toSignIndexes = app.signPsbt.toSignInputs.map((el:any)=>el.index);
      const tweakedChildNode = app.account.account.tweak(
        bitcoin.crypto.taggedHash('TapTweak', app.account.internalPubkey),
      );
      for (let i = 0;i < inputs.length;i++) {
        if (!toSignIndexes.includes(i)) continue
        psbtToSign.signInput(i, tweakedChildNode);
        console.log('### sign OK. Psbt:', psbtToSign.toBase64())
        psbtToSign.finalizeInput(i);
      }
      const hex = psbtToSign.toHex();
      return hex;//TODO returnSignPsbt
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