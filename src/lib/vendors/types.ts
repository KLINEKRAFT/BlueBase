export type VendorStatus =
  | 'recommended'
  | 'under_review'
  | 'approved_for_invitation'
  | 'invited'
  | 'onboarding'
  | 'contribution_pending'
  | 'active'
  | 'renewal_due'
  | 'expired'
  | 'suspended'
  | 'declined'
  | 'archived';
export interface Taxonomy {
  id: string;
  name: string;
}
export interface DirectoryRules {
  minimumRating: number;
  annualContribution: number;
  renewalMonths: number;
  renewalNoticeDays: number;
}
export interface DirectoryReview {
  id: string;
  agentId: string;
  agentName: string;
  rating: number;
  experience: 'agent' | 'client';
  comment: string;
  createdAt: string;
  updatedAt: string;
  sample: boolean;
}
export interface DirectoryVendor {
  id: string;
  name: string;
  initials: string;
  tone: string;
  description: string;
  services: string[];
  categoryIds: string[];
  markets: { id: string; detail: string }[];
  website: string;
  phone: string;
  email: string;
  contactName: string;
  sourceUrl: string;
  sourceCheckedAt: string;
  memberSince: string;
  status: VendorStatus;
  rating: number | null;
  reviewCount: number;
  recommendationCount: number;
  reviews: DirectoryReview[];
  charity: { name: string; renewalDate: string; sample: boolean } | null;
  sample: boolean;
  logo: string | null;
}
export interface RecommendationInput {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  categoryIds: string[];
  marketIds: string[];
  otherMarket: string;
  experience: string;
  reason: string;
  notes: string;
}
export interface ReviewInput {
  vendorId: string;
  rating: number;
  experience: 'agent' | 'client';
  comment: string;
}
export interface RecommendationReceipt {
  id: string;
  companyName: string;
  submittedAt: string;
  status: 'pending';
  notificationStatus: 'awaiting_provider';
  duplicate: boolean;
}
export interface DirectorySnapshot {
  vendors: DirectoryVendor[];
  reviewedVendors: DirectoryVendor[];
  categories: Taxonomy[];
  markets: Taxonomy[];
  rules: DirectoryRules;
  recommendations: RecommendationReceipt[];
  mode: 'local-demo';
  agentId: string;
}
