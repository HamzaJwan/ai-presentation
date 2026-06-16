export default function ProgressBar({ index, total }) {
  const percent = total <= 1 ? 100 : ((index + 1) / total) * 100;
  return (
    <div className="progress-shell" aria-label="مؤشر التقدم">
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
