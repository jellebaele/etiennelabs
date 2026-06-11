'use client';

import mermaid from 'mermaid';
import { useEffect, useRef } from 'react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

const Mermaid = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 11)}`);

  useEffect(() => {
    if (!ref.current) return;

    let isCurrent = true;

    const renderChart = async () => {
      try {
        if (ref.current) ref.current.innerHTML = '';
        const { svg } = await mermaid.render(idRef.current, chart);

        if (isCurrent && ref.current) ref.current!.innerHTML = svg;
      } catch (err) {
        console.error('Mermaid rendering failed:', err);
      }
    };

    renderChart();

    return () => {
      isCurrent = false;
    };
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
