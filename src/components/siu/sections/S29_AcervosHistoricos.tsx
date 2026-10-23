import React, { useState } from 'react';
import { AcervoHistoricoSIU, MESES_CORTO } from '../../../types';
import { KPICard } from '../../common/KPICard';
import { PlotlyChart } from '../../common/PlotlyChart';
import { History, FileText, Users, BookOpen } from 'lucide-react';

interface S29Props {
  items: AcervoHistoricoSIU[];
  onChange: (items: AcervoHistoricoSIU[]) => void;
  year: number;
}

export const S29_AcervosHistoricos: React.FC<S29Props> = ({ items, onChange, year }) => {
  const [metricType, setMetricType] = useState<'titulos' | 'paginas'>('titulos');

  const calculateRowTotal = (meses: number[]) => meses.reduce((a, b) => a + (Number(b) || 0), 0);

  const totTitulos = items.reduce((sum, i) => sum + calculateRowTotal(i.titulosMes), 0);
  const totPaginas = items.reduce((sum, i) => sum + calculateRowTotal(i.paginasMes), 0);
  const totInvestigadores = items.reduce((sum, i) => sum + (Number(i.atencionInvestigadores) || 0), 0);

  const handleCellChange = (
    serie: 'titulosMes' | 'paginasMes',
    rIdx: number,
    mIdx: number,
    val: string
  ) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = [...items];
    const list = [...updated[rIdx][serie]];
    list[mIdx] = num;
    updated[rIdx] = { ...updated[rIdx], [serie]: list };
    onChange(updated);
  };

  const handleInvestigadoresChange = (rIdx: number, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = [...items];
    updated[rIdx] = { ...updated[rIdx], atencionInvestigadores: num };
    onChange(updated);
  };

  // Barras apiladas por procedencia
  const activeSerie = metricType === 'titulos' ? 'titulosMes' : 'paginasMes';
  const stackedChartData: Plotly.Data[] = items.map((i) => ({
    x: [...MESES_CORTO],
    y: i[activeSerie],
    name: i.procedencia,
    type: 'bar',
  }));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Títulos Digitalizados"
          value={totTitulos}
          subtitle={`Total procesado en ${year}`}
          meta="Acervos y colecciones especiales"
          icon={BookOpen}
        />
        <KPICard
          title="Páginas Digitalizadas"
          value={totPaginas.toLocaleString()}
          subtitle="Preservación documental histórica"
          meta={`Promedio: ${Math.round(totPaginas / 12).toLocaleString()} págs/mes`}
          icon={FileText}
        />
        <KPICard
          title="Atención a Investigadores"
          value={totInvestigadores}
          subtitle="Consultas especializadas en sala"
          meta="Investigadores nacionales y extranjeros"
          icon={Users}
        />
      </div>

      {/* Selector de Métrica */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-sm">
        <button
          type="button"
          onClick={() => setMetricType('titulos')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-center ${
            metricType === 'titulos'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Títulos Digitalizados
        </button>
        <button
          type="button"
          onClick={() => setMetricType('paginas')}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors text-center ${
            metricType === 'paginas'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Páginas Digitalizadas
        </button>
      </div>

      {/* Matriz Mensual de Acervos */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            2.9 {metricType === 'titulos' ? 'Títulos' : 'Páginas'} Digitalizados por Procedencia ({year})
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Archivos históricos del conflicto armado, hemeroteca, tesis y colecciones patrimoniales
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                <th className="px-3 py-2.5 whitespace-nowrap">Procedencia / Fondo</th>
                {MESES_CORTO.map((m) => (
                  <th key={m} className="px-1.5 py-2.5 text-center w-14">
                    {m}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right font-bold w-24">TOTAL ANUAL</th>
                <th className="px-3 py-2.5 text-center w-28">Investigadores</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {items.map((i, rIdx) => {
                const mesesArr = metricType === 'titulos' ? i.titulosMes : i.paginasMes;
                const rowTot = calculateRowTotal(mesesArr);
                return (
                  <tr key={i.id || rIdx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">
                      {i.procedencia}
                    </td>
                    {mesesArr.map((val, mIdx) => (
                      <td key={mIdx} className="px-1 py-1 text-center">
                        <input
                          type="number"
                          min="0"
                          value={val}
                          onChange={(e) => handleCellChange(activeSerie, rIdx, mIdx, e.target.value)}
                          className="w-12 text-center py-1 px-0.5 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-indigo-500 rounded font-mono tabular-nums text-slate-700 dark:text-slate-300"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right font-bold font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
                      {rowTot.toLocaleString()}
                    </td>
                    <td className="px-2 py-1 text-center">
                      <input
                        type="number"
                        min="0"
                        value={i.atencionInvestigadores}
                        onChange={(e) => handleInvestigadoresChange(rIdx, e.target.value)}
                        className="w-16 text-center py-1 bg-slate-50 dark:bg-slate-800 border rounded font-mono tabular-nums"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/90 font-bold border-t-2 text-slate-900 dark:text-white">
                <td className="px-3 py-2.5">Total General</td>
                {MESES_CORTO.map((_, mIdx) => {
                  const mSum = items.reduce(
                    (acc, row) => acc + (Number(metricType === 'titulos' ? row.titulosMes[mIdx] : row.paginasMes[mIdx]) || 0),
                    0
                  );
                  return (
                    <td key={mIdx} className="px-1.5 py-2.5 text-center font-mono tabular-nums">
                      {mSum.toLocaleString()}
                    </td>
                  );
                })}
                <td className="px-3 py-2.5 text-right font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
                  {(metricType === 'titulos' ? totTitulos : totPaginas).toLocaleString()}
                </td>
                <td className="px-2 py-2.5 text-center font-mono tabular-nums text-slate-700 dark:text-slate-300">
                  {totInvestigadores}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Gráfico de Barras Apiladas por Procedencia */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
          Digitalización Mensual de Acervos Históricos ({metricType === 'titulos' ? 'Títulos' : 'Páginas'})
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Comportamiento mensual de preservación por procedencia documental
        </p>
        <PlotlyChart
          data={stackedChartData}
          layout={{ barmode: 'stack', margin: { l: 45, r: 20, t: 20, b: 40 } }}
          className="w-full h-80"
          chartId="acervos_stacked_bar"
        />
      </div>
    </div>
  );
};
