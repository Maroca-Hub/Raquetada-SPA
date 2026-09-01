import type { Match, Player, Participation } from "../types";

export const mockCurrentUser: Player = {
  id: "player-current-user",
  name: "Lucas Silva",
  nickname: "O Trovão",
  email: "lucas.silva@padelmatch.com",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  rating: 92,
  tier: "OURO",
  level: "Nível 5.5 - Avançado",
  preferredSide: "DRIVE",
  stats: {
    power: 95,
    speed: 88,
    technique: 92,
    stamina: 85,
  },
  evaluations: {
    fairPlay: 98,
    punctuality: 95,
    teamSpirit: 92,
    generalTechnique: 89,
  },
  tags: [
    "Agressivo na Rede",
    "Bom Saque",
    "Comunicação Clara",
    "Fair Play",
    "Smash Potente",
  ],
  matchHistory: [
    {
      id: "hist-1",
      title: "Liga Diamante - Final",
      date: "Ontem, 20:30",
      court: "Quadra Central",
      result: "V",
      score: "6-4, 7-6",
    },
    {
      id: "hist-2",
      title: "Amistoso Duplas",
      date: "12 Mai, 18:00",
      court: "Quadra 3",
      result: "V",
      score: "6-2, 6-1",
    },
    {
      id: "hist-3",
      title: "Torneio Regional",
      date: "05 Mai, 09:00",
      court: "Quadra 1",
      result: "D",
      score: "4-6, 5-7",
    },
    {
      id: "hist-4",
      title: "Copa Padel Brasil",
      date: "28 Abr, 16:30",
      court: "Quadra 4",
      result: "V",
      score: "7-5, 6-3",
    },
  ],
};

export const mockOtherPlayers: Record<string, Player> = {
  "player-beatriz": {
    id: "player-beatriz",
    name: "Beatriz Lima",
    nickname: "Guerreira",
    email: "beatriz.lima@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    rating: 89,
    tier: "OURO",
    level: "Nível 5.0 - Avançado",
    preferredSide: "REVES",
    stats: {
      power: 82,
      speed: 94,
      technique: 90,
      stamina: 91,
    },
    evaluations: {
      fairPlay: 99,
      punctuality: 96,
      teamSpirit: 95,
      generalTechnique: 88,
    },
    tags: ["Rápida em Quadra", "Ótima Defesa", "Voleio Preciso"],
  },
  "player-rodrigo": {
    id: "player-rodrigo",
    name: "Rodrigo Costa",
    nickname: "Paredão",
    email: "rodrigo.costa@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    rating: 94,
    tier: "DIAMANTE",
    level: "Nível 6.0 - Pro",
    preferredSide: "AMBOS",
    stats: {
      power: 96,
      speed: 90,
      technique: 95,
      stamina: 92,
    },
    evaluations: {
      fairPlay: 95,
      punctuality: 98,
      teamSpirit: 91,
      generalTechnique: 96,
    },
    tags: ["Paredão de Fundo", "Saque Pesado", "Visão de Jogo"],
  },
  "player-camila": {
    id: "player-camila",
    name: "Camila Nogueira",
    nickname: "Mágica",
    email: "camila.nogueira@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
    rating: 87,
    tier: "PRATA",
    level: "Nível 4.5 - Intermediário",
    preferredSide: "DRIVE",
    stats: {
      power: 80,
      speed: 86,
      technique: 91,
      stamina: 84,
    },
    evaluations: {
      fairPlay: 97,
      punctuality: 92,
      teamSpirit: 96,
      generalTechnique: 89,
    },
    tags: ["Efeito Preciso", "Boa Leitura", "Espírito de Equipe"],
  },
  "player-matheus": {
    id: "player-matheus",
    name: "Matheus Rocha",
    nickname: "Foguete",
    email: "matheus.rocha@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    rating: 85,
    tier: "PRATA",
    level: "Nível 4.0 - Intermediário",
    preferredSide: "REVES",
    stats: {
      power: 88,
      speed: 84,
      technique: 82,
      stamina: 86,
    },
    evaluations: {
      fairPlay: 94,
      punctuality: 90,
      teamSpirit: 90,
      generalTechnique: 84,
    },
    tags: ["Smash Forte", "Energia Alta"],
  },
  "player-gabriel": {
    id: "player-gabriel",
    name: "Gabriel Ramos",
    nickname: "Maestro",
    email: "gabriel.ramos@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
    rating: 86,
    tier: "PRATA",
    level: "Nível 4.5 - Intermediário",
    preferredSide: "DRIVE",
    stats: {
      power: 84,
      speed: 85,
      technique: 89,
      stamina: 82,
    },
    evaluations: {
      fairPlay: 96,
      punctuality: 94,
      teamSpirit: 93,
      generalTechnique: 87,
    },
    tags: ["Lobs Perfeitos", "Controle de Ritmo"],
  },
  "player-thiago": {
    id: "player-thiago",
    name: "Thiago Martins",
    nickname: "Canhão",
    email: "thiago.martins@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
    rating: 90,
    tier: "OURO",
    level: "Nível 5.0 - Avançado",
    preferredSide: "REVES",
    stats: {
      power: 93,
      speed: 87,
      technique: 88,
      stamina: 89,
    },
    evaluations: {
      fairPlay: 92,
      punctuality: 95,
      teamSpirit: 94,
      generalTechnique: 90,
    },
    tags: ["Smash x3", "Vibora Agressiva"],
  },
};

