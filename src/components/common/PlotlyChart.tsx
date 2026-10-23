import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

interface PlotlyChartProps {
  data: Plotly.Data[];
  layout?: Partial<Plotly.Layout>;
  config?: Partial<Plotly.Config>;
  className?: string;
  chartId?: string;
}

export const PlotlyChart: React.FC<PlotlyChartProps> = ({
  data,
  layout = {},
  config = {},
  className = 'w-full h-80',
  chartId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const textColor = isDarkMode ? '#e2e8f0' : '#1e293b';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const zerolineColor = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)';
    const bgColor = 'transparent';

    const mergedLayout: Partial<Plotly.Layout> = {
      autosize: true,
      paper_bgcolor: bgColor,
      plot_bgcolor: bgColor,
      font: {
        family: 'Plus Jakarta Sans, system-ui, sans-serif',
        color: textColor,
        size: 12,
      },
      colorway: ['#234a80', '#e06d26', '#2b6cb0', '#059669', '#d97706', '#64748b', '#0284c7'],
      margin: { l: 45, r: 25, t: 35, b: 40 },
      xaxis: {
        gridcolor: gridColor,
        zerolinecolor: zerolineColor,
        tickfont: { color: textColor, family: 'JetBrains Mono, monospace' },
        ...(layout.xaxis || {}),
      },
      yaxis: {
        gridcolor: gridColor,
        zerolinecolor: zerolineColor,
        tickfont: { color: textColor, family: 'JetBrains Mono, monospace' },
        ...(layout.yaxis || {}),
      },
      legend: {
        orientation: 'h',
        y: -0.22,
        x: 0,
        font: { color: textColor, size: 11 },
        ...(layout.legend || {}),
      },
      ...layout,
    };

    const mergedConfig: Partial<Plotly.Config> = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['sendChartToCloud', 'hoverClosestCartesian', 'hoverCompareCartesian'] as any,
      toImageButtonOptions: {
        format: 'png',
        filename: chartId ? `grafico_${chartId}` : 'grafico_crai',
        height: 600,
        width: 1000,
        scale: 2,
      },
      ...config,
    };

    Plotly.react(containerRef.current, data, mergedLayout, mergedConfig);

    const handleResize = () => {
      if (containerRef.current) {
        Plotly.Plots.resize(containerRef.current);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, layout, config, isDarkMode, chartId]);

  return <div ref={containerRef} id={chartId} className={className} />;
};
