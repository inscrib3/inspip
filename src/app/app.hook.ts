import { useContext } from "react";
import { AppContext } from "./app-context";

export const useApp = () => useContext(AppContext);