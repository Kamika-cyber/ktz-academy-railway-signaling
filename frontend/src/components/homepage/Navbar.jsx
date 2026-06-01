import LanguageDropdown from '../LanguageDropdown';

const LOGIN_URL = 'http://127.0.0.1:8000/login/';
const REGISTER_URL = 'http://127.0.0.1:8000/register/';

function Navbar({ lang, setLang, t, activeSection }) {
  if (!t) return null; 

  return (
    <nav className="top-nav">
      <div className="logo">
        KTZ Academy
      </div>
      <div className="nav-links">
        
        <a 
          href="#about" 
          className={activeSection === 'about' ? 'active' : ''}
        >
          {t.nav_about}
        </a>
        <a 
          href="#company" 
          className={activeSection === 'company' ? 'active' : ''}
        >
          {t.nav_company}
        </a>
        
        <div className="nav-item-dropdown">
          <a 
            href="#contact" 
            className={`drop-trigger ${activeSection === 'contact' ? 'active' : ''}`}
          >
            {t.nav_contact}
          </a>
          
          <div className="contact-accordion">
            <div className="contact-details-mini">
              <p><i className="fas fa-phone"></i> +7 (7172) 00-00-00</p>
              <p><i className="fas fa-envelope"></i> ktzacademy@gmail.com</p>
              <p><i className="fas fa-map-marker-alt"></i> {t.contact_address}</p>
            </div>
          </div>
        </div>

      </div>

      <div className="nav-right-actions">
        <div className="nav-auth-links">
          <a href={LOGIN_URL}> {t.nav_login || 'Login'} </a>
          <span className="nav-auth-separator" aria-hidden="true"></span>
          <a href={REGISTER_URL}> {t.nav_register || 'Register'} </a>
        </div>

        <LanguageDropdown
          value={lang}
          onChange={setLang}
          variant="homepage"
          ariaLabel="Homepage language"
          options={[
            { value: 'ru', label: 'RU' },
            { value: 'kk', label: 'KZ' },
            { value: 'en', label: 'EN' },
          ]}
        />
      </div>
    </nav>
  );
}

export default Navbar;
