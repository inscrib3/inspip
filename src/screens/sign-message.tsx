import { useNavigate } from "react-router-dom";
import { Layout } from "../components";
import { Box, Button, Footer, Text } from "grommet";
import { useApp } from "../app";
import { useEffect } from "react";
import { Signer, Verifier } from 'bip322-js';
import * as bitcoin from 'bitcoinjs-lib';

export const SignMessage = (): JSX.Element => {
  const app = useApp();
  const navigate = useNavigate();

  const onSign = async () => {
    try {
      console.log('SIGN MESSAGE');
      const privateKey = app.account.account.toWIF();
      const address = app.account.address;
      console.log('PRIVATEKEY',privateKey,'address',app.account.address)
      const signature = Signer.sign('cN6dXeJMWtzWj9Nw9f1aEXyahhh1LA2xHn4ecZvPAZBfN69F68k2', address, app.signMessage.msg, bitcoin.networks.testnet);
      console.log(signature);
      const validity = Verifier.verifySignature(address, app.signMessage.msg, signature as string);
      console.log(validity);
      chrome.runtime.sendMessage({ message: `ReturnSignMessage;${signature}`});
      window.close();
    } catch (e) {
        console.log((e as Error));
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  useEffect(()=>{
    if (app.signMessage.msg) {
      try {
      console.log('SignMessageData',app.signMessage)
      } catch (error){
        console.log('signmessage error: ',error)
      }
    }
  },[app.signMessage])

  return (
    <Layout showBack>
      <Box height="full" style={{ overflow: "scroll" }}>
        <Text>SIGN MESSAGE</Text>
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