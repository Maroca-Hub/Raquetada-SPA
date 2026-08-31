import { AuthProvider } from "react-oidc-context";
import { RouterProvider } from "react-router-dom";
import { oidcConfig } from "./auth";
import { router } from "./router";

export default function App() {
  return (
    <AuthProvider {...oidcConfig}>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
