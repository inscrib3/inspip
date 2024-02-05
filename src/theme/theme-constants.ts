import { ThemeType } from "grommet";

export const colors = {
  primary: "#6FFFB0",
  secondary: "#D67BFF",
  dark: "#1C1917",
  inactive: "#858585",
  odd: "#272727",
  even: "#1C1917",
};

export const themeConstants: ThemeType = {
  global: {
    font: {
      family: "'Roboto', sans-serif",
    },
    colors: {
      brand: colors.primary
    },
  },
  button: {
    size: {
      small: {
        border: {
          radius: "3px",
        },
      },
      medium: {
        border: {
          radius: "3px",
        },
      },
      large: {
        border: {
          radius: "3px",
        },
      }
    },
    border: {
      radius: "3px",
    },
  },
};
