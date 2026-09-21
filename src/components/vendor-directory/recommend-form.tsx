'use client';
import { useState } from 'react';
import { Check, ArrowRight, Send, HeartHandshake } from 'lucide-react';
import { Modal } from '../ui';
import type {
  DirectorySnapshot,
  RecommendationReceipt,
  RecommendationInput,
} from '@/lib/vendors/types';
import { submitRecommendation } from '@/lib/vendors/client';
import { refreshDirectory } from '@/lib/vendors/use-directory';
export function RecommendForm({
  snapshot,
  onClose,
}: {
  snapshot: DirectorySnapshot;
  onClose: () => void;
}) {
  const [markets, setMarkets] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [receipt, setReceipt] = useState<RecommendationReceipt | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <Modal
      title={receipt ? 'A good connection starts here.' : 'Recommend a vendor'}
      onClose={() => {
        if (!busy) onClose();
      }}
      wide={!receipt}
    >
      {receipt ? (
        <div className="recommend-success">
          <span className="success-seal">
            <Check size={32} />
          </span>
          <span className="eyebrow">
            {receipt.duplicate ? 'ALREADY IN YOUR RECOMMENDATIONS' : 'RECOMMENDATION RECEIVED'}
          </span>
          <h3>{receipt.companyName}</h3>
          <p>
            {receipt.duplicate
              ? 'Your earlier recommendation is already saved. There’s no need to submit it again.'
              : 'Your recommendation is saved for internal review, linked to your BlueBase agent profile.'}
          </p>
          <div className="recommend-steps">
            <span>
              <Check size={16} />
              Saved as pending
            </span>
            <span>
              <span className="step-dot" />
              Internal review
            </span>
            <span>
              <span className="step-dot" />
              Personal invitation
            </span>
          </div>
          <div className="directory-disclosure">
            <Send size={17} />
            <p>
              Tiffany’s notification is saved in the outbox. Email delivery is not connected in this
              demo, so no email has been sent.
            </p>
          </div>
          <button className="btn primary full" onClick={onClose}>
            Back to the directory
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <>
          <p className="directory-form-intro">
            Know someone you trust? Tell us about them. Our team reviews each recommendation before
            sending a personal invitation.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError('');
              if (!categories.length || !markets.length) {
                setError('Please select at least one category and service area.');
                return;
              }
              const fd = new FormData(e.currentTarget);
              const input: RecommendationInput = {
                companyName: String(fd.get('companyName')),
                contactName: String(fd.get('contactName')),
                email: String(fd.get('email')),
                phone: String(fd.get('phone')),
                website: String(fd.get('website') || ''),
                categoryIds: categories,
                marketIds: markets,
                otherMarket: String(fd.get('otherMarket') || ''),
                experience: String(fd.get('experience')),
                reason: String(fd.get('reason')),
                notes: String(fd.get('notes') || ''),
              };
              setBusy(true);
              try {
                setReceipt(await submitRecommendation(input));
                await refreshDirectory();
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <fieldset disabled={busy} className="directory-fieldset">
              <div className="form-grid">
                <label>
                  Company name
                  <input name="companyName" required maxLength={140} autoComplete="organization" />
                </label>
                <label>
                  Contact person
                  <input name="contactName" required maxLength={100} autoComplete="name" />
                </label>
                <label>
                  Email address
                  <input name="email" type="email" required maxLength={254} autoComplete="email" />
                </label>
                <label>
                  Phone
                  <input name="phone" type="tel" required maxLength={40} autoComplete="tel" />
                </label>
                <label className="field-full">
                  Website <span className="optional">Optional</span>
                  <input name="website" type="url" placeholder="https://" maxLength={500} />
                </label>
              </div>
              <fieldset className="directory-choice-fieldset">
                <legend>
                  What do they do? <span>Select all that apply.</span>
                </legend>
                <select
                  aria-label="Add vendor category"
                  value=""
                  onChange={(e) => {
                    if (e.target.value)
                      setCategories([...new Set([...categories, e.target.value])]);
                  }}
                >
                  <option value="">Choose a category…</option>
                  {snapshot.categories
                    .filter((c) => !categories.includes(c.id))
                    .map((c) => (
                      <option value={c.id} key={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
                <div className="selected-options">
                  {categories.map((id) => (
                    <button
                      type="button"
                      key={id}
                      onClick={() => setCategories(categories.filter((c) => c !== id))}
                      aria-label={`Remove ${snapshot.categories.find((c) => c.id === id)?.name}`}
                    >
                      {snapshot.categories.find((c) => c.id === id)?.name}
                      <span aria-hidden="true">×</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="directory-choice-fieldset">
                <legend>
                  Where do they work? <span>Select all that apply.</span>
                </legend>
                <div className="market-options">
                  {snapshot.markets.map((m) => (
                    <label key={m.id}>
                      <input
                        type="checkbox"
                        checked={markets.includes(m.id)}
                        onChange={(e) =>
                          setMarkets(
                            e.target.checked
                              ? [...markets, m.id]
                              : markets.filter((id) => id !== m.id),
                          )
                        }
                      />
                      {m.name}
                    </label>
                  ))}
                </div>
                {markets.includes('other') && (
                  <label className="other-market-label">
                    Other service area
                    <input
                      name="otherMarket"
                      placeholder="e.g. Northwest Arkansas"
                      required
                      maxLength={150}
                    />
                  </label>
                )}
              </fieldset>
              <label className="directory-textarea">
                Your relationship or experience with this vendor
                <textarea
                  name="experience"
                  rows={2}
                  required
                  maxLength={1500}
                  placeholder="How have you or your clients worked with them?"
                />
              </label>
              <label className="directory-textarea">
                Why do you recommend them?
                <textarea
                  name="reason"
                  rows={3}
                  required
                  maxLength={2500}
                  placeholder="What made the experience worth sharing?"
                />
              </label>
              <label className="directory-textarea">
                Additional notes <span className="optional">Optional</span>
                <textarea name="notes" rows={2} maxLength={2000} />
              </label>
              <div className="directory-disclosure">
                <HeartHandshake size={18} />
                <p>
                  Recommended vendors are reviewed, invited personally, and asked to make an annual
                  ${snapshot.rules.annualContribution} contribution to an approved charity.
                </p>
              </div>
              <p className="directory-demo-note">
                Demo submission · saved under Alexis Oakes. Use sample contact details while
                evaluating this workflow.
              </p>
              {error && (
                <p className="directory-error" role="alert">
                  {error}
                </p>
              )}
              <div className="modal-actions">
                <button type="button" className="btn secondary" onClick={onClose}>
                  Cancel
                </button>
                <button className="btn primary" disabled={busy}>
                  {busy ? 'Saving recommendation…' : 'Send recommendation'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </fieldset>
          </form>
        </>
      )}
    </Modal>
  );
}
