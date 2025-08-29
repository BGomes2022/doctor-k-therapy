// Debug script to test patient data decryption
const { getAllPatients } = require('./utils/jsonPatientStorage.ts');

async function debugPatients() {
  console.log('🔍 Testing patient data decryption...');
  
  try {
    const result = await getAllPatients();
    
    if (result.success) {
      console.log(`✅ Successfully loaded ${result.patients.length} patients`);
      
      result.patients.forEach((patient, index) => {
        console.log(`\n--- Patient ${index + 1}: ${patient.patientName} ---`);
        console.log('Basic Info:', {
          email: patient.patientEmail,
          bookingToken: patient.bookingToken
        });
        
        console.log('Medical Data:', {
          fullName: patient.medicalFormData?.fullName,
          dateOfBirth: patient.medicalFormData?.dateOfBirth,
          phone: patient.medicalFormData?.phone,
          emergencyContactName: patient.medicalFormData?.emergencyContactName,
          doctorName: patient.medicalFormData?.doctorName,
          currentMedications: patient.medicalFormData?.currentMedications,
          hasData: !!patient.medicalFormData && Object.keys(patient.medicalFormData).length > 0
        });
      });
    } else {
      console.error('❌ Failed to load patients:', result.error);
    }
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugPatients();