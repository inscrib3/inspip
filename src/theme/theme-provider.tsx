import { Grommet } from "grommet";
import { theme } from "./theme";

export type ThemeProviderProps = {
  children: React.ReactNode;
};

export const ThemeProvider = (props: ThemeProviderProps) => (
  <Grommet full theme={theme} themeMode="dark">
    {props.children}
  </Grommet>
);
