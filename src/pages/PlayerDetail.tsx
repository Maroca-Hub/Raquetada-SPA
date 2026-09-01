import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { Layout } from "../components/layout/Layout";
import { PlayerCard } from "../components/card/PlayerCard";
import { Toast } from "../components/common/Toast";
import { useApi } from "../hooks/useApi";
import { mapPlayerOutputToPlayer } from "../services/api";
import { mockService } from "../services/mockData";
import type { Player } from "../types";

export function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const playerId = id || "player-rodrigo";
  const auth = useAuth();
  const api = useApi();

  const [player, setPlayer] = useState<Player>(mockService.getPlayerById(playerId));
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadPlayerData = useCallback(async () => {
    setLoading(true);
    if (auth.isAuthenticated) {
      try {
        const playerOutput = await api.players.get(playerId);
        const mappedPlayer = mapPlayerOutputToPlayer(playerOutput);

        try {
          const evalOutputs = await api.players.listReceivedEvaluations(playerId);
          if (evalOutputs && evalOutputs.length > 0) {
            let lob = 0, serve = 0, pos = 0, smash = 0, def = 0;
            evalOutputs.forEach((ev) => {
              ev.skillRatings?.forEach((sr) => {
                if (sr.skill === "LOB") lob += sr.score * 10;
                if (sr.skill === "SERVE") serve += sr.score * 10;
                if (sr.skill === "POSITIONING") pos += sr.score * 10;
                if (sr.skill === "SMASH") smash += sr.score * 10;
                if (sr.skill === "DEFENSE") def += sr.score * 10;
              });
            });
            const evalCount = evalOutputs.length;
            mappedPlayer.evaluations = {
              fairPlay: Math.round(pos / evalCount) || 95,
              punctuality: Math.round(serve / evalCount) || 94,
              teamSpirit: Math.round(lob / evalCount) || 92,
              generalTechnique: Math.round((smash + def) / (evalCount * 2)) || mappedPlayer.rating,
            };
          }
        } catch (evalErr) {
          console.warn("Evaluations fetch note:", evalErr);
        }

        setPlayer(mappedPlayer);
      } catch (err) {
        console.error("API error loading player, using local data:", err);
        setPlayer(mockService.getPlayerById(playerId));
      }
    } else {
      setPlayer(mockService.getPlayerById(playerId));
    }
    setLoading(false);
  }, [auth.isAuthenticated, api, playerId]);

  useEffect(() => {
    loadPlayerData();
  }, [loadPlayerData]);

  const handleChallenge = () => {
    setToastMessage(`Convite de desafio enviado para ${player.name}!`);
  };

  if (loading) {
    return (
      <Layout showBack title="Carregando...">
        <div style={{ textAlign: "center", padding: "40px", color: "var(--primary-fixed)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "32px", animation: "spin 1s linear infinite" }}>
            sports_tennis
          </span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showBack title={player.name}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Main Player Card */}
        <section className="animate-fade-in">
          <PlayerCard
            player={player}
            showAttributes={true}
            showAction={true}
            actionText={`DESAFIAR ${player.nickname ? player.nickname.toUpperCase() : player.name.toUpperCase()}`}
            onAction={handleChallenge}
          />
        </section>

        {/* Rating & Peer Reputation Summary */}
        <section
          className="glass-panel animate-fade-in"
          style={{
            borderRadius: "20px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--on-surface-variant)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Média de Avaliação
              </span>
              <div
                className="font-display"
                style={{
                  fontSize: "40px",
                  fontWeight: 900,
                  color: "var(--primary-fixed)",
                  lineHeight: 1,
                  marginTop: 4,
                }}
              >
                {player.rating}
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", maxWidth: "60%", justifyContent: "flex-end" }}>
              {player.tags?.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "var(--surface-container-high)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-full)",
                    padding: "4px 10px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--on-surface)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </Layout>
  );
}
