import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Patient from './models/Patient.js';
import Doctor from './models/Doctor.js';
import Department from './models/Department.js';
import Bed from './models/Bed.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Patient.deleteMany({}),
      Doctor.deleteMany({}),
      Department.deleteMany({}),
      Bed.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    const password = await bcrypt.hash('password123', 12);

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@healthai.com',
      password,
      role: 'admin',
      phone: '9999999999',
      isVerified: true,
    });
    console.log('✅ Admin created: admin@healthai.com / password123');

    // Create Doctors
    const doctorUsers = await User.insertMany([
      { name: 'Rajesh Sharma', email: 'dr.rajesh@healthai.com', password, role: 'doctor', phone: '9876543210', isVerified: true },
      { name: 'Priya Patel', email: 'dr.priya@healthai.com', password, role: 'doctor', phone: '9876543211', isVerified: true },
      { name: 'Amit Kumar', email: 'dr.amit@healthai.com', password, role: 'doctor', phone: '9876543212', isVerified: true },
      { name: 'Sneha Gupta', email: 'dr.sneha@healthai.com', password, role: 'doctor', phone: '9876543213', isVerified: true },
      { name: 'Vikram Singh', email: 'dr.vikram@healthai.com', password, role: 'doctor', phone: '9876543214', isVerified: false },
    ]);

    // Create Departments
    const departments = await Department.insertMany([
      { name: 'Cardiology', description: 'Heart and cardiovascular system' },
      { name: 'Neurology', description: 'Brain and nervous system' },
      { name: 'Orthopedics', description: 'Bones, joints, and muscles' },
      { name: 'Pediatrics', description: 'Child healthcare' },
      { name: 'Dermatology', description: 'Skin conditions and treatment' },
      { name: 'General Medicine', description: 'Primary healthcare and diagnostics' },
    ]);

    // Create Doctor profiles
    await Doctor.insertMany([
      {
        userId: doctorUsers[0]._id, specialization: 'Cardiology', qualification: 'MD, DM Cardiology',
        experience: 15, licenseNumber: 'MCI-2010-001', departmentId: departments[0]._id,
        consultationFee: 800, rating: 4.8, totalReviews: 120, isAvailable: true,
        availability: [
          { day: 'Mon', startTime: '09:00', endTime: '13:00' },
          { day: 'Wed', startTime: '09:00', endTime: '13:00' },
          { day: 'Fri', startTime: '14:00', endTime: '18:00' },
        ],
      },
      {
        userId: doctorUsers[1]._id, specialization: 'Neurology', qualification: 'MD, DM Neurology',
        experience: 10, licenseNumber: 'MCI-2014-002', departmentId: departments[1]._id,
        consultationFee: 1000, rating: 4.9, totalReviews: 85, isAvailable: true,
        availability: [
          { day: 'Tue', startTime: '10:00', endTime: '14:00' },
          { day: 'Thu', startTime: '10:00', endTime: '14:00' },
          { day: 'Sat', startTime: '09:00', endTime: '12:00' },
        ],
      },
      {
        userId: doctorUsers[2]._id, specialization: 'Orthopedics', qualification: 'MS Orthopedics',
        experience: 8, licenseNumber: 'MCI-2016-003', departmentId: departments[2]._id,
        consultationFee: 600, rating: 4.5, totalReviews: 60, isAvailable: true,
        availability: [
          { day: 'Mon', startTime: '14:00', endTime: '18:00' },
          { day: 'Wed', startTime: '14:00', endTime: '18:00' },
          { day: 'Fri', startTime: '09:00', endTime: '13:00' },
        ],
      },
      {
        userId: doctorUsers[3]._id, specialization: 'Pediatrics', qualification: 'MD Pediatrics',
        experience: 12, licenseNumber: 'MCI-2012-004', departmentId: departments[3]._id,
        consultationFee: 500, rating: 4.7, totalReviews: 150, isAvailable: true,
        availability: [
          { day: 'Mon', startTime: '09:00', endTime: '17:00' },
          { day: 'Tue', startTime: '09:00', endTime: '17:00' },
          { day: 'Thu', startTime: '09:00', endTime: '17:00' },
        ],
      },
      {
        userId: doctorUsers[4]._id, specialization: 'Dermatology', qualification: 'MD Dermatology',
        experience: 5, licenseNumber: 'MCI-2019-005', departmentId: departments[4]._id,
        consultationFee: 700, isAvailable: true,
        availability: [{ day: 'Sat', startTime: '10:00', endTime: '16:00' }],
      },
    ]);
    console.log('✅ 5 Doctors created (1 unverified for admin testing)');

    // Create Patients
    const patientUsers = await User.insertMany([
      { name: 'Chetan Prajapat', email: 'chetan@healthai.com', password, role: 'patient', phone: '9123456780', isVerified: true },
      { name: 'Ananya Verma', email: 'ananya@healthai.com', password, role: 'patient', phone: '9123456781', isVerified: true },
      { name: 'Rohan Mehta', email: 'rohan@healthai.com', password, role: 'patient', phone: '9123456782', isVerified: true },
    ]);

    await Patient.insertMany([
      {
        userId: patientUsers[0]._id, dateOfBirth: new Date('1998-05-15'), gender: 'male', bloodGroup: 'B+',
        height: 175, weight: 72, allergies: ['Penicillin'], chronicConditions: [],
        emergencyContact: { name: 'Parent', phone: '9876000001', relation: 'Father' },
        address: { street: '123 Main St', city: 'Ahmedabad', state: 'Gujarat', zip: '380001' },
      },
      {
        userId: patientUsers[1]._id, dateOfBirth: new Date('1995-08-22'), gender: 'female', bloodGroup: 'A+',
        height: 162, weight: 58, allergies: [], chronicConditions: ['Asthma'],
        emergencyContact: { name: 'Spouse', phone: '9876000002', relation: 'Husband' },
        address: { street: '456 Park Ave', city: 'Mumbai', state: 'Maharashtra', zip: '400001' },
      },
      {
        userId: patientUsers[2]._id, dateOfBirth: new Date('2000-01-10'), gender: 'male', bloodGroup: 'O+',
        height: 180, weight: 85, allergies: ['Dust'], chronicConditions: ['Hypertension'],
        emergencyContact: { name: 'Sister', phone: '9876000003', relation: 'Sister' },
        address: { street: '789 Lake Rd', city: 'Delhi', state: 'Delhi', zip: '110001' },
      },
    ]);
    console.log('✅ 3 Patients created');

    // Create Beds
    const bedData = [];
    const bedTypes = ['general', 'icu', 'private', 'semi-private'];
    const statuses = ['available', 'available', 'available', 'occupied', 'maintenance'];
    let bedNum = 1;
    for (const dept of departments.slice(0, 4)) {
      for (let i = 0; i < 5; i++) {
        bedData.push({
          bedNumber: `${dept.name.substring(0, 3).toUpperCase()}-${String(bedNum++).padStart(3, '0')}`,
          departmentId: dept._id,
          type: bedTypes[i % 4],
          status: statuses[i % 5],
          dailyRate: [500, 2000, 1500, 800][i % 4],
        });
      }
    }
    await Bed.insertMany(bedData);
    console.log('✅ 20 Beds created across 4 departments');

    console.log('\n🎉 Seed complete! Login credentials:');
    console.log('─────────────────────────────────────');
    console.log('Admin:   admin@healthai.com / password123');
    console.log('Doctor:  dr.rajesh@healthai.com / password123');
    console.log('Doctor:  dr.priya@healthai.com / password123');
    console.log('Patient: chetan@healthai.com / password123');
    console.log('Patient: ananya@healthai.com / password123');
    console.log('─────────────────────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
