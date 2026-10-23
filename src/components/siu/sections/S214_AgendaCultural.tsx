import React from 'react';
import { AgendaCulturalSIU, TertuliaSIU, ActividadCulturalSIU } from '../../../types';
import { EditableTable, ColumnDef } from '../../common/EditableTable';
import { KPICard } from '../../common/KPICard';
import { PlotlyChart } from '../../common/PlotlyChart';
import { Sparkles, Users, Video, Calendar, Plus, Trash2 } from 'lucide-react';

interface S214Props {
  data: AgendaCulturalSIU;
  onChange: (data: AgendaCulturalSIU) => void;
  year: number;
}

export const S214_AgendaCultural: React.FC<S214Props> = ({ data, onChange, year }) => {
  const totPresencialTertulias = data.tertulias.reduce((a, b) => a + (Number(b.presencial) || 0), 0);
  const totVirtualTertulias = data.tertulias.reduce((a, b) => a + (Number(b.virtual) || 0), 0);
  const totAsistentesTertulias = totPresencialTertulias + totVirtualTertulias;

  const totPresencialActividades = data.actividades.reduce((a, b) => a + (Number(b.asistenciaPresencial) || 0), 0);
  const totVistasActividades = data.actividades.reduce((a, b) => a + (Number(b.visualizaciones) || 0), 0);

  const handleTertuliaChange = (idx: number, field: 'presencial' | 'virtual', val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = [...data.tertulias];
    updated[idx] = { ...updated[idx], [field]: num };
    onChange({ ...data, tertulias: updated });
  };

  const actColumns: ColumnDef<ActividadCulturalSIU>[] = [
    {
      key: 'fecha',
      header: 'Fecha',
      accessor: (row) => row.fecha,
      type: 'date',
      onCellChange: (row, val) => {
        row.fecha = String(val);
      },
    },
    {
      key: 'hora',
      header: 'Hora',
      accessor: (row) => row.hora,
      type: 'text',
      onCellChange: (row, val) => {
        row.hora = String(val);
      },
    },
    {
      key: 'nombre',
      header: 'Nombre de la Actividad Cultural',
      accessor: (row) => row.nombre,
      type: 'text',
      onCellChange: (row, val) => {
        row.nombre = String(val);
      },
    },
    {
      key: 'asistenciaPresencial',
      header: 'Asist. Presencial',
      accessor: (row) => row.asistenciaPresencial,
      type: 'number',
      align: 'right',
      sumTotal: true,
      onCellChange: (row, val) => {
        row.asistenciaPresencial = Number(val) || 0;
      },
    },
    {
      key: 'visualizaciones',
      header: 'Vistas Transmisión',
      accessor: (row) => row.visualizaciones,
      type: 'number',
      align: 'right',
      sumTotal: true,
      onCellChange: (row, val) => {
        row.visualizaciones = Number(val) || 0;
      },
    },
    {
      key: 'lugar',
      header: 'Lugar / Espacio',
      accessor: (row) => row.lugar,
      type: 'text',
      onCellChange: (row, val) => {
        row.lugar = String(val);
      },
    },
    {
      key: 'verificacion',
      header: 'Medio de Verificación',
      accessor: (row) => row.verificacion,
      type: 'text',
      onCellChange: (row, val) => {
        row.verificacion = String(val);
      },
    },
  ];

  const handleAddActividad = () => {
    const newAct: ActividadCulturalSIU = {
      id: `act-${Date.now()}`,
      fecha: `${year}-05-10`,
      hora: '15:00',
      nombre: 'Nueva actividad cultural CRAI',
      asistenciaPresencial: 50,
      visualizaciones: 120,
      lugar: 'Sala de Exposiciones CRAI',
      verificacion: 'Lista de asistencia y fotos',
    };
    onChange({ ...data, actividades: [...data.actividades, newAct] });
  };

  const handleDeleteActividad = (idx: number) => {
    const updated = [...data.actividades];
    updated.splice(idx, 1);
    onChange({ ...data, actividades: updated });
  };

  const chartTertuliasData: Plotly.Data[] = [
    {
      x: data.tertulias.map((t) => t.categoria),
      y: data.tertulias.map((t) => t.presencial),
      name: 'Asistencia Presencial',
      type: 'bar',
      marker: { color: '#6366f1' },
    },
    {
      x: data.tertulias.map((t) => t.categoria),
      y: data.tertulias.map((t) => t.virtual),
      name: 'Asistencia Virtual',
      type: 'bar',
      marker: { color: '#0ea5e9' },
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Participación en Tertulias"
          value={totAsistentesTertulias}
          subtitle={`Asistentes en ${year}`}
          meta={`${totPresencialTertulias} presencial · ${totVirtualTertulias} virtual`}
          icon={Users}
        />
        <KPICard
          title="Eventos Culturales Realizados"
          value={data.actividades.length}
          subtitle="Actividades programadas"
          meta="CRAI UCA"
          icon={Calendar}
        />
        <KPICard
          title="Asistencia Presencial Actividades"
          value={totPresencialActividades}
          subtitle="Público en salas del CRAI"
          meta="Eventos culturales"
          icon={Sparkles}
        />
        <KPICard
          title="Alcance Transmisiones"
          value={totVistasActividades.toLocaleString()}
          subtitle="Vistas en FB y YouTube"
          meta="Audiencia digital"
          icon={Video}
        />
      </div>

      {/* Matriz 1: Tertulias Literarias */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            Tertulias Literarias por Categoría de Usuarios ({year})
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registro de directores y asistentes presenciales y virtuales
          </p>
        </div>

        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-2.5">Categoría de Asistentes</th>
              <th className="px-4 py-2.5 text-center">Asistencia Presencial</th>
              <th className="px-4 py-2.5 text-center">Asistencia Virtual</th>
              <th className="px-4 py-2.5 text-right font-bold">Total Asistentes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {data.tertulias.map((t, idx) => (
              <tr key={t.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">{t.categoria}</td>
                <td className="px-4 py-1 text-center">
                  <input
                    type="number"
                    min="0"
                    value={t.presencial}
                    onChange={(e) => handleTertuliaChange(idx, 'presencial', e.target.value)}
                    className="w-16 text-center py-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border rounded font-mono tabular-nums"
                  />
                </td>
                <td className="px-4 py-1 text-center">
                  <input
                    type="number"
                    min="0"
                    value={t.virtual}
                    onChange={(e) => handleTertuliaChange(idx, 'virtual', e.target.value)}
                    className="w-16 text-center py-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border rounded font-mono tabular-nums"
                  />
                </td>
                <td className="px-4 py-2 text-right font-bold font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
                  {(t.presencial + t.virtual).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 dark:bg-slate-800/90 font-bold border-t-2 text-slate-900 dark:text-white">
              <td className="px-4 py-2.5">Total Asistentes a Tertulias</td>
              <td className="px-4 py-2.5 text-center font-mono tabular-nums">{totPresencialTertulias.toLocaleString()}</td>
              <td className="px-4 py-2.5 text-center font-mono tabular-nums">{totVirtualTertulias.toLocaleString()}</td>
              <td className="px-4 py-2.5 text-right font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
                {totAsistentesTertulias.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Gráfico Tertulias */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
        <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
          Participación en Tertulias Literarias por Modalidad
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Comparativo presencial vs virtual por estamento universitario
        </p>
        <PlotlyChart
          data={chartTertuliasData}
          layout={{ barmode: 'group', margin: { l: 45, r: 20, t: 20, b: 40 } }}
          className="w-full h-72"
          chartId="tertulias_barras"
        />
      </div>

      {/* Tabla 2: Registro de Actividades Culturales */}
      <EditableTable
        title="Registro de Actividades Culturales Realizadas"
        subtitle="Ferias del libro, conferencias, tertulias y homenajes con medios de verificación."
        columns={actColumns}
        data={data.actividades}
        onDataChange={(newData) => onChange({ ...data, actividades: [...newData] })}
        canAddRow={true}
        canDeleteRow={true}
        onAddRow={handleAddActividad}
        onDeleteRow={handleDeleteActividad}
        totalsLabel="Total Asistencia a Actividades"
      />
    </div>
  );
};
