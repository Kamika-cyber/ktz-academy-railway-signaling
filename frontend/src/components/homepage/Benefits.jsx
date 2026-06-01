import React from 'react';

function Benefits({ t }) {
  return (
    <section className="benefits-section full-width reveal active">
      <div className="container text-center">
        <h2 className="section-title text-white">{t.benefits_title}</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <i className="fas fa-laptop-code"></i>
            <h3>{t.benefit_1_title}</h3>
            <p>{t.benefit_1_text}</p>
          </div>
          <div className="benefit-card">
            <i className="fas fa-certificate"></i>
            <h3>{t.benefit_2_title}</h3>
            <p>{t.benefit_2_text}</p>
          </div>
          <div className="benefit-card">
            <i className="fas fa-user-tie"></i>
            <h3>{t.benefit_3_title}</h3>
            <p>{t.benefit_3_text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Benefits;