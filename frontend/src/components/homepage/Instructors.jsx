import React, { useState } from 'react';

const InstructorCard = ({ name, bioMain, bioMore, btnReadMore, btnHide, avatar }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="instructor-card">
      <div className="instructor-avatar-frame">
        <img src={avatar} alt={name} className="instructor-photo" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      </div>
      <h3>{name}</h3>
      <p>{bioMain} {isExpanded && bioMore}</p>
      <button className="read-more-btn" onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? btnHide : btnReadMore}
      </button>
    </div>
  );
};

function Instructors({ t }) {
  return (
    <section className="container instructors-section">
      <h2 className="section-title centered">{t.inst_title}</h2>
      <div className="instructor-grid">
        <InstructorCard avatar="/Kamila.png" name={t.inst_1_name} bioMain={t.inst_1_bio_main} bioMore={t.inst_1_bio_more} btnReadMore={t.btn_read_more} btnHide={t.btn_hide} />
        <InstructorCard avatar="/Takhmina.png" name={t.inst_2_name} bioMain={t.inst_2_bio_main} bioMore={t.inst_2_bio_more} btnReadMore={t.btn_read_more} btnHide={t.btn_hide} />
      </div>
    </section>
  );
}

export default Instructors;
