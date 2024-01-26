import { Box, Text } from "grommet";
import { Layout } from "../components";
import { Next } from "grommet-icons";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "../router";
import { useApp } from "../app";

export const Settings = () => {
  const navigate = useNavigate();
  const app = useApp();

  return (
  <Layout showTabs showLogo activeTab={1}>
    <Box height="full" pad={{ vertical: "large" }}>
      <Box
        direction="row"
        background="background-contrast"
        gap="medium"
        style={{ borderRadius: 8 }}
        pad={{ vertical: "medium", horizontal: "large" }}
        align="center"
        onClick={() => navigate(RoutePath.SwitchNetwork)}
      >
        <Box flex>
          <Text weight="bold" size="small">
            Network
          </Text>
          <Text size="small" color="text-weak">
            {app.network.toUpperCase()}
          </Text>
        </Box>
        <Next size="small" />
      </Box>
    </Box>
  </Layout>
  );
};
