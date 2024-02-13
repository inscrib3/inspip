import { Box, Button, Image, Text } from "grommet";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "../router";
import { useEffect } from "react";
import { Layout } from "../components";
import { useSearchParams } from "react-router-dom";
import { useApp } from ".";

export const App = () => {
  const navigate = useNavigate();
  const app = useApp();
  const [searchParams] = useSearchParams();
  const params = {
    ticker: searchParams.get("ticker"),
    id: searchParams.get("id"),
    toAddress: searchParams.get("toAddress"),
    satoshi: searchParams.get("satoshi") || searchParams.get("amount"),
    feerate: searchParams.get("feerate"),
  };

  useEffect(()=>{
    if (searchParams.get("psbt")) {
      app.setSignPsbt({
        account:JSON.parse(searchParams.get("account") || ""),
        psbt:(searchParams.get("psbt") || "").replace(/\s/g,'+'),
        toSignInputs:(JSON.parse(searchParams.get("toSignInputs") || "")),
        autoFinalized:searchParams.get("autoFinalized") === 'true' ? true : false,
        broadcast:searchParams.get("broadcast") === 'true' ? true : false,
      })
    }
    if (searchParams.get("action") === "SignMessage") {
      app.setSignMessage({
        msg:searchParams.get("msg"),
        type:searchParams.get("type"),
      })
    }
    if (searchParams.get("action") === "VerifyMessage") {
      app.setVerifyMessage({
        address:searchParams.get("address"),
        msg:searchParams.get("msg"),
        signature:(searchParams.get("signature") || "").replace(/\s/g,'+'),
      })
    }
  },[app, searchParams])

  const createWallet = () => navigate(RoutePath.CreateWallet);
  const restoreWallet = () => navigate(RoutePath.RestoreWallet);
  const connectWallet = () => navigate(RoutePath.ConnectWallet);
  const send = (data: any) => navigate(RoutePath.Send, { state: data });

  useEffect(() => {
    if (searchParams.get("toAddress")) {
      setTimeout(() => {
        send(params);
      }, 500);
    }
    if (
      searchParams.get("action") &&
      searchParams.get("action") === "ConnectWallet"
    ) {
      setTimeout(() => {
        connectWallet();
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (localStorage.getItem("wallet")) {
      navigate(RoutePath.Password);
    }
  }, [navigate]);

  return (
    <Layout>
      <Box fill align="center" justify="center">
        <Box width="medium" alignSelf="center">
          <Box direction="row" justify="center" align="center" gap="small">
            <Image src="/logo.svg" width={44} margin={{ bottom: "small" }} />
            <Text size="large" weight="bold" style={{ marginTop: -10 }}>
              Inspip | Pipe Wallet
            </Text>
          </Box>
          <Text margin={{ top: "small", bottom: "small" }} style={{ lineHeight: 1.5, letterSpacing: 0.2 }}>
            Create & Store your Pipe DMT and ART in the world's first Open
            Source Chrome wallet for Pipe!
          </Text>
          <Box gap="small">
            <Button primary label="Create Wallet" onClick={createWallet} />
            <Button label="Restore Wallet" onClick={restoreWallet} />
          </Box>
            {window.origin.includes('http') && (
              <Box align="center" margin="small" onClick={() => window.open('https://chromewebstore.google.com/detail/inspip/hgbnkbbibgkjkbgbaicdajneaponhnge', '_blank')}>
                <Image src="/chromestore.png" width={200} />
              </Box>
            )}
        </Box>
      </Box>
    </Layout>
  );
};
