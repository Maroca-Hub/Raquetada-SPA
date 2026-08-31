export type MatchStatus = "AWAITING_PLAYERS" | "SCHEDULED" | "FINISHED";

export interface Player {
  id: string;
  name: string;
  email: string;
  rating: number;
}

export interface Match {
  id: string;
  dateTime: string;
  location: string;
  status: MatchStatus;
  scorePair1: number | null;
  scorePair2: number | null;
  organizer: Player;
}

export interface Participation {
  id: string;
  matchId: string;
  player: Player;
  team: number;
  status: "ACCEPTED" | "REJECTED";
}
