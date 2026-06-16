export default function OverviewMode({ slides, currentIndex, mediaMap = {}, showEditorTools = false, onJump, onEditMedia, onClose }) {
  return (
    <div className="overlay overview-overlay">
      <div className="overlay-header">
        <h2>عرض كل الشرائح</h2>
        <button type="button" onClick={onClose}>إغلاق</button>
      </div>
      <div className="overview-grid">
        {slides.map((slide, index) => (
          <button
            type="button"
            className={`overview-card ${index === currentIndex ? 'active' : ''}`}
            key={slide.id}
            onClick={() => onJump(index)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <small>{slide.section}</small>
            <strong>{slide.title}</strong>
            <p>{slide.keyMessage}</p>
            <em>
              {mediaMap[`slide-${String(slide.id).padStart(2, '0')}-main`] || slide.mediaSlots
                ? 'تدعم وسائط'
                : 'بدون وسائط'}
            </em>
            {showEditorTools && (
              <i
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  onEditMedia?.(slide.id);
                }}
              >
                تعديل الوسائط
              </i>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
