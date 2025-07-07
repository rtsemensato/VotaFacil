import Poll, { IPoll } from "../models/Poll";
import { Types } from "mongoose";

export async function createPoll(data: Partial<IPoll>) {
  return await Poll.create(data);
}

export async function listUserPolls(
  userId: string,
  page = 1,
  limit = 10,
  search = ""
) {
  const query: Record<string, unknown> = { createdBy: userId };

  if (search) query.title = { $regex: search, $options: "i" };

  return await Poll.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}

export async function getPollById(id: string) {
  return await Poll.findById(id).populate("createdBy", "name email");
}

export async function closePoll(id: string, userId: string) {
  const poll = await Poll.findById(id);
  if (!poll) throw new Error("Enquete não encontrada");

  if (poll.createdBy.toString() !== userId) throw new Error("Sem permissão");

  poll.closed = true;

  await poll.save();

  return poll;
}

export async function votePoll(pollId: string, userId: string, option: string) {
  const poll = await Poll.findById(pollId);

  if (!poll) throw new Error("Enquete não encontrada");

  if (poll.closed || poll.expiresAt < new Date())
    throw new Error("Enquete encerrada");

  if (!poll.options.includes(option)) throw new Error("Opção inválida");

  if (poll.createdBy.toString() === userId)
    throw Object.assign(
      new Error("Você não pode votar na sua própria enquete."),
      { status: 403 }
    );

  if (poll.votes.some((v) => v.user.toString() === userId))
    throw Object.assign(new Error("Você já votou nesta enquete."), {
      status: 403,
    });

  poll.votes.push({ user: new Types.ObjectId(userId), option });

  await poll.save();

  return poll;
}

export async function listPublicPolls(
  page = 1,
  limit = 10,
  search = "",
  status = "active"
) {
  const now = new Date();

  const query: Record<string, unknown> = { visibility: "public" };

  if (search) query.title = { $regex: search, $options: "i" };

  if (status === "active") {
    query.closed = false;
    query.expiresAt = { $gt: now };
  } else if (status === "closed") {
    query.$or = [{ closed: true }, { expiresAt: { $lte: now } }];
  }

  return await Poll.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
}
