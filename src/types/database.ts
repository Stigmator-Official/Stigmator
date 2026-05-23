// STIGMATOR Database Types
// Auto-generated from Prisma schema - Single source of truth

// ============================================
// ENUMS
// ============================================

export type UserRole = 'CUSTOMER' | 'ARTIST' | 'ADMIN' | 'SUPER_ADMIN' | 'DEVELOPER' | 'FULFILLMENT' | 'STUDIO_MANAGER';

export type VerificationStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export type DesignStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'ARCHIVED';

export type GarmentType = 
  | 'TSHIRT' 
  | 'LONG_SLEEVE' 
  | 'HOODIE' 
  | 'TANK_TOP' 
  | 'CREWNECK' 
  | 'HAT_BEANIE' 
  | 'HAT_TRUCKER' 
  | 'POSTER' 
  | 'STICKER_PACK';

export const GARMENT_TYPE_LABELS: Record<GarmentType, string> = {
  TSHIRT: 'T-Shirt',
  LONG_SLEEVE: 'Long Sleeve',
  HOODIE: 'Hoodie',
  TANK_TOP: 'Tank Top',
  CREWNECK: 'Crewneck',
  HAT_BEANIE: 'Beanie',
  HAT_TRUCKER: 'Trucker Hat',
  POSTER: 'Poster',
  STICKER_PACK: 'Sticker Pack'
};

export type ProductStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'PAUSED' | 'SOLD_OUT' | 'ARCHIVED';

export type OrderStatus = 
  | 'PENDING_PAYMENT' 
  | 'PAYMENT_RECEIVED' 
  | 'IN_PRODUCTION' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'REFUNDED' 
  | 'DISPUTED';

export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'HELD_FOR_REVIEW';

export type PartnershipCodeStatus = 'GENERATED' | 'SENT' | 'REDEEMED' | 'EXPIRED' | 'REVOKED';

export type PartnershipStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';

export type CompetitionStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'VOTING' | 'COMPLETED' | 'CANCELLED';

export type CompetitionType = 'MONTHLY' | 'BRACKET' | 'FLASH_BATTLE' | 'COLLAB_CHALLENGE';

// ============================================
// BASE INTERFACES
// ============================================

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export interface SoftDelete extends Timestamps {
  deletedAt: string | null;
}

// ============================================
// USER & AUTH
// ============================================

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  fullName: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  instagramHandle: string | null;
  role: UserRole;
  isVerified: boolean;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  referralCode: string | null;
  referredById: string | null;
  emailNotifications: boolean;
  marketingEmails: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  
  // Relations
  artistProfile?: ArtistProfile;
  studioMemberships?: StudioMember[];
}

export interface ArtistProfile {
  id: string;
  userId: string;
  yearsExperience: number | null;
  specialties: string[];
  portfolioUrl: string | null;
  applicationData: Record<string, unknown> | null;
  reviewedById: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  totalDesigns: number;
  totalSales: number;
  totalEarnings: number; // in cents
  rating: number;
  reviewCount: number;
  defaultSplits: RevenueSplit | null;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueSplit {
  artist: number;
  partner: number;
  studio: number;
}

export interface PublicUser {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  location: string | null;
  instagramHandle: string | null;
  role: UserRole;
  isVerified: boolean;
  artistProfile?: Pick<ArtistProfile, 'specialties' | 'totalDesigns' | 'rating'>;
}

// ============================================
// STUDIOS
// ============================================

export interface Studio {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagramHandle: string | null;
  verificationStatus: VerificationStatus;
  verifiedAt: string | null;
  artistCount: number;
  totalSales: number;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  members?: StudioMember[];
}

export interface StudioMember {
  id: string;
  studioId: string;
  userId: string;
  role: 'OWNER' | 'MANAGER' | 'ARTIST';
  createdAt: string;
  
