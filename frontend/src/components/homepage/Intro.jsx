import React from 'react';

function Intro({ t }) {
  return (
    <section id="about" className="container intro-flex">
      <div className="video-box">
        <video src="/example.mp4" autoPlay muted loop playsInline className="homepage-autoplay-video" />
      </div>
      <div className="text-box">
        <h2 className="section-title">{t.intro_title}</h2>
        <p>{t.intro_p1}</p>
        <p>{t.intro_p2}</p>
        <a className="btn-secondary" href="/Presentation.pdf" download="KTZ-course-program.pdf">
          <span>{t.btn_download}</span> <i className="fas fa-download"></i>
        </a>
      </div>
    </section>
  );
}

export default Intro;
