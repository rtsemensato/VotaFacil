import { RequestHandler } from "express";
import {
  createPoll,
  listUserPolls,
  getPollById,
  closePoll,
  votePoll,
  listPublicPolls,
} from "../services/pollService";
declare global {
  // eslint-disable-next-line no-var
  var emitVoteUpdate: ((pollId: string, pollData: object) => void) | undefined;
  // eslint-disable-next-line no-var
  var io: import("socket.io").Server | undefined;
}

export const create: RequestHandler = async (req, res) => {
  try {
    const {
      title,
      description,
      options,
      expiresAt,
      visibility = "public",
    } = req.body;
    const image = req.file?.filename;
    // @ts-expect-error: req.user é adicionado pelo middleware de autenticação
    const createdBy = req.user.id;

    const poll = await createPoll({
      title,
      description,
      options,
      expiresAt,
      image,
      createdBy,
      visibility,
    });

    res.status(201).json(poll);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Erro desconhecido" });
    }
  }
};

export const listPublic: RequestHandler = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "active" } = req.query;

    const polls = await listPublicPolls(
      Number(page),
      Number(limit),
      String(search),
      String(status)
    );

    res.json(polls);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Erro desconhecido" });
    }
  }
};

export const listMine: RequestHandler = async (req, res) => {
  try {
    // @ts-expect-error: req.user é adicionado pelo middleware de autenticação
    const userId = req.user.id;
    const { page = 1, limit = 10, search = "" } = req.query;

    const polls = await listUserPolls(
      userId,
      Number(page),
      Number(limit),
      String(search)
    );

    res.json(polls);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Erro desconhecido" });
    }
  }
};

export const get: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const poll = await getPollById(id);

    if (!poll) res.status(404).json({ error: "Enquete não encontrada" });

    res.json(poll);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Erro desconhecido" });
    }
  }
};

export const close: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    // @ts-expect-error: req.user é adicionado pelo middleware de autenticação
    const userId = req.user.id;

    const poll = await closePoll(id, userId);

    res.json(poll);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Erro desconhecido" });
    }
  }
};

export const vote: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { option } = req.body;
    // @ts-expect-error: req.user é adicionado pelo middleware de autenticação
    const userId = req.user.id;

    const poll = await votePoll(id, userId, option);

    if (typeof globalThis.emitVoteUpdate === "function") {
      globalThis.emitVoteUpdate(id, poll);
    }

    if (typeof globalThis.io !== "undefined") {
      globalThis.io.emit("pollListUpdate", poll);
    }

    res.json(poll);
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      (error as { status?: number }).status === 403
    ) {
      const err = error as { message?: string };
      res.status(403).json({ error: err.message || "Ação não permitida" });
    } else if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Erro desconhecido" });
    }
  }
};
