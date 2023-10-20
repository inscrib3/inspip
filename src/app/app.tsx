import { Box, Button, Image } from "grommet";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "../router";
import { useEffect } from "react";
import { Layout } from "../components";
import { importWallet, loadWallet } from "../lib/wallet";
import { useApp } from ".";

export const App = () => {
  const navigate = useNavigate();

  const createWallet = () => navigate(RoutePath.CreateWallet);
  const restoreWallet = () => navigate(RoutePath.RestoreWallet);

  const app = useApp();

  useEffect(() => {
    try {
      console.log("loading wallet")
      const wallet = loadWallet("password"); // @todo use password
      app.setAccount(importWallet(wallet.mnemonic, wallet.network));
      app.setNetwork(wallet.network);
      app.setCurrentAddress(wallet.currentAddress)
      app.setAddresses(wallet.addresses);
    } catch(e) {
      return;
    }
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
