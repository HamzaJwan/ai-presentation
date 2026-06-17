import { motion } from 'motion/react';
import { Icon } from './iconMap.jsx';

const comparisonVisuals = {
  6: {
    left: {
      icon: 'FileText',
      label: 'بحث يدوي + ملفات + وقت أطول',
      chips: ['بحث', 'قراءة', 'كتابة']
    },
    right: {
      icon: 'BrainCircuit',
      label: 'مساعد ذكي + مراجعة بشرية',
      chips: ['تلخيص', 'مسودة', 'تحقق']
    },
    takeaway: 'AI يسرّع البداية، لكن الإنسان يراجع ويقرر.'
  },
  7: {
    left: {
      icon: 'MapPinned',
      label: 'القوة = عتاد + موقع + تحليل أبطأ',
      chips: ['معدات', 'حدود', 'خرائط']
    },
    right: {
      icon: 'Network',
      label: 'القوة = بيانات + خوارزميات + تشغيل آمن',
      chips: ['بيانات', 'سحابة', 'سيبراني']
    },
    bridge: 'من العتاد فقط → إلى البيانات والخوارزميات',
    takeaway: 'القوة الحديثة لا تلغي المعدات، لكنها تضيف طبقة قرار مبنية على البيانات والسرعة والسيادة.'
  },
  15: {
    left: {
      icon: 'ShieldCheck',
      label: 'بيانات حساسة داخل بيئة محكومة',
      chips: ['حماية', 'صلاحيات', 'حوكمة']
    },
    right: {
      icon: 'CloudCog',
      label: 'تعلم سريع وتجارب عامة',
      chips: ['سريع', 'عام', 'مرن']
    },
    takeaway: 'مكان تشغيل AI يحدده مستوى حساسية البيانات، لا شهرة الأداة.'
  },
  23: {
    left: {
      icon: 'CloudCog',
      label: 'Cloud وEdge يمنحان مرونة وسرعة بداية أعلى',
      chips: ['Cloud', 'Edge', 'مرونة']
    },
    right: {
      icon: 'LockKeyhole',
      label: 'On‑Prem وAir‑Gapped يمنحان سيطرة وحماية أعلى',
      chips: ['On‑Prem', 'Air‑Gapped', 'سيطرة']
    },
    bridge: 'حساسية البيانات تحدد مكان التشغيل',
    takeaway: 'لا يوجد اختيار واحد صحيح دائمًا؛ نختار البيئة حسب البيانات والزمن والحوكمة.'
  },
  27: {
    left: {
      icon: 'HelpCircle',
      label: 'سؤال عام يعطي نتيجة عامة',
      chips: ['غامض', 'إعادة', 'تخمين']
    },
    right: {
      icon: 'ListChecks',
      label: 'سؤال محدد يعطي نتيجة قابلة للاستخدام',
      chips: ['دور', 'سياق', 'مخرج']
    },
    takeaway: 'كلما كان الطلب أوضح، أصبحت النتيجة أقرب لما نحتاجه.'
  }
};

function ComparisonVisualZone({ config, tone }) {
  return (
    <div className={`comparison-visual-zone ${tone}`}>
      <div className="comparison-big-icon">
        <Icon name={config?.icon || 'Sparkles'} size={96} />
      </div>
      <p>{config?.label || 'الفكرة هنا أن المقارنة ليست بين أدوات فقط، بل بين طريقة عمل كاملة.'}</p>
      <div className="comparison-chips">
        {(config?.chips || ['فكرة', 'سياق', 'قرار']).map((chip) => (
          <span key={chip}>{chip}</span>
        ))}
      </div>
    </div>
  );
}

function Panel({ title, items, tone, visual }) {
  return (
    <motion.div
      className={`comparison-panel ${tone}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <h3>{title}</h3>
      <div className="comparison-rows">
        {items.map((item, index) => (
          <motion.div
            className="comparison-row"
            key={item}
            initial={{ opacity: 0, x: tone === 'warm' ? 18 : -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07, duration: 0.35 }}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <p>{item}</p>
          </motion.div>
        ))}
      </div>
      <ComparisonVisualZone config={visual} tone={tone} />
    </motion.div>
  );
}

export default function ComparisonSlide({ slide }) {
  const visual = comparisonVisuals[slide.id] || {};

  return (
    <div className={`comparison-layout comparison-rich slide-${slide.id}`}>
      <Panel title={slide.leftTitle} items={slide.left} tone="warm" visual={visual.left} />
      <div className="vs-divider">
        <span>مقابل</span>
        {visual.bridge && <em>{visual.bridge}</em>}
      </div>
      <Panel title={slide.rightTitle} items={slide.right} tone="cool" visual={visual.right} />
      <div className="comparison-rule">
        <strong>الخلاصة</strong>
        <span>{visual.takeaway || slide.keyMessage}</span>
      </div>
    </div>
  );
}
