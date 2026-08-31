import { useMemo } from "react";
import { useAuth } from "react-oidc-context";
import { createApi } from "../services/api";

export function useApi() {
  const auth = useAuth();
  const token = auth.user?.access_token;
  return useMemo(() => createApi(() => token), [token]);
}
