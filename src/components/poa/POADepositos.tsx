import React from 'react';
import { DepositosMensualesPOA, MESES_CORTO, MESES_COMPLETO } from '../../types';
import { KPICard } from '../common/KPICard';
import { PlotlyChart } from '../common/PlotlyChart';
import { TrendingUp, Calendar, CheckSquare, Target } from 'lucide-react';

interface POADepositosProps {
  depositos: DepositosMensualesPOA;
  onChange: (depositos: DepositosMensualesPOA) => void;
  year: number;
}

const DEFAULT_PROYECCION_SIGUIENTE = [0, 0, 1, 1, 1, 2, 2, 1, 2, 2, 1, 0];

export const POADepositos: React.FC<POADepositosProps> = ({ depositos, onChange, year }) => {
  const totBase = depositos.lineaBase.reduce((a, b) => a + (Number(b) || 0), 0);
  const totProy = depositos.proyeccion.reduce((a, b) => a + (Number(b) || 0), 0);
  const totRes = depositos.resultados.reduce((a, b) => a + (Number(b) || 0), 0);

  // Proyección para el año siguiente (ej. 2027) con fallback seguro
  const proySiguiente =
    Array.isArray(depositos.proyeccionSiguiente) && depositos.proyeccionSiguiente.length === 12
      ? depositos.proyeccionSiguiente
      : DEFAULT_PROYECCION_SIGUIENTE;

  const totProySig = proySiguiente.reduce((a, b) => a + (Number(b) || 0), 0);

  // Acumulados mensuales para resultados y proyección
  const acumProy: number[] = [];
  const acumRes: number[] = [];
  let sP = 0;
  let sR = 0;
  for (let i = 0; i < 12; i++) {
    sP += Number(depositos.proyeccion[i]) || 0;
    sR += Number(depositos.resultados[i]) || 0;
    acumProy.push(sP);
    acumRes.push(sR);
  }

  const handleCellChange = (
    serie: 'lineaBase' | 'proyeccion' | 'resultados' | 'proyeccionSiguiente',
    monthIdx: number,
    val: string
  ) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const currentList =
      Array.isArray(depositos[serie]) && depositos[serie]!.length === 12
        ? [...depositos[serie]!]
        : serie === 'proyeccionSiguiente'
        ? [...DEFAULT_PROYECCION_SIGUIENTE]
        : new Array(12).fill(0);

    currentList[monthIdx] = num;

    const updated: DepositosMensualesPOA = {
      ...depositos,
      proyeccionSiguiente: serie === 'proyeccionSiguiente' ? currentList : proySiguiente,
      [serie]: currentList,
    };
    onChange(updated);
  };

  // Gráfico de líneas Plotly: mensual, proyección siguiente en amarillo y acumulado con colores institucionales
  const chartLinesData: Plotly.Data[] = [
    {
      x: [...MESES_CORTO],
      y: depositos.proyeccion,
      name: `Proyección (${year})`,
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#234a80', width: 2.5, dash: 'dash' },
      marker: { size: 6, color: '#234a80' },
    },
    {
      x: [...MESES_CORTO],
      y: depositos.resultados,
      name: `Resultados (${year})`,
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#e06d26', width: 3 },
      marker: { size: 7, color: '#e06d26' },
    },
    {
      x: [...MESES_CORTO],
      y: proySiguiente,
      name: `Proyección (${year + 1})`,
      type: 'scatter',
      mode: 'lines+markers',
      line: { color: '#eab308', width: 2.8, dash: 'dot' }, // Línea de tendencia en amarillo
      marker: { size: 7, color: '#eab308', symbol: 'diamond', line: { color: '#ca8a04', width: 1 } },
    },
    {
      x: [...MESES_CORTO],
      y: acumRes,
      name: `Acumulado Observado (${year})`,
      type: 'scatter',
      mode: 'lines',
      line: { color: '#3b82f6', width: 2 },
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Proyección Anual"
          value={totProy}
          subtitle={`Planificado para ${year}`}
          meta={`Base anterior: ${totBase}`}
          icon={Calendar}
        />
        <KPICard
          title="Total Resultados Observados"
          value={totRes}
          subtitle={`Depósitos acumulados ${year}`}
          meta={totRes >= totProy ? 'Meta alcanzada' : `Restan ${totProy - totRes}`}
          icon={CheckSquare}
          badge={{
            text: `${totProy > 0 ? ((totRes / totProy) * 100).toFixed(1) : 0}% avance`,
            variant: totRes >= totProy ? 'success' : 'warning',
          }}
        />
        <KPICard
          title={`Proyección Meta ${year + 1}`}
          value={totProySig}
          subtitle={`Proyectado para ${year + 1}`}
          meta={totProySig >= totProy ? `+${totProySig - totProy} vs ${year}` : `${totProySig - totProy} vs ${year}`}
          icon={Target}
          badge={{
            text: `Meta ${year + 1}`,
            variant: 'warning',
          }}
        />
        <KPICard
          title="Mes con Mayor Depósito"
          value={
            depositos.resultados.some((v) => v > 0)
              ? MESES_COMPLETO[depositos.resultados.indexOf(Math.max(...depositos.resultados))]
              : 'Sin registros'
          }
          subtitle={`Máximo: ${Math.max(...depositos.resultados)} depósitos`}
          icon={TrendingUp}
        />
      </div>

      {/* Matriz Mensual Editable */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">
            1.3 Depósito Mensual de Investigaciones en Micelio
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Haga clic en las celdas numéricas de cada mes para actualizar. La fila amarilla corresponde a la proyección del {year + 1}. La columna de Total Anual y los gráficos se recalculan en tiempo real.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                <th className="px-3 py-2.5 whitespace-nowrap">Serie / Concepto</th>
                {MESES_CORTO.map((m) => (
                  <th key={m} className="px-2 py-2.5 text-center w-16">
                    {m}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right font-bold w-24">TOTAL ANUAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {/* Línea Base */}
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">
                  Línea base ({year - 1})
                </td>
                {depositos.lineaBase.map((val, idx) => (
                  <td key={idx} className="px-1 py-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={val}
                      onChange={(e) => handleCellChange('lineaBase', idx, e.target.value)}
                      className="w-14 text-center py-1 px-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-indigo-500 rounded font-mono tabular-nums text-slate-700 dark:text-slate-300"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-bold font-mono tabular-nums text-slate-700 dark:text-slate-300">
                  {totBase}
                </td>
              </tr>

              {/* Proyección año actual */}
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="px-3 py-2 font-medium text-indigo-700 dark:text-indigo-400">
                  Proyección ({year})
                </td>
                {depositos.proyeccion.map((val, idx) => (
                  <td key={idx} className="px-1 py-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={val}
                      onChange={(e) => handleCellChange('proyeccion', idx, e.target.value)}
                      className="w-14 text-center py-1 px-1 bg-transparent hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-indigo-500 rounded font-mono tabular-nums text-indigo-700 dark:text-indigo-400 font-semibold"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-bold font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
                  {totProy}
                </td>
              </tr>

              {/* Resultados Observados */}
              <tr className="bg-emerald-50/30 dark:bg-emerald-950/10 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20">
                <td className="px-3 py-2 font-medium text-emerald-700 dark:text-emerald-400">
                  Resultados Observados ({year})
                </td>
                {depositos.resultados.map((val, idx) => (
                  <td key={idx} className="px-1 py-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={val}
                      onChange={(e) => handleCellChange('resultados', idx, e.target.value)}
                      className="w-14 text-center py-1 px-1 bg-transparent hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 focus:bg-white dark:focus:bg-slate-800 border border-transparent focus:border-emerald-500 rounded font-mono tabular-nums text-emerald-800 dark:text-emerald-300 font-bold"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                  {totRes}
                </td>
              </tr>

              {/* Proyección Año Siguiente (ej. 2027) - Resaltada en Amarillo */}
              <tr className="bg-amber-50/70 dark:bg-amber-950/25 hover:bg-amber-100/70 dark:hover:bg-amber-950/45 border-t-2 border-amber-300/80 dark:border-amber-700/60">
                <td className="px-3 py-2 font-bold text-amber-900 dark:text-amber-300">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-600 inline-block shrink-0 shadow-xs" />
                    <span>Proyección ({year + 1})</span>
                  </div>
                </td>
                {proySiguiente.map((val, idx) => (
                  <td key={idx} className="px-1 py-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={val}
                      onChange={(e) => handleCellChange('proyeccionSiguiente', idx, e.target.value)}
                      className="w-14 text-center py-1 px-1 bg-amber-100/60 dark:bg-amber-900/40 hover:bg-amber-200/70 dark:hover:bg-amber-800/60 focus:bg-white dark:focus:bg-slate-800 border border-amber-300 dark:border-amber-600/70 focus:border-amber-500 rounded font-mono tabular-nums text-amber-950 dark:text-amber-200 font-bold"
                    />
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-bold font-mono tabular-nums text-amber-900 dark:text-amber-300 text-sm">
                  {totProySig}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico de Evolución Mensual */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="mb-4">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            Tendencia Mensual de Depósitos en Micelio
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comparativo entre la proyección planificada ({year}), resultados observados ({year}), tendencia de proyección ({year + 1} en amarillo) y trayectoria acumulada.
          </p>
        </div>
        <PlotlyChart
          data={chartLinesData}
          layout={{
            margin: { l: 40, r: 20, t: 20, b: 40 },
          }}
          className="w-full h-80"
          chartId="poa_depositos_lineas"
        />
      </div>
    </div>
  );
};
