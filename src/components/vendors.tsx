'use client';
import { useState } from 'react';
import {
  Search,
  Heart,
  Star,
  MapPin,
  ArrowUpRight,
  Phone,
  Mail,
  ShieldCheck,
  Users,
  SlidersHorizontal,
} from 'lucide-react';
import { vendors, categories } from '@/data/mock';
import type { Vendor } from '@/lib/types';
import { Empty, Modal, PageHeading, useStoredState } from './ui';
export function Vendors({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('All categories');
  const [area, setArea] = useState('All areas');
  const [favorites, setFavorites] = useStoredState<string[]>('favorites', []);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [selected, setSelected] = useState<Vendor | null>(null);
  const toggle = (id: string) =>
    setFavorites(favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id]);
  const results = vendors.filter(
    (v) =>
      (v.name + ' ' + v.category + ' ' + v.description)
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (category === 'All categories' || v.category === category) &&
      (area === 'All areas' || v.area === area) &&
      (!onlyFavorites || favorites.includes(v.id)),
  );
  return (
    <>
      <PageHeading
        eyebrow="GOOD PEOPLE. GREAT PARTNERS."
        title="Your trusted circle."
        description="A curated collection of local pros, recommended by people you know."
      >
        <span className="soft-label">
          <ShieldCheck size={15} />
          Invitation-only network
        </span>
      </PageHeading>
      <div className="vendor-banner">
        <div>
          <div className="eyebrow">THE RIGHT PEOPLE MAKE ALL THE DIFFERENCE</div>
          <h2>
            Consider your short list,
            <br />a little shorter.
          </h2>
          <p>From the first inspection to the final moving box.</p>
        </div>
        <img src="/images/interior.jpg" alt="A calm, light-filled home interior" />
      </div>
      <div className="filter-toolbar">
        <label className="search-input">
          <Search size={18} />
          <input
            aria-label="Search vendors"
            placeholder="Find a service or a familiar name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Vendor service area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        >
          {['All areas', ...new Set(vendors.map((v) => v.area))].map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <button
          className={`btn secondary ${onlyFavorites ? 'selected' : ''}`}
          aria-pressed={onlyFavorites}
          onClick={() => setOnlyFavorites(!onlyFavorites)}
        >
          <Heart size={17} fill={onlyFavorites ? 'currentColor' : 'none'} />
          Favorites{favorites.length > 0 && <span>{favorites.length}</span>}
        </button>
      </div>
      <div className="category-scroll" aria-label="Vendor categories">
        {['All categories', ...categories].map((c) => (
          <button
            key={c}
            className={c === category ? 'active' : ''}
            aria-pressed={c === category}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="results-meta">
        <span>
          {results.length} trusted {results.length === 1 ? 'partner' : 'partners'}
        </span>
        <span>
          <SlidersHorizontal size={14} />
          Curated for your community
        </span>
      </div>
      <div className="vendor-grid">
        {results.map((v) => (
          <article className="vendor-card" key={v.id}>
            <div className="vendor-image">
              <button
                className="image-button"
                onClick={() => setSelected(v)}
                aria-label={`View ${v.name}`}
              >
                <img src={v.image} alt={`Illustrative ${v.category.toLowerCase()} photo`} />
              </button>
              <span className="image-category">{v.category}</span>
              <button
                className={`favorite-btn ${favorites.includes(v.id) ? 'favorited' : ''}`}
                onClick={() => toggle(v.id)}
                aria-label={`${favorites.includes(v.id) ? 'Unfavorite' : 'Favorite'} ${v.name}`}
                aria-pressed={favorites.includes(v.id)}
              >
                <Heart size={18} fill={favorites.includes(v.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
            <button className="vendor-content" onClick={() => setSelected(v)}>
              <div className="vendor-title">
                <h3>{v.name}</h3>
                <span>
                  <Star size={13} fill="currentColor" />
                  {v.rating.toFixed(1)}
                </span>
              </div>
              <p className="vendor-location">
                <MapPin size={13} />
                {v.area}
              </p>
              <p className="vendor-description">{v.description}</p>
              <div className="vendor-footer">
                <span>
                  <Users size={14} />
                  {v.recommendations} agent recommendations
                </span>
                <ArrowUpRight size={17} />
              </div>
            </button>
          </article>
        ))}
      </div>
      {!results.length && (
        <Empty
          title="A different search might do it."
          description="Try another category or area, or turn off Favorites to browse the full collection."
        />
      )}
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <img className="detail-cover" src={selected.image} alt="Illustrative vendor service" />
          <div className="detail-meta">
            <span className="status blue">{selected.category}</span>
            <span>
              <Star size={15} />
              {selected.rating.toFixed(1)} · {selected.recommendations} recommendations
            </span>
          </div>
          <div className="prose">
            <p>{selected.description}</p>
            <p>
              <MapPin size={16} /> Serving {selected.area}
            </p>
            <div className="info-note">
              <ShieldCheck size={20} />
              <span>
                Invited by the BlueBase community. All business names, ratings, and contact details
                in this demo are fictional.
              </span>
            </div>
          </div>
          <div className="vendor-contact">
            <span>
              <Phone size={17} />
              {selected.phone}
            </span>
            <span>
              <Mail size={17} />
              {selected.email}
            </span>
          </div>
          <button className="btn primary full" onClick={() => toggle(selected.id)}>
            <Heart size={17} fill={favorites.includes(selected.id) ? 'currentColor' : 'none'} />
            {favorites.includes(selected.id) ? 'Saved to your favorites' : 'Add to favorites'}
          </button>
        </Modal>
      )}
    </>
  );
}
