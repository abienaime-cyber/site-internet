import { getDb } from "./db";

export type ListingCardData = {
  id: number;
  brand: string;
  model: string;
  reference: string;
  price: number;
  condition: string;
  year: number | null;
  city: string;
  visual: string;
  status: string;
  created_at: string;
  photo_id: number | null;
  seller_id: number;
  seller_rating: number | null;
  seller_reviews: number;
  is_favorite: 0 | 1;
};

export type ListingDetail = ListingCardData & {
  description: string;
  has_box: 0 | 1;
  has_papers: 0 | 1;
  case_size: number | null;
  material: string;
  movement: string;
  views: number;
  seller_name: string;
  seller_city: string;
  seller_hue: number;
  seller_since: string;
  photo_ids: number[];
};

export type SearchFilters = {
  q?: string;
  brand?: string;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string[];
  yearMin?: number;
  yearMax?: number;
  boxPapers?: boolean;
  sort?: "recent" | "price_asc" | "price_desc" | "year_desc";
};

const CARD_COLUMNS = `
  l.id, l.brand, l.model, l.reference, l.price, l.condition, l.year, l.city, l.visual, l.status, l.created_at,
  l.seller_id,
  (SELECT p.id FROM listing_photos p WHERE p.listing_id = l.id ORDER BY p.position LIMIT 1) AS photo_id,
  (SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.seller_id = l.seller_id) AS seller_rating,
  (SELECT COUNT(*) FROM reviews r WHERE r.seller_id = l.seller_id) AS seller_reviews,
  EXISTS (SELECT 1 FROM favorites f WHERE f.listing_id = l.id AND f.user_id = :viewer) AS is_favorite
`;

export function searchListings(filters: SearchFilters, viewerId: number | null, limit = 60): ListingCardData[] {
  const where = ["l.status = 'active'"];
  const params: Record<string, string | number> = { viewer: viewerId ?? 0, limit };

  if (filters.q) {
    where.push("(l.brand LIKE :q OR l.model LIKE :q OR l.reference LIKE :q OR (l.brand || ' ' || l.model) LIKE :q)");
    params.q = `%${filters.q}%`;
  }
  if (filters.brand) {
    where.push("l.brand = :brand");
    params.brand = filters.brand;
  }
  if (filters.model) {
    where.push("l.model LIKE :model");
    params.model = `%${filters.model}%`;
  }
  if (filters.minPrice) {
    where.push("l.price >= :minPrice");
    params.minPrice = filters.minPrice * 100;
  }
  if (filters.maxPrice) {
    where.push("l.price <= :maxPrice");
    params.maxPrice = filters.maxPrice * 100;
  }
  if (filters.condition?.length) {
    const keys = filters.condition.map((c, i) => {
      params[`c${i}`] = c;
      return `:c${i}`;
    });
    where.push(`l.condition IN (${keys.join(", ")})`);
  }
  if (filters.yearMin) {
    where.push("l.year >= :yearMin");
    params.yearMin = filters.yearMin;
  }
  if (filters.yearMax) {
    where.push("l.year <= :yearMax");
    params.yearMax = filters.yearMax;
  }
  if (filters.boxPapers) where.push("l.has_box = 1 AND l.has_papers = 1");

  const order = {
    recent: "l.created_at DESC",
    price_asc: "l.price ASC",
    price_desc: "l.price DESC",
    year_desc: "l.year DESC",
  }[filters.sort ?? "recent"];

  return getDb()
    .prepare(`SELECT ${CARD_COLUMNS} FROM listings l WHERE ${where.join(" AND ")} ORDER BY ${order}, l.id DESC LIMIT :limit`)
    .all(params) as ListingCardData[];
}

export function getListing(id: number, viewerId: number | null): ListingDetail | null {
  const row = getDb()
    .prepare(
      `SELECT ${CARD_COLUMNS}, l.description, l.has_box, l.has_papers, l.case_size, l.material, l.movement, l.views,
        u.name AS seller_name, u.city AS seller_city, u.avatar_hue AS seller_hue, u.created_at AS seller_since
       FROM listings l JOIN users u ON u.id = l.seller_id WHERE l.id = :id`,
    )
    .get({ id, viewer: viewerId ?? 0 }) as Omit<ListingDetail, "photo_ids"> | undefined;
  if (!row) return null;
  const photos = getDb()
    .prepare("SELECT id FROM listing_photos WHERE listing_id = ? ORDER BY position")
    .all(id) as { id: number }[];
  return { ...row, photo_ids: photos.map((p) => p.id) };
}

export function incrementViews(id: number) {
  getDb().prepare("UPDATE listings SET views = views + 1 WHERE id = ?").run(id);
}

