# VotaFacil

Sistema de votação online simples e eficiente, permitindo a criação, gerenciamento e participação em enquetes de forma intuitiva.

## Descrição

O VotaFacil é uma aplicação web fullstack que permite a criação de enquetes, votação em tempo real e administração de resultados. Ideal para eventos, pesquisas rápidas ou decisões em grupo.

## Tecnologias Utilizadas

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- WebSocket (para votos em tempo real)

### Frontend

- React
- TypeScript
- Vite
- Context API
- Axios

## Estrutura do Projeto

```
primeiroRepo/
  backend/    # API, WebSocket, banco de dados
  frontend/   # Aplicação web (React)
```

## Como rodar o projeto

### Pré-requisitos

- Node.js >= 16
- MongoDB rodando localmente ou em nuvem

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/VotaFacil.git
cd VotaFacil
```

### 2. Rodar o Backend

```bash
cd backend
npm install
npm run dev
```

O backend estará disponível em `http://localhost:5000` (ou porta configurada).

### 3. Rodar o Frontend

Abra outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em `http://localhost:5173` (ou porta configurada).

## Funcionalidades

- Cadastro e login de usuários
- Criação e gerenciamento de enquetes (admin)
- Votação em tempo real
- Visualização de resultados
- Proteção de rotas (admin e usuário)

## Estrutura de Pastas

- `backend/src/controllers` — Lógica das rotas
- `backend/src/models` — Modelos do banco de dados
- `backend/src/services` — Regras de negócio
- `backend/src/routes` — Definição das rotas
- `backend/src/sockets` — WebSocket para votos em tempo real
- `frontend/src/pages` — Páginas principais
- `frontend/src/components` — Componentes reutilizáveis
- `frontend/src/api` — Integração com backend
- `frontend/src/store` — Contextos globais

## Contribuição

Pull requests são bem-vindos! Para grandes mudanças, abra uma issue primeiro para discutir o que você gostaria de modificar.

## Licença

[MIT](LICENSE)
