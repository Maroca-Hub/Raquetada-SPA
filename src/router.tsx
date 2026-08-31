import { createBrowserRouter } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import { Login } from "./pages/Login";
import { Callback } from "./pages/Callback";
import { Matches } from "./pages/Matches";
import { MatchDetail } from "./pages/MatchDetail";
import { Profile } from "./pages/Profile";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/callback", element: <Callback /> },
  {
    element: <RequireAuth />,
    children: [
      { path: "/", element: <Matches /> },
      { path: "/matches/:id", element: <MatchDetail /> },
      { path: "/profile", element: <Profile /> },
    ],
  },
]);
