import { grommet } from "grommet";
import { deepMerge } from "grommet/utils";
import { themeConstants } from "./theme-constants";

export const theme = deepMerge(grommet, themeConstants);
