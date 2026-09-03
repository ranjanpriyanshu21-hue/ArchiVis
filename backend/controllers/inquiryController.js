import { createInquiry } from "../models/inquiryModel.js";
import { subscribeEmail } from "../models/newsletterModel.js";
import { optionalInt, requireEmail, requireFields } from "../middleware/validate.js";
import { findArchitectById } from "../models/architectModel.js";
import { HttpError } from "../middleware/errorHandler.js";

export async function submitInquiry(req, res) {
  requireFields(req.body, ["name", "email", "subject", "message"]);
  const email = requireEmail(req.body.email);
  const architectId = optionalInt(req.body.architectId);

  if (architectId !== null && !(await findArchitectById(architectId))) {
    throw new HttpError(404, "Architect not found");
  }

  const inquiry = await createInquiry({
    name: String(req.body.name).trim(),
    email,
    subject: String(req.body.subject).trim(),
    message: String(req.body.message).trim(),
    architectId,
    userId: req.user?.id ?? null,
  });

  res.status(201).json({ inquiry, message: "Message sent! We'll be in touch within 24 hours." });
}

export async function subscribeNewsletter(req, res) {
  requireFields(req.body, ["email"]);
  const email = requireEmail(req.body.email);
  await subscribeEmail(email);
  res.status(201).json({ message: "Subscribed to the ArchiVis newsletter." });
}
