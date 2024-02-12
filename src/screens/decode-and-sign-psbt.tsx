import { Layout } from "../components";
import { Box, Button, Footer, Text } from "grommet";
import { useApp } from "../app";
import { useEffect, useState } from "react";
import * as bitcoin from "bitcoinjs-lib";

export const DecodeAndSignPsbt = () => {
  const app = useApp();
  const [psbtToSign, setPsbtToSign] = useState<bitcoin.Psbt>();
  const [inputsDetails, setInputsDetails] = useState<any>([]);

  const onSign = async () => {
    if (!psbtToSign) return;
    try {
      const inputs = psbtToSign.data.inputs;
      const toSignIndexes = app.signPsbt.toSignInputs.map(
        (el: any) => el.index
      );
      const tweakedChildNode = app.account.account.tweak(
        bitcoin.crypto.taggedHash("TapTweak", app.account.internalPubkey)
      );
      for (let i = 0; i < inputs.length; i++) {
        if (!toSignIndexes.includes(i)) continue;
        psbtToSign.signInput(i, tweakedChildNode);
        psbtToSign.finalizeInput(i);
      }
      const hex = psbtToSign.toHex();
      chrome.runtime.sendMessage({ message: `ReturnSignPsbt;${hex}` });
      window.close();
    } catch (e) {
      console.log(e as Error);
    }
  };

  const onClose = () => {
    () => window.close();
  };

  useEffect(() => {
    if (app.signPsbt.account) {
      try {
        const newPsbt = bitcoin.Psbt.fromBase64(app.signPsbt.psbt, {
          network: app.signPsbt.account.startsWith("tb1")
            ? bitcoin.networks.testnet
            : bitcoin.networks.bitcoin,
        });
        for (const input of newPsbt.data.inputs) {
          if (!input.witnessUtxo) return;
          const address = bitcoin.address.fromOutputScript(
            input.witnessUtxo.script || ""
          );
          const value = input.witnessUtxo.value;
          setInputsDetails((prev: any) => [...prev, { address, value }]);
          console.log("indirizzo input: ", address, " valore input: ", value);
        }
        setPsbtToSign(newPsbt);
      } catch (error) {
        console.log("signpsbt error: ", error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.signPsbt.account, app.signPsbt.psbt]);

  return (
    <Layout showBack>
      <Box height="full" style={{ overflow: "scroll" }}>
        <Text>Inputs</Text>
        {inputsDetails.map((el: any) => (
          <>
            <Box margin={{ top: "small" }} justify="between">
              <Text>Address</Text>
              <Text>{el.address}</Text>
            </Box>
            <Box margin={{ top: "small" }} justify="between">
              <Text>Sats</Text>
              <Text>{el.value.toString()}</Text>
            </Box>
          </>
        ))}
      </Box>
      <Footer pad="small">
        <Box flex>
          <Box direction="row" flex justify="between" gap="large">
            <Button
              secondary
              label="Reject"
              style={{ width: "100%" }}
              onClick={onClose}
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