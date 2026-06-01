import React, { useState, useEffect } from 'react';

function Hero({ t }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1));
    }, 8000);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  const slides = [
    { title: t.hero_1_title, text: t.hero_1_text, btn: t.hero_btn_more, vid: "/slideshow1.mp4" },
    { title: t.hero_2_title, text: t.hero_2_text, btn: t.hero_btn_curriculum, vid: "/slideshow2.mp4" },
    { title: t.hero_3_title, text: t.hero_3_text, btn: t.hero_btn_apply, vid: "/slideshow3.mp4" }
  ];

  return (
    <section className="hero-section">
      <div className="slideshow-container">
        {slides.map((slide, index) => (
          <div key={index} className={`slide fade ${currentSlide === index ? 'active-slide' : ''}`} style={{ display: currentSlide === index ? 'block' : 'none' }}>
            <div className="overlay"></div>
            {slide.vid && <video autoPlay muted loop playsInline className="slide-video"><source src={slide.vid} type="video/mp4" /></video>}
            <div className="slide-text">
              <h1>{slide.title}</h1>
              <p>{slide.text}</p>
              <a href="#curriculum" className="btn-primary">{slide.btn}</a>
            </div>
          </div>
        ))}
        <button
          className="hero-arrow hero-prev"
          onClick={() => setCurrentSlide(prev => prev === 0 ? 2 : prev - 1)}
          aria-label="Previous slide"
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        <button
          className="hero-arrow hero-next"
          onClick={() => setCurrentSlide(prev => prev === 2 ? 0 : prev + 1)}
          aria-label="Next slide"
        >
          <i className="fas fa-chevron-right"></i>
        </button>
        <div className="dot-container">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`dot ${currentSlide === index ? 'active-dot' : ''}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`${t.hero_open_slide || 'Открыть слайд'} ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
