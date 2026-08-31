import { useAuth } from "react-oidc-context";
import { Link } from "react-router-dom";
import { useResource } from "../hooks/useResource";
import type { Player } from "../types";

export function Profile() {
  const auth = useAuth();
  const { data, error, loading } = useResource<Player>((api) => api.get("/api/v1/players/me"));

  return (
    <main>
      <Link to="/">Partidas</Link>
      <h1>Perfil</h1>
      {loading && <p>Carregando...</p>}
      {error && <p>{error}</p>}
      {data && (
        <ul>
          <li>Nome: {data.name}</li>
          <li>E-mail: {data.email}</li>
          <li>Rating: {data.rating}</li>
        </ul>
      )}
      <button type="button" onClick={() => void auth.signoutRedirect()}>
        Sair
      </button>
    </main>
  );
}
