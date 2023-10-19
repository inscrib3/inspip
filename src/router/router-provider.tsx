import { RouterProvider as DefaultRouterProvider } from "react-router-dom";
import { router } from "./router";

export const RouterProvider = () => <DefaultRouterProvider router={router} />;
