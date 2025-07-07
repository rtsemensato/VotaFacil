import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import pollRoutes from "./routes/pollRoutes";
import { createServer } from "http";
import { initVoteSocket } from "./sockets/voteSocket";
import adminRoutes from "./routes/adminRoutes";
import path from "path";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors());
app.use(express.json());

// Definindo diretório para arquivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Conectar ao banco de dados
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/polls", pollRoutes);
app.use("/admin", adminRoutes);

// Rota de teste
app.get("/", (req, res) => {
  res.send("API VotaFacil rodando!");
});

// Inicializar socket.io
const { emitVoteUpdate } = initVoteSocket(server);
declare global {
  // eslint-disable-next-line no-var
  var emitVoteUpdate: ((pollId: string, pollData: object) => void) | undefined;
}

globalThis.emitVoteUpdate = emitVoteUpdate;

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}...`);
});
