import { createHashRouter } from "react-router-dom";
import { RoutePath } from "./route-path";
import { App } from "../app";
import { CreateWallet, RestoreWallet, Mnemonic, Balances, Send } from "../screens";
import { Addresses } from "../screens/addresses";

export const router = createHashRouter([
  {
    path: RoutePath.Root,
    element: <App />,
  },
  {
    path: RoutePath.CreateWallet,
    element: <CreateWallet />,
  },
  {
    path: RoutePath.Mnemonic,
    element: <Mnemonic />,
  },
  {
    path: RoutePath.RestoreWallet,
    element: <RestoreWallet />,
  },
  {
    path: RoutePath.Balances,
    element: <Balances />,
  },
  {
    path: RoutePath.Send,
    element: <Send />,
  },
  {
    path: RoutePath.Addresses,
    element: <Addresses />,
  }
]);
