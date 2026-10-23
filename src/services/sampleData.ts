import type { YearData } from '../types/index.ts';

export function createSample2026Data(): YearData {
  return {
    year: 2026,
    status: 'en_proceso',
    lastModified: new Date().toISOString(),
    modifiedBy: 'Kevin Hernández',
    poa: {
      presupuesto: [
        { id: 'pres-1', rubro: '1- KUMU', monto: 96, comentarios: 'Plataforma para mapeo de relaciones' },
        { id: 'pres-2', rubro: '2- API de Google Maps', monto: 66, comentarios: 'Geolocalización y mapas de impacto (valor estimado)' },
      ],
      publicaciones: [
        { id: 'pub-1', tipo: 'Conjunto de datos', lineaBase: 4, proyeccionActual: 5, resultadosActual: 0, proyeccionSiguiente: 5, observaciones: 'En etapa de curaduría técnica y anonimización de datos; los depósitos se formalizarán en el segundo semestre.' },
        { id: 'pub-2', tipo: 'Artículo externo (indexado)', lineaBase: 3, proyeccionActual: 4, resultadosActual: 8, proyeccionSiguiente: 8, observaciones: 'Meta superada (200%): 8 artículos en revistas indexadas Scopus/WoS de proyectos cerrados de la VRII.' },
        { id: 'pub-3', tipo: 'Artículo externo (no indexado)', lineaBase: 0, proyeccionActual: 0, resultadosActual: 4, proyeccionSiguiente: 4, observaciones: 'Artículos de divulgación y actas de congresos externos depositados voluntariamente por investigadores.' },
        { id: 'pub-4', tipo: 'Artículo UCA', lineaBase: 1, proyeccionActual: 1, resultadosActual: 8, proyeccionSiguiente: 5, observaciones: 'Artículos publicados en revistas institucionales (ECA y Realidad Empresarial) incorporados a Micelio.' },
        { id: 'pub-5', tipo: 'Informe de investigación', lineaBase: 3, proyeccionActual: 5, resultadosActual: 9, proyeccionSiguiente: 5, observaciones: 'Informes técnicos finales entregados a Vicerrectoría y difundidos con DOI institucional.' },
        { id: 'pub-6', tipo: 'Libro y capítulos', lineaBase: 0, proyeccionActual: 1, resultadosActual: 5, proyeccionSiguiente: 3, observaciones: '5 capítulos de libros colectivos con referato editorial nacional e internacional.' },
        { id: 'pub-7', tipo: 'Monografía', lineaBase: 0, proyeccionActual: 0, resultadosActual: 0, proyeccionSiguiente: 0, observaciones: 'No se programaron ni registraron monografías independientes en este periodo.' },
        { id: 'pub-8', tipo: 'Otros', lineaBase: 3, proyeccionActual: 3, resultadosActual: 1, proyeccionSiguiente: 2, observaciones: 'Documento de trabajo metodológico (Working paper) de la Maestría en Políticas Públicas.' },
      ],
      depositosMensuales: {
        lineaBase: [0, 0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0], // Total 6
        proyeccion: [0, 0, 0, 0, 0, 1, 1, 0, 3, 2, 2, 0], // Total 9
        resultados: [0, 1, 0, 1, 0, 3, 0, 0, 2, 0, 0, 0], // Total 7
        proyeccionSiguiente: [0, 0, 1, 1, 1, 2, 2, 1, 2, 2, 1, 0], // Total 13 (Proyección 2027)
      },
      adopcion: {
        universoInvestigadores: 184,
        tasaRegistroBase: 88,       // 47.83%
        tasaRegistroMeta: 100,      // 54.35%
        tasaRegistroObservado: 12,  // 6.52% de avance observados
        tasaConversionBase: 71,     // 38.59%
        tasaConversionMeta: 88,     // 47.83%
        tasaConversionObservado: 8, // 4.35% de conversión observada
      },
      subactividades: [
        { id: 'sub-1', descripcion: 'Depositar, describir y dar seguimiento en Micelio a 9 Publicaciones retrospectivas realizadas hasta 2024 (47.37% del total proyectado para 2026).', cantidad: 9 },
        { id: 'sub-2', descripcion: 'Depositar, describir y dar seguimiento en Micelio a 10 publicaciones de proyectos en ejecución hasta 2025 (52.63% del total proyectado para 2026).', cantidad: 10 },
        { id: 'sub-3', descripcion: 'Incrementar en 3 investigaciones más que representa un 66.67% de la línea base 2024 de investigaciones depositadas en Micelio.', cantidad: 3 },
      ],
      visibilidadPerfiles: [
        { id: 'per-1', investigador: 'Rodríguez Rodríguez, Lizeth', visualizaciones: 50 },
        { id: 'per-2', investigador: 'Óscar Meléndez Ramírez', visualizaciones: 43 },
        { id: 'per-3', investigador: 'Chichique Martínez, Violeta', visualizaciones: 42 },
        { id: 'per-4', investigador: 'Caleb C. & Óscar G.', visualizaciones: 38 },
        { id: 'per-5', investigador: 'José A. Ramos & Alexandra Urbina', visualizaciones: 31 },
        { id: 'per-6', investigador: 'C. Fabián & Jacqueline E.', visualizaciones: 27 },
        { id: 'per-7', investigador: 'Patricia Z., Erick R. & Frida M.', visualizaciones: 24 },
      ],
      analisisCualitativo: {
        maxCaracteres: 1000,
        semestre1: {
          logro: 'Durante el periodo enero-junio no se observó un avance significativo en el registro de nuevos investigadores en Micelio y aunque la meta planteada era incorporar 12 personas adicionales, al cierre del periodo aún no se había concretado este incremento. La plataforma sí permitió evidenciar un comportamiento sostenido en la visibilidad de los perfiles académicos, alcanzando 846 visualizaciones acumuladas. Entre los perfiles más consultados destacan Lizeth Rodríguez con 50 vistas, Óscar Meléndez con 43 y Violeta Chichiqué con 42. En relación con el indicador de número de investigaciones el resultado observado alcanzó precisamente 5 proyectos adicionales. Esto evidencia un avance favorable en la incorporación y visibilización de investigaciones dentro de la plataforma.',
          dificultades: 'La principal dificultad se relaciona con la temporalidad de los proyectos de investigación de la VRII, los cuales inician a partir de marzo de cada año. Esta dinámica ha limitado la posibilidad de cerrar procesos anteriores o de incorporar nuevos registros de manera oportuna durante el primer semestre. A ello se suma que algunos equipos de investigación aún se encuentran en ejecución, lo que retrasa la actualización y visibilización completa de los perfiles de investigadores que aún no se registran.',
          acciones: 'Se mantuvo el seguimiento a la plataforma Micelio como un espacio de visibilización académica, permitiendo registrar y monitorear el comportamiento de las consultas a los perfiles de investigadores. Asimismo, se identificaron los perfiles con mayor nivel de visualización, lo cual aporta insumos para fortalecer estrategias futuras de actualización, difusión y registro de investigadores. Se realizó seguimiento a los proyectos en ejecución y retrospectivos.',
          resumen: 'Durante enero-junio se dio seguimiento a Micelio alcanzando 846 visualizaciones con alta visibilidad en perfiles de Lizeth Rodríguez (50), Óscar Meléndez (43) y Violeta Chichiqué (42). Se incorporaron 5 proyectos y 6 publicaciones. A pesar de los desfaces temporales de inicio de convocatorias en marzo, se mantiene trazabilidad y articulación para la meta anual.',
        },
        anual: {
          logro: '',
          dificultades: '',
          acciones: '',
          resumen: '',
        },
      },
    },
    siu: {
      cabecera: {
        ano: 2026,
        unidad: 'Centro de Recursos para el Aprendizaje y la Investigación P. Florentino Idoate, S.J.',
        jefaturas: 'Jacqueline Morales / América Díaz',
        correosJefaturas: 'jmorales@uca.edu.sv / adiaz@uca.edu.sv',
        personaEnlace: 'Kevin Amilcar Hernández',
        correoEnlace: 'kahernandezg@uca.edu.sv',
      },
      controlReportes: [
        { id: 'cr-1', reporte: 'Preliminar (Enero - Junio)', fechaLimite: '2026-07-15', responsable: 'Kevin Hernández', correo: 'kahernandezg@uca.edu.sv', estado: 'Entregado', fechaEntrega: '2026-07-12' },
        { id: 'cr-2', reporte: 'Anual (Enero - Diciembre)', fechaLimite: '2027-01-20', responsable: 'Kevin Hernández', correo: 'kahernandezg@uca.edu.sv', estado: 'En revisión' },
      ],
      s21_formacion: [
        { id: 'f-1', tipo: 'Curso', nombre: 'Gestión y curaduría de datos en repositorios institucionales', participante: 'Kevin Hernández', categoria: 'Académico planta', fechaInicio: '2026-02-10', fechaFin: '2026-02-28', institucion: 'Consorcio CBUES / LA Referencia', horas: 30, modalidad: 'En línea', estado: 'Completado' },
        { id: 'f-2', tipo: 'Taller', nombre: 'Metadatos Dublin Core y OpenAIRE para revistas académicas', participante: 'María Ester Cerón', categoria: 'Personal administrativo', fechaInicio: '2026-03-05', fechaFin: '2026-03-12', institucion: 'FECYT España', horas: 16, modalidad: 'En línea', estado: 'Completado' },
        { id: 'f-3', tipo: 'Seminario', nombre: 'Preservación digital a largo plazo con CoreTrustSeal', participante: 'Jacqueline Morales', categoria: 'Académico planta', fechaInicio: '2026-04-14', fechaFin: '2026-04-18', institucion: 'RedCLARA', horas: 20, modalidad: 'Híbrida', estado: 'Completado' },
      ],
      s22_planMejora: [
        { id: 'pm-1', categoria: 'Repositorios y Acceso Abierto', acciones: 'Actualizar la versión de DSpace y parametrizar cosechador OAI-PMH', indicador: 'Versión actualizada y validada en OpenAIRE', periodo: 'Ene - Jun 2026', actividades: 'Pruebas en sandbox, migración de base de datos e indexación', logros: 'Repositorio RIUCA optimizado en tiempos de carga y compatibilidad' },
        { id: 'pm-2', categoria: 'Servicios al Investigador', acciones: 'Campaña de registro de perfiles y depósitos de investigación en Micelio', indicador: 'Incremento de al menos 12 perfiles y 19 publicaciones', periodo: 'Anual 2026', actividades: 'Talleres presenciales y contacto con investigadores de planta', logros: '846 visitas acumuladas en perfiles y 9 publicaciones incorporadas' },
      ],
      s23_recursosElectronicos: [
        { id: 're-1', recurso: 'Academic Search Ultimate (EBSCO)', meses: [2140, 2430, 2890, 3120, 3450, 2900, 1800, 2950, 3600, 3420, 2800, 1500], anterior: 31000 },
        { id: 're-2', recurso: 'E-Libro Cátedra', meses: [1450, 1890, 2300, 2550, 2800, 2100, 1200, 2400, 2900, 2750, 2100, 1100], anterior: 24200 },
        { id: 're-3', recurso: 'JSTOR Arts & Sciences', meses: [950, 1120, 1430, 1510, 1680, 1340, 780, 1420, 1750, 1620, 1290, 680], anterior: 14800 },
        { id: 're-4', recurso: 'Knovel (Engineering)', meses: [320, 410, 520, 580, 640, 490, 280, 510, 630, 590, 450, 220], anterior: 5400 },
        { id: 're-5', recurso: 'Digitalia Hispánica', meses: [410, 490, 630, 710, 780, 620, 350, 690, 810, 790, 580, 290], anterior: 6900 },
        { id: 're-6', recurso: 'ASTM Compass', meses: [210, 260, 340, 380, 420, 310, 190, 350, 440, 410, 320, 160], anterior: 3600 },
        { id: 're-7', recurso: 'DOAJ & Dryad', meses: [180, 220, 290, 310, 350, 280, 160, 300, 370, 360, 270, 140], anterior: 3100 },
      ],
      s24_visitasObras: {
        visitasHombres: [4120, 4850, 6120, 6450, 7200, 5890, 3200, 6100, 7450, 7120, 5900, 2800],
        visitasMujeres: [4680, 5420, 6980, 7310, 8120, 6740, 3650, 6980, 8490, 8100, 6720, 3190],
        obrasConsultadas: [2890, 3410, 4250, 4510, 5120, 4100, 2180, 4320, 5290, 5010, 4120, 1890],
        carnesEmitidos: [
          { id: 'c-1', tipo: 'Alumnos pregrado', cantidad: 1850 },
          { id: 'c-2', tipo: 'Alumnos postgrado', cantidad: 340 },
          { id: 'c-3', tipo: 'Catedráticos de planta y hora clase', cantidad: 125 },
          { id: 'c-4', tipo: 'Empleados UCA', cantidad: 88 },
          { id: 'c-5', tipo: 'Lector ocasional nacional/privado', cantidad: 210 },
          { id: 'c-6', tipo: 'Graduados y diplomados', cantidad: 95 },
          { id: 'c-7', tipo: 'Cortesía y pasantías', cantidad: 32 },
        ],
      },
      s25_portalRevistas: {
        articulosPublicados: [
          { id: 'ar-1', revista: 'Realidad', meses: [8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { id: 'ar-2', revista: 'Realidad Empresarial', meses: [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
          { id: 'ar-3', revista: 'ECA', meses: [0, 345, 203, 145, 0, 607, 0, 0, 0, 0, 0, 0] },
          { id: 'ar-4', revista: 'Revista Latinoamericana de Teología', meses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { id: 'ar-5', revista: 'Investigaciones UCA', meses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { id: 'ar-6', revista: 'Proceso', meses: [0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { id: 'ar-7', revista: 'ILIA', meses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        ],
        numerosPublicados: [
          { id: 'num-1', revista: 'Realidad', meses: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { id: 'num-2', revista: 'Realidad Empresarial', meses: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { id: 'num-3', revista: 'ECA', meses: [0, 40, 17, 13, 0, 53, 0, 0, 0, 0, 0, 0] },
          { id: 'num-4', revista: 'Revista Latinoamericana de Teología', meses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { id: 'num-5', revista: 'Investigaciones UCA', meses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { id: 'num-6', revista: 'Proceso', meses: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { id: 'num-7', revista: 'ILIA', meses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        ],
        visibilidadVistas: [
          { id: 'vis-1', revista: 'Realidad', meses: [0, 0, 0, 0, 3423, 33097, 19507, 19759, 37922, 9796, 0, 0] },
          { id: 'vis-2', revista: 'Realidad Empresarial', meses: [0, 0, 0, 0, 821, 7000, 4607, 4430, 5228, 1994, 0, 0] },
          { id: 'vis-3', revista: 'ECA', meses: [0, 0, 0, 0, 9877, 124673, 80838, 70190, 101108, 23387, 0, 0] },
          { id: 'vis-4', revista: 'Revista Latinoamericana de Teología', meses: [0, 0, 0, 0, 1700, 18889, 12597, 8423, 30889, 4415, 0, 0] },
          { id: 'vis-5', revista: 'Investigaciones UCA', meses: [0, 0, 0, 0, 596, 4054, 2623, 2429, 5058, 1152, 0, 0] },
          { id: 'vis-6', revista: 'Proceso', meses: [0, 0, 0, 0, 485, 3339, 2280, 1622, 2885, 950, 0, 0] },
          { id: 'vis-7', revista: 'ILIA', meses: [0, 0, 0, 0, 295, 1499, 1153, 1024, 1763, 488, 0, 0] },
        ],
        visibilidadAnterior: [
          { id: 'van-1', revista: 'Realidad', meses: [2100, 2300, 2500, 2700, 3100, 30000, 18000, 18500, 35000, 9000, 4200, 2800] },
          { id: 'van-2', revista: 'Realidad Empresarial', meses: [700, 750, 800, 810, 800, 6500, 4200, 4100, 4900, 1800, 1200, 900] },
          { id: 'van-3', revista: 'ECA', meses: [8500, 9100, 9400, 9600, 9700, 115000, 76000, 68000, 96000, 22000, 15000, 11000] },
          { id: 'van-4', revista: 'Revista Latinoamericana de Teología', meses: [1500, 1600, 1650, 1680, 1690, 17500, 11800, 7900, 29000, 4100, 2500, 1800] },
          { id: 'van-5', revista: 'Investigaciones UCA', meses: [500, 520, 550, 580, 590, 3800, 2400, 2300, 4800, 1100, 800, 600] },
          { id: 'van-6', revista: 'Proceso', meses: [400, 420, 450, 470, 480, 3100, 2100, 1500, 2700, 900, 650, 500] },
          { id: 'van-7', revista: 'ILIA', meses: [250, 260, 280, 290, 290, 1400, 1050, 980, 1650, 450, 320, 240] },
        ],
        descargasCamjol: [
          { id: 'cam-1', revista: 'Realidad', meses: [12483, 12215, 17232, 27327, 32125, 12695, 0, 0, 0, 0, 0, 0] },
          { id: 'cam-2', revista: 'Realidad Empresarial', meses: [1932, 1126, 2515, 3235, 3655, 3004, 0, 0, 0, 0, 0, 0] },
          { id: 'cam-3', revista: 'ECA', meses: [157, 525, 811, 1468, 5741, 1638, 0, 0, 0, 0, 0, 0] },
        ],
      },
      s26_repositorioRIUCA: {
        documentos: [
          { id: 'doc-1', no: 1, titulo: 'Contaminación del agua en El Salvador: Evaluación de la calidad del agua de los ríos', handle: 'http://hdl.handle.net/11715/3412', comunidad: 'Ciencias Naturales y Exactas', coleccion: 'Artículos de investigación', financiamiento: 'VRII UCA', fecha: '2026-03-15', areaMined: 1 },
          { id: 'doc-2', no: 2, titulo: 'Movilidad urbana socialmente sostenible en el Triángulo Norte', handle: 'http://hdl.handle.net/11715/3418', comunidad: 'Ingeniería y Arquitectura', coleccion: 'Informes técnicos', financiamiento: 'Fondos UCA', fecha: '2026-04-20', areaMined: 2 },
          { id: 'doc-3', no: 3, titulo: 'Evaluación del impacto psicosocial y memoria histórica en El Salvador', handle: 'http://hdl.handle.net/11715/3425', comunidad: 'Ciencias Sociales y Humanidades', coleccion: 'Tesis de maestría', financiamiento: 'Autofinanciado', fecha: '2026-05-11', areaMined: 5 },
          { id: 'doc-4', no: 4, titulo: 'Desarrollo de biocatálisis enzimática para tratamiento de aguas residuales', handle: 'http://hdl.handle.net/11715/3430', comunidad: 'Ciencias Naturales y Exactas', coleccion: 'Artículos de investigación', financiamiento: 'MINEDCYT', fecha: '2026-06-02', areaMined: 1 },
        ],
        crecimientoMensual: [45, 62, 78, 85, 94, 112, 58, 89, 105, 98, 76, 42],
      },
      s27_micelio: {
        publicacionesMes: [
          { id: 'm-pub-1', tipo: 'Artículo UCA', meses: [0, 0, 0, 0, 0, 0, 0, 0, 1, 7, 0, 0] },
          { id: 'm-pub-2', tipo: 'Informe de investigación', meses: [0, 1, 0, 0, 1, 2, 1, 0, 2, 2, 0, 0] },
          { id: 'm-pub-3', tipo: 'Artículo externo (indexado)', meses: [0, 0, 0, 0, 0, 0, 2, 0, 0, 6, 0, 0] },
          { id: 'm-pub-4', tipo: 'Artículo externo (No indexado)', meses: [0, 0, 0, 0, 0, 0, 1, 0, 0, 3, 0, 0] },
          { id: 'm-pub-5', tipo: 'Libro', meses: [0, 0, 0, 0, 0, 0, 1, 0, 1, 2, 0, 0] },
          { id: 'm-pub-6', tipo: 'Monografía', meses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { id: 'm-pub-7', tipo: 'Capítulos de libro', meses: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0] },
          { id: 'm-pub-8', tipo: 'Otros', meses: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0] },
          { id: 'm-pub-9', tipo: 'Conjuntos de datos', meses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        ],
        proyectosMes: [
          { id: 'm-proj-1', tipo: 'Proyectos de Investigación 2025 (retrospectivo)', meses: [0, 0, 0, 0, 0, 0, 0, 6, 4, 2, 4, 10] },
          { id: 'm-proj-2', tipo: 'Proyectos de Investigación 2026 (meta)', meses: [0, 0, 0, 0, 0, 1, 1, 0, 3, 2, 2, 0] },
          { id: 'm-proj-3', tipo: 'Resultado observado 2026', meses: [0, 1, 0, 1, 0, 3, 0, 0, 2, 2, 0, 0] },
        ],
        vistasRegion: [
          { id: 'vr-1', region: 'América del Norte', vistas: 2436 },
          { id: 'vr-2', region: 'Europa', vistas: 46 },
          { id: 'vr-3', region: 'América del Sur', vistas: 36 },
          { id: 'vr-4', region: 'Asia', vistas: 16 },
          { id: 'vr-5', region: 'Oceanía', vistas: 0 },
          { id: 'vr-6', region: 'África', vistas: 0 },
        ],
        paisesMicelio: [
          { id: 'pmic-1', pais: 'El Salvador', vistas: 953 },
          { id: 'pmic-2', pais: 'United States', vistas: 28 },
          { id: 'pmic-3', pais: 'Guatemala', vistas: 14 },
          { id: 'pmic-4', pais: 'Costa Rica', vistas: 9 },
          { id: 'pmic-5', pais: 'Perú', vistas: 7 },
        ],
        paisesAnalytics: [
          { id: 'pga-1', pais: 'El Salvador', vistas: 183 },
          { id: 'pga-2', pais: 'United States', vistas: 7 },
          { id: 'pga-3', pais: 'Vietnam', vistas: 4 },
          { id: 'pga-4', pais: 'México', vistas: 3 },
          { id: 'pga-5', pais: 'Chile', vistas: 2 },
          { id: 'pga-6', pais: 'Cuba', vistas: 2 },
          { id: 'pga-7', pais: 'Guatemala', vistas: 2 },
          { id: 'pga-8', pais: 'Canadá', vistas: 1 },
          { id: 'pga-9', pais: 'España', vistas: 1 },
        ],
        ciudades: [
          { id: 'ciu-1', ciudad: 'San Salvador', vistasMicelio: 859, vistasAnalytics: 149 },
          { id: 'ciu-2', ciudad: 'La Libertad', vistasMicelio: 45, vistasAnalytics: 0 },
          { id: 'ciu-3', ciudad: 'San Pedro Perulapán', vistasMicelio: 35, vistasAnalytics: 0 },
          { id: 'ciu-4', ciudad: 'Guatemala City', vistasMicelio: 14, vistasAnalytics: 1 },
          { id: 'ciu-5', ciudad: 'Santa Ana', vistasMicelio: 14, vistasAnalytics: 3 },
          { id: 'ciu-6', ciudad: 'Los Angeles', vistasMicelio: 11, vistasAnalytics: 1 },
          { id: 'ciu-7', ciudad: 'Santa Tecla', vistasMicelio: 0, vistasAnalytics: 9 },
          { id: 'ciu-8', ciudad: 'Mejicanos', vistasMicelio: 0, vistasAnalytics: 6 },
        ],
        visitasMesComparativo: {
          anioAnterior: [301, 100, 136, 87, 83, 274, 310, 490, 1506, 1288, 1192, 386], // 6153
          anioActual: [738, 376, 272, 600, 208, 338, 0, 0, 0, 0, 0, 0], // 2532 hasta junio
        },
        loMasDescargado: [
          { id: 'des-1', publicacion: 'Contaminación del agua en El Salvador: Evaluación de la calidad del agua de los ríos y estudio preliminar', descargas: 149 },
          { id: 'des-2', publicacion: 'Movilidad urbana socialmente sostenible, un modelo no explorado para las capitales del Triángulo Norte', descargas: 103 },
          { id: 'des-3', publicacion: 'Social sustainability in urban mobility: An approach for policies and urban planning from the Global South', descargas: 99 },
          { id: 'des-4', publicacion: 'All Roads Lead to Rome: Triple Stoichiometry with a Lithium Battery', descargas: 75 },
        ],
        eventos: [
          { id: 'eve-1', tipo: 'Congresos y conferencias nacionales', meses: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0] },
          { id: 'eve-2', tipo: 'Congresos y conferencias internacionales', meses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { id: 'eve-3', tipo: 'Ponencias y seminarios nacionales', meses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        ],
        softwareHerramientas: [
          { id: 'soft-1', tipo: 'Software de investigación', meses: [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0] },
          { id: 'soft-2', tipo: 'Aplicaciones / APP móvil', meses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
          { id: 'soft-3', tipo: 'Herramientas y sitios web', meses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
        ],
      },
      s28_desarrolloColecciones: [
        { id: 'dc-1', titulo: 'Academic Search Ultimate + Business Source', proveedor: 'EBSCO Information Services', fechaInicio: '2026-01-01', fechaFin: '2026-12-31', costo: 28500, comentarios: 'Renovación anual institucional', area: 'Multidisciplinar', modelo: 'Suscripción anual' },
        { id: 'dc-2', titulo: 'E-Libro Cátedra Colección Completa', proveedor: 'E-Libro Corp.', fechaInicio: '2026-01-01', fechaFin: '2026-12-31', costo: 14200, comentarios: 'Acceso multiusuario ilimitado', area: 'Ciencias Sociales y Humanidades', modelo: 'Suscripción anual' },
        { id: 'dc-3', titulo: 'ASTM Compass Standards and Technical Papers', proveedor: 'ASTM International', fechaInicio: '2026-03-01', fechaFin: '2027-02-28', costo: 6800, comentarios: 'Suscripción requerida para acreditaciones de ingeniería', area: 'Ingeniería y Tecnología', modelo: 'Suscripción anual' },
      ],
      s29_acervosHistoricos: [
        { id: 'ah-1', procedencia: 'Archivo histórico del conflicto armado', titulosMes: [12, 15, 18, 14, 20, 22, 10, 18, 25, 21, 16, 8], paginasMes: [850, 1100, 1340, 980, 1560, 1720, 750, 1420, 1890, 1650, 1200, 600], atencionInvestigadores: 45 },
        { id: 'ah-2', procedencia: 'Colecciones Especiales', titulosMes: [8, 10, 12, 9, 14, 15, 7, 12, 16, 14, 11, 5], paginasMes: [520, 710, 890, 640, 980, 1120, 480, 910, 1250, 1080, 780, 390], atencionInvestigadores: 28 },
        { id: 'ah-3', procedencia: 'Hemeroteca / Revista ECA histórica', titulosMes: [15, 18, 22, 19, 25, 28, 12, 22, 30, 26, 20, 10], paginasMes: [1120, 1450, 1780, 1320, 2100, 2350, 980, 1890, 2450, 2190, 1620, 810], atencionInvestigadores: 62 },
        { id: 'ah-4', procedencia: 'Fondo Francisco Gavidia', titulosMes: [4, 6, 8, 5, 9, 10, 4, 8, 11, 9, 7, 3], paginasMes: [280, 420, 560, 350, 620, 710, 290, 580, 790, 680, 490, 210], atencionInvestigadores: 18 },
        { id: 'ah-5', procedencia: 'Tesis históricas UCA', titulosMes: [20, 25, 30, 26, 35, 38, 16, 31, 42, 37, 28, 14], paginasMes: [2400, 3100, 3850, 2980, 4450, 4980, 2100, 4050, 5420, 4890, 3600, 1800], atencionInvestigadores: 85 },
      ],
      s210_catalogadoKoha: {
        catalogadoMes: [120, 145, 180, 165, 210, 195, 90, 175, 230, 215, 160, 85],
        enProcesoMes: [35, 42, 48, 40, 55, 50, 28, 45, 60, 52, 38, 20],
        notaExplicativa: 'El flujo de catalogación en KOHA mantiene un ritmo promedio de 164 registros mensuales completados, con una baja estacional esperada en los periodos vacacionales de julio y diciembre.',
        analisisCualitativo: 'Se priorizó la catalogación de donaciones bibliográficas especializadas para postgrados y se inició la depuración de registros duplicados en el módulo de autoridades.',
        conclusiones: 'Se cumple satisfactoriamente la meta de procesamiento técnico con una reducción del 15% en el tiempo promedio de disponibilidad física del material.',
      },
      s211_atom: {
        depositosMes: [
          { id: 'at-1', comunidadColeccion: 'Archivo Histórico / Fotografías', meses: [15, 22, 28, 19, 34, 30, 12, 25, 38, 32, 21, 10] },
          { id: 'at-2', comunidadColeccion: 'Archivo Histórico / Manuscritos', meses: [8, 12, 16, 11, 20, 18, 7, 15, 22, 19, 13, 6] },
          { id: 'at-3', comunidadColeccion: 'Audiovisuales de Memoria', meses: [4, 7, 9, 6, 11, 10, 3, 8, 13, 11, 7, 3] },
        ],
        estadisticasDSpace: [
          { id: 'ds-1', indicador: 'Ítems nuevos incorporados', meses: [45, 62, 78, 85, 94, 112, 58, 89, 105, 98, 76, 42] },
          { id: 'ds-2', indicador: 'Descargas totales mensuales (miles)', meses: [32, 38, 45, 49, 56, 48, 28, 46, 59, 54, 43, 22] },
        ],
      },
      s212_propiedadIntelectual: [
        { id: 'pi-1', tipoRegistro: 'ISSN', codigo: '0256-6133', titulo: 'ECA: Estudios Centroamericanos', sello: 'UCA Editores', unidad: 'CRAI / DDP', ano: 2026, formato: 'Ambos', autores: 'Varios' },
        { id: 'pi-2', tipoRegistro: 'ISSN', codigo: '1995-1078', titulo: 'Realidad y Reflexión', sello: 'UCA Editores', unidad: 'Facultad de CC.SS.', ano: 2026, formato: 'Digital', autores: 'Varios' },
        { id: 'pi-3', tipoRegistro: 'ISBN', codigo: '978-99961-0-452-1', titulo: 'Ecología Integral y Bien Común en Centroamérica', sello: 'UCA Editores', unidad: 'Vicerrectoría de Investigación', ano: 2026, formato: 'Impreso', autores: 'Colectivo de Investigadores' },
        { id: 'pi-4', tipoRegistro: 'ISBN', codigo: '978-99961-0-453-8', titulo: 'Guía metodológica para la curaduría de datos en investigación', sello: 'CRAI UCA', unidad: 'CRAI', ano: 2026, formato: 'Digital', autores: 'Hernández, K.; Morales, J.' },
      ],
      s213_comunicaciones: [
        { id: 'com-1', red: 'Facebook CRAI UCA', periodo1: { publicaciones: 48, interacciones: 1420, seguidores: 8950, alcance: 34200 }, periodo2: { publicaciones: 52, interacciones: 1650, seguidores: 9320, alcance: 38900 } },
        { id: 'com-2', red: 'X (Twitter) @CRAI_UCA', periodo1: { publicaciones: 64, interacciones: 890, seguidores: 3100, alcance: 19500 }, periodo2: { publicaciones: 70, interacciones: 980, seguidores: 3250, alcance: 21400 } },
        { id: 'com-3', red: 'Instagram @crai.uca', periodo1: { publicaciones: 36, interacciones: 2150, seguidores: 4600, alcance: 28400 }, periodo2: { publicaciones: 42, interacciones: 2540, seguidores: 4980, alcance: 32100 } },
        { id: 'com-4', red: 'YouTube Canal CRAI UCA', periodo1: { publicaciones: 12, interacciones: 640, seguidores: 1450, alcance: 12800 }, periodo2: { publicaciones: 15, interacciones: 810, seguidores: 1580, alcance: 16200 } },
      ],
      s214_agendaCultural: {
        tertulias: [
          { id: 'ter-1', categoria: 'Estudiantes', presencial: 185, virtual: 94 },
          { id: 'ter-2', categoria: 'Docentes e Investigadores', presencial: 64, virtual: 42 },
          { id: 'ter-3', categoria: 'Empleados UCA', presencial: 48, virtual: 26 },
          { id: 'ter-4', categoria: 'Graduados y Visitantes', presencial: 52, virtual: 38 },
        ],
        actividades: [
          { id: 'act-1', fecha: '2026-03-24', hora: '16:00', nombre: 'Tertulia: Monseñor Romero en la memoria histórica', asistenciaPresencial: 85, visualizaciones: 340, lugar: 'Sala de Conferencias CRAI', verificacion: 'Lista de asistencia y transmisión FB' },
          { id: 'act-2', fecha: '2026-04-23', hora: '10:00', nombre: 'Feria del Libro y Lectura Libre Día del Idioma', asistenciaPresencial: 160, visualizaciones: 512, lugar: 'Atrio Central CRAI', verificacion: 'Registro fotográfico y firmas' },
        ],
      },
      s215_formacionesUsuarios: {
        actividades: [
          { id: 'fu-1', tema: 'Búsqueda avanzada en bases de datos EBSCO y JSTOR', tipo: 'Búsquedas efectivas', modalidad: 'Presencial', participantes: 42, fecha: '2026-02-18', facilitador: 'Kevin Hernández' },
          { id: 'fu-2', tema: 'Gestor bibliográfico RefWorks y normas APA 7a. edición', tipo: 'Refworks / APA', modalidad: 'Híbrida', participantes: 68, fecha: '2026-03-12', facilitador: 'María Ester Cerón' },
          { id: 'fu-3', tema: 'Prevención de plagio académico con Originality', tipo: 'Originality', modalidad: 'Virtual', participantes: 85, fecha: '2026-04-09', facilitador: 'Kevin Hernández' },
          { id: 'fu-4', tema: 'Huella digital e identificadores ORCID / Micelio', tipo: 'Huella del investigador', modalidad: 'Virtual', participantes: 34, fecha: '2026-05-14', facilitador: 'Jacqueline Morales' },
        ],
        resumenPorTipo: [
          { id: 'rt-1', tipo: 'Búsquedas efectivas y metabuscador', cantidad: 8, participantes: 210 },
          { id: 'rt-2', tipo: 'RefWorks y APA 7a.', cantidad: 12, participantes: 340 },
          { id: 'rt-3', tipo: 'Originality y ética académica', cantidad: 6, participantes: 195 },
          { id: 'rt-4', tipo: 'Huella del investigador y Micelio', cantidad: 4, participantes: 115 },
          { id: 'rt-5', tipo: 'Sesión de acogida pregrado', cantidad: 14, participantes: 520 },
        ],
      },
      s216_ingresosServicios: [
        { id: 'ing-1', area: 'Carnetización', servicio: 'Reposición de carné de biblioteca', precioUnitario: 5.00, cantidadMes: [25, 30, 45, 38, 50, 42, 18, 35, 55, 48, 30, 15] },
        { id: 'ing-2', area: 'Circulación', servicio: 'Mora por entrega tardía de material bibliográfico', precioUnitario: 0.50, cantidadMes: [180, 210, 310, 290, 380, 340, 110, 260, 420, 390, 280, 95] },
        { id: 'ing-3', area: 'Reprografía', servicio: 'Fotocopias e impresiones académicas', precioUnitario: 0.05, cantidadMes: [3500, 4200, 6100, 5800, 7200, 6400, 2100, 5400, 7800, 7200, 5100, 1900] },
        { id: 'ing-4', area: 'Servicios Externos', servicio: 'Pase de lectura temporal para usuarios externos', precioUnitario: 2.50, cantidadMes: [14, 18, 25, 22, 30, 28, 12, 24, 32, 29, 19, 8] },
      ],
      s217_seguridadSalud: {
        evacuaciones: [
          { id: 'ev-1', fecha: '2026-05-20', tipo: 'Simulacro nacional de terremoto', participantes: 285, tiempoMinutos: 3.5, observaciones: 'Evacuación ordenada hacia la zona segura del parqueo de biblioteca. Señalética funcional.' },
        ],
        actividadesPersonal: [
          { id: 'asp-1', actividad: 'Capacitación en uso de extintores y primeros auxilios', fecha: '2026-03-10', medio: 'Presencial / Brigada UCA', descripcion: 'Entrenamiento práctico al 100% del personal de sala y hemeroteca.' },
          { id: 'asp-2', actividad: 'Pausas activas y ergonomía laboral', fecha: '2026-04-15', medio: 'Presencial / Recursos Humanos', descripcion: 'Sesión guiada de estiramiento y postura frente al computador.' },
        ],
        actividadesUsuarios: [
          { id: 'asu-1', actividad: 'Campaña informativa de rutas de evacuación', fecha: '2026-02-05', medio: 'Carteleras físicas y pantallas digitales', descripcion: 'Difusión de mapas de emergencia en los 3 niveles del edificio.' },
        ],
      },
      s218_definiciones: [
        { id: 'def-1', categoria: 'Áreas MINED', codigo: 'Área 1', nombre: 'Ciencias Naturales y Exactas', descripcion: 'Física, Química, Biología, Matemáticas, Ciencias de la Tierra' },
        { id: 'def-2', categoria: 'Áreas MINED', codigo: 'Área 2', nombre: 'Ingeniería y Tecnología', descripcion: 'Civil, Eléctrica, Mecánica, Computación, Química Industrial' },
        { id: 'def-3', categoria: 'Áreas MINED', codigo: 'Área 3', nombre: 'Ciencias Médicas y de la Salud', descripcion: 'Medicina, Enfermería, Salud Pública, Farmacia' },
        { id: 'def-4', categoria: 'Áreas MINED', codigo: 'Área 4', nombre: 'Ciencias Agrícolas y Veterinarias', descripcion: 'Agronomía, Producción Animal, Silvicultura' },
        { id: 'def-5', categoria: 'Áreas MINED', codigo: 'Área 5', nombre: 'Ciencias Sociales', descripcion: 'Economía, Sociología, Derecho, Educación, Psicología' },
        { id: 'def-6', categoria: 'Áreas MINED', codigo: 'Área 6', nombre: 'Humanidades y Arte', descripcion: 'Filosofía, Teología, Historia, Literatura, Lingüística' },
        { id: 'def-7', categoria: 'Publicación', codigo: 'PUB_INDEX', nombre: 'Publicación indexada', descripcion: 'Artículo arbitrado publicado en revista indexada en Scopus, WoS, SciELO o Latindex Catálogo 2.0' },
        { id: 'def-8', categoria: 'TIC', codigo: 'REC_ELEC', nombre: 'Recurso Electrónico', descripcion: 'Bases de datos de texto completo, libros electrónicos y herramientas especializadas suscritas por el CRAI' },
      ],
    },
  };
}

/**
 * Clona la estructura de un año hacia un año nuevo.
 * Mantiene intactas las categorías, nombres de recursos, revistas,
 * subactividades, rubros presupuestarios, indicadores y cabecera,
 * pero inicializa todos los valores numéricos en 0 y textos observados en blanco.
 */
export function cloneYearStructure(source: YearData, newYear: number): YearData {
  const cloneMonths = () => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  return {
    year: newYear,
    status: 'sin_iniciar',
    lastModified: new Date().toISOString(),
    modifiedBy: source.modifiedBy || 'Kevin Hernández',
    poa: {
      presupuesto: source.poa.presupuesto.map((p, idx) => ({
        id: `pres-${newYear}-${idx + 1}`,
        rubro: p.rubro,
        monto: 0,
        comentarios: '',
      })),
      publicaciones: source.poa.publicaciones.map((pub, idx) => ({
        id: `pub-${newYear}-${idx + 1}`,
        tipo: pub.tipo,
        lineaBase: pub.resultadosActual || 0, // La línea base del nuevo año es el resultado observado del año anterior
        proyeccionActual: pub.proyeccionSiguiente || 0, // La proyección actual es la proyección que se dejó para este año
        resultadosActual: 0,
        proyeccionSiguiente: 0,
        observaciones: '',
      })),
      depositosMensuales: {
        lineaBase: [...(source.poa.depositosMensuales.resultados || cloneMonths())], // El resultado anterior pasa a ser la nueva base
        proyeccion: cloneMonths(),
        resultados: cloneMonths(),
        proyeccionSiguiente: cloneMonths(),
      },
      adopcion: {
        universoInvestigadores: source.poa.adopcion.universoInvestigadores || 184,
        tasaRegistroBase: source.poa.adopcion.tasaRegistroMeta || 100,
        tasaRegistroMeta: (source.poa.adopcion.tasaRegistroMeta || 100) + 10,
        tasaRegistroObservado: 0,
        tasaConversionBase: source.poa.adopcion.tasaConversionMeta || 88,
        tasaConversionMeta: (source.poa.adopcion.tasaConversionMeta || 88) + 10,
        tasaConversionObservado: 0,
      },
      subactividades: source.poa.subactividades.map((sub, idx) => ({
        id: `sub-${newYear}-${idx + 1}`,
        descripcion: sub.descripcion,
        cantidad: 0,
      })),
      visibilidadPerfiles: source.poa.visibilidadPerfiles.map((p, idx) => ({
        id: `per-${newYear}-${idx + 1}`,
        investigador: p.investigador,
        visualizaciones: 0,
      })),
      analisisCualitativo: {
        maxCaracteres: source.poa.analisisCualitativo.maxCaracteres || 1000,
        semestre1: { logro: '', dificultades: '', acciones: '', resumen: '' },
        anual: { logro: '', dificultades: '', acciones: '', resumen: '' },
      },
    },
    siu: {
      cabecera: {
        ...source.siu.cabecera,
        ano: newYear,
      },
      controlReportes: [
        { id: `cr-${newYear}-1`, reporte: 'Preliminar (Enero - Junio)', fechaLimite: `${newYear}-07-15`, responsable: source.siu.cabecera.personaEnlace, correo: source.siu.cabecera.correoEnlace, estado: 'Pendiente' },
        { id: `cr-${newYear}-2`, reporte: 'Anual (Enero - Diciembre)', fechaLimite: `${newYear + 1}-01-20`, responsable: source.siu.cabecera.personaEnlace, correo: source.siu.cabecera.correoEnlace, estado: 'Pendiente' },
      ],
      s21_formacion: [],
      s22_planMejora: source.siu.s22_planMejora.map((pm, idx) => ({
        id: `pm-${newYear}-${idx + 1}`,
        categoria: pm.categoria,
        acciones: pm.acciones,
        indicador: pm.indicador,
        periodo: `Anual ${newYear}`,
        actividades: '',
        logros: '',
      })),
      s23_recursosElectronicos: source.siu.s23_recursosElectronicos.map((re, idx) => ({
        id: `re-${newYear}-${idx + 1}`,
        recurso: re.recurso,
        meses: cloneMonths(),
        anterior: re.meses.reduce((a, b) => a + b, 0), // El anterior se hereda de la suma del año que se clona
      })),
      s24_visitasObras: {
        visitasHombres: cloneMonths(),
        visitasMujeres: cloneMonths(),
        obrasConsultadas: cloneMonths(),
        carnesEmitidos: source.siu.s24_visitasObras.carnesEmitidos.map((c, idx) => ({
          id: `c-${newYear}-${idx + 1}`,
          tipo: c.tipo,
          cantidad: 0,
        })),
      },
      s25_portalRevistas: {
        articulosPublicados: source.siu.s25_portalRevistas.articulosPublicados.map((a, idx) => ({
          id: `ar-${newYear}-${idx + 1}`,
          revista: a.revista,
          meses: cloneMonths(),
        })),
        numerosPublicados: source.siu.s25_portalRevistas.numerosPublicados.map((n, idx) => ({
          id: `num-${newYear}-${idx + 1}`,
          revista: n.revista,
          meses: cloneMonths(),
        })),
        visibilidadVistas: source.siu.s25_portalRevistas.visibilidadVistas.map((v, idx) => ({
          id: `vis-${newYear}-${idx + 1}`,
          revista: v.revista,
          meses: cloneMonths(),
        })),
        visibilidadAnterior: source.siu.s25_portalRevistas.visibilidadVistas.map((v, idx) => ({
          id: `van-${newYear}-${idx + 1}`,
          revista: v.revista,
          meses: [...v.meses],
        })),
        descargasCamjol: source.siu.s25_portalRevistas.descargasCamjol?.map((d, idx) => ({
          id: `cam-${newYear}-${idx + 1}`,
          revista: d.revista,
          meses: cloneMonths(),
        })) || [],
      },
      s26_repositorioRIUCA: {
        documentos: [],
        crecimientoMensual: cloneMonths(),
      },
      s27_micelio: {
        publicacionesMes: source.siu.s27_micelio.publicacionesMes.map((p, idx) => ({
          id: `m-pub-${newYear}-${idx + 1}`,
          tipo: p.tipo,
          meses: cloneMonths(),
        })),
        proyectosMes: source.siu.s27_micelio.proyectosMes.map((p, idx) => ({
          id: `m-proj-${newYear}-${idx + 1}`,
          tipo: p.tipo,
          meses: cloneMonths(),
        })),
        vistasRegion: source.siu.s27_micelio.vistasRegion.map((r, idx) => ({
          id: `vr-${newYear}-${idx + 1}`,
          region: r.region,
          vistas: 0,
        })),
        paisesMicelio: source.siu.s27_micelio.paisesMicelio.map((p, idx) => ({
          id: `pmic-${newYear}-${idx + 1}`,
          pais: p.pais,
          vistas: 0,
        })),
        paisesAnalytics: source.siu.s27_micelio.paisesAnalytics.map((p, idx) => ({
          id: `pga-${newYear}-${idx + 1}`,
          pais: p.pais,
          vistas: 0,
        })),
        ciudades: source.siu.s27_micelio.ciudades.map((c, idx) => ({
          id: `ciu-${newYear}-${idx + 1}`,
          ciudad: c.ciudad,
          vistasMicelio: 0,
          vistasAnalytics: 0,
        })),
        visitasMesComparativo: {
          anioAnterior: [...source.siu.s27_micelio.visitasMesComparativo.anioActual],
          anioActual: cloneMonths(),
        },
        loMasDescargado: [],
        eventos: source.siu.s27_micelio.eventos.map((e, idx) => ({
          id: `eve-${newYear}-${idx + 1}`,
          tipo: e.tipo,
          meses: cloneMonths(),
        })),
        softwareHerramientas: source.siu.s27_micelio.softwareHerramientas.map((s, idx) => ({
          id: `soft-${newYear}-${idx + 1}`,
          tipo: s.tipo,
          meses: cloneMonths(),
        })),
      },
      s28_desarrolloColecciones: source.siu.s28_desarrolloColecciones.map((dc, idx) => ({
        id: `dc-${newYear}-${idx + 1}`,
        titulo: dc.titulo,
        proveedor: dc.proveedor,
        fechaInicio: `${newYear}-01-01`,
        fechaFin: `${newYear}-12-31`,
        costo: dc.costo,
        comentarios: 'Renovación proyectada',
        area: dc.area,
        modelo: dc.modelo,
      })),
      s29_acervosHistoricos: source.siu.s29_acervosHistoricos.map((ah, idx) => ({
        id: `ah-${newYear}-${idx + 1}`,
        procedencia: ah.procedencia,
        titulosMes: cloneMonths(),
        paginasMes: cloneMonths(),
        atencionInvestigadores: 0,
      })),
      s210_catalogadoKoha: {
        catalogadoMes: cloneMonths(),
        enProcesoMes: cloneMonths(),
        notaExplicativa: '',
        analisisCualitativo: '',
        conclusiones: '',
      },
      s211_atom: {
        depositosMes: source.siu.s211_atom.depositosMes.map((d, idx) => ({
          id: `at-${newYear}-${idx + 1}`,
          comunidadColeccion: d.comunidadColeccion,
          meses: cloneMonths(),
        })),
        estadisticasDSpace: source.siu.s211_atom.estadisticasDSpace.map((e, idx) => ({
          id: `ds-${newYear}-${idx + 1}`,
          indicador: e.indicador,
          meses: cloneMonths(),
        })),
      },
      s212_propiedadIntelectual: source.siu.s212_propiedadIntelectual.map((pi, idx) => ({
        ...pi,
        id: `pi-${newYear}-${idx + 1}`,
        ano: newYear,
      })),
      s213_comunicaciones: source.siu.s213_comunicaciones.map((c, idx) => ({
        id: `com-${newYear}-${idx + 1}`,
        red: c.red,
        periodo1: { publicaciones: 0, interacciones: 0, seguidores: c.periodo2.seguidores || 0, alcance: 0 },
        periodo2: { publicaciones: 0, interacciones: 0, seguidores: c.periodo2.seguidores || 0, alcance: 0 },
      })),
      s214_agendaCultural: {
        tertulias: source.siu.s214_agendaCultural.tertulias.map((t, idx) => ({
          id: `ter-${newYear}-${idx + 1}`,
          categoria: t.categoria,
          presencial: 0,
          virtual: 0,
        })),
        actividades: [],
      },
      s215_formacionesUsuarios: {
        actividades: [],
        resumenPorTipo: source.siu.s215_formacionesUsuarios.resumenPorTipo.map((r, idx) => ({
          id: `rt-${newYear}-${idx + 1}`,
          tipo: r.tipo,
          cantidad: 0,
          participantes: 0,
        })),
      },
      s216_ingresosServicios: source.siu.s216_ingresosServicios.map((ing, idx) => ({
        id: `ing-${newYear}-${idx + 1}`,
        area: ing.area,
        servicio: ing.servicio,
        precioUnitario: ing.precioUnitario,
        cantidadMes: cloneMonths(),
      })),
      s217_seguridadSalud: {
        evacuaciones: [],
        actividadesPersonal: [],
        actividadesUsuarios: [],
      },
      s218_definiciones: [...source.siu.s218_definiciones],
    },
  };
}
