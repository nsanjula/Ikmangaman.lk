export default function Footer() {
  return (
    <footer className="py-9" style={{ background: '#0B1220', color: '#94A3B8' }}>
      <div className="container iframe-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--primary-600)' }}>
              Ikmangamn.lk
            </h3>
            <p className="text-sm mb-6 max-w-xs">
              Your trusted companion for discovering the beautiful island of Sri
              Lanka with personalized recommendations.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="transition-colors duration-150"
                style={{ color: '#64748B' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--primary-600)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#64748B'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a2.999 2.999 0 0 0-2.114-2.117C19.743 3.5 12 3.5 12 3.5s-7.743 0-9.384.569A3 3 0 0 0 .502 6.186C0 7.833 0 12 0 12s0 4.167.502 5.814a2.999 2.999 0 0 0 2.114 2.117C4.257 20.5 12 20.5 12 20.5s7.743 0 9.384-.569a2.999 2.999 0 0 0 2.114-2.117C24 16.167 24 12 24 12s0-4.167-.502-5.814zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
                </svg>
              </a>
              <a
                href="#"
                className="transition-colors duration-150"
                style={{ color: '#64748B' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--primary-600)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#64748B'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm5.25-.75a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                </svg>
              </a>
              <a
                href="#"
                className="transition-colors duration-150"
                style={{ color: '#64748B' }}
                onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--primary-600)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#64748B'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.406.593 24 1.325 24h11.49v-9.294H9.692v-3.622h3.123V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.796.143v3.24l-1.919.001c-1.504 0-1.796.715-1.796 1.763v2.312h3.591l-.467 3.622h-3.124V24h6.127C23.406 24 24 23.406 24 22.675V1.325C24 .593 23.406 0 22.675 0z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: 'white' }}>Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm transition-colors duration-150"
                  style={{ color: '#64748B' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--primary-600)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#64748B'}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm transition-colors duration-150"
                  style={{ color: '#64748B' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--primary-600)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#64748B'}
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm transition-colors duration-150"
                  style={{ color: '#64748B' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--primary-600)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#64748B'}
                >
                  Destinations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm transition-colors duration-150"
                  style={{ color: '#64748B' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--primary-600)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#64748B'}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: 'white' }}>Legal</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm transition-colors duration-150"
                  style={{ color: '#64748B' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--primary-600)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#64748B'}
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm transition-colors duration-150"
                  style={{ color: '#64748B' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--primary-600)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#64748B'}
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm transition-colors duration-150"
                  style={{ color: '#64748B' }}
                  onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'var(--primary-600)'}
                onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#64748B'}
                >
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-9 pt-6 text-center" style={{ borderColor: '#334155' }}>
          <p className="text-sm" style={{ color: '#64748B' }}>
            © 2024 Ikmangamn.lk. All rights reserved. Made with ❤️ for Sri Lanka travelers.
          </p>
        </div>
      </div>
    </footer>
  );
}
