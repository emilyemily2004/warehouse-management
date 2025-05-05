import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    stock: { type: Number, required: true }
});

export const Article = mongoose.model("Article", ArticleSchema);

export interface Article {
    art_id: string;
    name: string;
    stock: number;
  }