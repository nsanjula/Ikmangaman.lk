import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { getConsent, saveConsent, hasPersonalizationConsent } from "../utils/cookies";

const Toggle = ({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      checked ? "bg-cyan-600" : "bg-gray-300"
    } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    aria-pressed={checked}
    aria-disabled={disabled}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`}
    />
  </button>
);

const CookieConsentPopup = ({ onCustomize, onAcceptAll, onRejectAll }: { onCustomize: () => void; onAcceptAll: () => void; onRejectAll: () => void; }) => (
  createPortal(
    <div className="cookie-consent-popup fixed bottom-4 left-4 z-[99999] card p-4 max-w-md shadow-lg" style={{ pointerEvents: 'auto' }}>
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-900)' }}>We value your privacy</h3>
      <p className="text-sm mb-3" style={{ color: 'var(--text-600)' }}>
        We use cookies to enhance your experience, serve personalized content, and analyze traffic.
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <button className="btn btn-secondary btn-sm" onClick={onCustomize}>Customize</button>
        <button className="btn btn-secondary btn-sm" onClick={onRejectAll}>Reject All</button>
        <button className="btn btn-primary btn-sm" onClick={onAcceptAll}>Accept All</button>
      </div>
    </div>,
    document.body
  )
);

const CookieSettingsSidebar = ({ open, onClose, onAccept }: { open: boolean; onClose: () => void; onAccept: (personalization: boolean) => void; }) => {
  const [personalization, setPersonalization] = useState<boolean>(hasPersonalizationConsent());

  useEffect(() => {
    if (open) setPersonalization(hasPersonalizationConsent());
  }, [open]);

  return (
    <div className={`fixed inset-0 z-[9999] ${open ? '' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      {/* Panel */}
      <aside className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-gray-200 transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-900)' }}>Privacy settings</h3>
            <button className="btn btn-secondary btn-sm" onClick={onClose} aria-label="Close">Close</button>
          </div>

          <div className="space-y-4 flex-1 overflow-auto">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold" style={{ color: 'var(--text-900)' }}>Necessary Cookies</div>
                  <p className="text-sm" style={{ color: 'var(--text-600)' }}>Required for authentication and core functionality. Always on.</p>
                </div>
                <Toggle checked={true} onChange={() => {}} disabled />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold" style={{ color: 'var(--text-900)' }}>Personalization</div>
                  <p className="text-sm" style={{ color: 'var(--text-600)' }}>Theme and currency preferences.</p>
                </div>
                <Toggle checked={personalization} onChange={setPersonalization} />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2">
            <button className="btn btn-secondary btn-md" onClick={() => onAccept(false)}>Do Not Accept</button>
            <button className="btn btn-primary btn-md" onClick={() => onAccept(personalization)}>I accept cookies</button>
          </div>
        </div>
      </aside>
    </div>
  );
};

const CookieConsent = () => {
  const consent = useMemo(() => getConsent(), []);
  const [showPopup, setShowPopup] = useState(!consent);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Keep popup persistent on navigation until a decision is made
    const sync = () => setShowPopup(!getConsent());
    const handlePopState = () => sync();
    window.addEventListener('popstate', handlePopState);
    // Initial mount sync only
    sync();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const acceptAll = () => {
    saveConsent(true);
    setShowPopup(false);
    setSidebarOpen(false);
  };
  const rejectAll = () => {
    saveConsent(false);
    setShowPopup(false);
    setSidebarOpen(false);
  };

  return (
    <>
      {showPopup && (
        <CookieConsentPopup
          onCustomize={() => { setSidebarOpen(true); setShowPopup(false); }}
          onAcceptAll={acceptAll}
          onRejectAll={rejectAll}
        />
      )}
      {createPortal(
        <CookieSettingsSidebar
          open={sidebarOpen}
          onClose={() => { setSidebarOpen(false); setShowPopup(!getConsent()); }}
          onAccept={(p) => { saveConsent(p); setShowPopup(false); setSidebarOpen(false); }}
        />, document.body)
      }
    </>
  );
};

export default CookieConsent;
