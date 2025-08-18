"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Article = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ArticleSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    stock: { type: Number, required: true }
});
exports.Article = mongoose_1.default.model("Article", ArticleSchema);
