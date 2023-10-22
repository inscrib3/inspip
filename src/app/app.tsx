import { Box, Button, Image } from "grommet";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "../router";
import { useEffect } from "react";
import { Layout } from "../components";

export const App = () => {
  const navigate = useNavigate();

  const createWallet = () => navigate(RoutePath.CreateWallet);
  const restoreWallet = () => navigate(RoutePath.RestoreWallet);

  useEffect(() => {
    if (localStorage.getItem("wallet")) {
      navigate(RoutePath.Password);
    }
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
