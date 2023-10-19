import { Box, Button, Image } from "grommet";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "../router";
import { useEffect } from "react";
import { Layout } from "../components";
import { generateWallet } from "../lib/wallet";
import { bitcoin } from "../lib/bitcoin-lib";

export const App = () => {
  const navigate = useNavigate();

  const createWallet = () => navigate(RoutePath.CreateWallet);
  const restoreWallet = () => navigate(RoutePath.RestoreWallet);

  useEffect(() => {
    const wallet = localStorage.getItem("wallet");
    if (!wallet) return;
    navigate(RoutePath.Balances);
  }, [navigate]);

  return (
    <Layout>
      <Box fill align="center" justify="center">
          <Box align="center" gap="medium">
            <Image src="/logo.svg" width={50} />
            <Button primary label="Create Wallet" onClick={createWallet} />
            <Button label="Restore Wallet" onClick={restoreWallet} />
          </Box>
      </Box>
    </Layout>
  );
};
