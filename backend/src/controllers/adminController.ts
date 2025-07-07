import { RequestHandler } from "express";
import Poll from "../models/Poll";

export const listAllPolls: RequestHandler = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const query: Record<string, unknown> = {};

    if (search) query.title = { $regex: search, $options: "i" };

    const polls = await Poll.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const mappedPolls = polls.map((poll: any) => {
      if (typeof poll === "object" && poll !== null) {
        const p = poll as {
          id?: string;
          _id?: unknown;
          toObject?: () => object;
        };

        if (p.id) return poll;
        if (p._id) {
          return {
            ...(p.toObject?.() ?? p),
            id: String(p._id),
            _id: undefined,
          };
        }
      }

      return poll;
    });

    res.json(mappedPolls);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Erro desconhecido" });
    }
  }
};

export const pollStatus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const poll = await Poll.findById(id);

    if (!poll) {
      res.status(404).json({ error: "Enquete não encontrada" });
      return;
    }

    res.json({
      id: poll._id,
      title: poll.title,
      active: !poll.closed && poll.expiresAt > new Date(),
      expired: poll.expiresAt < new Date(),
      closed: poll.closed,
      totalVotes: poll.votes.length,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Erro desconhecido" });
    }
  }
};
