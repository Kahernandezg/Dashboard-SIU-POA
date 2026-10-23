import React from 'react';
import { FormacionesUsuariosSIU, ActividadFormacionSIU, ResumenFormacionTipoSIU } from '../../../types';
import { EditableTable, ColumnDef } from '../../common/EditableTable';
import { KPICard } from '../../common/KPICard';
import { PlotlyChart } from '../../common/PlotlyChart';
import { GraduationCap, Users, BookOpen, Layers } from 'lucide-react';

interface S215Props {
  data: FormacionesUsuariosSIU;
  onChange: (data: FormacionesUsuariosSIU) => void;
  year: number;
}

export const S215_FormacionesUsuarios: React.FC<S215Props> = ({ data, onChange, year }) => {
  const totTalleres = data.resumenPorTipo.reduce((a, b) => a + (Number(b.cantidad) || 0), 0);
  const totParticipantes = data.resumenPorTipo.reduce((a, b) => a + (Number(b.participantes) || 0), 0);

  const actColumns: ColumnDef<ActividadFormacionSIU>[] = [
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
      key: 'tema',
      header: 'Tema / Contenido',
      accessor: (row) => row.tema,
      type: 'text',
      onCellChange: (row, val) => {
        row.tema = String(val);
      },
    },
    {
      key: 'tipo',
      header: 'Tipo de Capacitación',
      accessor: (row) => row.tipo,
      type: 'text',
      onCellChange: (row, val) => {
        row.tipo = String(val);
      },
    },
    {
      key: 'modalidad',
      header: 'Modalidad',
      accessor: (row) => row.modalidad,
      type: 'select',
      options: ['Virtual', 'Presencial', 'Híbrida'],
      align: 'center',
      onCellChange: (row, val) => {
        row.modalidad = val;
      },
    },
    {
      key: 'participantes',
      header: 'No. Participantes',
      accessor: (row) => row.participantes,
      type: 'number',
      align: 'right',
      sumTotal: true,
      onCellChange: (row, val) => {
        row.participantes = Number(val) || 0;
      },
    },
    {
      key: 'facilitador',
      header: 'Facilitador / Instructor',
      accessor: (row) => row.facilitador,
      type: 'text',
      onCellChange: (row, val) => {
        row.facilitador = String(val);
      },
    },
  ];

  const handleAddActividad = () => {
    const newAct: ActividadFormacionSIU = {
      id: `fu-${Date.now()}`,
      fecha: `${year}-06-15`,
      tema: 'Taller de alfabetización informacional',
      tipo: 'Búsquedas efectivas',
      modalidad: 'Presencial',
      participantes: 25,
      facilitador: 'Personal CRAI',
    };
    onChange({ ...data, actividades: [...data.actividades, newAct] });
  };

  const handleDeleteActividad = (idx: number) => {
    const updated = [...data.actividades];
    updated.splice(idx, 1);
    onChange({ ...data, actividades: updated });
  };

  const handleResumenChange = (idx: number, field: 'cantidad' | 'participantes', val: string) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = [...data.resumenPorTipo];
    updated[idx] = { ...updated[idx], [field]: num };
    onChange({ ...data, resumenPorTipo: updated });
  };

  const pieChartData: Plotly.Data[] = [
    {
      labels: data.resumenPorTipo.map((r) => r.tipo),
      values: data.resumenPorTipo.map((r) => r.participantes),
      type: 'pie',
      hole: 0.45,
      textinfo: 'label+percent',
      marker: {
        colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'],
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Total Usuarios Capacitados"
          value={totParticipantes}
          subtitle={`Estudiantes e investigadores en ${year}`}
          meta="Alfabetización informacional"
          icon={Users}
        />
        <KPICard
          title="Sesiones / Talleres Impartidos"
          value={totTalleres}
          subtitle="Capacitaciones grupales y especializadas"
          meta="Formación de usuarios"
          icon={GraduationCap}
        />
        <KPICard
          title="Promedio Asistentes / Taller"
          value={totTalleres > 0 ? (totParticipantes / totTalleres).toFixed(1) : 0}
          subtitle="Participantes promedio por sesión"
          meta="Rendimiento del servicio"
          icon={BookOpen}
        />
      </div>

      {/* Resumen por Tipo de Formación y Gráfico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
              Resumen por Tipo de Formación ({year})
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              RefWorks, Originality, APA 7a., Metabuscador y Acogida
            </p>
          </div>

          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-2.5">Tipo de Formación</th>
                <th className="px-4 py-2.5 text-center">No. Talleres</th>
                <th className="px-4 py-2.5 text-right">Participantes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {data.resumenPorTipo.map((r, idx) => (
                <tr key={r.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-2 font-medium text-slate-800 dark:text-slate-200">{r.tipo}</td>
                  <td className="px-4 py-1 text-center">
                    <input
                      type="number"
                      min="0"
                      value={r.cantidad}
                      onChange={(e) => handleResumenChange(idx, 'cantidad', e.target.value)}
                      className="w-16 text-center py-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border rounded font-mono tabular-nums"
                    />
                  </td>
                  <td className="px-4 py-1 text-right">
                    <input
                      type="number"
                      min="0"
                      value={r.participantes}
                      onChange={(e) => handleResumenChange(idx, 'participantes', e.target.value)}
                      className="w-20 text-right py-1 px-1 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 border rounded font-mono tabular-nums font-semibold text-indigo-700 dark:text-indigo-400"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/90 font-bold border-t-2 text-slate-900 dark:text-white">
                <td className="px-4 py-2.5">Total General</td>
                <td className="px-4 py-2.5 text-center font-mono tabular-nums">{totTalleres}</td>
                <td className="px-4 py-2.5 text-right font-mono tabular-nums text-indigo-700 dark:text-indigo-400">
                  {totParticipantes.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
            Participantes por Tipo de Taller
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Distribución porcentual de capacitados</p>
          <PlotlyChart
            data={pieChartData}
            layout={{ margin: { l: 20, r: 20, t: 10, b: 20 }, showlegend: true }}
            className="w-full h-64"
            chartId="formacion_usuarios_pie"
          />
        </div>
      </div>

      {/* Tabla de Actividades de Formación Detalladas */}
      <EditableTable
        title="2.15 Detalle de Actividades de Formación Impartidas"
        subtitle="Registro de fechas, facilitadores y cantidades de participantes por sesión."
        columns={actColumns}
        data={data.actividades}
        onDataChange={(newData) => onChange({ ...data, actividades: [...newData] })}
        canAddRow={true}
        canDeleteRow={true}
        onAddRow={handleAddActividad}
        onDeleteRow={handleDeleteActividad}
        totalsLabel="Total Participantes en Sesiones"
      />
    </div>
  );
};