export function getFavoriteListings(userId: number): ListingCardData[] {
  return getDb()
    .prepare(
      `SELECT ${CARD_COLUMNS} FROM favorites fav JOIN listings l ON l.id = fav.listing_id
       WHERE fav.user_id = :viewer ORDER BY fav.created_at DESC`,
    )
    .all({ viewer: userId }) as ListingCardData[];
}

export function getSellerListings(sellerId: number, viewerId: number | null, includeInactive = false): ListingCardData[] {
  return getDb()
    .prepare(
      `SELECT ${CARD_COLUMNS} FROM listings l WHERE l.seller_id = :seller
       ${includeInactive ? "" : "AND l.status = 'active'"} ORDER BY l.created_at DESC`,
    )
    .all({ seller: sellerId, viewer: viewerId ?? 0 }) as ListingCardData[];
}

export type BrandCount = { brand: string; count: number; visual: string };

export function getBrandCounts(): BrandCount[] {
  return getDb()
    .prepare(
      `SELECT l.brand, COUNT(*) AS count,
        (SELECT l2.visual FROM listings l2 WHERE l2.brand = l.brand AND l2.status = 'active' ORDER BY l2.price DESC LIMIT 1) AS visual
       FROM listings l WHERE l.status = 'active' GROUP BY l.brand ORDER BY count DESC, l.brand`,
    )
    .all() as BrandCount[];
}

export type SellerProfile = {
  id: number;
  name: string;
  city: string;
  bio: string;
  avatar_hue: number;
  created_at: string;
  rating: number | null;
  reviews: number;
  active_listings: number;
  sold: number;
};

export function getSeller(id: number): SellerProfile | null {
  return (
    (getDb()
      .prepare(
        `SELECT u.id, u.name, u.city, u.bio, u.avatar_hue, u.created_at,
          (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE seller_id = u.id) AS rating,
          (SELECT COUNT(*) FROM reviews WHERE seller_id = u.id) AS reviews,
          (SELECT COUNT(*) FROM listings WHERE seller_id = u.id AND status = 'active') AS active_listings,
          (SELECT COUNT(*) FROM listings WHERE seller_id = u.id AND status = 'sold') AS sold
         FROM users u WHERE u.id = ?`,
      )
      .get(id) as SellerProfile | undefined) ?? null
  );
}

export type Review = { id: number; rating: number; comment: string; created_at: string; author_name: string; author_hue: number };

export function getSellerReviews(sellerId: number): Review[] {
  return getDb()
    .prepare(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS author_name, u.avatar_hue AS author_hue
       FROM reviews r JOIN users u ON u.id = r.author_id WHERE r.seller_id = ? ORDER BY r.created_at DESC`,
    )
    .all(sellerId) as Review[];
}

export function countUnread(userId: number): number {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS n FROM messages m JOIN conversations c ON c.id = m.conversation_id
       WHERE (c.buyer_id = :u OR c.seller_id = :u) AND m.sender_id != :u AND m.read_at IS NULL`,
    )
    .get({ u: userId }) as { n: number };
  return row.n;
}

export type OrderRow = {
  id: number;
  listing_id: number;
  amount: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  brand: string;
  model: string;
  reference: string;
  visual: string;
  photo_id: number | null;
  other_name: string;
  other_id: number;
  reviewed: 0 | 1;
};

const ORDER_COLUMNS = `
  o.id, o.listing_id, o.amount, o.status, o.created_at, o.paid_at,
  l.brand, l.model, l.reference, l.visual,
  (SELECT p.id FROM listing_photos p WHERE p.listing_id = l.id ORDER BY p.position LIMIT 1) AS photo_id,
  EXISTS (SELECT 1 FROM reviews r WHERE r.order_id = o.id) AS reviewed
`;

export function getPurchases(userId: number): OrderRow[] {
  return getDb()
    .prepare(
      `SELECT ${ORDER_COLUMNS}, u.name AS other_name, u.id AS other_id
       FROM orders o JOIN listings l ON l.id = o.listing_id JOIN users u ON u.id = o.seller_id
       WHERE o.buyer_id = ? AND o.status = 'paid' ORDER BY o.paid_at DESC`,
    )
    .all(userId) as OrderRow[];
}

export function getSales(userId: number): OrderRow[] {
  return getDb()
    .prepare(
      `SELECT ${ORDER_COLUMNS}, u.name AS other_name, u.id AS other_id
       FROM orders o JOIN listings l ON l.id = o.listing_id JOIN users u ON u.id = o.buyer_id
       WHERE o.seller_id = ? AND o.status = 'paid' ORDER BY o.paid_at DESC`,
    )
    .all(userId) as OrderRow[];
}
