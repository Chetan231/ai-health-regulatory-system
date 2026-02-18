import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Department from '../models/Department.js';
import Appointment from '../models/Appointment.js';
import Report from '../models/Report.js';
import Prescription from '../models/Prescription.js';
import Vital from '../models/Vital.js';
import Invoice from '../models/Invoice.js';
import Notification from '../models/Notification.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all
    await Promise.all([
      User.deleteMany(), Patient.deleteMany(), Doctor.deleteMany(),
      Department.deleteMany(), Appointment.deleteMany(), Report.deleteMany(),
      Prescription.deleteMany(), Vital.deleteMany(), Invoice.deleteMany(),
      Notification.deleteMany(),
    ]);
    console.log('🗑️ Cleared all collections');

    // Create departments
    const departments = await Department.create([
      { name: 'Cardiology', description: 'Heart and cardiovascular system' },
      { name: 'Neurology', description: 'Brain and nervous system' },
      { name: 'Orthopedics', description: 'Bones, joints, and muscles' },
      { name: 'Dermatology', description: 'Skin conditions and treatments' },
      { name: 'Pediatrics', description: 'Children health care' },
    ]);
    console.log('🏥 Departments created');

    // Create admin
    const admin = await User.create({
      name: 'Admin User', email: 'admin@health.com', password: 'admin123',
      role: 'admin', phone: '+1234567890', isVerified: true,
    });

    // Create doctors
    const doctorUsers = await User.create([
      { name: 'Dr. Sarah Smith', email: 'sarah@health.com', password: 'doctor123', role: 'doctor', phone: '+1234567891', isVerified: true },
      { name: 'Dr. John Williams', email: 'john@health.com', password: 'doctor123', role: 'doctor', phone: '+1234567892', isVerified: true },
      { name: 'Dr. Emily Chen', email: 'emily@health.com', password: 'doctor123', role: 'doctor', phone: '+1234567893', isVerified: true },
    ]);

    const doctors = await Doctor.create([
      { userId: doctorUsers[0]._id, specialization: 'Cardiology', licenseNumber: 'MED-001', department: departments[0]._id, experience: 12, consultationFee: 800, isApproved: true, rating: 4.8, availability: [{ day: 'monday', startTime: '09:00', endTime: '17:00' }, { day: 'wednesday', startTime: '09:00', endTime: '17:00' }, { day: 'friday', startTime: '09:00', endTime: '15:00' }] },
      { userId: doctorUsers[1]._id, specialization: 'Neurology', licenseNumber: 'MED-002', department: departments[1]._id, experience: 8, consultationFee: 1000, isApproved: true, rating: 4.5, availability: [{ day: 'tuesday', startTime: '10:00', endTime: '18:00' }, { day: 'thursday', startTime: '10:00', endTime: '18:00' }] },
      { userId: doctorUsers[2]._id, specialization: 'Dermatology', licenseNumber: 'MED-003', department: departments[3]._id, experience: 5, consultationFee: 600, isApproved: true, rating: 4.7, availability: [{ day: 'monday', startTime: '08:00', endTime: '16:00' }, { day: 'tuesday', startTime: '08:00', endTime: '16:00' }, { day: 'wednesday', startTime: '08:00', endTime: '14:00' }] },
    ]);
    console.log('👨‍⚕️ Doctors created');

    // Create patients
    const patientUsers = await User.create([
      { name: 'Rahul Kumar', email: 'rahul@test.com', password: 'patient123', role: 'patient', phone: '+9198765001', isVerified: true },
      { name: 'Priya Sharma', email: 'priya@test.com', password: 'patient123', role: 'patient', phone: '+9198765002', isVerified: true },
      { name: 'Amit Patel', email: 'amit@test.com', password: 'patient123', role: 'patient', phone: '+9198765003', isVerified: true },
    ]);

    const patients = await Patient.create([
      { userId: patientUsers[0]._id, dateOfBirth: new Date('1995-03-15'), gender: 'male', bloodGroup: 'B+', allergies: ['Penicillin'], chronicConditions: ['Asthma'], height: 175, weight: 72, emergencyContact: { name: 'Vikram Kumar', phone: '+9198765010', relation: 'Father' } },
      { userId: patientUsers[1]._id, dateOfBirth: new Date('1990-07-22'), gender: 'female', bloodGroup: 'A+', allergies: ['Peanuts', 'Dust'], chronicConditions: [], height: 162, weight: 58, emergencyContact: { name: 'Deepak Sharma', phone: '+9198765011', relation: 'Husband' } },
      { userId: patientUsers[2]._id, dateOfBirth: new Date('1988-11-30'), gender: 'male', bloodGroup: 'O+', allergies: [], chronicConditions: ['Diabetes Type 2', 'Hypertension'], height: 170, weight: 85, emergencyContact: { name: 'Meena Patel', phone: '+9198765012', relation: 'Wife' } },
    ]);
    console.log('🧑 Patients created');

    // Create appointments
    const now = new Date();
    const appointments = await Appointment.create([
      { patient: patientUsers[0]._id, doctor: doctorUsers[0]._id, date: new Date(now.getTime() + 86400000), timeSlot: '10:00', type: 'in-person', status: 'confirmed', symptoms: 'Chest pain and shortness of breath' },
      { patient: patientUsers[1]._id, doctor: doctorUsers[2]._id, date: new Date(now.getTime() + 172800000), timeSlot: '11:00', type: 'in-person', status: 'pending', symptoms: 'Skin rash on arms' },
      { patient: patientUsers[2]._id, doctor: doctorUsers[0]._id, date: new Date(now.getTime() - 86400000), timeSlot: '14:00', type: 'in-person', status: 'completed', symptoms: 'Follow-up for blood pressure' },
      { patient: patientUsers[0]._id, doctor: doctorUsers[1]._id, date: new Date(now.getTime() - 172800000), timeSlot: '10:30', type: 'online', status: 'completed', symptoms: 'Recurring headaches' },
    ]);
    console.log('📅 Appointments created');

    // Create reports
    const reports = await Report.create([
      {
        patient: patientUsers[0]._id, doctor: doctorUsers[0]._id, appointment: appointments[2]._id,
        type: 'cbc', title: 'Complete Blood Count', description: 'Routine CBC test',
        results: [
          { parameter: 'Hemoglobin', value: '14.5', unit: 'g/dL', normalRange: '13.5-17.5', status: 'normal' },
          { parameter: 'WBC Count', value: '11200', unit: '/μL', normalRange: '4500-11000', status: 'high' },
          { parameter: 'Platelet Count', value: '250000', unit: '/μL', normalRange: '150000-400000', status: 'normal' },
          { parameter: 'RBC Count', value: '5.1', unit: 'M/μL', normalRange: '4.7-6.1', status: 'normal' },
        ],
        aiSummary: 'CBC results are mostly normal. WBC count is slightly elevated, suggesting a mild infection or inflammatory response. Monitor and retest in 2 weeks.',
      },
      {
        patient: patientUsers[2]._id, doctor: doctorUsers[0]._id,
        type: 'lipid-panel', title: 'Lipid Panel Report', description: 'Fasting lipid profile',
        results: [
          { parameter: 'Total Cholesterol', value: '245', unit: 'mg/dL', normalRange: '<200', status: 'high' },
          { parameter: 'LDL', value: '160', unit: 'mg/dL', normalRange: '<100', status: 'high' },
          { parameter: 'HDL', value: '38', unit: 'mg/dL', normalRange: '>40', status: 'low' },
          { parameter: 'Triglycerides', value: '180', unit: 'mg/dL', normalRange: '<150', status: 'high' },
        ],
        aiSummary: 'Lipid panel shows elevated cholesterol and triglycerides with low HDL. Cardiovascular risk is elevated. Recommend dietary changes, exercise, and possible statin therapy.',
      },
      {
        patient: patientUsers[1]._id, doctor: doctorUsers[2]._id,
        type: 'blood-test', title: 'Thyroid Function Test', description: 'TSH and T4 levels',
        results: [
          { parameter: 'TSH', value: '2.5', unit: 'mIU/L', normalRange: '0.4-4.0', status: 'normal' },
          { parameter: 'Free T4', value: '1.1', unit: 'ng/dL', normalRange: '0.8-1.8', status: 'normal' },
        ],
      },
    ]);
    console.log('🧪 Reports created');

    // Create prescriptions
    await Prescription.create([
      {
        patient: patientUsers[0]._id, doctor: doctorUsers[0]._id, appointment: appointments[2]._id,
        diagnosis: 'Mild Upper Respiratory Infection',
        medications: [
          { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days', instructions: 'Take after meals' },
          { name: 'Paracetamol', dosage: '650mg', frequency: 'As needed', duration: '5 days', instructions: 'Take for fever above 100°F' },
          { name: 'Cetrizine', dosage: '10mg', frequency: 'Once daily', duration: '5 days', instructions: 'Take at bedtime' },
        ],
        notes: 'Rest well and drink plenty of fluids. Follow up in 1 week if symptoms persist.',
      },
      {
        patient: patientUsers[2]._id, doctor: doctorUsers[0]._id,
        diagnosis: 'Hypertension & Dyslipidemia',
        medications: [
          { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take in the morning' },
          { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', duration: '30 days', instructions: 'Take at night after dinner' },
          { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days', instructions: 'Take with meals' },
        ],
        notes: 'Monitor blood pressure daily. Follow low-sodium, low-fat diet. Exercise 30 min daily.',
      },
    ]);
    console.log('💊 Prescriptions created');

    // Create vitals
    const vitalEntries = [];
    for (let d = 29; d >= 0; d--) {
      const date = new Date(now.getTime() - d * 86400000);
      vitalEntries.push(
        { patient: patientUsers[0]._id, type: 'heart-rate', value: String(65 + Math.floor(Math.random() * 20)), unit: 'bpm', recordedAt: date },
        { patient: patientUsers[0]._id, type: 'blood-pressure', value: `${115 + Math.floor(Math.random() * 20)}/${70 + Math.floor(Math.random() * 15)}`, unit: 'mmHg', recordedAt: date },
      );
      if (d % 3 === 0) {
        vitalEntries.push(
          { patient: patientUsers[2]._id, type: 'glucose', value: String(100 + Math.floor(Math.random() * 60)), unit: 'mg/dL', recordedAt: date },
          { patient: patientUsers[2]._id, type: 'blood-pressure', value: `${130 + Math.floor(Math.random() * 25)}/${80 + Math.floor(Math.random() * 15)}`, unit: 'mmHg', recordedAt: date },
        );
      }
    }
    await Vital.create(vitalEntries);
    console.log('📊 Vitals created (30 days of data)');

    // Create invoices (sequentially to avoid duplicate key)
    await Invoice.create({ invoiceNumber: 'INV-000001', patient: patientUsers[0]._id, doctor: doctorUsers[0]._id, appointment: appointments[2]._id, items: [{ description: 'Consultation Fee', amount: 800 }, { description: 'CBC Test', amount: 500 }, { description: 'Medication', amount: 350 }], total: 1650, status: 'paid', paidAt: new Date(), dueDate: new Date(now.getTime() + 604800000) });
    await Invoice.create({ invoiceNumber: 'INV-000002', patient: patientUsers[2]._id, doctor: doctorUsers[0]._id, items: [{ description: 'Consultation Fee', amount: 800 }, { description: 'Lipid Panel', amount: 700 }, { description: 'ECG', amount: 400 }], total: 1900, status: 'pending', dueDate: new Date(now.getTime() + 604800000) });
    await Invoice.create({ invoiceNumber: 'INV-000003', patient: patientUsers[1]._id, doctor: doctorUsers[2]._id, items: [{ description: 'Consultation Fee', amount: 600 }, { description: 'Thyroid Test', amount: 450 }], total: 1050, status: 'paid', paidAt: new Date(now.getTime() - 172800000), dueDate: new Date(now.getTime() + 432000000) });
    console.log('💰 Invoices created');

    console.log('\n✅ Seed completed!\n');
    console.log('📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:   admin@health.com / admin123');
    console.log('Doctor:  sarah@health.com / doctor123');
    console.log('Doctor:  john@health.com / doctor123');
    console.log('Doctor:  emily@health.com / doctor123');
    console.log('Patient: rahul@test.com / patient123');
    console.log('Patient: priya@test.com / patient123');
    console.log('Patient: amit@test.com / patient123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seed();
