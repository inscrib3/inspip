import { Box, Text } from "grommet";
import { Layout } from "../components";
import { Checkmark } from "grommet-icons";
import { useApp } from "../app";
import { RoutePath } from "../router";
import { useNavigate } from "react-router-dom";

export const SwitchNetwork = () => {
  const app = useApp();
  const navigate = useNavigate();

  return (
    <Layout showLogo activeTab={1}>
      <Box height="full" pad={{ vertical: "large" }} gap="medium">
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
    </Layout>
  );
};
