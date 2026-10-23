import * as XLSX from 'xlsx';
import { YearData, MESES_COMPLETO } from '../types';

/**
 * Descarga un archivo binario en el navegador
 */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exporta hojas a un libro Excel .xlsx
 */
export function exportWorkbook(filename: string, sheets: Array<{ name: string; data: any[][] }>) {
  const wb = XLSX.utils.book_new();

  for (const sheet of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(sheet.data);
    // Limitar longitud de nombre de hoja a 31 caracteres (requisito de Excel)
    const safeName = sheet.name.substring(0, 31).replace(/[\\/?*[\]:]/g, '_');
    XLSX.utils.book_append_sheet(wb, ws, safeName);
  }

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  downloadBlob(blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}

/**
 * Exporta una tabla a archivo CSV con codificación UTF-8 con BOM
 */
export function exportToCSV(filename: string, rows: any[][]) {
  const csvContent = rows
    .map((row) =>
      row
        .map((cell) => {
          if (cell === null || cell === undefined) return '""';
          const str = String(cell);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return `"${str}"`;
        })
        .join(',')
    )
    .join('\r\n');

  // Agregar UTF-8 BOM para que Excel en Windows reconozca tildes y Ñ
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

/**
 * Exporta el informe consolidado completo del POA a un libro Excel (.xlsx)
 */
export function exportPOAExcel(data: YearData) {
  const year = data.year;
  const poa = data.poa;

  // 1. Presupuesto
  const totalPresupuesto = poa.presupuesto.reduce((sum, item) => sum + (Number(item.monto) || 0), 0);
  const sheetPresupuesto: any[][] = [
    ['CRAI UCA - PLAN OPERATIVO ANUAL (POA)', `AÑO ${year}`],
    ['Línea Micelio - Sistema CRIS e investigaciones'],
    ['1.1 Presupuesto de la línea'],
    [],
    ['No.', 'Rubro / Concepto', 'Monto (USD)', 'Comentarios / Justificación'],
    ...poa.presupuesto.map((p, idx) => [idx + 1, p.rubro, p.monto, p.comentarios || '']),
    ['', 'TOTAL GENERAL PRESUPUESTO', totalPresupuesto, ''],
  ];

  // 2. Publicaciones
  const totBase = poa.publicaciones.reduce((a, b) => a + (b.lineaBase || 0), 0);
  const totProy = poa.publicaciones.reduce((a, b) => a + (b.proyeccionActual || 0), 0);
  const totRes = poa.publicaciones.reduce((a, b) => a + (b.resultadosActual || 0), 0);
  const totSig = poa.publicaciones.reduce((a, b) => a + (b.proyeccionSiguiente || 0), 0);

  const sheetPublicaciones: any[][] = [
    ['1.2 Publicaciones por tipo en Micelio', `Año ${year}`],
    [],
    [
      'Tipo de Publicación',
      `Línea base (${year - 1})`,
      `Proyección (${year})`,
      `Resultados Observados (${year})`,
      `Proyección (${year + 1})`,
      '% Cumplimiento (Res / Proy)',
      'Brecha Pendiente (Proy - Res)',
      'Notas / Justificación de Resultados',
    ],
    ...poa.publicaciones.map((p) => {
      const avance = p.proyeccionActual > 0 ? ((p.resultadosActual / p.proyeccionActual) * 100).toFixed(1) + '%' : 'N/A';
      const brecha = Math.max(0, p.proyeccionActual - p.resultadosActual);
      return [p.tipo, p.lineaBase, p.proyeccionActual, p.resultadosActual, p.proyeccionSiguiente, avance, brecha, p.observaciones || ''];
    }),
    [
      'Total General',
      totBase,
      totProy,
      totRes,
      totSig,
      totProy > 0 ? ((totRes / totProy) * 100).toFixed(1) + '%' : 'N/A',
      Math.max(0, totProy - totRes),
      '',
    ],
  ];

  // 3. Depósitos mensuales
  const dep = poa.depositosMensuales;
  const totDepBase = dep.lineaBase.reduce((a, b) => a + (Number(b) || 0), 0);
  const totDepProy = dep.proyeccion.reduce((a, b) => a + (Number(b) || 0), 0);
  const totDepRes = dep.resultados.reduce((a, b) => a + (Number(b) || 0), 0);
  const proySig = Array.isArray(dep.proyeccionSiguiente) && dep.proyeccionSiguiente.length === 12
    ? dep.proyeccionSiguiente
    : [0, 0, 1, 1, 1, 2, 2, 1, 2, 2, 1, 0];
  const totDepSig = proySig.reduce((a, b) => a + (Number(b) || 0), 0);

  const sheetDepositos: any[][] = [
    ['1.3 Depósito mensual de investigaciones en Micelio', `Año ${year}`],
    [],
    ['Serie', ...MESES_COMPLETO, 'TOTAL ANUAL'],
    [`Línea base (${year - 1})`, ...dep.lineaBase, totDepBase],
    [`Proyección (${year})`, ...dep.proyeccion, totDepProy],
    [`Resultados (${year})`, ...dep.resultados, totDepRes],
    [`Proyección (${year + 1})`, ...proySig, totDepSig],
  ];

  // 4. Adopción
  const adop = poa.adopcion;
  const univ = adop.universoInvestigadores || 184;
  const sheetAdopcion: any[][] = [
    ['1.4 Indicadores de adopción de perfiles de investigadores en Micelio'],
    [`Universo institucional de investigadores: ${univ}`],
    [],
    ['Indicador', 'Cantidad Base', '% Base', 'Cantidad Meta', '% Meta', 'Resultado Observado', '% Observado', 'Incremento Proyectado'],
    [
      'Tasa de registro de perfiles',
      adop.tasaRegistroBase,
      ((adop.tasaRegistroBase / univ) * 100).toFixed(2) + '%',
      adop.tasaRegistroMeta,
      ((adop.tasaRegistroMeta / univ) * 100).toFixed(2) + '%',
      adop.tasaRegistroObservado,
      ((adop.tasaRegistroObservado / univ) * 100).toFixed(2) + '%',
      `+${adop.tasaRegistroMeta - adop.tasaRegistroBase} investigadores`,
    ],
    [
      'Tasa de conversión (registro a perfil completo)',
      adop.tasaConversionBase,
      ((adop.tasaConversionBase / univ) * 100).toFixed(2) + '%',
      adop.tasaConversionMeta,
      ((adop.tasaConversionMeta / univ) * 100).toFixed(2) + '%',
      adop.tasaConversionObservado,
      ((adop.tasaConversionObservado / univ) * 100).toFixed(2) + '%',
      `+${adop.tasaConversionMeta - adop.tasaConversionBase} investigadores`,
    ],
  ];

  // 5. Subactividades
  const totSub = poa.subactividades.reduce((a, b) => a + (Number(b.cantidad) || 0), 0);
  const sheetSubactividades: any[][] = [
    ['1.5 Subactividades de la línea Micelio', `Año ${year}`],
    [],
    ['No.', 'Descripción de la Subactividad', 'Cantidad', '% del Total Proyectado'],
    ...poa.subactividades.map((s, idx) => [
      idx + 1,
      s.descripcion,
      s.cantidad,
      totSub > 0 ? ((s.cantidad / totSub) * 100).toFixed(2) + '%' : '0%',
    ]),
    ['', 'Total', totSub, '100%'],
  ];

  // 6. Perfiles más vistos
  const totVistasPerfiles = poa.visibilidadPerfiles.reduce((a, b) => a + (Number(b.visualizaciones) || 0), 0);
  const sheetPerfiles: any[][] = [
    ['1.6 Ranking de perfiles de investigadores más consultados', `Año ${year}`],
    [],
    ['Posición', 'Investigador / Académico', 'Visualizaciones acumuladas', '% Participación'],
    ...poa.visibilidadPerfiles.map((p, idx) => [
      idx + 1,
      p.investigador,
      p.visualizaciones,
      totVistasPerfiles > 0 ? ((p.visualizaciones / totVistasPerfiles) * 100).toFixed(2) + '%' : '0%',
    ]),
    ['', 'TOTAL VISITAS EN PERFILES', totVistasPerfiles, '100%'],
  ];

  // 7. Análisis cualitativo
  const sheetCualitativo: any[][] = [
    ['1.7 Análisis cualitativo institucional', `Año ${year}`],
    [],
    ['PERIODO ENERO - JUNIO (SEMESTRAL)'],
    ['1. Descripción del logro del objetivo:', poa.analisisCualitativo.semestre1.logro],
    ['2. Dificultades encontradas (internas y externas):', poa.analisisCualitativo.semestre1.dificultades],
    ['3. Acciones realizadas:', poa.analisisCualitativo.semestre1.acciones],
    ['4. Resumen consolidado:', poa.analisisCualitativo.semestre1.resumen],
    [],
    ['PERIODO ANUAL (ENERO - DICIEMBRE)'],
    ['1. Descripción del logro del objetivo:', poa.analisisCualitativo.anual.logro],
    ['2. Dificultades encontradas (internas y externas):', poa.analisisCualitativo.anual.dificultades],
    ['3. Acciones realizadas:', poa.analisisCualitativo.anual.acciones],
    ['4. Resumen consolidado:', poa.analisisCualitativo.anual.resumen],
  ];

  exportWorkbook(`POA_${year}_CRAI_UCA.xlsx`, [
    { name: '1. Presupuesto', data: sheetPresupuesto },
    { name: '2. Publicaciones', data: sheetPublicaciones },
    { name: '3. Depositos Mensuales', data: sheetDepositos },
    { name: '4. Adopcion', data: sheetAdopcion },
    { name: '5. Subactividades', data: sheetSubactividades },
    { name: '6. Perfiles', data: sheetPerfiles },
    { name: '7. Analisis Cualitativo', data: sheetCualitativo },
  ]);
}

/**
 * Exporta el libro consolidado oficial del SIU con todas las hojas nombradas
 * y organizadas exactamente en el orden requerido por la universidad.
 */
export function exportSIUConsolidatedExcel(data: YearData) {
  const year = data.year;
  const siu = data.siu;

  const headerBlock = [
    ['Sistema Integrado de Información Universitaria (SIU)', `Año a reportar: ${year}`],
    ['Unidad:', siu.cabecera.unidad],
    ['Jefaturas:', siu.cabecera.jefaturas, 'Correos:', siu.cabecera.correosJefaturas],
    ['Persona enlace:', siu.cabecera.personaEnlace, 'Correo enlace:', siu.cabecera.correoEnlace],
    [],
  ];

  // Helper para tablas con 12 meses
  const buildMonthTable = (title: string, labelCol: string, items: Array<{ label: string; meses: number[] }>) => {
    const rows: any[][] = [
      ...headerBlock,
      [title],
      [],
      [labelCol, ...MESES_COMPLETO, 'TOTAL ANUAL'],
    ];

    const monthlyTotals = new Array(12).fill(0);

    for (const item of items) {
      const sum = item.meses.reduce((a, b) => a + (Number(b) || 0), 0);
      item.meses.forEach((val, idx) => {
        monthlyTotals[idx] += Number(val) || 0;
      });
      rows.push([item.label, ...item.meses, sum]);
    }

    const grandTotal = monthlyTotals.reduce((a, b) => a + b, 0);
    rows.push(['Total General', ...monthlyTotals, grandTotal]);
    return rows;
  };

  // 0. Control de reportes
  const s0 = [
    ...headerBlock,
    ['2.0 Control de reportes SIU'],
    [],
    ['Reporte', 'Fecha Límite', 'Responsable', 'Correo', 'Estado', 'Fecha Prórroga', 'Fecha Entrega'],
    ...siu.controlReportes.map((c) => [c.reporte, c.fechaLimite, c.responsable, c.correo, c.estado, c.fechaProrroga || '-', c.fechaEntrega || '-']),
  ];

  // 1. Formación del personal
  const s1 = [
    ...headerBlock,
    ['2.1 Formación del personal'],
    [],
    ['Tipo', 'Nombre de la Formación', 'Participante', 'Categoría', 'Fecha Inicio', 'Fecha Fin', 'Institución', 'Horas', 'Modalidad', 'Estado', 'Observaciones'],
    ...siu.s21_formacion.map((f) => [f.tipo, f.nombre, f.participante, f.categoria, f.fechaInicio, f.fechaFin, f.institucion, f.horas, f.modalidad, f.estado, f.observaciones || '']),
    ['', '', '', '', '', '', 'Total Horas Capacitación:', siu.s21_formacion.reduce((a, b) => a + (Number(b.horas) || 0), 0)],
  ];

  // 2. Plan de mejora CdA
  const s2 = [
    ...headerBlock,
    ['2.2 Plan de mejora CdA'],
    [],
    ['Categoría', 'Acciones Principales', 'Indicador de Logro', 'Periodo', 'Detalle de Actividades', 'Logros Obtenidos'],
    ...siu.s22_planMejora.map((pm) => [pm.categoria, pm.acciones, pm.indicador, pm.periodo, pm.actividades, pm.logros]),
  ];

  // 3. Recursos electrónicos
  const s3 = buildMonthTable(
    '2.3 Estadísticas de uso de recursos electrónicos',
    'Recurso Electrónico',
    siu.s23_recursosElectronicos.map((r) => ({ label: r.recurso, meses: r.meses }))
  );

  // 4. Visitas y obras
  const s4 = [
    ...headerBlock,
    ['2.4 Visitas y obras consultadas'],
    [],
    ['Concepto', ...MESES_COMPLETO, 'TOTAL ANUAL'],
    ['Usuarios masculinos que ingresaron', ...siu.s24_visitasObras.visitasHombres, siu.s24_visitasObras.visitasHombres.reduce((a, b) => a + b, 0)],
    ['Usuarios femeninos que ingresaron', ...siu.s24_visitasObras.visitasMujeres, siu.s24_visitasObras.visitasMujeres.reduce((a, b) => a + b, 0)],
    [
      'Total usuarios que ingresaron',
      ...siu.s24_visitasObras.visitasHombres.map((h, i) => h + siu.s24_visitasObras.visitasMujeres[i]),
      siu.s24_visitasObras.visitasHombres.reduce((a, b) => a + b, 0) + siu.s24_visitasObras.visitasMujeres.reduce((a, b) => a + b, 0),
    ],
    ['Obras consultadas en sala y préstamo', ...siu.s24_visitasObras.obrasConsultadas, siu.s24_visitasObras.obrasConsultadas.reduce((a, b) => a + b, 0)],
    [],
    ['Carnés emitidos por tipo de usuario'],
    ['Tipo de Usuario', 'Cantidad Emitida'],
    ...siu.s24_visitasObras.carnesEmitidos.map((c) => [c.tipo, c.cantidad]),
    ['Total Carnés Emitidos', siu.s24_visitasObras.carnesEmitidos.reduce((a, b) => a + (Number(b.cantidad) || 0), 0)],
  ];

  // 5. Portal de revistas
  const s5 = [
    ...headerBlock,
    ['2.5 Portal de Revistas OJS/UCA'],
    [],
    ['TABLA 1. ARTÍCULOS PUBLICADOS POR REVISTA'],
    ['Revista OJS', ...MESES_COMPLETO, 'Total Anual'],
    ...siu.s25_portalRevistas.articulosPublicados.map((a) => [a.revista, ...a.meses, a.meses.reduce((x, y) => x + y, 0)]),
    [],
    ['TABLA 2. NÚMEROS / EDICIONES PUBLICADAS'],
    ['Revista OJS', ...MESES_COMPLETO, 'Total Anual'],
    ...siu.s25_portalRevistas.numerosPublicados.map((n) => [n.revista, ...n.meses, n.meses.reduce((x, y) => x + y, 0)]),
    [],
    ['TABLA 3. VISIBILIDAD DE REVISTAS (VISTAS)'],
    ['Revista OJS', ...MESES_COMPLETO, 'Total Anual'],
    ...siu.s25_portalRevistas.visibilidadVistas.map((v) => [v.revista, ...v.meses, v.meses.reduce((x, y) => x + y, 0)]),
    [],
    ['TABLA 4. VISIBILIDAD AÑO ANTERIOR'],
    ['Revista OJS', ...MESES_COMPLETO, 'Total Anual'],
    ...siu.s25_portalRevistas.visibilidadAnterior.map((va) => [va.revista, ...va.meses, va.meses.reduce((x, y) => x + y, 0)]),
  ];

  // 6. Repositorio RIUCA
  const s6 = [
    ...headerBlock,
    ['2.6 Repositorio Institucional RIUCA'],
    [],
    ['Crecimiento mensual de documentos'],
    ['Mes', ...MESES_COMPLETO, 'Total Anual'],
    ['Documentos ingresados', ...siu.s26_repositorioRIUCA.crecimientoMensual, siu.s26_repositorioRIUCA.crecimientoMensual.reduce((a, b) => a + b, 0)],
    [],
    ['Listado de documentos indexados'],
    ['No.', 'Título del Documento', 'Enlace Handle', 'Comunidad', 'Colección', 'Financiamiento', 'Fecha Publicación', 'Área MINED'],
    ...siu.s26_repositorioRIUCA.documentos.map((d) => [d.no, d.titulo, d.handle, d.comunidad, d.coleccion, d.financiamiento, d.fecha, `Área ${d.areaMined}`]),
    ...(siu.s26_repositorioRIUCA.indexadoras && siu.s26_repositorioRIUCA.indexadoras.length > 0
      ? [
          [],
          ['INDEXADORAS, COSECHADORAS Y AGREGADORES QUE INCLUYEN A RIUCA'],
          ['Plataforma / Red', 'Tipo', 'Inclusión', 'Protocolo', 'Estado', ...MESES_COMPLETO, 'Total Anual', 'Comentarios'],
          ...siu.s26_repositorioRIUCA.indexadoras.map((i) => [
            i.nombre,
            i.tipo,
            i.mesInclusion,
            i.protocolo,
            i.estado,
            ...(i.meses || []),
            (i.meses || []).reduce((a, b) => a + (Number(b) || 0), 0),
            i.comentarios || '',
          ]),
          ...(siu.s26_repositorioRIUCA.comentariosIndexadoras ? [[], ['Bitácora General:', siu.s26_repositorioRIUCA.comentariosIndexadoras]] : []),
        ]
      : []),
  ];

  // 7. Micelio
  const s7 = [
    ...headerBlock,
    ['2.7 Micelio - Repositorio de datos'],
    [],
    ['Publicaciones depositadas por tipo y mes'],
    ['Tipo', ...MESES_COMPLETO, 'Total'],
    ...siu.s27_micelio.publicacionesMes.map((p) => [p.tipo, ...p.meses, p.meses.reduce((a, b) => a + b, 0)]),
    [],
    ['Proyectos de investigación por mes'],
    ['Serie', ...MESES_COMPLETO, 'Total'],
    ...siu.s27_micelio.proyectosMes.map((p) => [p.tipo, ...p.meses, p.meses.reduce((a, b) => a + b, 0)]),
    [],
    ['Visibilidad por región / continente'],
    ['Región', 'Vistas'],
    ...siu.s27_micelio.vistasRegion.map((r) => [r.region, r.vistas]),
    [],
    ['Visibilidad por países (Micelio y GA)'],
    ['País (Micelio)', 'Vistas Micelio', 'País (Analytics)', 'Vistas Analytics'],
    ...siu.s27_micelio.paisesMicelio.map((pm, idx) => {
      const ga = siu.s27_micelio.paisesAnalytics[idx];
      return [pm.pais, pm.vistas, ga?.pais || '', ga?.vistas || ''];
    }),
    ...(siu.s27_micelio.indexadoras && siu.s27_micelio.indexadoras.length > 0
      ? [
          [],
          ['INDEXADORAS, COSECHADORAS Y AGREGADORES QUE INCLUYEN A MICELIO'],
          ['Plataforma / Red', 'Tipo', 'Inclusión', 'Protocolo', 'Estado', ...MESES_COMPLETO, 'Total Anual', 'Comentarios'],
          ...siu.s27_micelio.indexadoras.map((i) => [
            i.nombre,
            i.tipo,
            i.mesInclusion,
            i.protocolo,
            i.estado,
            ...(i.meses || []),
            (i.meses || []).reduce((a, b) => a + (Number(b) || 0), 0),
            i.comentarios || '',
          ]),
          ...(siu.s27_micelio.comentariosIndexadoras ? [[], ['Bitácora General:', siu.s27_micelio.comentariosIndexadoras]] : []),
        ]
      : []),
  ];

  // 8. Desarrollo de colecciones
  const s8 = [
    ...headerBlock,
    ['2.8 Desarrollo de colecciones (Bases de datos académicas)'],
    [],
    ['Título de la Base de Datos', 'Proveedor', 'Vigencia Inicio', 'Vigencia Fin', 'Costo Inversión ($)', 'Área del Conocimiento', 'Modelo Financiamiento', 'Comentarios'],
    ...siu.s28_desarrolloColecciones.map((dc) => [dc.titulo, dc.proveedor, dc.fechaInicio, dc.fechaFin, dc.costo, dc.area, dc.modelo, dc.comentarios]),
    ['', '', '', 'Total Inversión:', siu.s28_desarrolloColecciones.reduce((a, b) => a + (Number(b.costo) || 0), 0)],
  ];

  // 9. Acervos históricos
  const s9 = [
    ...headerBlock,
    ['2.9 Acervos históricos'],
    [],
    ['TÍTULOS DIGITALIZADOS POR PROCEDENCIA'],
    ['Procedencia', ...MESES_COMPLETO, 'Total'],
    ...siu.s29_acervosHistoricos.map((ah) => [ah.procedencia, ...ah.titulosMes, ah.titulosMes.reduce((a, b) => a + b, 0)]),
    [],
    ['PÁGINAS DIGITALIZADAS POR PROCEDENCIA'],
    ['Procedencia', ...MESES_COMPLETO, 'Total'],
    ...siu.s29_acervosHistoricos.map((ah) => [ah.procedencia, ...ah.paginasMes, ah.paginasMes.reduce((a, b) => a + b, 0)]),
    [],
    ['ATENCIÓN A INVESTIGADORES EN SALA'],
    ['Procedencia', 'Investigadores Atendidos'],
    ...siu.s29_acervosHistoricos.map((ah) => [ah.procedencia, ah.atencionInvestigadores]),
    ['Total Investigadores Atendidos', siu.s29_acervosHistoricos.reduce((a, b) => a + (Number(b.atencionInvestigadores) || 0), 0)],
  ];

  // 10. KOHA
  const s10 = [
    ...headerBlock,
    ['2.10 Catalogado en KOHA'],
    [],
    ['Concepto', ...MESES_COMPLETO, 'TOTAL ANUAL', 'Promedio Mensual'],
    [
      'Total catalogado en el mes',
      ...siu.s210_catalogadoKoha.catalogadoMes,
      siu.s210_catalogadoKoha.catalogadoMes.reduce((a, b) => a + b, 0),
      (siu.s210_catalogadoKoha.catalogadoMes.reduce((a, b) => a + b, 0) / 12).toFixed(1),
    ],
    [
      'En proceso físico',
      ...siu.s210_catalogadoKoha.enProcesoMes,
      siu.s210_catalogadoKoha.enProcesoMes.reduce((a, b) => a + b, 0),
      (siu.s210_catalogadoKoha.enProcesoMes.reduce((a, b) => a + b, 0) / 12).toFixed(1),
    ],
    [],
    ['Nota explicativa:', siu.s210_catalogadoKoha.notaExplicativa],
    ['Análisis cualitativo:', siu.s210_catalogadoKoha.analisisCualitativo],
    ['Conclusiones:', siu.s210_catalogadoKoha.conclusiones],
  ];

  // 11. ATOM
  const s11 = buildMonthTable(
    '2.11 ATOM y estadísticas DSpace',
    'Comunidad / Colección ATOM',
    siu.s211_atom.depositosMes.map((d) => ({ label: d.comunidadColeccion, meses: d.meses }))
  );

  // 12. Propiedad Intelectual
  const s12 = [
    ...headerBlock,
    ['2.12 Propiedad intelectual (ISSN e ISBN)'],
    [],
    ['Tipo', 'Código', 'Título', 'Sello Editorial', 'Unidad', 'Año', 'Formato', 'Autores'],
    ...siu.s212_propiedadIntelectual.map((pi) => [pi.tipoRegistro, pi.codigo, pi.titulo, pi.sello, pi.unidad, pi.ano, pi.formato, pi.autores]),
  ];

  // 13. Comunicaciones
  const s13 = [
    ...headerBlock,
    ['2.13 Comunicaciones (Servicios Académicos)'],
    [],
    ['Red Social', 'Pub. Ene-Jun', 'Interac. Ene-Jun', 'Seguidores Jun', 'Alcance Ene-Jun', 'Pub. Jul-Dic', 'Interac. Jul-Dic', 'Seguidores Dic', 'Alcance Jul-Dic', 'Total Publicaciones', 'Total Interacciones'],
    ...siu.s213_comunicaciones.map((c) => [
      c.red,
      c.periodo1.publicaciones,
      c.periodo1.interacciones,
      c.periodo1.seguidores,
      c.periodo1.alcance,
      c.periodo2.publicaciones,
      c.periodo2.interacciones,
      c.periodo2.seguidores,
      c.periodo2.alcance,
      c.periodo1.publicaciones + c.periodo2.publicaciones,
      c.periodo1.interacciones + c.periodo2.interacciones,
    ]),
  ];

  // 14. Agenda Cultural
  const s14 = [
    ...headerBlock,
    ['2.14 Agenda cultural'],
    [],
    ['Tertulias literarias por categoría de usuarios'],
    ['Categoría', 'Asistencia Presencial', 'Asistencia Virtual', 'Total Asistentes'],
    ...siu.s214_agendaCultural.tertulias.map((t) => [t.categoria, t.presencial, t.virtual, t.presencial + t.virtual]),
    [],
    ['Registro de actividades culturales'],
    ['Fecha', 'Hora', 'Nombre de la Actividad', 'Asist. Presencial', 'Vistas Transmisión', 'Lugar', 'Medio de Verificación'],
    ...siu.s214_agendaCultural.actividades.map((a) => [a.fecha, a.hora, a.nombre, a.asistenciaPresencial, a.visualizaciones, a.lugar, a.verificacion]),
  ];

  // 15. Formaciones a usuarios
  const s15 = [
    ...headerBlock,
    ['2.15 Formaciones a usuarios'],
    [],
    ['Resumen por tipo de capacitación'],
    ['Tipo de Formación', 'Cantidad de Talleres', 'Participantes Capacitados'],
    ...siu.s215_formacionesUsuarios.resumenPorTipo.map((r) => [r.tipo, r.cantidad, r.participantes]),
    ['Total General', siu.s215_formacionesUsuarios.resumenPorTipo.reduce((a, b) => a + b.cantidad, 0), siu.s215_formacionesUsuarios.resumenPorTipo.reduce((a, b) => a + b.participantes, 0)],
    [],
    ['Detalle de actividades realizadas'],
    ['Fecha', 'Tema', 'Tipo', 'Modalidad', 'Participantes', 'Facilitador'],
    ...siu.s215_formacionesUsuarios.actividades.map((a) => [a.fecha, a.tema, a.tipo, a.modalidad, a.participantes, a.facilitador]),
  ];

  // 16. Ingresos por servicios
  const s16 = [
    ...headerBlock,
    ['2.16 Ingresos por servicios bibliotecarios'],
    [],
    ['Área', 'Servicio', 'Precio Unitario ($)', ...MESES_COMPLETO, 'Cantidad Total', 'Ingreso Total ($)'],
    ...siu.s216_ingresosServicios.map((ing) => {
      const totCant = ing.cantidadMes.reduce((a, b) => a + (Number(b) || 0), 0);
      const totIng = totCant * (Number(ing.precioUnitario) || 0);
      return [ing.area, ing.servicio, ing.precioUnitario, ...ing.cantidadMes, totCant, totIng];
    }),
    [
      '',
      '',
      'Total Ingresos Generados:',
      ...new Array(12).fill(''),
      '',
      siu.s216_ingresosServicios.reduce((sum, item) => sum + item.cantidadMes.reduce((a, b) => a + (Number(b) || 0), 0) * (Number(item.precioUnitario) || 0), 0),
    ],
  ];

  // 17. Seguridad y salud ocupacional
  const s17 = [
    ...headerBlock,
    ['2.17 Seguridad y salud ocupacional'],
    [],
    ['Simulacros y evacuaciones'],
    ['Fecha', 'Tipo de Simulacro', 'Participantes', 'Tiempo (min)', 'Observaciones'],
    ...siu.s217_seguridadSalud.evacuaciones.map((e) => [e.fecha, e.tipo, e.participantes, e.tiempoMinutos, e.observaciones]),
    [],
    ['Actividades para el personal'],
    ['Actividad', 'Fecha', 'Medio / Entidad', 'Descripción'],
    ...siu.s217_seguridadSalud.actividadesPersonal.map((ap) => [ap.actividad, ap.fecha, ap.medio, ap.descripcion]),
    [],
    ['Actividades para usuarios'],
    ['Actividad', 'Fecha', 'Medio', 'Descripción'],
    ...siu.s217_seguridadSalud.actividadesUsuarios.map((au) => [au.actividad, au.fecha, au.medio, au.descripcion]),
  ];

  // 18. Definiciones
  const s18 = [
    ...headerBlock,
    ['2.18 Catálogo de definiciones'],
    [],
    ['Categoría', 'Código', 'Nombre', 'Descripción'],
    ...siu.s218_definiciones.map((d) => [d.categoria, d.codigo, d.nombre, d.descripcion]),
  ];

  exportWorkbook(`SIU_Consolidado_${year}_CRAI_UCA.xlsx`, [
    { name: '0. Control_Reportes', data: s0 },
    { name: '1. Formacion_Personal', data: s1 },
    { name: '2. Plan_Mejora_CdA', data: s2 },
    { name: '3. Recursos_Electronicos', data: s3 },
    { name: '4. Visitas_y_Obras', data: s4 },
    { name: '5. Portal_Revistas', data: s5 },
    { name: '6. RIUCA', data: s6 },
    { name: '7. Micelio_Repositorio', data: s7 },
    { name: '8. Desarrollo_Colecciones', data: s8 },
    { name: '9. Acervos_Historicos', data: s9 },
    { name: '10. Catalogado_KOHA', data: s10 },
    { name: '11. ATOM', data: s11 },
    { name: '12. Propiedad_Intelectual', data: s12 },
    { name: '13. Comunicaciones', data: s13 },
    { name: '14. Agenda_Cultural', data: s14 },
    { name: '15. Formaciones_Usuarios', data: s15 },
    { name: '16. Ingresos_Servicios', data: s16 },
    { name: '17. Seguridad_Salud', data: s17 },
    { name: '18. Definiciones', data: s18 },
  ]);
}
