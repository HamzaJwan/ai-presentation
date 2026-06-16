import { motion } from 'motion/react';

function Panel({ title, items, tone }) {
  return (
    <motion.div className={`comparison-panel ${tone}`} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <h3>{title}</h3>
      <div className="comparison-rows">
        {items.map((item, index) => (
          <div className="comparison-row" key={item}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <p>{item}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function ComparisonSlide({ slide }) {
  return (
    <div className="comparison-layout">
      <Panel title={slide.leftTitle} items={slide.left} tone="warm" />
      <div className="vs-divider">مقابل</div>
      <Panel title={slide.rightTitle} items={slide.right} tone="cool" />
    </div>
  );
}