  // Relations
  user?: PublicUser;
  studio?: Studio;
}

// ============================================
// DESIGNS
// ============================================

export interface Design {
  id: string;
  artistId: string;
  artist?: PublicUser;
  title: string;
  description: string | null;
  originalFile: string;
  previewImage: string;
  thumbnailImage: string | null;
  status: DesignStatus;
  category: string | null;
  tags: string[];
  isNSFW: boolean;
  attributionRequired: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  
  // Relations
  products?: ProductDesign[];
}

// ============================================
// PRODUCTS
// ============================================

export interface Product {
  id: string;
  artistId: string;
  artist?: PublicUser;
  studioId: string | null;
  studio?: Studio;
  name: string;
  description: string | null;
  garmentType: GarmentType;
  status: ProductStatus;
  basePrice: number; // in cents
  salePrice: number | null;
  costToProduce: number;
  depositAmount: number;
  depositRecoupEnabled: boolean;
  depositRecoupTargetSales: number;
  depositRecoupedAmount: number;
  depositRecoupedSalesCount: number;
  freshnessScore: number;
  lastSaleAt: string | null;
  inventoryEnabled: boolean;
  inventoryCount: number;
  totalSales: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  
  // Relations
  designs?: ProductDesign[];
  reviews?: Review[];
}

export interface ProductDesign {
  id: string;
  productId: string;
  product?: Product;
  designId: string;
  design?: Design;
  artistId: string;
  artist?: User;
  positionX: number;
  positionY: number;
  scale: number;
  rotation: number;
  designPlacement?: any;
  revenueShare: number;
  mockupImages: string[];
  mockupImage?: string;
  printFile: string | null;
  priceOverride: number | null;
  depositAmount: number;
  isActive: boolean;
  totalSales: number;
  productionStatus?: string;
  artistRetailPrice?: number;
  manufacturingCost?: number;
  platformFeeAmount?: number;
  artistProfitPerUnit?: number;
  isLimitedRun: boolean;
  maxUnits?: number;
  unitsSold: number;
  isCampaignMode: boolean;
  campaignMinUnits: number;
  depositRecoupEnabled: boolean;
  depositRecoupSalesTarget?: number;
  depositRecoupedSalesCount: number;
  depositRecoupedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// For shop display
export interface ShopProduct extends Product {
  designs: (ProductDesign & { design: Design })[];
  artist: PublicUser;
  freshness: 'FIRE' | 'HOT' | 'FRESH' | 'STALE' | 'VINTAGE';
}

// ============================================
// PARTNERSHIPS
// ============================================

export interface PartnershipCode {
  id: string;
  code: string;
  artistId: string;
  artist?: PublicUser;
  designId: string;
  design?: Design;
  artistShare: number;
  partnerShare: number;
  studioShare: number;
  status: PartnershipCodeStatus;
  expiresAt: string | null;
  requiresPhoto: boolean;
  requiresLocation: boolean;
  createdAt: string;
  redeemedAt: string | null;
  
