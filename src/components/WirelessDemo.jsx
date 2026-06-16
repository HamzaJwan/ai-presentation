import { useMemo, useState } from 'react';

const presets = {
  '5GHz Backhaul': {
    frequency: 5800,
    distance: 5,
    txPower: 20,
    txGain: 16,
    rxGain: 16,
    txLoss: 1,
    rxLoss: 1,
    sensitivity: -82,
    fadeMargin: 15
  },
  '2.4GHz Indoor': {
    frequency: 2400,
    distance: 0.08,
    txPower: 17,
    txGain: 3,
    rxGain: 2,
    txLoss: 0.5,
    rxLoss: 0.5,
    sensitivity: -75,
    fadeMargin: 10
  },
  'Rural Outdoor': {
    frequency: 5200,
    distance: 12,
    txPower: 24,
    txGain: 23,
    rxGain: 23,
    txLoss: 2,
    rxLoss: 2,
    sensitivity: -84,
    fadeMargin: 20
  }
};

const fields = [
  ['frequency', 'Frequency MHz', 'MHz'],
  ['distance', 'Distance km', 'km'],
  ['txPower', 'Tx Power dBm', 'dBm'],
  ['txGain', 'Tx Antenna Gain dBi', 'dBi'],
  ['rxGain', 'Rx Antenna Gain dBi', 'dBi'],
  ['txLoss', 'Tx Loss dB', 'dB'],
  ['rxLoss', 'Rx Loss dB', 'dB'],
  ['sensitivity', 'Receiver Sensitivity dBm', 'dBm'],
  ['fadeMargin', 'Desired Fade Margin dB', 'dB']
];

function statusFor(margin, desiredFadeMargin) {
  if (margin >= desiredFadeMargin + 15) return ['ممتاز', 'excellent'];
  if (margin >= desiredFadeMargin) return ['جيد', 'good'];
  if (margin >= 0) return ['قريب من الحد', 'border'];
  if (margin >= -10) return ['ضعيف', 'weak'];
  return ['غير مناسب', 'poor'];
}

function recommendations(margin, desiredFadeMargin) {
  if (margin >= desiredFadeMargin) {
    return 'الهامش مناسب تعليميًا. راجع العوائق والتداخلات وجودة التركيب قبل اعتماد تصميم حقيقي.';
  }

  return 'الهامش أقل من المطلوب. جرّب تقليل المسافة أو الفواقد، أو زيادة كسب الهوائيات، أو تحسين حساسية المستقبل.';
}

export default function WirelessDemo() {
  const [values, setValues] = useState(presets['5GHz Backhaul']);

  const result = useMemo(() => {
    const frequency = Number(values.frequency);
    const distance = Number(values.distance);
    const txPower = Number(values.txPower);
    const txGain = Number(values.txGain);
    const rxGain = Number(values.rxGain);
    const txLoss = Number(values.txLoss);
    const rxLoss = Number(values.rxLoss);
    const sensitivity = Number(values.sensitivity);
    const desiredFadeMargin = Number(values.fadeMargin);

    if ([frequency, distance].some((value) => !Number.isFinite(value) || value <= 0)) {
      return { error: 'يجب أن يكون التردد والمسافة أكبر من صفر.' };
    }

    const fspl = 32.44 + 20 * Math.log10(distance) + 20 * Math.log10(frequency);
    const eirp = txPower + txGain - txLoss;
    const received = txPower + txGain + rxGain - txLoss - rxLoss - fspl;
    const margin = received - sensitivity;
    const [status, className] = statusFor(margin, desiredFadeMargin);

    return {
      fspl,
      eirp,
      received,
      margin,
      status,
      className,
      interpretation: `القدرة المستقبلة تساوي ${received.toFixed(2)} dBm، والهامش فوق حساسية المستقبل يساوي ${margin.toFixed(2)} dB.`,
      recommendations: recommendations(margin, desiredFadeMargin)
    };
  }, [values]);

  const gauge = result.error ? 0 : Math.max(0, Math.min(100, ((result.margin + 20) / 55) * 100));

  return (
    <div className="wireless-demo">
      <div className="preset-row">
        {Object.entries(presets).map(([name, preset]) => (
          <button type="button" key={name} onClick={() => setValues(preset)}>
            {name}
          </button>
        ))}
      </div>

      <div className="demo-grid">
        <div className="demo-inputs">
          {fields.map(([key, label, unit]) => (
            <label key={key}>
              <span>{label}</span>
              <div className="demo-input-wrap">
                <input
                  type="number"
                  step="any"
                  value={values[key]}
                  onChange={(event) => setValues({ ...values, [key]: event.target.value })}
                />
                <em>{unit}</em>
              </div>
            </label>
          ))}
        </div>

        <div className="demo-output">
          {result.error ? (
            <p className="demo-error">{result.error}</p>
          ) : (
            <>
              <div className="wireless-visual-card">
                <img src="/media/downloaded/slide-22-wireless-link-budget.svg" alt="Wireless point to point link diagram" />
              </div>
              <div className="gauge">
                <div className="gauge-fill" style={{ width: `${gauge}%` }} />
              </div>
              <div className="metric-grid">
                <div><span>FSPL</span><strong>{result.fspl.toFixed(2)} dB</strong></div>
                <div><span>EIRP</span><strong>{result.eirp.toFixed(2)} dBm</strong></div>
                <div><span>Received Power</span><strong>{result.received.toFixed(2)} dBm</strong></div>
                <div><span>Link Margin</span><strong>{result.margin.toFixed(2)} dB</strong></div>
              </div>
              <div className={`demo-status ${result.className}`}>{result.status}</div>
              <p className="ai-interpretation">{result.interpretation}</p>
              <p className="ai-interpretation">{result.recommendations}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
