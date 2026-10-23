import React from 'react';
import { AdopcionPOA } from '../../types';
import { KPICard } from '../common/KPICard';
import { PlotlyChart } from '../common/PlotlyChart';
import { Users, UserCheck, Percent } from 'lucide-react';

interface POAAdopcionProps {
  adopcion: AdopcionPOA;
  onChange: (adopcion: AdopcionPOA) => void;
  year: number;
}

export const POAAdopcion: React.FC<POAAdopcionProps> = ({ adopcion, onChange, year }) => {
  const univ = adopcion.universoInvestigadores || 184;

  const pctRegBase = (adopcion.tasaRegistroBase / univ) * 100;
  const pctRegMeta = (adopcion.tasaRegistroMeta / univ) * 100;
  const pctRegObs = (adopcion.tasaRegistroObservado / univ) * 100;

  const pctConvBase = (adopcion.tasaConversionBase / univ) * 100;
  const pctConvMeta = (adopcion.tasaConversionMeta / univ) * 100;
  const pctConvObs = (adopcion.tasaConversionObservado / univ) * 100;

  const incRegEsperado = adopcion.tasaRegistroMeta - adopcion.tasaRegistroBase;
  const incConvEsperado = adopcion.tasaConversionMeta - adopcion.tasaConversionBase;

  const handleFieldChange = (field: keyof AdopcionPOA, val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    onChange({
      ...adopcion,
      [field]: num,
    });
  };

  // Gráfico Gauge para Tasa de Registro
  const gaugeDataRegistro: Plotly.Data[] = [
    {
      type: 'indicator',
      mode: 'gauge+number+delta',
      value: adopcion.tasaRegistroMeta,
      title: { text: `Tasa Registro Meta (${year})`, font: { size: 14 } },
      delta: { reference: adopcion.tasaRegistroBase, increasing: { color: '#059669' } },
      gauge: {
        axis: { range: [0, univ], tickwidth: 1 },
        bar: { color: '#234a80' },
        bgcolor: 'transparent',
        threshold: {
          line: { color: '#e06d26', width: 3 },
          thickness: 0.75,
          value: adopcion.tasaRegistroMeta,
        },
      },
    },
  ];

  // Gráfico Gauge para Tasa de Conversión
  const gaugeDataConversion: Plotly.Data[] = [
    {
      type: 'indicator',
      mode: 'gauge+number+delta',
      value: adopcion.tasaConversionMeta,
      title: { text: `Tasa Conversión Meta (${year})`, font: { size: 14 } },
      delta: { reference: adopcion.tasaConversionBase, increasing: { color: '#059669' } },
      gauge: {
        axis: { range: [0, univ], tickwidth: 1 },
        bar: { color: '#e06d26' },
        bgcolor: 'transparent',
        threshold: {
          line: { color: '#234a80', width: 3 },
          thickness: 0.75,
          value: adopcion.tasaConversionMeta,
        },
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Selector de Universo de Investigadores */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-[#234a80] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            Parámetro Base: Universo Institucional de Investigadores
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cuerpo académico e investigadores de la UCA sobre el cual se calculan automáticamente los porcentajes de adopción.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Universo:</span>
          <input
            type="number"
            min="1"
            value={univ}
            onChange={(e) => handleFieldChange('universoInvestigadores', e.target.value)}
            className="w-24 px-3 py-1.5 text-sm font-mono font-bold tabular-nums text-center bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#234a80]"
          />
          <span className="text-xs text-slate-500">investigadores</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Tasa de Registro (Meta)"
          value={`${adopcion.tasaRegistroMeta} (${pctRegMeta.toFixed(1)}%)`}
          subtitle={`Año base: ${adopcion.tasaRegistroBase} (${pctRegBase.toFixed(1)}%)`}
          meta={`Incremento: +${incRegEsperado}`}
          icon={Users}
        />
        <KPICard
          title="Tasa de Conversión (Meta)"
          value={`${adopcion.tasaConversionMeta} (${pctConvMeta.toFixed(1)}%)`}
          subtitle={`Año base: ${adopcion.tasaConversionBase} (${pctConvBase.toFixed(1)}%)`}
          meta={`Incremento: +${incConvEsperado}`}
          icon={UserCheck}
        />
        <KPICard
          title="Registro Observado"
          value={adopcion.tasaRegistroObservado}
          subtitle={`${pctRegObs.toFixed(1)}% del universo`}
          meta="Perfiles creados en el periodo"
          icon={Percent}
        />
        <KPICard
          title="Conversión Observada"
          value={adopcion.tasaConversionObservado}
          subtitle={`${pctConvObs.toFixed(1)}% del universo`}
          meta="Perfiles validados y completados"
          icon={Percent}
        />
      </div>

      {/* Tabla Formulario de Adopción */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">
            1.4 Matriz de Indicadores de Adopción en Micelio
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Los porcentajes y diferencias de crecimiento se calculan al instante con base en el universo de {univ} investigadores.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                <th className="px-3 py-2.5">Indicador de Adopción</th>
                <th className="px-3 py-2.5 text-center">Cantidad Base</th>
                <th className="px-3 py-2.5 text-center">% Base</th>
                <th className="px-3 py-2.5 text-center">Cantidad Meta ({year})</th>
                <th className="px-3 py-2.5 text-center">% Proyectado ({year})</th>
                <th className="px-3 py-2.5 text-center">Resultado Observado</th>
                <th className="px-3 py-2.5 text-center">% Observado</th>
                <th className="px-3 py-2.5 text-right">Incremento Esperado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {/* Tasa de Registro */}
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">
                  Tasa de registro de perfiles en Micelio
                </td>
                <td className="px-2 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    value={adopcion.tasaRegistroBase}
                    onChange={(e) => handleFieldChange('tasaRegistroBase', e.target.value)}
                    className="w-16 text-center py-1 bg-slate-50 dark:bg-slate-800 border rounded font-mono tabular-nums"
                  />
                </td>
                <td className="px-3 py-2 text-center font-mono tabular-nums text-slate-600 dark:text-slate-400">
                  {pctRegBase.toFixed(2)}%
                </td>
                <td className="px-2 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    value={adopcion.tasaRegistroMeta}
                    onChange={(e) => handleFieldChange('tasaRegistroMeta', e.target.value)}
                    className="w-16 text-center py-1 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-300 rounded font-mono font-bold tabular-nums text-indigo-700 dark:text-indigo-400"
                  />
                </td>
                <td className="px-3 py-2 text-center font-mono font-bold tabular-nums text-indigo-700 dark:text-indigo-400">
                  {pctRegMeta.toFixed(2)}%
                </td>
                <td className="px-2 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    value={adopcion.tasaRegistroObservado}
                    onChange={(e) => handleFieldChange('tasaRegistroObservado', e.target.value)}
                    className="w-16 text-center py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 rounded font-mono font-bold tabular-nums text-emerald-800 dark:text-emerald-300"
                  />
                </td>
                <td className="px-3 py-2 text-center font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {pctRegObs.toFixed(2)}%
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-semibold">
                  +{incRegEsperado} investigadores ({(pctRegMeta - pctRegBase).toFixed(2)}%+)
                </td>
              </tr>

              {/* Tasa de Conversión */}
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">
                  Tasa de conversión de registro a creación de perfil completo
                </td>
                <td className="px-2 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    value={adopcion.tasaConversionBase}
                    onChange={(e) => handleFieldChange('tasaConversionBase', e.target.value)}
                    className="w-16 text-center py-1 bg-slate-50 dark:bg-slate-800 border rounded font-mono tabular-nums"
                  />
                </td>
                <td className="px-3 py-2 text-center font-mono tabular-nums text-slate-600 dark:text-slate-400">
                  {pctConvBase.toFixed(2)}%
                </td>
                <td className="px-2 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    value={adopcion.tasaConversionMeta}
                    onChange={(e) => handleFieldChange('tasaConversionMeta', e.target.value)}
                    className="w-16 text-center py-1 bg-sky-50 dark:bg-sky-950/30 border border-sky-300 rounded font-mono font-bold tabular-nums text-sky-700 dark:text-sky-400"
                  />
                </td>
                <td className="px-3 py-2 text-center font-mono font-bold tabular-nums text-sky-700 dark:text-sky-400">
                  {pctConvMeta.toFixed(2)}%
                </td>
                <td className="px-2 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    value={adopcion.tasaConversionObservado}
                    onChange={(e) => handleFieldChange('tasaConversionObservado', e.target.value)}
                    className="w-16 text-center py-1 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 rounded font-mono font-bold tabular-nums text-emerald-800 dark:text-emerald-300"
                  />
                </td>
                <td className="px-3 py-2 text-center font-mono font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {pctConvObs.toFixed(2)}%
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums text-sky-600 dark:text-sky-400 font-semibold">
                  +{incConvEsperado} investigadores ({(pctConvMeta - pctConvBase).toFixed(2)}%+)
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráficos Gauge de Cumplimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <PlotlyChart
            data={gaugeDataRegistro}
            layout={{ height: 240, margin: { t: 30, b: 20, l: 30, r: 30 } }}
            className="w-full h-60"
            chartId="gauge_registro"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <PlotlyChart
            data={gaugeDataConversion}
            layout={{ height: 240, margin: { t: 30, b: 20, l: 30, r: 30 } }}
            className="w-full h-60"
            chartId="gauge_conversion"
          />
        </div>
      </div>
    </div>
  );
};
