const mongoose = require('mongoose');

const historiaSchema = new mongoose.Schema({
  cedula: { 
    type: mongoose.Schema.Types.String, 
    ref: 'Usuario',
    required: true
  },
  datosGenerales: {
    nombreCompleto: { type: String, required: true },
    edad: { type: Number, required: true },
    fechaNacimiento: { type: Date, required: true },
    ocupacion: { type: String, required: true },
    telefono: { type: String, required: true },
    correo: { type: String, required: true },
    motivo: { type: String, required: true } // ← NUEVO CAMPO AGREGADO AQUÍ
  },
  historialClinico: {
    afeccionesCutaneas: [String],
    enfermedadesCronicas: [String],
    alergias: { type: [String], default: [] },
    medicacionActual: { type: String, default: '' },
    embarazoLactancia: {
      tipo: { type: String, enum: ['No', 'Embarazo', 'Lactancia'], default: 'No' },
      semanasEmbarazo: { type: Number, default: null }
    },
    tratamientoMedicoActual: { type: String, default: '' },
    medicamentosContinuos: { type: [String], default: [] },
    cirugiasRecientes: { type: [String], default: [] }
  },
  estiloVidaYHabitos: {
    nivelEstres: { type: String, enum: ['Bajo', 'Medio', 'Alto'], default: 'Medio' },
    consumoAgua: { type: Number, default: 0 },
    alimentacion: { type: String, enum: ['Balanceada', 'Desordenada', 'Rica en grasas'], default: 'Balanceada' },
    horasSueño: { type: Number, default: 7 },
    consumoSustancias: {
      alcohol: { type: Boolean, default: false },
      tabaco: { type: Boolean, default: false },
      cafeina: { type: Boolean, default: false }
    }
  },
  cuidadoFacialActual: {
    protectorSolar: { type: String, enum: ['Si', 'No', 'A veces'], default: 'No' },
    frecuenciaLimpiezaFacial: { type: String, enum: ['Mensual', 'Trimestral', 'Nunca'], default: 'Nunca' },
    productosActuales: { type: [String], default: [] },
    rutinaDiaria: { type: [String], default: [] }
  },
  diagnosticoFacial: {
    tipoPiel: { type: String, enum: ['Normal', 'Grasa', 'Seca', 'Mixta', 'Sensible/Reactiva'], default: 'Normal' },
    observacionVisual: { type: [String], default: [] },
    observacionLamparaWood: { type: [String], default: [] },
    observacionTactil: { type: [String], default: [] }
  },
  planTratamiento: {
    diagnosticoFinal: { type: String, default: '' },
    tratamientoRecomendado: { type: String, default: '' },
    frecuenciaSugerida: { type: Number, default: 1 },
    numSesiones: { type: Number, default: 1 },
    aparatologia: { type: [String], default: [] }
  }
}, { timestamps: true });

module.exports = mongoose.model('HistoriaClinica', historiaSchema);