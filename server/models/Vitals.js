import mongoose from 'mongoose';

const vitalsSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bloodPressure: {
      systolic: { type: Number },
      diastolic: { type: Number },
    },
    heartRate: { type: Number }, // bpm
    temperature: { type: Number }, // °F
    oxygenSaturation: { type: Number }, // %
    bloodSugar: {
      fasting: { type: Number },
      postMeal: { type: Number },
    },
    bmi: { type: Number },
    weight: { type: Number }, // kg
    respiratoryRate: { type: Number }, // breaths per min
    recordedAt: { type: Date, default: Date.now },
    recordedBy: { type: String, enum: ['self', 'doctor', 'device'], default: 'self' },
    notes: { type: String },
    alerts: [
      {
        type: { type: String },
        message: { type: String },
        severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
      },
    ],
  },
  { timestamps: true }
);

// Auto-generate alerts based on vitals
vitalsSchema.pre('save', function (next) {
  this.alerts = [];

  // Blood pressure checks
  if (this.bloodPressure?.systolic) {
    if (this.bloodPressure.systolic >= 180 || this.bloodPressure.diastolic >= 120) {
      this.alerts.push({ type: 'blood_pressure', message: 'Hypertensive crisis detected!', severity: 'critical' });
    } else if (this.bloodPressure.systolic >= 140 || this.bloodPressure.diastolic >= 90) {
      this.alerts.push({ type: 'blood_pressure', message: 'High blood pressure detected', severity: 'high' });
    } else if (this.bloodPressure.systolic < 90 || this.bloodPressure.diastolic < 60) {
      this.alerts.push({ type: 'blood_pressure', message: 'Low blood pressure detected', severity: 'high' });
    }
  }

  // Heart rate checks
  if (this.heartRate) {
    if (this.heartRate > 120) {
      this.alerts.push({ type: 'heart_rate', message: 'Abnormally high heart rate', severity: 'high' });
    } else if (this.heartRate < 50) {
      this.alerts.push({ type: 'heart_rate', message: 'Abnormally low heart rate', severity: 'high' });
    }
  }

  // Oxygen saturation
  if (this.oxygenSaturation) {
    if (this.oxygenSaturation < 90) {
      this.alerts.push({ type: 'oxygen', message: 'Critical oxygen level!', severity: 'critical' });
    } else if (this.oxygenSaturation < 95) {
      this.alerts.push({ type: 'oxygen', message: 'Low oxygen saturation', severity: 'medium' });
    }
  }

  // Temperature
  if (this.temperature) {
    if (this.temperature >= 103) {
      this.alerts.push({ type: 'temperature', message: 'High fever detected!', severity: 'critical' });
    } else if (this.temperature >= 100.4) {
      this.alerts.push({ type: 'temperature', message: 'Fever detected', severity: 'medium' });
    }
  }

  // Blood sugar
  if (this.bloodSugar?.fasting) {
    if (this.bloodSugar.fasting > 200) {
      this.alerts.push({ type: 'blood_sugar', message: 'Very high fasting blood sugar', severity: 'critical' });
    } else if (this.bloodSugar.fasting > 126) {
      this.alerts.push({ type: 'blood_sugar', message: 'High fasting blood sugar (diabetic range)', severity: 'high' });
    }
  }

  next();
});

export default mongoose.model('Vitals', vitalsSchema);
