// ── User & Session ────────────────────────────────────────────────────────────

export type UserRole = 'creator' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  displayName: string;
  status: UserStatus;
  reports: number;
  createdAt: string;
}

export interface Session {
  username: string;
  role: UserRole;
  displayName: string;
  status: UserStatus;
}

// ── Item ──────────────────────────────────────────────────────────────────────

export type ItemCategory = 'tops' | 'bottoms' | 'shoes' | 'outerwear' | 'accessories';

export interface Item {
  id: string;
  ownerUsername: string;
  name: string;
  category: ItemCategory;
  color: string;
  colorExtracted?: string;   // server-side Jimp-extracted dominant color
  icon?: string;
  tags: string[];
  notes?: string;
  imageDataUrl?: string;
  addedAt: string;
}

// ── Outfit ────────────────────────────────────────────────────────────────────

export interface AiMeta {
  harmony: string;
  style: string;
  confidence: number;
  palette: string[];
  insights: string[];
}

export interface Outfit {
  id: string;
  ownerUsername: string;
  name: string;
  occasion: string;
  caption?: string;
  items: string[];       // item IDs
  itemIcons: string[];   // emoji icons (resolved at save time)
  posted: boolean;
  boardIds: string[];
  likes: number;
  aiMeta?: AiMeta;
  createdAt: string;
  updatedAt?: string;
}

// ── Board ─────────────────────────────────────────────────────────────────────

export type BoardVisibility = 'private' | 'public';

export interface Board {
  id: string;
  ownerUsername: string;
  name: string;
  description?: string;
  visibility: BoardVisibility;
  outfitIds: string[];
  createdAt: string;
  updatedAt?: string;
}

// ── Profile ───────────────────────────────────────────────────────────────────

export interface Profile {
  username: string;
  displayName: string;
  bio?: string;
  email?: string;
  avatarDataUrl?: string;
}

// ── Follow ────────────────────────────────────────────────────────────────────

export interface FollowStatus {
  following: boolean;
  followerCount: number;
}

// ── Report ────────────────────────────────────────────────────────────────────

export type ReportType = 'post' | 'board';
export type ReportStatus = 'pending' | 'removed' | 'hidden' | 'resolved';

export interface Report {
  id: string;
  type: ReportType;
  status: ReportStatus;
  contentId: string;
  contentLabel: string;
  posterUsername: string;
  reason: string;
  caption?: string;
  createdAt: string;
}

// ── Audit Log ─────────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  adminUsername: string;
  action: string;
  target: string;
  timestamp: string;
}

// ── Feed ──────────────────────────────────────────────────────────────────────

export interface FeedPost {
  id: string;
  title: string;
  creator: string;
  caption: string;
  tags: string[];
  likes: number;
  createdAt: string;
  items: string[]; // emoji icons
}

// ── API responses ─────────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
}

// ── Color theory (outfit generator) ──────────────────────────────────────────

export interface ColorMeta {
  hex: string;
  hue: number | null;
  neutral: boolean;
  family: string;
}

export type HarmonyMode = 'monochrome' | 'analogous' | 'complementary' | 'neutral-balance' | 'auto';
export type OccasionMode = 'everyday' | 'school' | 'office' | 'date-night' | 'streetwear';
export type StyleMode = 'balanced' | 'minimal' | 'casual' | 'layered';

export interface EnrichedItem extends Item {
  aiColor: ColorMeta & { source: 'image' | 'manual'; colorName: string };
}

export interface OutfitCombo {
  top: EnrichedItem;
  bottom: EnrichedItem;
  shoes: EnrichedItem;
  extras?: EnrichedItem[];
}

export interface AiSuggestion {
  id: string;
  title: string;
  combo: OutfitCombo;
  items: EnrichedItem[];
  score: number;
  confidence: number;
  reason: string;
  insights: string[];
  filters: {
    harmony: string;
    occasion: OccasionMode;
    style: StyleMode;
    preferredColor: string;
  };
}
