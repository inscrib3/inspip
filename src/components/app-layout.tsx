import { Box, Text, Image } from "grommet";
import { Icon } from "../components/icon";
import { RoutePath } from "../router";
import { colors } from "../theme";
import { useNavigate } from "react-router-dom";

export interface AppLayoutProps {
  children: React.ReactNode;
  activeTab?: number;
  showBack?: boolean;
  showHeader?: boolean;
}

export const AppLayout = ({
  activeTab = 0,
  showBack = false,
  showHeader = true,
  ...props
}: AppLayoutProps): JSX.Element => {
  const navigate = useNavigate();

  return (
    <Box fill>
      {showHeader && (
        <Box
          alignSelf="center"
          pad={{ vertical: "large", horizontal: "medium" }}
          width="large"
          flex={false}
          justify={showBack ? "start" : "center"}
          style={{ cursor: "pointer" }}
        >
          {showBack ? (
            <Icon style={{ fontSize: 24 }} name="arrow_back" onClick={() => navigate(-1)} />
          ) : (
            <Image src="/logo.svg" height={44} />
          )}
        </Box>
      )}
      {props.children}
      <Box background={colors.dark} flex={false}>
        <Box
          alignSelf="center"
          background={colors.dark}
          pad="small"
          width="large"
          direction="row"
          justify="around"
        >
          <Box align="center" onClick={() => navigate(RoutePath.Root)}>
            <Icon
              name="wallet"
              style={{
                color: activeTab === 0 ? colors.secondary : colors.inactive,
              }}
            />
            <Text
              size="small"
              style={{
                color: activeTab === 0 ? colors.secondary : colors.inactive,
              }}
            >
              Wallet
            </Text>
          </Box>
          <Box
            align="center"
            onClick={() => navigate(RoutePath.Explore)}
          >
            <Icon
              name="explore"
              style={{
                color: activeTab === 1 ? colors.secondary : colors.inactive,
              }}
            />
            <Text
              size="small"
              style={{
                color: activeTab === 1 ? colors.secondary : colors.inactive,
              }}
            >
              Explore
            </Text>
          </Box>
          <Box align="center" onClick={() => navigate(RoutePath.Settings)}>
            <Icon
              name="settings"
              style={{
                color: activeTab === 2 ? colors.secondary : colors.inactive,
              }}
            />
            <Text
              size="small"
              style={{
                color: activeTab === 2 ? colors.secondary : colors.inactive,
              }}
            >
              Settings
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
