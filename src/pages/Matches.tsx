import { Link } from "react-router-dom";
import { useResource } from "../hooks/useResource";
import type { Match } from "../types";

export function Matches() {
  const { data, error, loading } = useResource<Match[]>((api) => api.get("/api/v1/matches"));

  return (
    <main>
      <header>
        <h1>Partidas</h1>
        <Link to="/profile">Perfil</Link>
      </header>
      {loading && <p>Carregando...</p>}
      {error && <p>{error}</p>}
      <ul>
        {data?.map((match) => (
          <li key={match.id}>
            <Link to={`/matches/${match.id}`}>
              {match.location} — {match.status}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
