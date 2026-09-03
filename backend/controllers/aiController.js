import { matchDesigns } from "../services/aiMatchService.js";
import { requireFields } from "../middleware/validate.js";

export async function match(req, res) {
  requireFields(req.body, ["prompt"]);
  const result = await matchDesigns(String(req.body.prompt).trim(), 3);
  res.json(result);
}
