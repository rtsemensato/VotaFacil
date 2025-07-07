import { Request, Response, NextFunction } from "express";

// Middleware para garantir que o usuário é admin
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // @ts-expect-error: req.user é adicionado pelo middleware de autenticação
  if (!req.user || !req.user.isAdmin) {
    res.status(403).json({ error: "Acesso restrito a administradores" });
  }

  next();
}
