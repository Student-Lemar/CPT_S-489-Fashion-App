import { api } from "./client";
import type { ColorMeta, AiSuggestion } from "../types";

export interface ExtractColorResult {
  id: string;
  color: string;
  colorExtracted: string;
  aiColor: ColorMeta & { colorName: string; source: "image" | "manual" };
}

export interface GenerateOptions {
  harmony?:
    | "auto"
    | "monochrome"
    | "analogous"
    | "complementary"
    | "neutral-balance";
  occasion?: "everyday" | "school" | "office" | "date-night" | "streetwear";
  style?: "balanced" | "minimal" | "casual" | "layered";
  preferredColor?: string;
  maxSuggestions?: number;
  useImageColors?: boolean;
}

export interface GenerateResult {
  suggestions: AiSuggestion[];
  harmony: string;
}

export const colorsApi = {
  /** Return the server-side COLOR_MAP (public, no auth). */
  meta: () => api.get<Record<string, ColorMeta>>("/colors/meta"),

  /**
   * Run server-side Jimp color extraction on a specific item's image.
   * Saves result to item.colorExtracted on the server.
   */
  extractColor: (itemId: string) =>
    api.post<ExtractColorResult>(
      `/colors/extract/${encodeURIComponent(itemId)}`,
      {},
    ),

  /**
   * Generate outfit suggestions server-side using the full color theory engine.
   * Pass useImageColors: true to also extract colors from images that haven't been scanned yet.
   */
  generate: (opts: GenerateOptions = {}) =>
    api.post<GenerateResult>("/colors/generate", opts),
};
