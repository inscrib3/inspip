import { Box, Text } from "grommet";
import { Checkmark } from "grommet-icons";
import { useApp } from "../app";
import { RoutePath } from "../router";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../components/app-layout";

export const SwitchNetwork = () => {
  const app = useApp();
  const navigate = useNavigate();

  return (
    <AppLayout showBack activeTab={1}>
      <Box width="large" alignSelf="center" style={{ minHeight: 200 }} flex gap="medium" pad={{ horizontal: "medium" }}>
        <Box
          direction="row"
          background="background-contrast"
          gap="medium"
          style={{ borderRadius: 8 }}
          pad={{ vertical: "medium", horizontal: "large" }}
          align="center"
        >
          <Box
            flex
            onClick={() => {
              app.setNetwork("mainnet");
              navigate(RoutePath.Password);
            }}
          >
            <Text weight="bold" size="small">
              MAINNET
            </Text>
          </Box>
          {app.network === "mainnet" && <Checkmark size="small" />}
        </Box>
        <Box
          direction="row"
          background="background-contrast"
          gap="medium"
          style={{ borderRadius: 8 }}
          pad={{ vertical: "medium", horizontal: "large" }}
          align="center"
        >
          <Box
            flex
            onClick={() => {
              app.setNetwork("testnet");
              navigate(RoutePath.Password);
            }}
          >
            <Text weight="bold" size="small">
              TESTNET
            </Text>
          </Box>
          {app.network === "testnet" && <Checkmark size="small" />}
        </Box>
      </Box>
    </AppLayout>
  );
};
