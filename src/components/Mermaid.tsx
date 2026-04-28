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

  useEffect(() => {
    if (!ref.current) return;

    const renderChart = async () => {
      try {
        const mermaidId = `mermaid-${new Date().getTime()}`;
        const { svg } = await mermaid.render(mermaidId, chart);

        ref.current!.innerHTML = svg;
      } catch (err) {
        console.error('Mermaid rendering failed:', err);
      }
    };

    renderChart();
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
