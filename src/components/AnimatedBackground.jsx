const nodes = Array.from({ length: 26 }, (_, index) => ({
  id: index,
  x: 8 + ((index * 37) % 86),
  y: 10 + ((index * 23) % 78),
  delay: (index % 7) * 0.35
}));

export default function AnimatedBackground({ enabled = true }) {
  return (
    <div className="animated-bg" aria-hidden="true">
      <div className="grid-layer" />
      {enabled && (
        <>
          <div className="node-layer">
            {nodes.map((node) => (
              <span
                key={node.id}
                className="bg-node"
                style={{
                  right: `${node.x}%`,
                  top: `${node.y}%`,
                  animationDelay: `${node.delay}s`
                }}
              />
            ))}
          </div>
          <div className="scan-line" />
        </>
      )}
    </div>
  );
}
