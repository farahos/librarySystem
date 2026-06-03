import Genre from "../models/Genre.js";
import { slugify } from "../utils/slug.js";

export async function list(req, res) {
  try {
    const filter = req.query.includeInactive === "true" ? {} : { active: true };
    const genres = await Genre.find(filter).sort({ sortOrder: 1, name: 1 });
    res.json({ genres });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function create(req, res) {
  try {
    const genre = await Genre.create({
      ...req.body,
      slug: req.body.slug || slugify(req.body.name),
    });
    res.status(201).json({ genre });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function update(req, res) {
  try {
    const genre = await Genre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!genre) return res.status(404).json({ message: "Genre not found" });
    res.json({ genre });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
