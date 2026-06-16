import { motion } from 'motion/react';
import { Icon } from './iconMap.jsx';

export default function GlassCard({ card, index = 0, large = false }) {
  return (
    <motion.article
      className={`glass-card ${large ? 'large' : ''}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index, duration: 0.45, ease: 'easeOut' }}
    >
      <div className="card-icon">
        <Icon name={card.icon} />
      </div>
      <div>
        <h3>{card.title}</h3>
        <p>{card.body}</p>
      </div>
    </motion.article>
  );
}
