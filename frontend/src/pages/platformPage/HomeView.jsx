import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomeView({ data, lang, t }) {
  const navigate = useNavigate();
  const apiLeaderboard = data?.learning?.leaderboard || [];
  const leaderboardData = apiLeaderboard.length ? apiLeaderboard : t('home_leaderboard', []);
  const upcomingEvents = t('home_events', []);

  return (
    <div className="content-area animate-fade-in">
      <section className="home-dashboard reveal">
        <div className="welcome-hero-card">
          <div className="hero-text">
            <h1>{t('home_welcome_title')}</h1>
            <p>{t('home_welcome_text')} <strong>{t('home_last_activity')}</strong>.</p>
          </div>
          <button className="continue-action-btn" onClick={() => navigate(`/platform/program?lang=${lang}`)}>
            <span>{t('home_continue')}</span>
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>

        <div className="dashboard-main-grid">
          <div className="dashboard-left-col">
            <div className="dashboard-widget">
              <h3 className="widget-title"><i className="fas fa-bolt"></i> {t('home_recent_activity')}</h3>
              <div className="activity-cards-wrapper">
                <div className="activity-mini-card">
                  <div className="activity-icon success"><i className="fas fa-medal"></i></div>
                  <div className="activity-details">
                    <h4>{t('home_badges_received_title')}</h4>
                    <p>{t('home_badges_received_text')}</p>
                  </div>
                </div>
                <div className="activity-mini-card">
                  <div className="activity-icon warning"><i className="fas fa-pause-circle"></i></div>
                  <div className="activity-details">
                    <h4>{t('home_course_stop_title')}</h4>
                    <p>{t('home_course_stop_text')}</p>
                  </div>
                </div>
                <div className="activity-mini-card">
                  <div className="activity-icon primary"><i className="fas fa-trophy"></i></div>
                  <div className="activity-details">
                    <h4>{t('home_rating_up_title')}</h4>
                    <p>{t('home_rating_up_text')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-widget">
              <h3 className="widget-title"><i className="fas fa-users"></i> {t('home_leaderboard_title')}</h3>
              <div className="leaderboard-table-container">
                <table className="leaderboard-table">
                  <thead>
                    <tr>
                      <th>{t('table_place')}</th>
                      <th>{t('table_participant')}</th>
                      <th>{t('table_points')}</th>
                      <th>{t('table_badges')}</th>
                      <th>{t('table_hours')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.slice(0, 8).map((user) => (
                      <tr key={user.user_id || user.place} className={user.isCurrentUser ? 'current-user-row' : ''}>
                        <td>{user.place <= 3 ? <span className={`rank-badge rank-${user.place}`}>{user.place}</span> : <span className="rank-text">{user.place}</span>}</td>
                        <td className="user-name-cell"><div className="user-avatar"><i className="fas fa-user"></i></div>{user.name}</td>
                        <td><strong>{user.points}</strong></td>
                        <td>{user.badges}</td>
                        <td>{Number(user.hours || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })} {t('hour_short')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="dashboard-right-col">
            <div className="dashboard-widget events-widget">
              <h3 className="widget-title"><i className="fas fa-calendar-alt"></i> {t('home_events_title')}</h3>
              <div className="events-list">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className={`event-card event-${event.type}`}>
                    <div className="event-date"><span>{event.day}</span><small>{event.month}</small></div>
                    <div className="event-info"><h4>{event.title}</h4></div>
                    <div className="event-icon-bg"><i className={event.icon}></i></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomeView;
