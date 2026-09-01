import { createBrowserRouter } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import { Login } from "./pages/Login";
import { Callback } from "./pages/Callback";
import { Matches } from "./pages/Matches";
import { MatchDetail } from "./pages/MatchDetail";
import { Profile } from "./pages/Profile";
import { PlayerDetail } from "./pages/PlayerDetail";
import { Onboarding } from "./pages/Onboarding";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/callback", element: <Callback /> },
  { path: "/onboarding", element: <Onboarding /> },
  {
    element: <RequireAuth />,
    children: [
      { path: "/", element: <Matches /> },
      { path: "/feed", element: <Matches /> },
      { path: "/matches/:id", element: <MatchDetail /> },
      { path: "/match/:id", element: <MatchDetail /> },
      { path: "/profile", element: <Profile /> },
      { path: "/players/:id", element: <PlayerDetail /> },
    ],
  },
]);
