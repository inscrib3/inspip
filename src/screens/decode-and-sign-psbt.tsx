import { Layout } from "../components";
import { Accordion, AccordionPanel, Box, Button, Footer, Text } from "grommet";
import { useApp } from "../app";
import { Address } from "@cmdcode/tapscript";
import { truncateInMiddle } from "../utils/truncate-in-middle";
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
    window.close();
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
          const address = truncateInMiddle(
            Address.fromScriptPubKey(input.witnessUtxo.script),
            20
          )
          const value = input.witnessUtxo.value;
          setInputsDetails((prev: any) => [...prev, { address, value }]);
        }
        setPsbtToSign(newPsbt);
      } catch (error) {
        console.log("signpsbt error: ", error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.signPsbt.account, app.signPsbt.psbt]);

  return (
    <Layout>
      <Box height="full" style={{ overflow: "scroll" }}>
        <Accordion>
          <AccordionPanel
            label={<Text margin={{ vertical: "small" }}>Inputs</Text>}
          >
            <Box pad="small" background="background-contrast">
              {inputsDetails.map((el: any) => (
                <Box
                  justify="between"
                  margin={{ vertical: "small" }}
                >
                  <Text>
                    {el.address}
                  </Text>
                  <Text weight="bold">{el.value} sats</Text>
                </Box>
              ))}
            </Box>
          </AccordionPanel>
        </Accordion>
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