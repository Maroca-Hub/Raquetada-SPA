# 🎾 RAQUETADA — Padel Match & Rankings SPA

SPA moderno e gamificado para a plataforma de padel **Raquetada**. Permite que praticantes de padel encontrem partidas abertas, organizem seus próprios jogos, acompanhem a escalação de quadras (Dupla 1 vs Dupla 2) e evoluam sua carta gamificada de atleta (estilo FUT) com base no desempenho e em avaliações pós-jogo.

---

## 🚀 Tecnologias & Arquitetura

- **Frontend Core**: React 19, TypeScript, Vite.
- **Roteamento**: `react-router-dom` v7.
- **Autenticação**: `react-oidc-context` / `oidc-client-ts` via Keycloak SSO (OAuth2 / OpenID Connect com Authorization Code + PKCE).
- **Design System**: *Performance Dark* proprietário construído com Vanilla CSS (tokens semânticos, glassmorphism, glowing badges, cards FUT e micro-animações).
- **Tipografia & Ícones**: Google Fonts (*Montserrat* para displays e títulos esportivos, *Inter* para interface) e *Material Symbols Outlined*.
- **Runtime / Package Manager**: Desenvolvido e otimizado com [Bun](https://bun.sh) (também compatível com Node 20+ / npm / pnpm).

---

## 📱 Telas e Funcionalidades Desenvolvidas

### 1. 🔐 Autenticação & Entrada (`/login`, `/callback`)
- **Login com Keycloak SSO**: Fluxo oficial seguro via OAuth2 / PKCE para autenticação com token JWT.
- **Modo Desenvolvimento**: Seção exibida exclusivamente em ambiente de desenvolvimento (`import.meta.env.DEV`) para entrada rápida com perfil mockado.
- **Auto-Onboarding Guard ([RequireAuth.tsx](file:///Users/eduardocorrea/code/Raquetada-SPA/src/components/RequireAuth.tsx))**: Detecta automaticamente se o usuário autenticado já possui perfil configurado no backend; caso contrário, redireciona-o imediatamente para o Onboarding.

---

### 2. 🎴 Onboarding & Criação da Carta de Atleta (`/onboarding`)
- **Live FUT Preview**: Exibição da carta gamificada no topo com atualização em tempo real conforme as escolhas do jogador.
- **Identidade**: Nome completo, apelido em quadra e seleção entre 4 avatares esportivos com iluminação temática.
- **Posicionamento**: Seleção do lado preferido na quadra (**Drive / Direita**, **Revés / Esquerda**, **Ambos os Lados**) e categoria inicial.
- **Rating Inicial da Plataforma**: O jogador inicia com **Rating Geral de 52 (Tier Bronze)** e atributos gerenciados dinamicamente pela plataforma conforme o histórico de partidas e avaliações.
- **Tags de Estilo de Jogo**: Escolha de até 5 tags com destaques técnicos (ex: *Agressivo na Rede, Bom Saque, Fair Play, Smash Potente, Ótima Defesa*).

---

### 3. 🏟️ Feed de Partidas & Criação (`/`, `/feed`)
- **Filtros por Dia**: Filtros rápidos em chips (*Hoje, Amanhã, Sábado, Domingo, Todas*).
- **Cards de Partida ([MatchCard.tsx](file:///Users/eduardocorrea/code/Raquetada-SPA/src/components/card/MatchCard.tsx))**: Visualização de local, horário, vagas preenchidas/restantes com avatares sobrepostos, nível sugerido e valor por pessoa.
- **Modal de Criação de Partida ([CreateMatchModal.tsx](file:///Users/eduardocorrea/code/Raquetada-SPA/src/components/match/CreateMatchModal.tsx))**:
  - Formulário limpo com campos de nome do clube/local, quadra ou informações adicionais (opcional), dia, horário, valor por pessoa e nível.
  - Publica diretamente via `POST /api/v1/matches` e aloca o criador como organizador na Dupla 1.
- **Consumo Real da API**: Conexão com os endpoints OpenAPI v1 (`/api/v1/matches`), sem vazamento de dados fictícios em contas reais.

---

### 4. ⚔️ Detalhes da Partida & Escalação de Quadra (`/matches/:id`)
- **Visualização de Quadra Dividida**: Representação visual da quadra com **Dupla 1** (neon limão) e **Dupla 2** (azul neon) e status das vagas.
- **Ações de Jogador**:
  - Entrar na partida (`POST /api/v1/matches/{id}/participations`).
  - Mudar de dupla em tempo real (`PATCH /api/v1/matches/{id}/participations/me`).
  - Sair da partida (`DELETE /api/v1/matches/{id}/participations/me`).
- **Compartilhamento**: Botão com suporte a Web Share API e fallback para cópia de link na área de transferência com notificação Toast.
- **Status do Jogo**: Indicadores de status da partida (*Aguardando Jogadores, Agendada, Finalizada*).

---

### 5. 🏆 Meu Perfil Gamificado (`/profile`)
- **Carta FUT do Atleta**: Exibição da carta personalizada com foto, rating, tier, nível, lado e atributos.
- **Histórico de Partidas**: Histórico recente com placares e indicadores visuais de vitória (**V**) ou derrota (**D**).
- **Avaliações da Comunidade**: Barras de progresso com médias anônimas recebidas dos colegas (*Fair Play, Pontualidade, Espírito de Equipe, Técnica Geral*).
- **Edição e Gerenciamento**: Acesso rápido para editar a carta/perfil no Onboarding e botão de logout.

---

### 6. 👤 Perfil de Outro Jogador (`/players/:id`)
- Visualização pública da carta gamificada de outros atletas cadastrados.
- Resumo de reputação, tags de destaque e botão para envio de desafio.

---

## 🛠️ Como Executar o Projeto

### Pré-requisitos
- [Bun](https://bun.sh) (recomendado) ou Node.js 20+
- Raquetada API rodando localmente em `http://localhost:8080` (opcional caso utilize modo mock)
- Instância do Keycloak rodando para autenticação SSO

---

### 1. Clonar e Instalar Dependências

```bash
git clone https://github.com/Maroca-Hub/Raquetada-SPA.git
cd Raquetada-SPA

# Usando Bun (recomendado)
bun install

# Ou usando npm
npm install
```

---

### 2. Configurar Variáveis de Ambiente

Crie o arquivo `.env` com base no `.env.example`:

```bash
cp .env.example .env
```

Configurações padrão:

```env
VITE_KEYCLOAK_URL=http://localhost:8081
VITE_KEYCLOAK_REALM=maroca
VITE_KEYCLOAK_CLIENT_ID=raquetada-web
VITE_API_URL=http://localhost:8080
```

---

### 3. Rodar o Servidor de Desenvolvimento

```bash
# Com Bun
bun run dev

# Com npm
npm run dev
```

A aplicação estará disponível em `http://localhost:3000` (ou na porta configurada pelo Vite).

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `bun run dev` (ou `npm run dev`) | Inicia o servidor local de desenvolvimento com hot reload |
| `bun run build` (ou `npm run build`) | Valida tipagens TypeScript (`tsc -b`) e compila o bundle de produção via Vite |
| `bun run lint` (ou `npm run lint`) | Executa o linter ESLint |
| `bun run preview` (ou `npm run preview`) | Executa um servidor local servindo a pasta `dist` compilada |

---

## 📁 Estrutura de Pastas

```
Raquetada-SPA/
├── public/                  # Assets estáticos e ícones
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── card/            # PlayerCard (FUT) e MatchCard
│   │   ├── common/          # Toast, ShareButton, etc.
│   │   ├── layout/          # Layout, TopHeader, BottomNavigation
│   │   └── match/           # CreateMatchModal
│   ├── hooks/               # Custom hooks (useApi, useResource)
│   ├── pages/               # Páginas da aplicação
│   │   ├── Callback.tsx     # Callback de retorno do Keycloak
│   │   ├── Login.tsx        # Tela de login
│   │   ├── MatchDetail.tsx  # Detalhes e quadra da partida
│   │   ├── Matches.tsx      # Feed de partidas
│   │   ├── Onboarding.tsx   # Onboarding e personalização da carta
│   │   ├── PlayerDetail.tsx # Visualização de outro jogador
│   │   └── Profile.tsx      # Meu perfil e histórico
│   ├── services/            # Camada de serviços (api.ts, mockData.ts)
│   ├── auth.ts              # Configuração do OIDC Keycloak
│   ├── index.css            # Design System (tokens, FUT cards, animações)
│   ├── router.tsx           # Configuração de rotas e RequireAuth
│   └── types.ts             # Modelos de domínio e contratos OpenAPI
├── index.html               # Entrypoint HTML com fontes e ícones
├── package.json             # Dependências e scripts
└── vite.config.ts           # Configuração do Vite
```
