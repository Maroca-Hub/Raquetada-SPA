import type {
  ChangeSlotInput,
  CreateMatchInput,
  EvaluationInput,
  EvaluationOutput,
  JoinMatchInput,
  MatchInput,
  MatchOutput,
  MatchResultInput,
  MatchStatus,
  ParticipationOutput,
  PlayerInput,
  PlayerOutput,
  PlayerProfileOutput,
  Skill,
} from "../types";
import { DEV_USER, isDevSession } from "../devSession";

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
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    };

    if (isDevSession()) {
      // Dev mode wins even if a stale OIDC token is still around, so the app
      // always acts as the dev seed user. The API's `development` profile reads
      // this header instead of a JWT.
      headers["X-User"] = DEV_USER;
    } else if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${baseUrl}${path}`, { ...init, headers });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new ApiError(response.status, body.error ?? response.statusText);
    }

    return response.status === 204
      ? (undefined as T)
      : ((await response.json()) as T);
  }

  return {
    matches: {
      list: (params?: { status?: MatchStatus; organizerId?: string }) => {
        const search = new URLSearchParams();
        if (params?.status) search.set("status", params.status);
        if (params?.organizerId) search.set("organizerId", params.organizerId);
        const query = search.toString();
        return request<MatchOutput[]>(
          `/api/v1/matches${query ? `?${query}` : ""}`,
        );
      },
      get: (id: string) => request<MatchOutput>(`/api/v1/matches/${id}`),
      create: (body: CreateMatchInput) =>
        request<MatchOutput>("/api/v1/matches", {
          method: "POST",
          body: JSON.stringify(body),
        }),
      update: (id: string, body: MatchInput) =>
        request<MatchOutput>(`/api/v1/matches/${id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        }),
      registerResult: (id: string, body: MatchResultInput) =>
        request<MatchOutput>(`/api/v1/matches/${id}/result`, {
          method: "POST",
          body: JSON.stringify(body),
        }),

      listParticipations: (matchId: string) =>
        request<ParticipationOutput[]>(
          `/api/v1/matches/${matchId}/participations`,
        ),
      join: (matchId: string, body: JoinMatchInput) =>
        request<ParticipationOutput>(
          `/api/v1/matches/${matchId}/participations`,
          {
            method: "POST",
            body: JSON.stringify(body),
          },
        ),
      changeSlot: (matchId: string, body: ChangeSlotInput) =>
        request<ParticipationOutput>(
          `/api/v1/matches/${matchId}/participations/me`,
          {
            method: "PATCH",
            body: JSON.stringify(body),
          },
        ),
      leave: (matchId: string) =>
        request<void>(`/api/v1/matches/${matchId}/participations/me`, {
          method: "DELETE",
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
      getMyProfile: () => request<PlayerProfileOutput>("/api/v1/players/me"),
      updateMyProfile: (body: PlayerInput) =>
        request<PlayerOutput>("/api/v1/players/me", {
          method: "PATCH",
          body: JSON.stringify(body),
        }),
      list: () => request<PlayerOutput[]>("/api/v1/players"),
      get: (id: string) =>
        request<PlayerProfileOutput>(`/api/v1/players/${id}`),
      listReceivedEvaluations: (id: string) =>
        request<EvaluationOutput[]>(`/api/v1/players/${id}/evaluations`),
    },

    evaluations: {
      get: (id: string) =>
        request<EvaluationOutput>(`/api/v1/evaluations/${id}`),
    },
  };
}

// ----------------------------------------------------
// Small presentation helpers (no fabricated data — pure formatting of
// values the API already returns).
// ----------------------------------------------------

export const SKILL_LABELS: Record<string, string> = {
  LOB: "Lob",
  SERVE: "Saque",
  POSITIONING: "Posicionamento",
  SMASH: "Smash",
  DEFENSE: "Defesa",
};

export const SKILL_ORDER = [
  "SERVE",
  "SMASH",
  "LOB",
  "DEFENSE",
  "POSITIONING",
] as const;

// Player valences: radar axes (clockwise from top) / left-to-right skill row.
export const SKILL_AXES: { key: Skill; short: string }[] = [
  { key: "SERVE", short: "SAQ" },
  { key: "SMASH", short: "SMA" },
  { key: "DEFENSE", short: "DEF" },
  { key: "POSITIONING", short: "POS" },
  { key: "LOB", short: "LOB" },
];

export const FORM_LABELS: Record<string, string> = {
  AWFUL: "Péssima",
  POOR: "Ruim",
  NEUTRAL: "Neutra",
  GOOD: "Boa",
  GREAT: "Ótima",
};

export const POSITION_LABELS: Record<string, string> = {
  DRIVE: "Drive (direita)",
  REVES: "Revés (esquerda)",
};

export const RELIABILITY_FLOOR = 0.6;

export function isRatingReliable(reliability: number): boolean {
  return reliability >= RELIABILITY_FLOOR;
}

export function formatMatchDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
