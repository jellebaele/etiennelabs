'use client';

import mermaid from 'mermaid';
import { useEffect, useRef } from 'react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  themeVariables: {
    background: 'hsl(var(--background))',
  },
});

const Mermaid = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = chart;

      mermaid.run({ nodes: [ref.current] }).catch((err) => {
        console.error('Mermaid rendering failed:', err);
      });
    }
  }, [chart]);

  return (
    <div className='mermaid-container'>
      <div
        className='mermaid'
        ref={ref}
      />
    </div>
  );
};

export default Mermaid;
