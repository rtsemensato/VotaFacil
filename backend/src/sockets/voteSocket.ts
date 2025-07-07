import { Server } from "socket.io";
import { Server as HttpServer } from "http";
declare global {
  // eslint-disable-next-line no-var
  var io: Server | undefined;
}

export function initVoteSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  globalThis.io = io;

  // Evento de conexão
  io.on("connection", (socket) => {
    // console.log("Usuário conectado ao socket", socket.id);

    // Entrar em uma sala específica de enquete
    socket.on("join_poll", (pollId) => {
      socket.join(pollId);
    });

    // Sair da sala
    socket.on("leave_poll", (pollId) => {
      socket.leave(pollId);
    });
  });

  // enviar atualização de votos para uma enquete
  function emitVoteUpdate(pollId: string, pollData: object) {
    io.to(pollId).emit("vote_update", pollData);
  }

  return { io, emitVoteUpdate };
}