  // Relations
  partnership?: Partnership;
}

export interface Partnership {
  id: string;
  codeId: string;
  code?: PartnershipCode;
  partnerId: string;
  partner?: PublicUser;
  artistShare: number;
  partnerShare: number;
  studioShare: number;
  status: PartnershipStatus;
  verificationPhoto: string | null;
  verificationLocation: { lat: number; lng: number } | null;
  verifiedAt: string | null;
  totalSales: number;
  totalEarnings: number;
  partnerNotified: boolean;
  createdAt: string;
  activatedAt: string | null;
}

// ============================================
// ORDERS
// ============================================

export interface Order {
  id: string;
  customerId: string;
  customer?: PublicUser;
  customerEmail: string | null;
  customerName: string | null;
  status: OrderStatus;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  shippingAddress: ShippingAddress | null;
  shippingMethod: string | null;
  trackingNumber: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  
  // Relations
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productDesignId: string;
  productDesign?: ProductDesign;
  productName: string;
  designTitle: string;
  artistName: string;
  artistId: string;
  mockupImage: string;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  hasPartnership: boolean;
  productionStatus: string;
  printFileUrl: string | null;
  fulfillmentPartnerId?: string;
  fulfillmentStatus?: string;
  fulfillmentNotes?: string;
  createdAt: string;
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

// ============================================
// PAYOUTS
// ============================================

export interface Payout {
  id: string;
  userId: string;
  user?: PublicUser;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  platformFees: number;
  taxWithheld: number;
  netAmount: number;
  status: PayoutStatus;
  stripeTransferId: string | null;
  processedAt: string | null;
  completedAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  createdAt: string;
}

// ============================================
// REVIEWS
// ============================================

export interface Review {
  id: string;
  customerId: string;
  customer?: PublicUser;
  productId: string;
  product?: Product;
  rating: number;
  title: string | null;
  content: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// COMPETITIONS
// ============================================

export interface Competition {
  id: string;
  title: string;
  description: string;
  type: CompetitionType;
  theme: string;
  status: CompetitionStatus;
  submissionStart: string;
  submissionEnd: string;
  votingStart: string | null;
  votingEnd: string | null;
  prizePool: number;
  prizeBreakdown: {
    first: number;
    second: number;
    third: number;
  };
  maxEntriesPerArtist: number;
  entryCount: number;
  voteCount: number;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  entries?: CompetitionEntry[];
}

export interface CompetitionEntry {
  id: string;
  competitionId: string;
  designId: string;
  design?: Design;
  artistId: string;
  entryTitle: string;
  description: string | null;
  voteCount: number;
  finalRank: number | null;
  prizeAmount: number | null;
  prizePaid: boolean;
  createdAt: string;
}

// ============================================
// CART & CHECKOUT
// ============================================

export interface CartItem {
  productDesignId: string;
  productName: string;
  designTitle: string;
  artistName: string;
  artistId: string;
  mockupImage: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number; // in cents
}

export interface CheckoutSession {
  id: string;
  orderId: string;
  clientSecret: string;
  status: 'pending' | 'completed' | 'expired';
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// ============================================
// DASHBOARD STATS
// ============================================

export interface ArtistDashboardStats {
  totalEarnings: number;
  totalSales: number;
  designCount: number;
  partnerCount: number;
  pendingApprovals: number;
  recentOrders: Order[];
  topProducts: Product[];
  earningsHistory: { date: string; amount: number }[];
}

export interface PartnerDashboardStats {
  totalEarnings: number;
  totalSales: number;
  attributionCount: number;
  activePartnerships: Partnership[];
  earningsHistory: { date: string; amount: number }[];
}

// ============================================
// FORM TYPES
// ============================================

export interface DesignUploadForm {
  title: string;
  description: string;
  category: string;
  tags: string[];
  isNSFW: boolean;
  attributionRequired: boolean;
}

export interface ProductCreateForm {
  name: string;
  description: string;
  garmentType: GarmentType;
  basePrice: number;
  designs: {
    designId: string;
    position: { x: number; y: number };
    scale: number;
    rotation: number;
    revenueShare: number;
  }[];
  depositRecoupEnabled: boolean;
  depositRecoupTargetSales: number;
}

export interface PartnershipCodeCreateForm {
  designId: string;
  artistShare: number;
  partnerShare: number;
  studioShare: number;
  expiresAt: string | null;
  requiresPhoto: boolean;
  requiresLocation: boolean;
}

export interface PartnershipRedeemForm {
  code: string;
  verificationPhoto?: File;
  location?: { lat: number; lng: number };
}

// ============================================
// UTILITY TYPES
// ============================================

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type EntityType = 
  | 'User' 
  | 'ArtistProfile' 
  | 'Studio' 
  | 'Design' 
  | 'Product' 
  | 'Order' 
  | 'Partnership';
