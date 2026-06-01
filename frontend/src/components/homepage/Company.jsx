import React from 'react';

function Company({ t }) {
  const openHistory = () => {
    const target = document.getElementById('curriculum');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="company" className="company-section full-width reveal active">
      <div className="container company-flex">
        <div className="company-text-box">
          <h2 className="section-title">{ t.company_title }</h2>
          <p>{ t.company_p1 }</p>
          <p>{ t.company_p2 }</p>
          <button className="btn-primary" onClick={openHistory}>{ t.btn_history}</button>
        </div>
        <div className="company-image-box">
          <video src="/railway1.mp4" autoPlay muted loop playsInline className="homepage-autoplay-video" />
        </div>
      </div>
    </section>
  );
}

export default Company;
