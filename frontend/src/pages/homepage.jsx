import React, { useState, useEffect } from 'react';
import { translations } from '../translations'; 

// Components
import NavBar from '../components/homepage/Navbar';
import Hero from '../components/homepage/Hero';
import Intro from '../components/homepage/Intro';
import Company from '../components/homepage/Company';
import Benefits from '../components/homepage/Benefits';
import Curriculum from '../components/homepage/Curriculum';
import Instructors from '../components/homepage/Instructors';
import Contact from '../components/homepage/Contact';
import Footer from '../components/homepage/Footer';

const Homepage = () => {
  const [lang, setLang] = useState('ru');
  const [activeSection, setActiveSection] = useState('home');
  
 
  const t = translations[lang] || translations.ru;

  // Logic to handle scroll highlighting for the navbar
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'company', 'contact'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top >= 0 && rect.top <= 300;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      
      <NavBar 
        lang={lang} 
        setLang={setLang} 
        t={t} 
        activeSection={activeSection} 
      />
      <Hero t={t} />
      <Intro t={t} />
      <Benefits t={t} />
      <Curriculum t={t} />
      <Instructors t={t} />
      <Company t={t} />
      <Contact t={t} />
      <Footer t={t} />
    </>
  );
};

export default Homepage;
