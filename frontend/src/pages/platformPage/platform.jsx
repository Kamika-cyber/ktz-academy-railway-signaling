import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import '../../platform.css';
import { apiFetch } from '../../api';
import {
  createPlatformT,
  getInitialPlatformLang,
  normalizePlatformLang,
  rememberPlatformLang,
  startPlatformDomTranslator,
} from '../../platformI18n';

import Sidebar from '../../components/platform/Sidebar';
import Header from '../../components/platform/Header';

import HomeView from './HomeView';
import ProgramView from './ProgramView';
import DirectoryView from './DirectoryView';
import Simulators from './Simulators';
import GradesView from './GradesView';
import ResourcesView from './ResourcesView';
import CertificateView from './CertificateView';

const LOGIN_URL = 'http://127.0.0.1:8000/login/';

const withLang = (url, lang) => {
  const nextUrl = new URL(url, window.location.origin);
  nextUrl.searchParams.set('lang', normalizePlatformLang(lang));
  return nextUrl.toString();
};

const Platform = () => {
  const location = useLocation();
  const [language, setLanguage] = useState(getInitialPlatformLang);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const t = useMemo(
    () => createPlatformT(language, courseData?.ui),
    [language, courseData]
  );

  useEffect(() => {
    rememberPlatformLang(language);
  }, [language]);

  useEffect(() => startPlatformDomTranslator(language), [language, location.pathname, courseData]);

  useEffect(() => {
    let isMounted = true;

    async function loadCourseData() {
      if (!courseData) setLoading(true);

      try {
        const response = await apiFetch(`/api/course-data/?lang=${language}`);

        if (response.status === 401 || response.status === 403) {
          window.location.href = withLang(LOGIN_URL, language);
          return;
        }

        if (!response.ok) {
          throw new Error(`Course data request failed with ${response.status}`);
        }

        const data = await response.json();

        if (!data.authenticated) {
          window.location.href = withLang(LOGIN_URL, language);
          return;
        }

        if (!isMounted) return;
        setCourseData(data);
      } catch (error) {
        console.error('Error loading course data:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCourseData();

    return () => {
      isMounted = false;
    };
  }, [language, refreshKey]);

  const refreshCourseData = () => setRefreshKey((value) => value + 1);

  const sharedProps = { data: courseData, lang: language, t, onDataRefresh: refreshCourseData };

  return (
    <div className="platform-container">
      <Sidebar lang={language} t={t} />
      <main className="main-wrapper">
        <Header language={language} onLanguageChange={setLanguage} t={t} user={courseData?.user} />

        <div className="platform-route-shell">
          {loading ? (
            <div className="content-area">
              <h2 style={{ padding: '20px' }}>{t('loading')}</h2>
            </div>
          ) : (
            <Routes>
              <Route index element={<HomeView {...sharedProps} />} />
              <Route path="program" element={<ProgramView {...sharedProps} />} />
              <Route path="directory" element={<DirectoryView {...sharedProps} />} />
              <Route path="simulators" element={<Simulators {...sharedProps} />} />
              <Route path="grades" element={<GradesView {...sharedProps} />} />
              <Route path="resources" element={<ResourcesView {...sharedProps} />} />
              <Route path="certificate" element={<CertificateView {...sharedProps} />} />
            </Routes>
          )}
        </div>
      </main>
    </div>
  );
};

export default Platform;
