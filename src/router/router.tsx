import { createHashRouter } from "react-router-dom";
import { RoutePath } from "./route-path";
import { App } from "../app";
import { CreateWallet, RestoreWallet, Mnemonic, Balances, Send } from "../screens";
import { Addresses } from "../screens/addresses";
import { Password } from "../screens/password";
import { Settings} from "../screens/settings";
import { ConfirmTransaction } from "../screens/confirm-transaction";
import { ConnectWallet } from "../screens/connect-wallet";
import { SwitchNetwork } from "../screens/switch-network";
import { Explore } from "../screens/explore";
import { DecodeAndSignPsbt } from "../screens/decode-and-sign-psbt";
import { SignMessage } from "../screens/sign-message";
import { VerifyMessage } from "../screens/verify-message";

export const router = createHashRouter([
  {
    path: RoutePath.Root,
    element: <App />,
  },
  {
    path: RoutePath.Explore,
    element: <Explore />,
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
    path: RoutePath.Password,
    element: <Password />,
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
  },
  {
    path: RoutePath.ConfirmTransaction,
    element: <ConfirmTransaction />,
  },
  {
    path: RoutePath.ConnectWallet,
    element: <ConnectWallet />,
  },
  {
    path: RoutePath.Settings,
    element: <Settings />
  },
  {
    path: RoutePath.SwitchNetwork,
    element: <SwitchNetwork />,
  },
  {
    path: RoutePath.DecodeAndSignPsbt,
    element: <DecodeAndSignPsbt />,
  },
  {
    path: RoutePath.SignMessage,
    element: <SignMessage />,
  },
  {
    path: RoutePath.VerifyMessage,
    element: <VerifyMessage />,
  }
]);
