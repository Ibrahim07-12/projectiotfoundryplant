import { initializeApp } from 'firebase/app';
import { getDatabase, ref, remove, set } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCVPq1fWkO6paNBgb5Y5UjGEHOhwMpXlWE",
  authDomain: "lampu-plant-monitoring.firebaseapp.com", 
  databaseURL: "https://lampu-plant-monitoring-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lampu-plant-monitoring",
  storageBucket: "lampu-plant-monitoring.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function cleanupFirebaseData() {
  console.log('🧹 Starting Firebase Database Cleanup...');
  
  try {
    // 1. Delete conflicting area data
    console.log('🗑️ Cleaning conflicting areas...');
    await remove(ref(database, 'areas/fp1-lane-cd-utara'));
    await remove(ref(database, 'areas/fp1-lane-c-d-utara'));
    await remove(ref(database, 'areas/fp1-area-3'));
    console.log('✅ Conflicting areas cleaned');
    
    // 2. Delete old device mappings
    console.log('🗑️ Cleaning device mappings...');
    await remove(ref(database, 'devices/ESP32_AREA3'));
    await remove(ref(database, 'devices/ESP32_AREA3_LANE_CD_UTARA'));
    console.log('✅ Device mappings cleaned');
    
    // 3. Delete old commands
    console.log('🗑️ Cleaning commands...');
    await remove(ref(database, 'commands/ESP32_AREA3'));
    await remove(ref(database, 'commands/ESP32_AREA3_LANE_CD_UTARA'));
    console.log('✅ Commands cleaned');
    
    // 4. Delete old heartbeats
    console.log('🗑️ Cleaning heartbeats...');
    await remove(ref(database, 'heartbeat/ESP32_AREA3'));
    await remove(ref(database, 'heartbeat/ESP32_AREA3_LANE_CD_UTARA'));
    console.log('✅ Heartbeats cleaned');
    
    // 5. Ensure Lane A B Selatan structure exists
    console.log('🎯 Creating clean Lane A B Selatan structure...');
    const laneABSelatanData = {
      id: 'fp1-lane-ab-selatan',
      name: 'Lane A B Selatan',
      plant: 'foundry-plant-1',
      status: 'OFF',
      zone: 'Molding and Core',
      coordinates: {
        x: 350,
        y: 120
      },
      lastUpdate: Date.now()
    };
    
    await set(ref(database, 'areas/fp1-lane-ab-selatan'), laneABSelatanData);
    console.log('✅ Lane A B Selatan structure created');
    
    console.log('🎉 Firebase cleanup completed successfully!');
    console.log('📋 Next steps:');
    console.log('1. Upload ESP32_AREA3_LANE_AB_SELATAN_FIXED.ino to ESP32');
    console.log('2. Monitor ESP32 serial output');
    console.log('3. Test website toggle for Lane A B Selatan');
    
  } catch (error) {
    console.error('❌ Firebase cleanup failed:', error);
  }
}

// Run cleanup
cleanupFirebaseData();
