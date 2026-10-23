import React from 'react';
import { CatalogadoKohaSIU, MESES_CORTO } from '../../../types';
import { KPICard } from '../../common/KPICard';
import { PlotlyChart } from '../../common/PlotlyChart';
import { BookOpen, RefreshCw, CheckCircle, BarChart3 } from 'lucide-react';

interface S210Props {
  data: CatalogadoKohaSIU;
  onChange: (data: CatalogadoKohaSIU) => void;
  year: number;
}

export const S210_CatalogadoKoha: React.FC<S210Props> = ({ data, onChange, year }) => {
  const totCatalogado = data.catalogadoMes.reduce((a, b) => a + (Number(b) || 0), 0);
  const totEnProceso = data.enProcesoMes.reduce((a, b) => a + (Number(b) || 0), 0);
  const promCatalogado = (totCatalogado / 12).toFixed(1);
  const promEnProceso = (totEnProceso / 12).toFixed(1);

  const handleMonthChange = (serie: 'catalogadoMes' | 'enProcesoMes', mIdx: number, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = {
      ...data,
      [serie]: [...data[serie]],
    };
    updated[serie][mIdx] = num;
    onChange(updated);
  };

  const handleTextChange = (field: 'notaExplicativa' | 'analisisCualitativo' | 'conclusiones', text: string) => {
    onChange({
      ...data,
      [field]: text,
    });
  };

  const chartData: Plotly.Data[] = [
    {
      x: [...MESES_CORTO],
      y: data.catalogadoMes,
      name: 'Catalogado en el Mes',
      type: 'bar',
      marker: { color: '#6366f1' },
    },
    {
      x: [...MESES_CORTO],
      y: data.enProcesoMes,
      name: 'En Proceso Físico',
      type: 'bar',
      marker: { color: '#f59e0b' },
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Catalogado en KOHA"
          value={totCatalogado}
          subtitle={`Registros completados en ${year}`}
          meta="Catálogo en línea OPAC"
          icon={CheckCircle}
        />
        <KPICard
          title="Promedio Mensual Catalogado"
          value={promCatalogado}
          subtitle="Registros procesados por mes"
          meta="Rendimiento de procesamiento técnico"
          icon={BarChart3}
        />
        <KPICard
          title="Total en Proceso Físico"
          value={totEnProceso}
          subtitle="Material pendiente de etiquetado/sala"
          meta="Flujo continuo de adquisiciones"
          icon={RefreshCw}
        />
        <KPICard
          title="Promedio en Proceso"
          value={promEnProceso}
          subtitle="Ítems mensuales en transición"
          meta="Eficiencia operativa"
          icon={BookOpen}
        />
      </div>

      {/* Matriz Mensual KOHA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            2.10 Procesamiento Técnico y Catalogación en KOHA ({year})
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registro mensual de material bibliográfico ingresado al sistema integrado de gestión bibliotecaria
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                <th className="px-3 py-2.5 whitespace-nowrap">Concepto</th>
                {MESES_CORTO.map((m) => (
                  <th key={m} className="px-1.5 py-2.5 text-center w-14">
                    {m}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right font-bold w-24">TOTAL ANUAL</th>
                <th className="px-3 py-2.5 text-right font-bold w-20">PROMEDIO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="px-3 py-2 font-medium text-indigo-700 dark:text-indigo-400">
                  Total catalogado en el mes
                </td>
                {data.catalogadoMes.map((val, mIdx) => (
                  <td key={mIdx} className="px-1 py-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={val}
                      onChange={(e) => handleMonthChange('catalogadoMes', mIdx, e.target.value)}
                      className="w-12 text-center py-1 px-0.5 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-indigo-500 rounded font-mono tabular-nums text-slate-700 dark:text-slate-300"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-bold font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
                  {totCatalogado.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                  {promCatalogado}
                </td>
              </tr>

              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="px-3 py-2 font-medium text-amber-700 dark:text-amber-400">
                  Total en proceso físico
                </td>
                {data.enProcesoMes.map((val, mIdx) => (
                  <td key={mIdx} className="px-1 py-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={val}
                      onChange={(e) => handleMonthChange('enProcesoMes', mIdx, e.target.value)}
                      className="w-12 text-center py-1 px-0.5 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-amber-500 rounded font-mono tabular-nums text-slate-700 dark:text-slate-300"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-bold font-mono tabular-nums text-amber-700 dark:text-amber-400">
                  {totEnProceso.toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                  {promEnProceso}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico Comparativo KOHA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
          Catalogado vs En Proceso Físico (Mensual)
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Comparativo mensual de carga técnica en biblioteca
        </p>
        <PlotlyChart
          data={chartData}
          layout={{ barmode: 'group', margin: { l: 45, r: 20, t: 20, b: 40 } }}
          className="w-full h-72"
          chartId="koha_mensual_barras"
        />
      </div>

      {/* Notas Cualitativas y Conclusiones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <label className="font-semibold text-slate-900 dark:text-white block mb-2">Nota Explicativa:</label>
          <textarea
            rows={4}
            value={data.notaExplicativa || ''}
            onChange={(e) => handleTextChange('notaExplicativa', e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg resize-y focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Comentarios sobre el comportamiento del flujo..."
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <label className="font-semibold text-slate-900 dark:text-white block mb-2">Análisis Cualitativo:</label>
          <textarea
            rows={4}
            value={data.analisisCualitativo || ''}
            onChange={(e) => handleTextChange('analisisCualitativo', e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg resize-y focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Factores que incidieron en el rendimiento..."
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <label className="font-semibold text-slate-900 dark:text-white block mb-2">Conclusiones:</label>
          <textarea
            rows={4}
            value={data.conclusiones || ''}
            onChange={(e) => handleTextChange('conclusiones', e.target.value)}
            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border rounded-lg resize-y focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Conclusiones para el informe anual..."
          />
        </div>
      </div>
    </div>
  );
};
