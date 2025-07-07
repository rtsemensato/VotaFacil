import * as authController from "../../src/controllers/authController";
import * as authService from "../../src/services/authService";
import { Request, Response } from "express";

jest.mock("../../src/services/authService");

describe("authController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn(() => ({ json }));
    req = { body: {} };
    res = { status, json };
  });

  test("should register a user", async () => {
    (authService.registerUser as jest.Mock).mockResolvedValue({
      _id: "1",
      name: "Teste",
      email: "teste@email.com",
    });

    req.body = { name: "Teste", email: "teste@email.com", password: "123" };

    await authController.register(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({
      message: expect.any(String),
      user: expect.any(Object),
    });
  });

  test("should return error when registering a duplicate user", async () => {
    (authService.registerUser as jest.Mock).mockRejectedValue(
      new Error("E-mail já cadastrado")
    );

    req.body = { name: "Teste", email: "teste@email.com", password: "123" };
    await authController.register(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ error: "E-mail já cadastrado" });
  });

  test("should log in a user", async () => {
    (authService.loginUser as jest.Mock).mockResolvedValue({
      _id: "1",
      name: "Teste",
      email: "teste@email.com",
    });

    (authService.generateAccessToken as jest.Mock).mockReturnValue("token");
    (authService.generateRefreshToken as jest.Mock).mockReturnValue("refresh");

    req.body = { email: "teste@email.com", password: "123" };

    await authController.login(req as Request, res as Response);

    expect(json).toHaveBeenCalledWith({
      accessToken: "token",
      refreshToken: "refresh",
      user: expect.any(Object),
    });
  });
});
