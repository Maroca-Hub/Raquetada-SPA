// ----------------------------------------------------
// V1 API contract types — mirror the Raquetada API exactly.
// Source of truth: GET http://localhost:8080/v3/api-docs
// Nothing here is fabricated; every field is returned/accepted by an endpoint.
// ----------------------------------------------------

export type MatchStatus = "AWAITING_PLAYERS" | "SCHEDULED" | "FINISHED";

export type PadelPosition = "DRIVE" | "REVES";

export type ParticipationStatus = "ACCEPTED" | "REJECTED";

export type Form = "AWFUL" | "POOR" | "NEUTRAL" | "GOOD" | "GREAT";

export type Skill = "LOB" | "SERVE" | "POSITIONING" | "SMASH" | "DEFENSE";

// ---- Players --------------------------------------------------------------

export interface PlayerOutput {
  id: string;
  name: string;
  email: string;
  rating: number;
}

export interface PlayerProfileOutput {
  id: string;
  name: string;
  email: string;
  rating: number;
  currentRating: number;
  formBonus: number;
  form: Form;
  mainPosition: PadelPosition;
  ratingDrive: number;
  ratingReves: number;
  reliability: number;
  provisional: boolean;
  skillRatings: Partial<Record<Skill, number>>;
}

export interface PlayerInput {
  name: string;
}

// ---- Matches ------------------------------------------------------------

export interface MatchOutput {
  id: string;
  dateTime: string; // ISO 8601
  location: string;
  status: MatchStatus;
  scorePair1: number | null;
  scorePair2: number | null;
  organizer: PlayerOutput;
}

export interface CreateMatchInput {
  dateTime: string; // ISO 8601, must be in the future
  location?: string;
  position: PadelPosition; // organizer's slot position (team 1)
}

export interface MatchInput {
  dateTime: string; // ISO 8601, must be in the future
  location?: string;
}

export interface MatchResultInput {
  scorePair1: number;
  scorePair2: number;
}

// ---- Participations ---------------------------------------------------

export interface JoinMatchInput {
  team: number; // 1 | 2
  position: PadelPosition;
}

export interface ChangeSlotInput {
  team: number; // 1 | 2
  position: PadelPosition;
}

export interface ParticipationOutput {
  id: string;
  matchId: string;
  player: PlayerOutput;
  team: number;
  position: PadelPosition;
  status: ParticipationStatus;
}

// ---- Evaluations ----------------------------------------------------

export interface SkillRatingInput {
  skill: Skill;
  score: number; // 1..10
}

export interface SkillRatingOutput {
  skill: Skill;
  score: number;
}

export interface EvaluationInput {
  evaluatedPlayerId: string;
  skillRatings: SkillRatingInput[]; // exactly 5, one per Skill
}

export interface EvaluationOutput {
  id: string;
  matchId: string;
  evaluatorPlayerId: string;
  evaluatedPlayerId: string;
  evaluationDate: string;
  skillRatings: SkillRatingOutput[];
}
