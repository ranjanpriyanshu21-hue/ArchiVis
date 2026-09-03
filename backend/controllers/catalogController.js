import { findStyles } from "../models/styleModel.js";
import { findTestimonials } from "../models/testimonialModel.js";

export async function listStyles(req, res) {
  const styles = await findStyles();
  res.json({ styles });
}

export async function listTestimonials(req, res) {
  const testimonials = await findTestimonials();
  res.json({ testimonials });
}
