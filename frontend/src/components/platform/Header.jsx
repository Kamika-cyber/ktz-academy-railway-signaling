import { useLocation, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../api';
import LanguageDropdown from '../LanguageDropdown';
import { routeTitleKeys } from '../../platformI18n';

const initialsFromName = (name) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U';
};

const Header = ({ language, onLanguageChange, t, user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await apiFetch('/api/logout/', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      navigate(`/?lang=${language}`);
    }
  };

  const title = t(routeTitleKeys[location.pathname] || 'platform_title');
  const userName = user?.display_name || user?.displayName || user?.username || t('user_name');
  const userInitials = user?.initials || initialsFromName(userName) || t('user_initials');

  return (
    <header className="header navbar platform-topbar">
      <div className="header-left">
        <div className="breadcrumb">{title}</div>
        <div className="course-badge"><i className="fas fa-train"></i> {t('platform_course_badge')}</div>
      </div>
      <div className="platform-top-actions">
        <LanguageDropdown
          value={language}
          onChange={onLanguageChange}
          variant="platform"
          ariaLabel="Platform language"
        />
        <div className="user-profile">
          <div className="avatar">{userInitials}</div>
          <span>{userName}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> {t('logout')}
        </button>
      </div>
    </header>
  );
};

export default Header;
