import { Text, Image, Box, Button } from "grommet";
import { Layout } from "../components";
import { useLocation } from "react-router-dom";
import { useApp } from "../app";
import { toXOnly } from "../bitcoin/helpers";

export const ConnectWallet = (): JSX.Element => {
  const location = useLocation();
  const app = useApp();
  console.log('app',app,app.account.internalPubkey)
  console.log('location in connect wallet', location);
  //const navigate = useNavigate();
  const returnConnectInfo = () => {
    console.log('clicked YEs')
    chrome.runtime.sendMessage({ message: `ReturnConnectWalletInfo;${app.currentAddress};chiavepubblica`});
    /*const message = {
      action: "ReturnConnectWalletInfo",
      data: {
        address: app.currentAddress,
        pubkey: toXOnly(app.account.internalPubkey)
      }
    }
    chrome.runtime.sendMessage({ message });*/
  };
  const goBack = () => {
    console.log("returnConnectInfo");
  };
  return (
    <Layout showBack>
      <Box fill align="center" justify="center">
        <Box align="center" gap="medium">
          <Image src="/logo.svg" width={50} />
          <Box>
            <Text size="medium">Current address: {app.currentAddress}</Text>
          </Box>
          <Box>
            <Text size="medium">Current address: {app.account && app.account.publicKey && toXOnly(app.account.publicKey)}</Text>
          </Box>
          <Box>
            <Text size="medium">Connect wallet?</Text>
          </Box>
          <Box>
            <Button
              primary
              label="Yes"
              style={{ width: "100%" }}
              onClick={returnConnectInfo}
            />
            <Button
              primary
              label="No"
              style={{ width: "100%" }}
              onClick={goBack}
            />
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};
