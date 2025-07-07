import Poll from "../../src/models/Poll";
import * as pollService from "../../src/services/pollService";

jest.mock("../../src/models/Poll");

const mockPoll = {
  _id: "pollid123",
  title: "Enquete Teste",
  description: "Descrição",
  options: ["A", "B"],
  expiresAt: new Date(Date.now() + 1000000),
  image: undefined,
  createdBy: "userid123",
  votes: [],
  closed: false,
  save: jest.fn(),
};

describe("pollService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create a new poll", async () => {
    (Poll.create as jest.Mock).mockResolvedValue(mockPoll);
    const poll = await pollService.createPoll({
      title: "Enquete Teste",
      description: "Descrição",
      options: ["A", "B"],
      expiresAt: new Date(),
      createdBy: "userid123",
    });

    expect(poll).toHaveProperty("title", "Enquete Teste");
  });

  test("should throw an error when voting on a closed poll", async () => {
    (Poll.findById as jest.Mock).mockResolvedValue({
      ...mockPoll,
      closed: true,
    });

    await expect(
      pollService.votePoll("pollid123", "userid123", "A")
    ).rejects.toThrow("Enquete encerrada");
  });

  test("should throw an error when voting on an invalid option", async () => {
    (Poll.findById as jest.Mock).mockResolvedValue(mockPoll);

    await expect(
      pollService.votePoll("pollid123", "userid123", "C")
    ).rejects.toThrow("Opção inválida");
  });

  test("should throw an error when voting twice", async () => {
    (Poll.findById as jest.Mock).mockResolvedValue({
      ...mockPoll,
      votes: [{ user: "userid123", option: "A" }],
    });

    await expect(
      pollService.votePoll("pollid123", "userid123", "A")
    ).rejects.toThrow("Usuário já votou");
  });

  test("should close the poll if the requester is the creator", async () => {
    (Poll.findById as jest.Mock).mockResolvedValue(mockPoll);
    const poll = await pollService.closePoll("pollid123", "userid123");

    expect(poll.closed).toBe(true);
  });

  test("should throw an error when trying to close a poll as a non-creator", async () => {
    (Poll.findById as jest.Mock).mockResolvedValue(mockPoll);

    await expect(
      pollService.closePoll("pollid123", "outrouser")
    ).rejects.toThrow("Sem permissão");
  });
});
