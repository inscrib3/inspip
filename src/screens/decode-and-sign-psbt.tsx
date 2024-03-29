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
  const [inputsDetails, setInputsDetails] = useState<any[]>([]);
  const [outputDetails, setOutputDetails] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);

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
        psbtToSign.signInput(i, tweakedChildNode, app.signPsbt.toSignInputs[toSignIndexes.indexOf(i)].sighashTypes);
        if (app.signPsbt.autoFinalized) {
          psbtToSign.finalizeInput(i);
        }
      }

      const hex = psbtToSign.toHex();
      await chrome.runtime.sendMessage({ message: `ReturnSignPsbt;${hex}` });
      window.close();
    } catch (e) {
      console.log(e as Error);
      await chrome.runtime.sendMessage({ message: `ReturnErrorOnSignPsbt;${(e as Error).message}` });
      window.close();
    }
  };

  const onClose = async () => {
    await chrome.runtime.sendMessage({ message: `ClientRejectSignPsbt` });
    window.close();
  };

  useEffect(() => {
    if (app.signPsbt.psbt) {
      let validPsbt = false;
      let newPsbt: bitcoin.Psbt | undefined;
      
      try {
        try {
          newPsbt = bitcoin.Psbt.fromBase64(app.signPsbt.psbt, {
            network: app.network === "testnet"
              ? bitcoin.networks.testnet
              : bitcoin.networks.bitcoin,
          });
          validPsbt = true;
        } catch {
          try {
            newPsbt = bitcoin.Psbt.fromHex(app.signPsbt.psbt, {
              network: app.network === "testnet"
                ? bitcoin.networks.testnet
                : bitcoin.networks.bitcoin,
            });
            validPsbt = true;
          } catch {
            try {
              newPsbt = bitcoin.Psbt.fromBuffer(app.signPsbt.psbt, {
                network: app.network === "testnet"
                  ? bitcoin.networks.testnet
                  : bitcoin.networks.bitcoin,
              });
              validPsbt = true;
            } catch {/* empty */}
          }
        }

        if (!validPsbt || !newPsbt) throw new Error("Invalid Psbt");

        const inputs = [];

        for (const input of newPsbt.data.inputs) {
          if (!input.witnessUtxo) return;
          const address = Address.fromScriptPubKey(input.witnessUtxo.script);
          const value = input.witnessUtxo.value;
          inputs.push({ address, value });
        }

        const outputs: any[] = [];

        for (const output of newPsbt.txOutputs) {
          outputs.push({ address: output.address, value: output.value });
        }
        const getTotal = (arr: any) =>
        arr
          .filter((el: any) => el?.address === app.currentAddress)
          .reduce((acc: number, el: any) => acc + el.value, 0);

        const myInputsTotal = getTotal(inputs);
        const myOutputsTotal = getTotal(outputs);
        const total = myOutputsTotal - myInputsTotal;

        setInputsDetails(inputs);
        setOutputDetails(outputs);
        setTotal(total);
        setPsbtToSign(newPsbt);
      } catch (error) {
        console.log(error as Error);
        chrome.runtime.sendMessage({ message: `ReturnErrorOnSignPsbt` });
        window.close();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app.signPsbt.psbt]);

  return (
    <Layout>
      <Box height="full" style={{ overflow: "scroll" }}>
        <Accordion>
          <Box
            pad={{ vertical: "medium", horizontal: "small" }}
            justify="center"
            align="center"
            flex
          >
          <Text weight="bold">Sign Transaction</Text>
          </Box>
          <Box
            pad={{ vertical: "medium", horizontal: "small" }}
            background="background-contrast"
            justify="center"
            align="center"
            flex
          >
            <Text weight="bold">{total} sats</Text>
          </Box>
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
                    {el.address && truncateInMiddle(el.address, 20)}
                  </Text>
                  <Text weight="bold">{el.value} sats</Text>
                </Box>
              ))}
            </Box>
          </AccordionPanel>
          <AccordionPanel
            label={<Text margin={{ vertical: "small" }}>Outputs</Text>}
          >
            <Box pad="small" background="background-contrast">
              {outputDetails.map((el: any) => (
                <Box
                  justify="between"
                  margin={{ vertical: "small" }}
                >
                  <Text>
                    {el.address && truncateInMiddle(el.address, 20)}
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