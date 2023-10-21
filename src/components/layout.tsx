import { Box, Button, Header, Image } from "grommet";
import { LinkPrevious } from "grommet-icons";
import { useNavigate } from "react-router-dom";

export interface LayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
  showLogo?: boolean;
  actions?: {
    render: () => JSX.Element;
  }[];
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
    </Box>
  );
};
