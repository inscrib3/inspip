import { Anchor, Box, Button, Header, Image, Nav } from "grommet";
import { HomeOption, LinkPrevious, SettingsOption } from "grommet-icons";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "../router/route-path";

export interface LayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
  showLogo?: boolean;
  actions?: {
    render: () => JSX.Element;
  }[];
  activeTab?: number;
}

export const Layout = (props: LayoutProps): JSX.Element => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <Box height="full" pad={{ horizontal: "large", vertical: "large" }}>
      <Header>
        {!!props.showBack && (
          <Box flex="grow">
            <Button icon={<LinkPrevious />} onClick={goBack} />
          </Box>
        )}
        {!!props.showLogo && (
          <Box flex="grow">
            <Image src="/logo.svg" width={25} />
          </Box>
        )}
        {!!props.actions && props.actions.map((action) => action.render())}
      </Header>
      {props.children}
      <Nav direction="row" background="transparent" justify="around">
        <Anchor color={!props.activeTab || props.activeTab === 0 ? "brand" : "white"} onClick={() => navigate(RoutePath.Balances)} icon={<HomeOption />} label="Wallet" />
        <Anchor color={props.activeTab === 1 ? "brand" : "white"} onClick={() => navigate(RoutePath.Settings)} icon={<SettingsOption />} label="Settings" />
      </Nav>
    </Box>
  );
};
