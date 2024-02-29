import { Layout } from "../components";
import { Box, Button, Footer, Text } from "grommet";
import { useApp } from "../app";
import { Signer } from "bip322-js";
import * as bitcoin from "bitcoinjs-lib";
import { colors } from "../theme";

export const SignMessage = (): JSX.Element => {
  const app = useApp();

  const onSign = async () => {
    try {
      const privateKey = app.account.account.toWIF();
      const address = app.currentAddress;
      const signature = Signer.sign(
        privateKey,
        address,
        app.signMessage.msg,
        app.network === "testnet" ? bitcoin.networks.testnet : bitcoin.networks.bitcoin,
      );
      await chrome.runtime.sendMessage({ message: `ReturnSignMessage;${signature}` });
      window.close();
    } catch (e) {
      console.log(e as Error);
      await chrome.runtime.sendMessage({ message: `ReturnErrorOnSignMessage` });
      window.close();
    }
  };

  const onClose = async () => {
    await chrome.runtime.sendMessage({ message: `ClientRejectSignMessage` });
    window.close();
  };

  return (
    <Layout>
      <Box height="full" style={{ overflow: "scroll" }} align="center">
        <Text>SIGNATURE REQUEST</Text>
        <Text textAlign="center">
          Only sign this message if you fully understand the content and trust
          the requesting site.
        </Text>
        <Text>You are signing</Text>
        <Box background={colors.primary}>
          <Text>{app.signMessage.msg}</Text>
        </Box>
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