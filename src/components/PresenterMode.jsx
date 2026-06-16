import { useEffect, useState } from 'react';

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export default function PresenterMode({ slide, nextSlide, index, total, onClose, onNext, onPrev }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="overlay presenter-overlay">
      <div className="presenter-top">
        <div>
          <span>وضع المتحدث</span>
          <h2>{slide.title}</h2>
        </div>
        <div className="presenter-meta">
          <strong>{formatTime(seconds)}</strong>
          <span>{index + 1} / {total}</span>
          <button type="button" onClick={onClose}>إغلاق</button>
        </div>
      </div>
      <div className="presenter-grid">
        <section className="notes-panel">
          <h3>ملاحظات المتحدث</h3>
          <p>{slide.speakerNotes}</p>
        </section>
        <aside className="next-panel">
          <h3>الشريحة التالية</h3>
          <p>{nextSlide?.title || 'نهاية العرض'}</p>
          <div className="presenter-buttons">
            <button type="button" onClick={onPrev}>السابق</button>
            <button type="button" onClick={onNext}>التالي</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
