import { Link, useParams } from "react-router-dom";
import { useResource } from "../hooks/useResource";
import type { Match, Participation } from "../types";

export function MatchDetail() {
  const { id } = useParams<{ id: string }>();
  const match = useResource<Match>((api) => api.get(`/api/v1/matches/${id}`), [id]);
  const roster = useResource<Participation[]>(
    (api) => api.get(`/api/v1/matches/${id}/participations`),
    [id],
  );

  return (
    <main>
      <Link to="/">Voltar</Link>
      {match.error && <p>{match.error}</p>}
      {match.data && (
        <>
          <h1>{match.data.location}</h1>
          <p>
            {match.data.status}
            {match.data.status === "FINISHED" &&
              ` — ${match.data.scorePair1} x ${match.data.scorePair2}`}
          </p>
          <h2>Jogadores</h2>
          <ul>
            {roster.data?.map((p) => (
              <li key={p.id}>
                Time {p.team}: {p.player.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
