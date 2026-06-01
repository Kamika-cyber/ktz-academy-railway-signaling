import React from 'react';

function Contact({ t }) {
  return (
    <section id="contact" className="contact-section full-width reveal active">
      <div className="container contact-flex">
        <div className="contact-info">
          <h2>{t.contact_title}</h2>
          <p>{t.contact_p1}</p>
          <div className="contact-details">
            <p><i className="fas fa-map-marker-alt"></i> <span>{t.contact_address}</span></p>
            <p><i className="fas fa-phone-alt"></i> +7 (7172) 00-00-00</p>
            <p><i className="fas fa-envelope"></i> ktzacademy@gmail.com</p>
          </div>
        </div>

        <div className="contact-map-container">
          <a
            href="https://2gis.kz/astana/firm/70000001028257400?m=71.421741%2C51.131644%2F15.95"
            target="_blank"
            rel="noopener noreferrer"
            className="map-wrapper"
          >
            <div className="map-preview">
              <iframe
                title="KTZ Academy map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=71.401741%2C51.121644%2C71.441741%2C51.141644&layer=mapnik&marker=51.131644%2C71.421741"
                loading="lazy"
              />
              <span className="map-open-badge"><i className="fas fa-location-arrow"></i> {t.map_open || 'Открыть карту'}</span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Contact;
