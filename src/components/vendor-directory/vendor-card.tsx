'use client';
import { Heart, ArrowUpRight, MapPin, Star, HeartHandshake, Phone, Globe } from 'lucide-react';
import type { DirectoryVendor, Taxonomy } from '@/lib/vendors/types';
export function VendorLogo({
  vendor,
  large = false,
}: {
  vendor: DirectoryVendor;
  large?: boolean;
}) {
  return (
    <span className={`directory-logo ${vendor.tone} ${large ? 'large' : ''}`} aria-hidden="true">
      {vendor.logo ? <img src={vendor.logo} alt="" /> : vendor.initials}
    </span>
  );
}
export function marketLabel(vendor: DirectoryVendor, markets: Taxonomy[]) {
  return vendor.markets
    .map((m) => (m.id === 'other' ? m.detail : markets.find((a) => a.id === m.id)?.name || m.id))
    .join(' · ');
}
export function VendorCard({
  vendor,
  categories,
  markets,
  favorite,
  onFavorite,
  onOpen,
  featured = false,
}: {
  vendor: DirectoryVendor;
  categories: Taxonomy[];
  markets: Taxonomy[];
  favorite: boolean;
  onFavorite: () => void;
  onOpen: () => void;
  featured?: boolean;
}) {
  return (
    <article className={`directory-card ${featured ? 'featured' : ''}`}>
      <div className={`directory-card-art ${vendor.tone}`}>
        <span className="directory-sample-tag">DEMO PROFILE</span>
        <VendorLogo vendor={vendor} />
        <span className="directory-art-word">
          {vendor.categoryIds[0] === 'mortgage-lender'
            ? 'A place to begin.'
            : vendor.categoryIds[0] === 'title-company'
              ? 'The next chapter.'
              : vendor.categoryIds[0] === 'home-inspector'
                ? 'A closer look.'
                : 'A little peace of mind.'}
        </span>
        <button
          className={`favorite-btn ${favorite ? 'favorited' : ''}`}
          aria-label={`${favorite ? 'Unfavorite' : 'Favorite'} ${vendor.name}`}
          aria-pressed={favorite}
          onClick={onFavorite}
        >
          <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="directory-card-body">
        <div className="directory-card-category">
          {vendor.categoryIds.map((id) => categories.find((c) => c.id === id)?.name).join(' · ')}
        </div>
        <button className="directory-card-title" onClick={onOpen}>
          <h2>{vendor.name}</h2>
          <ArrowUpRight size={19} />
        </button>
        <div className="directory-rating">
          <Star size={14} fill={vendor.rating === null ? 'none' : 'currentColor'} />
          <strong>
            {vendor.rating === null ? 'New to the community' : vendor.rating.toFixed(1)}
          </strong>
          {vendor.rating !== null && <span>{vendor.reviewCount} sample ratings</span>}
        </div>
        <p className="directory-card-description">{vendor.description}</p>
        <div className="directory-card-market">
          <MapPin size={14} />
          <span>{marketLabel(vendor, markets)}</span>
        </div>
        <div className="directory-charity">
          <HeartHandshake size={17} />
          <span>
            Supporting <strong>{vendor.charity?.name || 'Charity confirmation pending'}</strong>
            <small>Illustrative community commitment</small>
          </span>
        </div>
        <div className="directory-card-actions">
          <button onClick={onOpen}>
            View profile
            <ArrowUpRight size={15} />
          </button>
          {vendor.phone ? (
            <a href={`tel:${vendor.phone}`} aria-label={`Call ${vendor.name}`}>
              <Phone size={16} />
              <span>Call</span>
            </a>
          ) : (
            <a
              href={vendor.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${vendor.name} website`}
            >
              <Globe size={16} />
              <span>Website</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
