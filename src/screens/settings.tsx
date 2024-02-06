import { Box, Text } from "grommet";
import { Next } from "grommet-icons";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "../router";
import { useApp } from "../app";
import { AppLayout } from "../components/app-layout";
import { Icon } from "../components/icon";
import { colors } from "../theme";
import { ResetStorageModal } from "./modals/reset-storage";
import { ShowMnemonicModal } from "./modals/show-mnemonic";
import { useState } from "react";

export const Settings = () => {
  const navigate = useNavigate();
  const app = useApp();
  const [showReset, setShowReset] = useState(false);
  const [showMnemo, setShowMnemo] = useState(false);

  return (
    <AppLayout activeTab={2}>
      {showMnemo && (
        <ShowMnemonicModal onClose={() => setShowMnemo(false)} />
      )}
      {showReset && (
        <ResetStorageModal onClose={() => setShowReset(false)} />
      )}
      <Box
        width="large"
        alignSelf="center"
        style={{ minHeight: 200 }}
        flex
        gap="medium"
        pad={{ horizontal: "medium" }}
      >
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
      <Box
        width="large"
        alignSelf="center"
        flex={false}
        gap="medium"
        pad={{ horizontal: "medium", vertical: "medium" }}
      >
        <Box
          direction="row"
          background={colors.secondary}
          gap="medium"
          style={{ borderRadius: 8 }}
          pad={{ vertical: "medium", horizontal: "large" }}
          align="center"
          onClick={() => setShowMnemo(true)}
        >
          <Icon name="key" style={{ fontSize: 24 }} />
          <Box flex>
            <Text weight="bold" size="small">
              Show Seed or Wif
            </Text>
          </Box>
          <Next size="small" color={colors.dark} />
        </Box>
        <Box
          direction="row"
          background="status-critical"
          gap="medium"
          style={{ borderRadius: 8 }}
          pad={{ vertical: "medium", horizontal: "large" }}
          align="center"
          onClick={() => setShowReset(true)}
        >
          <Icon name="logout" style={{ fontSize: 24 }} />
          <Box flex>
            <Text weight="bold" size="small">
              Exit Wallet
            </Text>
          </Box>
          <Next size="small" color={colors.dark} />
        </Box>
      </Box>
    </AppLayout>
  );
};
