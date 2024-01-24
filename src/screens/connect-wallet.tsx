import { Text, Image, Box, Button } from "grommet";
import { Layout } from "../components";
import { useNavigate } from "react-router-dom";
import { useApp } from "../app";

export const ConnectWallet = (): JSX.Element => {
  const app = useApp();
  const navigate = useNavigate();
  
  const returnConnectInfo = () => {
    chrome.runtime.sendMessage({ message: `ReturnConnectWalletInfo;${app.currentAddress};chiavepubblica`});
    setTimeout(()=>{
      window.close();
    },1000)
  };
  const goBack = () => {
    navigate(-1);
  };
  return (
    <Layout showBack>
      <Box fill align="center" justify="center">
        <Box align="center" gap="medium">
          <Image src="/logo.svg" width={50} />
          <Box>
            <Text size="medium">Current address:</Text>
          </Box>
          <Box>
            <Text size="medium">{app.currentAddress}</Text>
          </Box>
          <Box>
            <Text size="medium">Connect wallet?</Text>
          </Box>
          <Box gap="medium" direction="row" justify="center">
            <Button
              size="small"
              label="Yes"
              onClick={returnConnectInfo}
            />
            <Button
              size="small"
              label="No"
              onClick={goBack}
            />
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};