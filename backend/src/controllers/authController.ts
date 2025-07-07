import { RequestHandler } from "express";
import {
  registerUser,
  loginUser,
  generateAccessToken,
  generateRefreshToken,
} from "../services/authService";

export const register: RequestHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await registerUser(name, email, password);

    res.status(201).json({
      message: "Usuário registrado com sucesso",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Erro desconhecido" });
    }
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser(email, password);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(401).json({ error: "Erro desconhecido" });
    }
  }
};

// Gerar novo access token usando refresh token
export const refreshToken: RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ error: "Refresh token obrigatório" });
      return;
    }

    // ... lógica de validação do refresh token (implementar depois)
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Erro desconhecido" });
    }
  }
};
