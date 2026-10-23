import React from 'react';
import { SeguridadSaludSIU, EvacuacionSIU, ActividadSeguridadSIU } from '../../../types';
import { EditableTable, ColumnDef } from '../../common/EditableTable';
import { KPICard } from '../../common/KPICard';
import { ShieldAlert, Users, Clock, HeartPulse } from 'lucide-react';

interface S217Props {
  data: SeguridadSaludSIU;
  onChange: (data: SeguridadSaludSIU) => void;
  year: number;
}

export const S217_SeguridadSalud: React.FC<S217Props> = ({ data, onChange, year }) => {
  const totEvacuados = data.evacuaciones.reduce((a, b) => a + (Number(b.participantes) || 0), 0);
  const tiempoMedio =
    data.evacuaciones.length > 0
      ? (data.evacuaciones.reduce((a, b) => a + (Number(b.tiempoMinutos) || 0), 0) / data.evacuaciones.length).toFixed(1)
      : '0.0';

  const evacColumns: ColumnDef<EvacuacionSIU>[] = [
    {
      key: 'fecha',
      header: 'Fecha del Simulacro',
      accessor: (row) => row.fecha,
      type: 'date',
      onCellChange: (row, val) => {
        row.fecha = String(val);
      },
    },
    {
      key: 'tipo',
      header: 'Tipo de Evento / Simulacro',
      accessor: (row) => row.tipo,
      type: 'text',
      onCellChange: (row, val) => {
        row.tipo = String(val);
      },
    },
    {
      key: 'participantes',
      header: 'Personas Evacuadas',
      accessor: (row) => row.participantes,
      type: 'number',
      align: 'right',
      sumTotal: true,
      onCellChange: (row, val) => {
        row.participantes = Number(val) || 0;
      },
    },
    {
      key: 'tiempoMinutos',
      header: 'Tiempo Total (minutos)',
      accessor: (row) => row.tiempoMinutos,
      type: 'number',
      align: 'right',
      onCellChange: (row, val) => {
        row.tiempoMinutos = Number(val) || 0;
      },
    },
    {
      key: 'observaciones',
      header: 'Observaciones y Medidas Correctivas',
      accessor: (row) => row.observaciones,
      type: 'text',
      onCellChange: (row, val) => {
        row.observaciones = String(val);
      },
    },
  ];

  const actColumns: ColumnDef<ActividadSeguridadSIU>[] = [
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
      key: 'actividad',
      header: 'Actividad de Seguridad y Salud',
      accessor: (row) => row.actividad,
      type: 'text',
      onCellChange: (row, val) => {
        row.actividad = String(val);
      },
    },
    {
      key: 'medio',
      header: 'Medio / Facilitador',
      accessor: (row) => row.medio,
      type: 'text',
      onCellChange: (row, val) => {
        row.medio = String(val);
      },
    },
    {
      key: 'descripcion',
      header: 'Descripción y Resultados',
      accessor: (row) => row.descripcion,
      type: 'text',
      onCellChange: (row, val) => {
        row.descripcion = String(val);
      },
    },
  ];

  const handleAddEvac = () => {
    const newEvac: EvacuacionSIU = {
      id: `ev-${Date.now()}`,
      fecha: `${year}-09-10`,
      tipo: 'Simulacro de evacuación por sismo',
      participantes: 200,
      tiempoMinutos: 4.0,
      observaciones: 'Evacuación sin incidentes hacia el punto de reunión.',
    };
    onChange({ ...data, evacuaciones: [...data.evacuaciones, newEvac] });
  };

  const handleDeleteEvac = (idx: number) => {
    const updated = [...data.evacuaciones];
    updated.splice(idx, 1);
    onChange({ ...data, evacuaciones: updated });
  };

  const handleAddActPersonal = () => {
    const newAct: ActividadSeguridadSIU = {
      id: `asp-${Date.now()}`,
      actividad: 'Taller de ergonomía y pausas activas',
      fecha: `${year}-07-12`,
      medio: 'Presencial / Recursos Humanos',
      descripcion: 'Capacitación al personal en prevención de fatiga visual y postural.',
    };
    onChange({ ...data, actividadesPersonal: [...data.actividadesPersonal, newAct] });
  };

  const handleDeleteActPersonal = (idx: number) => {
    const updated = [...data.actividadesPersonal];
    updated.splice(idx, 1);
    onChange({ ...data, actividadesPersonal: updated });
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Total Personas Evacuadas"
          value={totEvacuados}
          subtitle={`Simulacros en ${year}`}
          meta="Comunidad CRAI y visitantes"
          icon={Users}
        />
        <KPICard
          title="Tiempo Medio de Evacuación"
          value={`${tiempoMedio} min`}
          subtitle="Respuesta de evacuación en el edificio"
          meta="Parqueo de biblioteca"
          icon={Clock}
          badge={{ text: 'Dentro de norma', variant: 'success' }}
        />
        <KPICard
          title="Actividades Preventivas"
          value={data.actividadesPersonal.length + data.actividadesUsuarios.length}
          subtitle="Para personal y usuarios"
          meta="Cultura de prevención"
          icon={HeartPulse}
        />
      </div>

      <EditableTable
        title="2.17.1 Registro de Simulacros y Evacuaciones"
        subtitle="Protocolos de seguridad, tiempos de respuesta y medidas de mitigación del CRAI."
        columns={evacColumns}
        data={data.evacuaciones}
        onDataChange={(newData) => onChange({ ...data, evacuaciones: [...newData] })}
        canAddRow={true}
        canDeleteRow={true}
        onAddRow={handleAddEvac}
        onDeleteRow={handleDeleteEvac}
        totalsLabel="Total Evacuados"
      />

      <EditableTable
        title="2.17.2 Actividades de Seguridad y Salud para el Personal"
        subtitle="Entrenamientos brigadistas, primeros auxilios, ergonomía y salud laboral."
        columns={actColumns}
        data={data.actividadesPersonal}
        onDataChange={(newData) => onChange({ ...data, actividadesPersonal: [...newData] })}
        canAddRow={true}
        canDeleteRow={true}
        onAddRow={handleAddActPersonal}
        onDeleteRow={handleDeleteActPersonal}
        showTotals={false}
      />
    </div>
  );
};
