export type MatchStatus = "AWAITING_PLAYERS" | "SCHEDULED" | "FINISHED";

export type PlayerTier = "BRONZE" | "PRATA" | "OURO" | "DIAMANTE";

export type PreferredSide = "DRIVE" | "REVES" | "AMBOS";

export type SkillType = "LOB" | "SERVE" | "POSITIONING" | "SMASH" | "DEFENSE";

export interface SkillRatingInput {
  skill: SkillType;
  score: number; // 1 to 10
}

export interface SkillRatingOutput {
  skill: SkillType;
  score: number;
}

export interface PlayerStats {
  power: number;
  speed: number;
  technique: number;
  stamina: number;
}

export interface PlayerEvaluations {
  fairPlay: number;
  punctuality: number;
  teamSpirit: number;
  generalTechnique: number;
}

export interface PlayerMatchHistoryItem {
  id: string;
  title: string;
  date: string;
  court: string;
  result: "V" | "D";
  score: string;
}

export interface Player {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  avatarUrl?: string;
  rating: number; // Overall Rating (OVR) e.g., 92
  tier: PlayerTier;
  level: string; // e.g. "Nível 5.5 - Avançado"
  preferredSide: PreferredSide;
  stats: PlayerStats;
  evaluations: PlayerEvaluations;
  matchHistory?: PlayerMatchHistoryItem[];
  tags?: string[];
}

export interface Participation {
  id: string;
  matchId: string;
  player: Player;
  team: number; // 1 = Dupla 1, 2 = Dupla 2, 0 = Não definido
  status: "ACCEPTED" | "PENDING" | "REJECTED";
}

export interface Match {
  id: string;
  clubName: string;
  location: string;
  courtName: string;
  dateTime: string;
  dateCategory: "today" | "tomorrow" | "saturday" | "sunday" | "other";
  pricePerPerson: number;
  status: MatchStatus;
  levelRequired?: string;
  maxPlayers: number;
  organizer: Player;
  scorePair1: number | null;
  scorePair2: number | null;
  participations: Participation[];
  pendingRequests: Participation[];
}

// ----------------------------------------------------
// OpenAPI / Backend Contract Types (V1 API)
// ----------------------------------------------------

export interface PlayerInput {
  name?: string;
}

export interface PlayerOutput {
  id: string;
  name: string;
  email: string;
  rating: number;
}

export interface MatchInput {
  dateTime: string; // ISO 8601 string
  location?: string;
}

export interface MatchOutput {
  id: string;
  dateTime: string;
  location: string;
  status: MatchStatus;
  scorePair1: number | null;
  scorePair2: number | null;
  organizer: PlayerOutput;
}

export interface JoinMatchInput {
  team?: number; // 1 | 2
}

export interface ChangeTeamInput {
  team: number; // 1 | 2
}

export interface ParticipationOutput {
  id: string;
  matchId: string;
  player: PlayerOutput;
  team: number;
  status: "ACCEPTED" | "REJECTED";
}

export interface MatchResultInput {
  scorePair1: number;
  scorePair2: number;
}

export interface EvaluationInput {
  evaluatedPlayerId: string;
  skillRatings: SkillRatingInput[]; // Exactly 5 skills
}

export interface EvaluationOutput {
  id: string;
  matchId: string;
  evaluatorPlayerId: string;
  evaluatedPlayerId: string;
  evaluationDate: string;
  skillRatings: SkillRatingOutput[];
}
