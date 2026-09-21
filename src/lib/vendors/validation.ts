import type { RecommendationInput, ReviewInput, Taxonomy } from './types';
export class DirectoryError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export const normalizedName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
function text(value: unknown, label: string, max: number, required = true) {
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim()))
    throw new DirectoryError(`Please enter a valid ${label}.`);
  return value.trim();
}
function selection(value: unknown, allowed: Taxonomy[], label: string) {
  if (
    !Array.isArray(value) ||
    !value.length ||
    value.length > allowed.length ||
    value.some((x) => typeof x !== 'string' || !allowed.some((a) => a.id === x))
  )
    throw new DirectoryError(`Choose at least one valid ${label}.`);
  return [...new Set(value)] as string[];
}
export function validateRecommendation(
  input: unknown,
  categories: Taxonomy[],
  markets: Taxonomy[],
): RecommendationInput {
  if (!input || typeof input !== 'object')
    throw new DirectoryError('Please complete the recommendation.');
  const x = input as Record<string, unknown>;
  const companyName = text(x.companyName, 'company name', 140);
  if (normalizedName(companyName).length < 2)
    throw new DirectoryError('Please enter a company name with at least two letters or numbers.');
  const email = text(x.email, 'email address', 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new DirectoryError('Please enter a valid email address.');
  const phone = text(x.phone, 'phone number', 40);
  if (phone.replace(/\D/g, '').length < 7)
    throw new DirectoryError('Please enter a valid phone number.');
  const website = text(x.website, 'website', 500, false);
  if (website) {
    try {
      const url = new URL(website);
      if (
        !['https:', 'http:'].includes(url.protocol) ||
        !url.hostname.includes('.') ||
        url.username ||
        url.password
      )
        throw new Error();
    } catch {
      throw new DirectoryError('Use a complete http:// or https:// website address.');
    }
  }
  const marketIds = selection(x.marketIds, markets, 'service area');
  return {
    companyName,
    contactName: text(x.contactName, 'contact name', 100),
    email,
    phone,
    website,
    categoryIds: selection(x.categoryIds, categories, 'category'),
    marketIds,
    otherMarket: text(x.otherMarket, 'other service area', 150, marketIds.includes('other')),
    experience: text(x.experience, 'relationship or experience', 1500),
    reason: text(x.reason, 'reason for recommending', 2500),
    notes: text(x.notes, 'additional notes', 2000, false),
  };
}
export function validateReview(input: unknown): ReviewInput {
  if (!input || typeof input !== 'object') throw new DirectoryError('Please complete your review.');
  const x = input as Record<string, unknown>;
  if (!Number.isInteger(x.rating) || Number(x.rating) < 1 || Number(x.rating) > 5)
    throw new DirectoryError('Choose a rating from 1 to 5 stars.');
  if (x.experience !== 'agent' && x.experience !== 'client')
    throw new DirectoryError('Choose whose experience you are sharing.');
  return {
    vendorId: text(x.vendorId, 'vendor', 100),
    rating: Number(x.rating),
    experience: x.experience,
    comment: text(x.comment, 'review', 2000, false),
  };
}