const initialMatches: Match[] = [
  {
    id: "match-1",
    clubName: "Padel Pro Arena",
    location: "Padel Pro Arena — Av. das Américas, 1500",
    courtName: "Quadra 2",
    dateTime: "Hoje, 19:30 - 21:00",
    dateCategory: "today",
    pricePerPerson: 45,
    status: "AWAITING_PLAYERS",
    levelRequired: "Nível 4.5 a 5.5",
    maxPlayers: 4,
    organizer: mockCurrentUser,
    scorePair1: null,
    scorePair2: null,
    participations: [
      {
        id: "part-1",
        matchId: "match-1",
        player: mockCurrentUser,
        team: 1,
        status: "ACCEPTED",
      },
      {
        id: "part-2",
        matchId: "match-1",
        player: mockOtherPlayers["player-beatriz"],
        team: 1,
        status: "ACCEPTED",
      },
    ],
    pendingRequests: [
      {
        id: "req-1",
        matchId: "match-1",
        player: mockOtherPlayers["player-gabriel"],
        team: 2,
        status: "PENDING",
      },
      {
        id: "req-2",
        matchId: "match-1",
        player: mockOtherPlayers["player-thiago"],
        team: 2,
        status: "PENDING",
      },
    ],
  },
  {
    id: "match-2",
    clubName: "Clube de Padel Elite",
    location: "Clube de Padel Elite — R. Olimpíadas, 300",
    courtName: "Quadra 5",
    dateTime: "Hoje, 21:00 - 22:30",
    dateCategory: "today",
    pricePerPerson: 50,
    status: "AWAITING_PLAYERS",
    levelRequired: "Avançado / Pro",
    maxPlayers: 4,
    organizer: mockOtherPlayers["player-rodrigo"],
    scorePair1: null,
    scorePair2: null,
    participations: [
      {
        id: "part-3",
        matchId: "match-2",
        player: mockOtherPlayers["player-rodrigo"],
        team: 1,
        status: "ACCEPTED",
      },
      {
        id: "part-4",
        matchId: "match-2",
        player: mockOtherPlayers["player-camila"],
        team: 1,
        status: "ACCEPTED",
      },
      {
        id: "part-5",
        matchId: "match-2",
        player: mockOtherPlayers["player-matheus"],
        team: 2,
        status: "ACCEPTED",
      },
    ],
    pendingRequests: [],
  },
  {
    id: "match-3",
    clubName: "Arena Smash",
    location: "Arena Smash — Rua dos Esportes, 88",
    courtName: "Quadra 1",
    dateTime: "Amanhã, 08:00 - 09:30",
    dateCategory: "tomorrow",
    pricePerPerson: 40,
    status: "AWAITING_PLAYERS",
    levelRequired: "Iniciante a Intermediário",
    maxPlayers: 4,
    organizer: mockOtherPlayers["player-gabriel"],
    scorePair1: null,
    scorePair2: null,
    participations: [],
    pendingRequests: [],
  },
  {
    id: "match-4",
    clubName: "Padel Village",
    location: "Padel Village — Rodovia dos Bandeirantes, km 40",
    courtName: "Quadra Central",
    dateTime: "Sábado, 10:00 - 11:30",
    dateCategory: "saturday",
    pricePerPerson: 60,
    status: "AWAITING_PLAYERS",
    levelRequired: "Intermediário+",
    maxPlayers: 4,
    organizer: mockOtherPlayers["player-thiago"],
    scorePair1: null,
    scorePair2: null,
    participations: [
      {
        id: "part-6",
        matchId: "match-4",
        player: mockOtherPlayers["player-thiago"],
        team: 1,
        status: "ACCEPTED",
      },
    ],
    pendingRequests: [],
  },
  {
    id: "match-5",
    clubName: "Match Point Club",
    location: "Match Point Club — Alameda Santos, 1200",
    courtName: "Quadra 3",
    dateTime: "Domingo, 17:00 - 18:30",
    dateCategory: "sunday",
    pricePerPerson: 45,
    status: "AWAITING_PLAYERS",
    levelRequired: "Todos os níveis",
    maxPlayers: 4,
    organizer: mockOtherPlayers["player-beatriz"],
    scorePair1: null,
    scorePair2: null,
    participations: [
      {
        id: "part-7",
        matchId: "match-5",
        player: mockOtherPlayers["player-beatriz"],
        team: 1,
        status: "ACCEPTED",
      },
      {
        id: "part-8",
        matchId: "match-5",
        player: mockOtherPlayers["player-camila"],
        team: 2,
        status: "ACCEPTED",
      },
    ],
    pendingRequests: [],
  },
];

