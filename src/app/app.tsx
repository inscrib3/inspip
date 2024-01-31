import { Box, Button, Image, Text } from "grommet";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "../router";
import { useEffect } from "react";
import { Layout } from "../components";
import { useSearchParams } from "react-router-dom";

export const App = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = {
    ticker: searchParams.get("ticker"),
    id: searchParams.get("id"),
    toAddress: searchParams.get("toAddress"),
    satoshi: searchParams.get("satoshi") || searchParams.get("amount"),
    feerate: searchParams.get("feerate"),
  };

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
        <Box align="center">
          <Image src="/logo.svg" width={50} margin={{ bottom: "small" }} />
          <Text margin={{ top: "small", bottom: "medium" }} textAlign="center">
            Create & Store your Pipe DMT and ART in the world's first Open
            Source Chrome wallet for Pipe!
          </Text>
          <Box gap="medium">
            <Button primary label="Create Wallet" onClick={createWallet} />
            <Button label="Restore Wallet" onClick={restoreWallet} />
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};
