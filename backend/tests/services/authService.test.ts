import User from "../../src/models/User";
import * as authService from "../../src/services/authService";

jest.mock("../../src/models/User");

const mockUser = {
  _id: "507f1f77bcf86cd799439011",
  name: "Teste",
  email: "teste@email.com",
  password: "$2b$10$hashfake",
  isAdmin: false,
  save: jest.fn(),
};

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should register a new user", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);
    (User.create as jest.Mock).mockResolvedValue(mockUser);

    const user = await authService.registerUser(
      "Teste",
      "teste@email.com",
      "senha123"
    );

    expect(user).toHaveProperty("email", "teste@email.com");
  });

  test("should throw an error when registering an already existing email", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(mockUser);

    await expect(
      authService.registerUser("Teste", "teste@email.com", "senha123")
    ).rejects.toThrow("E-mail já cadastrado");
  });

  test("should throw an error when logging in with a non-existent email", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      authService.loginUser("naoexiste@email.com", "senha123")
    ).rejects.toThrow("Usuário não encontrado");
  });
});