// Persistent state simulation in localStorage
const STORAGE_KEY = "raquetada_matches_state";
const USER_STORAGE_KEY = "raquetada_current_user_profile";

function loadCurrentUser(): Player {
  try {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load user from storage", e);
  }
  return mockCurrentUser;
}

function saveUser(player: Player): void {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(player));
  } catch (e) {
    console.error("Failed to save user", e);
  }
}

function loadMatches(): Match[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load matches from storage", e);
  }
  return initialMatches;
}

function saveMatches(matches: Match[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  } catch (e) {
    console.error("Failed to save matches", e);
  }
}

let inMemoryMatches = loadMatches();
let inMemoryCurrentUser = loadCurrentUser();

// Listeners for reactivity
type MatchesListener = () => void;
const listeners: Set<MatchesListener> = new Set();

export function subscribeToMatches(listener: MatchesListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((l) => l());
}

export const mockService = {
  getCurrentUser: (): Player => {
    return inMemoryCurrentUser;
  },

  saveCurrentUser: (player: Player): void => {
    inMemoryCurrentUser = { ...player };
    saveUser(inMemoryCurrentUser);
    // Also update any matches where current user is participating
    inMemoryMatches = inMemoryMatches.map((m) => {
      if (m.organizer.id === player.id) {
        m.organizer = player;
      }
      m.participations = m.participations.map((p) => {
        if (p.player.id === player.id) {
          return { ...p, player };
        }
        return p;
      });
      return m;
    });
    saveMatches(inMemoryMatches);
    notifyListeners();
  },

  getPlayerById: (id: string): Player => {
    if (id === inMemoryCurrentUser.id || id === "me" || id === "player-current-user") {
      return inMemoryCurrentUser;
    }
    return mockOtherPlayers[id] || {
      id,
      name: "Jogador Convidado",
      nickname: "Craque",
      email: `${id}@padel.com`,
      rating: 80,
      tier: "PRATA",
      level: "Nível 4.0",
      preferredSide: "AMBOS",
      stats: { power: 75, speed: 75, technique: 75, stamina: 75 },
      evaluations: { fairPlay: 90, punctuality: 90, teamSpirit: 90, generalTechnique: 80 },
    };
  },

  getMatches: (): Match[] => {
    return inMemoryMatches;
  },

  getMatchById: (id: string): Match | undefined => {
    return inMemoryMatches.find((m) => m.id === id);
  },

  createMatch: (data: {
    clubName: string;
    location?: string;
    courtName: string;
    dateTime: string;
    dateCategory: "today" | "tomorrow" | "saturday" | "sunday" | "other";
    pricePerPerson: number;
    levelRequired?: string;
  }): Match => {
    const user = inMemoryCurrentUser;
    const matchId = `match-${Date.now()}`;
    const newMatch: Match = {
      id: matchId,
      clubName: data.clubName,
      location: data.location || `${data.clubName} — Arena de Padel`,
      courtName: data.courtName,
      dateTime: data.dateTime,
      dateCategory: data.dateCategory,
      pricePerPerson: data.pricePerPerson,
      status: "AWAITING_PLAYERS",
      levelRequired: data.levelRequired || "Todos os níveis",
      maxPlayers: 4,
      organizer: user,
      scorePair1: null,
      scorePair2: null,
      participations: [
        {
          id: `part-${Date.now()}-org`,
          matchId: matchId,
          player: user,
          team: 1,
          status: "ACCEPTED",
        },
      ],
      pendingRequests: [],
    };

    inMemoryMatches.unshift(newMatch);
    saveMatches(inMemoryMatches);
    notifyListeners();
    return newMatch;
  },

  requestToJoinMatch: (matchId: string, player: Player = inMemoryCurrentUser): { success: boolean; message: string } => {
    const match = inMemoryMatches.find((m) => m.id === matchId);
    if (!match) return { success: false, message: "Partida não encontrada" };

    const isAlreadyAccepted = match.participations.some((p) => p.player.id === player.id);
    if (isAlreadyAccepted) {
      return { success: false, message: "Você já está confirmado nesta partida!" };
    }

    const isAlreadyPending = match.pendingRequests.some((p) => p.player.id === player.id);
    if (isAlreadyPending) {
      return { success: false, message: "Sua solicitação já foi enviada e aguarda aprovação." };
    }

    const newRequest: Participation = {
      id: `req-${Date.now()}`,
      matchId,
      player,
      team: match.participations.length < 2 ? 1 : 2,
      status: "PENDING",
    };

    match.pendingRequests.push(newRequest);
    saveMatches(inMemoryMatches);
    notifyListeners();
    return { success: true, message: "Solicitação enviada ao organizador com sucesso!" };
  },

  acceptParticipation: (matchId: string, requestId: string): boolean => {
    const match = inMemoryMatches.find((m) => m.id === matchId);
    if (!match) return false;

    const reqIndex = match.pendingRequests.findIndex((r) => r.id === requestId);
    if (reqIndex === -1) return false;

    const request = match.pendingRequests[reqIndex];
    match.pendingRequests.splice(reqIndex, 1);

    // Assign to available team (1 or 2, max 2 per team)
    const team1Count = match.participations.filter((p) => p.team === 1).length;
    const team = team1Count < 2 ? 1 : 2;

    const acceptedParticipation: Participation = {
      ...request,
      team,
      status: "ACCEPTED",
    };

    match.participations.push(acceptedParticipation);
    if (match.participations.length >= 4) {
      match.status = "SCHEDULED";
    }

    saveMatches(inMemoryMatches);
    notifyListeners();
    return true;
  },

  rejectParticipation: (matchId: string, requestId: string): boolean => {
    const match = inMemoryMatches.find((m) => m.id === matchId);
    if (!match) return false;

    const reqIndex = match.pendingRequests.findIndex((r) => r.id === requestId);
    if (reqIndex === -1) return false;

    match.pendingRequests.splice(reqIndex, 1);
    saveMatches(inMemoryMatches);
    notifyListeners();
    return true;
  },

  resetData: () => {
    inMemoryMatches = JSON.parse(JSON.stringify(initialMatches));
    inMemoryCurrentUser = JSON.parse(JSON.stringify(mockCurrentUser));
    saveMatches(inMemoryMatches);
    saveUser(inMemoryCurrentUser);
    localStorage.removeItem("raquetada_onboarding_completed");
    notifyListeners();
  },
};
