import { hasPersonalizationConsent, setCookie } from "../utils/cookies";

interface Props {
  theme: 'light' | 'dark';
  onToggle: () => void;
  className?: string;
}

const ThemeToggleButton: React.FC<Props> = ({ theme, onToggle, className }) => {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => {
        onToggle();
        const next = isDark ? 'light' : 'dark';
        if (hasPersonalizationConsent()) setCookie('pref_theme', next, 365);
      }}
      aria-label="Toggle theme"
      title="Toggle dark/light mode"
      className={`theme-toggle ${isDark ? 'theme-toggle--dark' : ''} ${className || ''}`}
    >
      <span aria-hidden className="theme-toggle__icon">
        <span className="theme-toggle__crescent" />
      </span>
    </button>
  );
};

export default ThemeToggleButton;
