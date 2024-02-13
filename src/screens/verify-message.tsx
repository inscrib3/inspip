import { Layout } from "../components";
import { Box, Button, Footer, Text } from "grommet";
import { useApp } from "../app";
import { Verifier } from "bip322-js";
import { colors } from "../theme";
import { useEffect } from "react";

export const VerifyMessage = (): JSX.Element => {
  const app = useApp();

  const onVerify = async () => {
    try {
      const validity = Verifier.verifySignature(
        app.verifyMessage.address,
        app.verifyMessage.msg,
        app.verifyMessage.signature as string
      );
      console.log(validity);
      chrome.runtime.sendMessage({ message: `ReturnVerifyMessage;${validity}` });
      window.close();
    } catch (e) {
      console.log(e as Error);
    }
  };

  const onClose = () => {
    window.close();
  };

  useEffect(()=>{
    console.log(app.verifyMessage);
  },[])

  return (
    <Layout>
      <Box height="full" style={{ overflow: "scroll" }} align="center">
        <Text>VERIFY MESSAGE</Text>
        <Text textAlign="center">
          Do you want to verify this message?
        </Text>
        <Box background={colors.primary}>
          <Text>{app.verifyMessage.msg}</Text>
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
              onClick={onVerify}
            />
          </Box>
        </Box>
      </Footer>
    </Layout>
  );
};