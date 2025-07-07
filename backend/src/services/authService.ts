import User, { IUser } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "segredo";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh";

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const existing = await User.findOne({ email });

  if (existing) throw new Error("E-mail já cadastrado");

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash });

  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email });
  console.log("user: ", user);
  if (!user) throw new Error("Usuário não encontrado");

  const valid = await bcrypt.compare(password, user.password);
  console.log("valid: ", valid);
  if (!valid) throw new Error("Senha inválida");

  return user;
}

export function generateAccessToken(user: IUser) {
  return jwt.sign(
    { id: user._id, email: user.email, isAdmin: user.isAdmin },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
}

export function generateRefreshToken(user: IUser) {
  return jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: "7d" });
}
