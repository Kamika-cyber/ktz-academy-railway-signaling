import React from 'react';
import { NavLink } from 'react-router-dom';
import { platformNavItems } from '../../platformI18n';

const Sidebar = ({ lang, t }) => {
  const withLang = (path) => `${path}?lang=${lang}`;

  return (
    <aside className="sidebar platform-sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <i className="fas fa-train"></i>
          <span>KTZ Academy</span>
        </div>
        <small>{t('platform_sidebar_subtitle')}</small>
      </div>
      <div className="sidebar-course-card">
        <span>{t('platform_sidebar_course_label')}</span>
        <strong>{t('platform_sidebar_course_name')}</strong>
        <div className="sidebar-progress"><span style={{ width: '40%' }}></span></div>
      </div>
      <nav className="sidebar-nav">
        {platformNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={withLang(item.to)}
            end={item.end}
            className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <i className={item.icon}></i>
            <span>{t(item.key)}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
