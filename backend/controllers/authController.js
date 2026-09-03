import bcrypt from "bcryptjs";
import { createUser, findUserByEmail, findUserById } from "../models/userModel.js";
import { HttpError } from "../middleware/errorHandler.js";
import { requireEmail, requireFields } from "../middleware/validate.js";
import { signToken } from "../middleware/auth.js";

const MIN_PASSWORD_LENGTH = 8;

export async function register(req, res) {
  requireFields(req.body, ["name", "email", "password"]);
  const email = requireEmail(req.body.email);
  const name = String(req.body.name).trim();
  const password = String(req.body.password);

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new HttpError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
  if (await findUserByEmail(email)) throw new HttpError(409, "An account with that email already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email, passwordHash });

  res.status(201).json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email } });
}

export async function login(req, res) {
  requireFields(req.body, ["email", "password"]);
  const email = requireEmail(req.body.email);

  const user = await findUserByEmail(email);
  if (!user) throw new HttpError(401, "Invalid email or password");

  const matches = await bcrypt.compare(String(req.body.password), user.password_hash);
  if (!matches) throw new HttpError(401, "Invalid email or password");

  res.json({ token: signToken(user), user: { id: user.id, name: user.name, email: user.email } });
}

export async function me(req, res) {
  const user = await findUserById(req.user.id);
  if (!user) throw new HttpError(404, "User not found");
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
}
