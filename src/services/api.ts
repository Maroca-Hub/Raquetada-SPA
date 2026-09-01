import type {
  Match,
  MatchInput,
  MatchOutput,
  MatchResultInput,
  MatchStatus,
  Player,
  PlayerInput,
  PlayerOutput,
  PlayerTier,
  Participation,
  ParticipationOutput,
  JoinMatchInput,
  ChangeTeamInput,
  EvaluationInput,
  EvaluationOutput,
} from "../types";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export type Api = ReturnType<typeof createApi>;

export function createApi(getToken: () => string | undefined) {
  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = getToken();
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new ApiError(response.status, body.error ?? response.statusText);
    }

    return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) =>
      request<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown) =>
      request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
    del: (path: string) => request<void>(path, { method: "DELETE" }),

    // Strongly typed endpoint clients matching OpenAPI docs
    matches: {
      list: (params?: { status?: MatchStatus; organizerId?: string }) => {
        const search = new URLSearchParams();
        if (params?.status) search.set("status", params.status);
        if (params?.organizerId) search.set("organizerId", params.organizerId);
        const query = search.toString();
        return request<MatchOutput[]>(`/api/v1/matches${query ? `?${query}` : ""}`);
      },
      get: (id: string) => request<MatchOutput>(`/api/v1/matches/${id}`),
      create: (body: MatchInput) => request<MatchOutput>("/api/v1/matches", { method: "POST", body: JSON.stringify(body) }),
      update: (id: string, body: MatchInput) => request<MatchOutput>(`/api/v1/matches/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
      registerResult: (id: string, body: MatchResultInput) =>
        request<MatchOutput>(`/api/v1/matches/${id}/result`, { method: "POST", body: JSON.stringify(body) }),
      listParticipations: (matchId: string) =>
        request<ParticipationOutput[]>(`/api/v1/matches/${matchId}/participations`),
      join: (matchId: string, body?: JoinMatchInput) =>
        request<ParticipationOutput>(`/api/v1/matches/${matchId}/participations`, {
          method: "POST",
          body: body ? JSON.stringify(body) : undefined,
        }),
      leave: (matchId: string) =>
        request<void>(`/api/v1/matches/${matchId}/participations/me`, { method: "DELETE" }),
      changeTeam: (matchId: string, body: ChangeTeamInput) =>
        request<ParticipationOutput>(`/api/v1/matches/${matchId}/participations/me`, {
          method: "PATCH",
          body: JSON.stringify(body),
        }),
      listEvaluations: (matchId: string) =>
        request<EvaluationOutput[]>(`/api/v1/matches/${matchId}/evaluations`),
      createEvaluation: (matchId: string, body: EvaluationInput) =>
        request<EvaluationOutput>(`/api/v1/matches/${matchId}/evaluations`, {
          method: "POST",
          body: JSON.stringify(body),
        }),
    },

    players: {
      getMyProfile: () => request<PlayerOutput>("/api/v1/players/me"),
      updateMyProfile: (body: PlayerInput) =>
        request<PlayerOutput>("/api/v1/players/me", { method: "PATCH", body: JSON.stringify(body) }),
      list: () => request<PlayerOutput[]>("/api/v1/players"),
      get: (id: string) => request<PlayerOutput>(`/api/v1/players/${id}`),
      listReceivedEvaluations: (id: string) =>
        request<EvaluationOutput[]>(`/api/v1/players/${id}/evaluations`),
    },

    evaluations: {
      get: (id: string) => request<EvaluationOutput>(`/api/v1/evaluations/${id}`),
    },
  };
}

// ----------------------------------------------------
// UI Adapters & Mappers
// ----------------------------------------------------

export function calculateTierFromRating(rating: number): PlayerTier {
  if (rating >= 93) return "DIAMANTE";
  if (rating >= 88) return "OURO";
  if (rating >= 80) return "PRATA";
  return "BRONZE";
}

export function mapPlayerOutputToPlayer(output: PlayerOutput): Player {
  const rating = output.rating ?? 52;
  const tier = calculateTierFromRating(rating);

  return {
    id: output.id,
    name: output.name || "Jogador",
    email: output.email,
    rating,
    tier,
    level:
      rating >= 93
        ? "Nível 6.0 - Pro"
        : rating >= 88
        ? "Nível 5.0 - Avançado"
        : rating >= 80
        ? "Nível 4.0 - Intermediário"
        : "Nível 3.0 - Iniciante",
    preferredSide: "AMBOS",
    stats: {
      power: 0,
      speed: 0,
      technique: 0,
      stamina: 0,
    },
    evaluations: {
      fairPlay: 0,
      punctuality: 0,
      teamSpirit: 0,
      generalTechnique: 0,
    },
    tags: [],
  };
}

export function mapParticipationOutputToParticipation(output: ParticipationOutput): Participation {
  return {
    id: output.id,
    matchId: output.matchId,
    player: mapPlayerOutputToPlayer(output.player),
    team: output.team,
    status: output.status === "ACCEPTED" ? "ACCEPTED" : "REJECTED",
  };
}

export function mapMatchOutputToMatch(
  output: MatchOutput,
  participations: ParticipationOutput[] = []
): Match {
  // Parse date and time from ISO string
  const date = new Date(output.dateTime);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow =
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toDateString() ===
    date.toDateString();

  const dayOfWeek = date.getDay();
  let dateCategory: Match["dateCategory"] = "other";
  if (isToday) dateCategory = "today";
  else if (isTomorrow) dateCategory = "tomorrow";
  else if (dayOfWeek === 6) dateCategory = "saturday";
  else if (dayOfWeek === 0) dateCategory = "sunday";

  const timeFormatted = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  const dayName = isToday
    ? "Hoje"
    : isTomorrow
    ? "Amanhã"
    : dayOfWeek === 6
    ? "Sábado"
    : dayOfWeek === 0
    ? "Domingo"
    : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  const dateTimeDisplay = `${dayName}, ${timeFormatted}`;

  // Extract club name and court name from location string if formatted as "Club — Court" or "Club"
  const locationParts = (output.location || "Padel Arena").split("—").map((p) => p.trim());
  const clubName = locationParts[0] || "Padel Arena";
  const courtName = locationParts[1] || "Quadra 1";

  const acceptedParticipations = participations.map(mapParticipationOutputToParticipation);

  return {
    id: output.id,
    clubName,
    location: output.location || clubName,
    courtName,
    dateTime: dateTimeDisplay,
    dateCategory,
    pricePerPerson: 45,
    status: output.status,
    levelRequired: "Todos os níveis",
    maxPlayers: 4,
    organizer: mapPlayerOutputToPlayer(output.organizer),
    scorePair1: output.scorePair1,
    scorePair2: output.scorePair2,
    participations: acceptedParticipations,
    pendingRequests: [],
  };
}
