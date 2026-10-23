import React from 'react';
import { FormacionPersonalSIU } from '../../../types';
import { EditableTable, ColumnDef } from '../../common/EditableTable';
import { KPICard } from '../../common/KPICard';
import { PlotlyChart } from '../../common/PlotlyChart';
import { GraduationCap, Clock, Building, Users } from 'lucide-react';

interface S21Props {
  items: FormacionPersonalSIU[];
  onChange: (items: FormacionPersonalSIU[]) => void;
  year: number;
}

export const S21_FormacionPersonal: React.FC<S21Props> = ({ items, onChange, year }) => {
  const totalHoras = items.reduce((a, b) => a + (Number(b.horas) || 0), 0);
  const participantesUnicos = Array.from(new Set(items.map((i) => i.participante)));

  // Horas por participante
  const horasPorParticipante: { [name: string]: number } = {};
  items.forEach((i) => {
    horasPorParticipante[i.participante] = (horasPorParticipante[i.participante] || 0) + (Number(i.horas) || 0);
  });

  // Conteo por institución para treemap
  const horasPorInstitucion: { [inst: string]: number } = {};
  items.forEach((i) => {
    const inst = i.institucion || 'Otras instituciones';
    horasPorInstitucion[inst] = (horasPorInstitucion[inst] || 0) + (Number(i.horas) || 0);
  });

  const columns: ColumnDef<FormacionPersonalSIU>[] = [
    {
      key: 'tipo',
      header: 'Tipo de Formación',
      accessor: (row) => row.tipo,
      type: 'select',
      options: ['Curso', 'Taller', 'Seminario', 'Webinar', 'Diplomado', 'Licenciatura', 'Otros Estudios'],
      onCellChange: (row, val) => {
        row.tipo = val;
      },
    },
    {
      key: 'nombre',
      header: 'Nombre del Curso / Evento',
      accessor: (row) => row.nombre,
      type: 'text',
      onCellChange: (row, val) => {
        row.nombre = String(val);
      },
    },
    {
      key: 'participante',
      header: 'Colaborador Participante',
      accessor: (row) => row.participante,
      type: 'text',
      onCellChange: (row, val) => {
        row.participante = String(val);
      },
    },
    {
      key: 'categoria',
      header: 'Categoría Laboral',
      accessor: (row) => row.categoria,
      type: 'select',
      options: ['Personal administrativo', 'Académico de planta', 'Hora clase'],
      onCellChange: (row, val) => {
        row.categoria = val;
      },
    },
    {
      key: 'institucion',
      header: 'Institución / Proveedor',
      accessor: (row) => row.institucion,
      type: 'text',
      onCellChange: (row, val) => {
        row.institucion = String(val);
      },
    },
    {
      key: 'horas',
      header: 'Horas',
      accessor: (row) => row.horas,
      type: 'number',
      align: 'right',
      sumTotal: true,
      onCellChange: (row, val) => {
        row.horas = Number(val) || 0;
      },
    },
    {
      key: 'modalidad',
      header: 'Modalidad',
      accessor: (row) => row.modalidad,
      type: 'select',
      options: ['Presencial', 'En línea', 'Híbrida'],
      onCellChange: (row, val) => {
        row.modalidad = val;
      },
    },
    {
      key: 'estado',
      header: 'Estado',
      accessor: (row) => row.estado,
      type: 'select',
      options: ['Completado', 'En curso', 'Cancelado'],
      onCellChange: (row, val) => {
        row.estado = val;
      },
      format: (val) => (
        <span
          className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
            val === 'Completado'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
          }`}
        >
          {val}
        </span>
      ),
    },
  ];

  const handleAdd = () => {
    const newItem: FormacionPersonalSIU = {
      id: `f-${Date.now()}`,
      tipo: 'Curso',
      nombre: 'Nueva capacitación',
      participante: 'Colaborador CRAI',
      categoria: 'Personal administrativo',
      fechaInicio: `${year}-03-01`,
      fechaFin: `${year}-03-15`,
      institucion: 'UCA / Externa',
      horas: 10,
      modalidad: 'En línea',
      estado: 'Completado',
      observaciones: '',
    };
    onChange([...items, newItem]);
  };

  const handleDelete = (idx: number) => {
    const updated = [...items];
    updated.splice(idx, 1);
    onChange(updated);
  };

  // 1. Barras de horas por participante
  const chartHorasData: Plotly.Data[] = [
    {
      x: Object.keys(horasPorParticipante),
      y: Object.values(horasPorParticipante),
      type: 'bar',
      marker: { color: '#6366f1' },
      text: Object.values(horasPorParticipante).map((h) => `${h} hrs`),
      textposition: 'auto',
    },
  ];

  // 2. Treemap por Institución
  const treemapData: Plotly.Data[] = [
    {
      type: 'treemap',
      labels: Object.keys(horasPorInstitucion),
      parents: Object.keys(horasPorInstitucion).map(() => ''),
      values: Object.values(horasPorInstitucion),
      textinfo: 'label+value+percent root',
      marker: { colorscale: 'Blues' },
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Horas de Formación"
          value={totalHoras}
          subtitle={`Horas recibidas en ${year}`}
          meta="Desarrollo profesional"
          icon={Clock}
        />
        <KPICard
          title="Personal Capacitado"
          value={participantesUnicos.length}
          subtitle="Colaboradores del CRAI"
          meta="100% seguimiento"
          icon={Users}
        />
        <KPICard
          title="Promedio de Horas / Persona"
          value={participantesUnicos.length > 0 ? (totalHoras / participantesUnicos.length).toFixed(1) : 0}
          subtitle="Horas por colaborador"
          meta="Intensidad formativa"
          icon={GraduationCap}
        />
        <KPICard
          title="Cursos / Eventos"
          value={items.length}
          subtitle="Actividades registradas"
          meta="Cursos, talleres, diplomados"
          icon={Building}
        />
      </div>

      <EditableTable
        title="2.1 Formación del Personal CRAI"
        subtitle="Registro de cursos, seminarios y diplomados recibidos por el equipo técnico y académico del CRAI."
        columns={columns}
        data={items}
        onDataChange={(newData) => onChange([...newData])}
        canAddRow={true}
        canDeleteRow={true}
        onAddRow={handleAdd}
        onDeleteRow={handleDelete}
        totalsLabel="Total Horas Formación Recibidas"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
            Horas de Capacitación por Colaborador
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Inversión formativa por persona</p>
          <PlotlyChart
            data={chartHorasData}
            layout={{ margin: { l: 40, r: 20, t: 10, b: 60 }, xaxis: { tickangle: -20 } }}
            className="w-full h-72"
            chartId="formacion_horas_barras"
          />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
            Treemap por Institución Proveedora
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Distribución de horas impartidas según organismo capacitador
          </p>
          <PlotlyChart
            data={treemapData}
            layout={{ margin: { l: 10, r: 10, t: 10, b: 10 } }}
            className="w-full h-72"
            chartId="formacion_treemap"
          />
        </div>
      </div>
    </div>
  );
};
