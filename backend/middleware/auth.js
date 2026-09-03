import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { HttpError } from "./errorHandler.js";

function readToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

export function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return next(new HttpError(401, "Authentication required"));
  try {
    const payload = jwt.verify(token, config.jwt.secret);
    req.user = { id: Number(payload.sub), email: payload.email };
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
}

export function optionalAuth(req, res, next) {
  const token = readToken(req);
  if (token) {
    try {
      const payload = jwt.verify(token, config.jwt.secret);
      req.user = { id: Number(payload.sub), email: payload.email };
    } catch {
      // An invalid token on a public route is simply treated as anonymous.
    }
  }
  next();
}
