import { Layout } from "../components";
import { Box, Button, Footer, Text } from "grommet";
import { useApp } from "../app";
import { Verifier } from "bip322-js";
import { colors } from "../theme";
import { useEffect } from "react";

export const VerifySign = (): JSX.Element => {
  const app = useApp();

  const onVerify = async () => {
    try {
      const validity = Verifier.verifySignature(
        app.currentAddress,
        app.verifySign.msg,
        app.verifySign.signature as string
      );
      await chrome.runtime.sendMessage({ message: `ReturnVerifySign;${validity}` });
      window.close();
    } catch (e) {
      console.log(e as Error);
      await chrome.runtime.sendMessage({ message: `ReturnErrorOnVerifySign` });
      window.close();
    }
  };

  const onClose = () => {
    window.close();
  };

  useEffect(()=>{
    onVerify();
  },[])

  return (
    <Layout>
      <Box height="full" style={{ overflow: "scroll" }} align="center">
        <Text>VERIFY MESSAGE</Text>
        <Text textAlign="center">
          Verifying the signature for
        </Text>
        <Box background={colors.primary}>
          <Text>{app.verifySign.msg}</Text>
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
          </Box>
        </Box>
      </Footer>
    </Layout>
  );
};