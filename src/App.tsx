// Komponen khusus Lane C D Utara untuk monitoring daya
import React, { useState, useRef, useEffect } from 'react';

type LaneCDUtaraPanelProps = {
  isOn: boolean;
  areaKey: string;
  getAreaName: (areaNum: number) => string;
  toggleArea: (areaKey: string) => void;
  toggleMainLane: (areaKey: string) => void;
  kontaktorKeys: string[];
  areaStates: Record<string, boolean>;
  toggleKontaktor: (kontaktorKey: string) => void;
};

function LaneCDUtaraPanel({ isOn, areaKey, getAreaName, toggleArea, toggleMainLane, kontaktorKeys, areaStates, toggleKontaktor }: LaneCDUtaraPanelProps) {
  // Dummy state, ganti dengan hook Firebase jika sudah siap
  const [boxPanel] = useState<{ voltage: number; current: number; power: number; daily: any[]; monthlyKwh: number; monthlyKwhByMonth: Record<string, number> }>({ voltage: 0, current: 0, power: 0, daily: [], monthlyKwh: 0, monthlyKwhByMonth: {} });
  const [showPowerGraph, setShowPowerGraph] = useState(false);
  // Dropdown tahun dan bulan
  const now = new Date();
  const thisYear = now.getFullYear();
  const [selectedYear, setSelectedYear] = useState(thisYear);
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12
  // Daftar tahun: 2025 sampai 5 tahun ke depan
  const yearOptions = Array.from({ length: 6 }, (_, i) => thisYear - 1 + i); // 2024-2029
  // Daftar bulan: 1-12
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('id-ID', { month: 'long' })
  }));
  // Key untuk ambil kWh: 'YYYY-MM'
  const kwhKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const kwhBulanIni = boxPanel.monthlyKwhByMonth?.[kwhKey] ?? 0;
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '8px',
      backgroundColor: 'white',
      padding: '12px',
      borderRadius: '6px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: isOn ? '2px solid #4caf50' : '2px solid #f44336',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Status Indicator Circle */}
        <div style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: isOn ? '#4caf50' : '#f44336',
          marginRight: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'white'
          }}></div>
        </div>
        {/* Area Info */}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', color: '#333', fontSize: '13px' }}>
            {getAreaName(10)}
          </div>
          {/* Ganti label dengan pembacaan realtime */}
          <div style={{ fontSize: '11px', color: '#333', display: 'flex', gap: 12 }}>
            <span><b>Tegangan:</b> {boxPanel.voltage.toFixed(1)} V</span>
            <span><b>Arus:</b> {boxPanel.current.toFixed(2)} A</span>
            <span><b>Daya:</b> {boxPanel.power.toFixed(1)} W</span>
          </div>
        </div>
        {/* ON/OFF Button */}
        <button
          onClick={() => kontaktorKeys.length > 0 ? toggleMainLane(areaKey) : toggleArea(areaKey)}
          style={{
            backgroundColor: isOn ? '#4caf50' : '#f44336',
            color: 'white',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 'bold',
            minWidth: '45px',
            transition: 'all 0.2s ease',
            marginLeft: 10
          }}
        >
          {isOn ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Individual Kontaktor Controls */}
      {kontaktorKeys.length > 0 && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '8px 12px',
          borderTop: '1px solid #e9ecef',
          marginTop: '8px'
        }}>
          <div style={{ 
            fontSize: '10px', 
            color: '#666', 
            marginBottom: '6px',
            fontWeight: 'bold'
          }}>
            Individual Kontaktor Controls:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {kontaktorKeys.map((kontaktorKey, index) => {
              const kontaktorIsOn = areaStates[kontaktorKey];
              const kontaktorNum = index + 1;
              
              return (
                <button
                  key={kontaktorKey}
                  onClick={() => toggleKontaktor(kontaktorKey)}
                  style={{
                    backgroundColor: kontaktorIsOn ? '#4caf50' : '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '9px',
                    fontWeight: 'bold',
                    minWidth: '35px',
                    transition: 'all 0.2s ease',
                    flex: '1',
                    maxWidth: '70px'
                  }}
                >
                  K{kontaktorNum}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Toggle grafik daya harian */}
      <div style={{ marginTop: 8 }}>
        <button
          onClick={() => setShowPowerGraph(v => !v)}
          style={{
            background: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: 4
          }}
        >
          {showPowerGraph ? 'Sembunyikan Grafik Daya Harian' : 'Lihat Grafik Daya Harian'}
        </button>
        {/* Dropdown tahun dan bulan */}
        <div style={{ margin: '8px 0 4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 'bold', marginRight: 4 }}>Tahun:</label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4 }}
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <label style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 8, marginRight: 4 }}>Bulan:</label>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4 }}
          >
            {monthOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {showPowerGraph && (
          <div style={{ marginTop: 8 }}>
            {/* Placeholder grafik, ganti dengan Chart.js/Recharts sesuai data boxPanel.daily */}
            <div style={{ height: 120, background: '#f5f5f5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 12 }}>
              [Grafik Daya Harian]
            </div>
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 'bold', color: '#333' }}>
              Total kWh bulan ini: {kwhBulanIni.toFixed(2)} kWh
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


import { authService } from './services/authService';
import { monitoringService } from './services/monitoringService';
import type { User } from './types/auth';
import type { Area, AreaStates, ManualPositions, ShapeType } from './types/monitoring';
// import type { Device } from './types/monitoring'; // Temporarily disabled

function App() {
  console.log('🏭 App component starting...');
  
  const [currentView, setCurrentView] = useState<'home' | 'login' | 'monitoring'>('login');
  
  // State untuk authentication
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string>('');
  
  // State untuk login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // State untuk edit mode dan manual positioning
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const [selectedKontaktor, setSelectedKontaktor] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isShapeEditing, setIsShapeEditing] = useState(false);
  const [isResizeEditing, setIsResizeEditing] = useState(false);
  const [clickTimer, setClickTimer] = useState<NodeJS.Timeout | null>(null);

  const [controlMode, setControlMode] = useState<'move' | 'shape' | 'resize' | null>(null);
  
  // State untuk copy/paste ukuran`
  const [copiedSize, setCopiedSize] = useState<{ width: number; height: number } | null>(null);
  
  // State untuk save status
  const [saveMessage, setSaveMessage] = useState('');

  // State untuk lebar kaki T (Lane C D Selatan)
  const [tFootWidth, setTFootWidth] = useState(() => {
    const saved = localStorage.getItem('iot-t-foot-width');
    return saved ? parseInt(saved) : 25; // default 25%
  });

  // State untuk data monitoring
  const [areas, setAreas] = useState<{ [key: string]: Area }>({});
  // const [devices, setDevices] = useState<{ [key: string]: Device }>({}); // Temporarily disabled

  // Refs untuk container plants
  const plant1Ref = useRef<HTMLDivElement>(null);
  const plant2Ref = useRef<HTMLDivElement>(null);
  
  // State untuk kontrol ON/OFF setiap area dan sub-area kontaktor - akan di-sync dengan Firebase
  const [areaStates, setAreaStates] = useState<AreaStates>({
    // Main Lane Controls
    'fp1-lane-b': false,        // Area 1 → Lane B (CHANGED: was fp1-lane-a)
    'fp1-lane-c': false,        // Area 2 → Lane C (CHANGED: was fp1-lane-b)
    'fp1-lane-d': false,        // Area 3 → Lane D (CHANGED: was fp1-lane-c)
    'fp1-lane-a': false,        // Area 4 → Lane A (CHANGED: was fp1-lane-d)
    'fp1-lane-melting-p2': false, // Area 5 → Lane Melting (Plant 2)
    'fp1-lane-ab-selatan': false, // Area 7 → Lane A B Selatan (CORRECTED: yang kotak biasa)
    'fp1-lane-cd-selatan': false,   // Area 8 → Lane C D Selatan (SWAPPED: was cd-utara)
    'fp1-lane-ab-utara': false,   // Area 9 → Lane A B Utara (CHANGED: was fp1-lane-cd-utara)
    'fp1-lane-cd-utara': false, // Area 10 → Lane C D Utara (SWAPPED: was cd-selatan)
    'fp1-lane-melting-p1': false,  // Area 11 → Lane Melting (Plant 1)
    
    // Sub-Area Kontaktor Controls
    // Lane AB Selatan (2 Kontaktor)
    'fp1-lane-ab-selatan-k1': false,
    'fp1-lane-ab-selatan-k2': false,
    
    // Lane AB Utara (4 Kontaktor) 
    'fp1-lane-ab-utara-k1': false,
    'fp1-lane-ab-utara-k2': false,
    'fp1-lane-ab-utara-k3': false,
    'fp1-lane-ab-utara-k4': false,
    
    // Lane CD Selatan (2 Kontaktor)
    'fp1-lane-cd-selatan-k1': false,
    'fp1-lane-cd-selatan-k2': false,
    
    // Lane CD Utara (2 Kontaktor)
    'fp1-lane-cd-utara-k1': false,
    'fp1-lane-cd-utara-k2': false,
    
    // Lane D (3 Kontaktor)
    'fp1-lane-d-k1': false,
    'fp1-lane-d-k2': false,
    'fp1-lane-d-k3': false,
    
    // Lane C (3 Kontaktor)
    'fp1-lane-c-k1': false,
    'fp1-lane-c-k2': false,
    'fp1-lane-c-k3': false,
    
    // Lane A (3 Kontaktor)
    'fp1-lane-a-k1': false,
    'fp1-lane-a-k2': false,
    'fp1-lane-a-k3': false,
    
    // Lane B (2 Kontaktor)
    'fp1-lane-b-k1': false,
    'fp1-lane-b-k2': false,
  });

  console.log('🏭 Area States initialized:', areaStates);

  // Function to get default positions - Check for saved default first
  const getDefaultPositions = (): ManualPositions => {
    console.log('📐 Getting default positions...');
    
    // First, check if user has saved a custom default layout
    const savedDefault = localStorage.getItem('iot-plant-default-positions');
    if (savedDefault) {
      try {
        const customDefault = JSON.parse(savedDefault);
        console.log('✅ Using saved custom default layout:', customDefault);
        return customDefault;
      } catch (e) {
        console.warn('❌ Failed to parse saved default layout, using built-in default:', e);
      }
    }
    
    // Built-in default layout (updated with new mapping) - ONLY KONTAKTOR POSITIONS
    console.log('📐 Using built-in default layout - Kontaktor positions only...');
    


    // Add melting areas (rendered as single areas, not kontaktors)
    const meltingAreas = {
      'fp1-lane-melting-p1': { top: 74.39927855007022, left: 35.63474387527836, width: 27.171492248997, height: 17.23633278007112, customShape: 'rectangle' as ShapeType },
      'fp1-lane-melting-p2': { top: 71.78524984425695, left: 50.779510022271715, width: 15.144766146993312, height: 18.499280071909354, customShape: 'rectangle' as ShapeType }
    };

    // Generate kontaktor positions AND melting area positions
    const positions: any = {};
    
    // Add melting areas first (single areas, not kontaktors)
    Object.entries(meltingAreas).forEach(([key, position]) => {
      positions[key] = position;
    });
    


    // Define specific kontaktor positions instead of auto-generation
    const kontaktorPositions = {
      // Lane A B Selatan kontaktors
      'fp1-lane-ab-selatan-k1': {
        top: 13.673380922715609,
        left: 15.14476614699332,
        width: 35.077951002229796,
        height: 16.689567233661702
      },
      'fp1-lane-ab-selatan-k2': {
        top: 29.960790551244497,
        left: 15.697847973795936,
        width: 34.632516703788816,
        height: 17.49388375852733
      },
      
      // Lane A B Utara kontaktors
      'fp1-lane-ab-utara-k1': {
        top: 13.874460053932017,
        left: 49.88864142538922,
        width: 34.07572383073497,
        height: 12.265924806327176
      },
      'fp1-lane-ab-utara-k2': {
        top: 25.738128795699968,
        left: 49.88864142538922,
        width: 34.29844097995545,
        height: 11.461608281461555
      },
      'fp1-lane-ab-utara-k3': {
        top: 36.998560143818715,
        left: 49.88864142538922,
        width: 34.075723830734965,
        height: 10.054054362946708
      },
      'fp1-lane-ab-utara-k4': {
        top: 46.851437573422594,
        left: 50.11135857461024,
        width: 33.85300668151448,
        height: 11.05945001902874
      },
      
      // Lane C D Selatan kontaktors
      'fp1-lane-cd-selatan-k1': {
        top: 47.253595835855414,
        left: 15.701559020044542,
        width: 34.74387527839643,
        height: 14.477737507581232
      },
      'fp1-lane-cd-selatan-k2': {
        top: 61.821781347063265,
        left: 15.367483296213807,
        width: 34.521158129175944,
        height: 29.960830611244496,
        customShape: 'T' as ShapeType,
        cutoutWidth: 30,
        cutoutHeight: 40,
        stemWidth: 18.76391982182628,
        headWidth: 98.66369710467706,
        headHeight: 42.43992785500703
      },
      
      // Lane C D Utara kontaktors
      'fp1-lane-cd-utara-k1': {
        top: 57.910789790324934,
        left: 49.88864142538975,
        width: 34.29844097995546,
        height: 9.249641535954677,
        customShape: 'rectangle' as ShapeType
      },
      'fp1-lane-cd-utara-k2': {
        top: 66.75827156384679,
        left: 49.66592427616927,
        width: 34.521158129175944,
        height: 6.434533698924993
      },
      
      // Lane D kontaktors
      'fp1-lane-d-k1': {
        top: 9.657402397847491,
        left: 65.47934187081931,
        width: 15.187824795842616,
        height: 30.13237545833131
      },
      'fp1-lane-d-k2': {
        top: 39.417113817875574,
        left: 65.74511766888911,
        width: 14.519673348181147,
        height: 27.719425883734438
      },
      'fp1-lane-d-k3': {
        top: 66.76387566330679,
        left: 65.56545916851792,
        width: 14.519673348181147,
        height: 23.295684996973506
      },
      
      // Lane C kontaktors
      'fp1-lane-c-k1': {
        top: 9.852877429603895,
        left: 51.44766146993339,
        width: 14.121009651076466,
        height: 20.735612851980516
      },
      'fp1-lane-c-k2': {
        top: 30.161869682460896,
        left: 51.53749072011899,
        width: 14.566443949517446,
        height: 21.942087639278956
      },
      'fp1-lane-c-k3': {
        top: 52.07949498504916,
        left: 51.40311871976788,
        width: 14.566443949517447,
        height: 20.534533720764113
      },
      
      // Lane A kontaktors
      'fp1-lane-a-k1': {
        top: 10.255035920356708,
        left: 22.939866370073467,
        width: 14.624350650948108,
        height: 21.91762530258825
      },
      'fp1-lane-a-k2': {
        top: 31.569423600975743,
        left: 22.85820296187709,
        width: 14.624350650948108,
        height: 19.906833990424186
      },
      'fp1-lane-a-k3': {
        top: 51.47625759139994,
        left: 23.23311038962451,
        width: 14.401633501727616,
        height: 20.107913121640593
      },
      
      // Lane B kontaktors
      'fp1-lane-b-k1': {
        top: 9.852877429603895,
        left: 37.63919821826282,
        width: 13.786191536748332,
        height: 45.414389430778165
      },
      'fp1-lane-b-k2': {
        top: 55.29676108451165,
        left: 37.61692650334077,
        width: 13.786191536748332,
        height: 34.55611634509224
      }
    };
    
    // Add all kontaktor positions to the final positions object
    Object.entries(kontaktorPositions).forEach(([key, position]) => {
      positions[key] = position;
    });

    console.log('📐 Final positions (kontaktors + melting):', positions);
    return positions;
  };

  // State untuk posisi manual kotak - bisa diubah secara interaktif
  const [manualPositions, setManualPositions] = useState<ManualPositions>(() => {
    console.log('🔧 === INITIALIZING MANUAL POSITIONS ===');
    console.log('🌐 Current URL:', window.location.href);
    
    // Debug: Check what's in localStorage
    console.log('📊 localStorage content:');
    console.log('- iot-plant-positions:', localStorage.getItem('iot-plant-positions') ? 'EXISTS' : 'NOT FOUND');
    console.log('- iot-plant-default-positions:', localStorage.getItem('iot-plant-default-positions') ? 'EXISTS' : 'NOT FOUND');
    
    // Priority 1: Load saved default layout FIRST (after Save as Default)
    const savedDefault = localStorage.getItem('iot-plant-default-positions');
    if (savedDefault) {
      try {
        const defaultPositions = JSON.parse(savedDefault);
        console.log('🎯 PRIORITY 1: Loading from iot-plant-default-positions (SAVED DEFAULT)');
        console.log('✅ USING SAVED DEFAULT POSITIONS');
        return defaultPositions;
      } catch (e) {
        console.warn('❌ Failed to load saved default positions:', e);
        localStorage.removeItem('iot-plant-default-positions'); // Clear corrupted data
      }
    } else {
      console.log('ℹ️ PRIORITY 1: No saved default positions found');
    }
    
    console.log('🎯 PRIORITY 2: Using kontaktor built-in defaults');
    console.log('✅ USING BUILT-IN DEFAULT POSITIONS (kontaktorpositions)');
    // Priority 2: Fall back to kontaktor defaults
    return getDefaultPositions();
  });

  // Save positions to localStorage whenever they change (skip initial load)
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      console.log('🔄 Initial load completed, skipping auto-save');
      return; // Skip saving on initial load
    }
    
    // Don't auto-save if user just saved as default (let default take priority)
    // Check if user has saved default - if yes, DON'T auto-save to iot-plant-positions
    const hasDefaultSaved = localStorage.getItem('iot-plant-default-positions');
    if (hasDefaultSaved) {
      console.log('� Skipping auto-save - user saved as default, preserving priority');
      return;
    }
    
    console.log('�💾 Auto-saving current positions to localStorage...');
    localStorage.setItem('iot-plant-positions', JSON.stringify(manualPositions));
    console.log('✅ Auto-saved to iot-plant-positions');
    
    // Set save message but only show it briefly
    setSaveMessage('💾 Layout tersimpan otomatis');
    
    // Clear message after 1.5 seconds
    const timer = setTimeout(() => {
      setSaveMessage('');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [manualPositions]);

  // Save T foot width to localStorage
  useEffect(() => {
    localStorage.setItem('iot-t-foot-width', tFootWidth.toString());
  }, [tFootWidth]);

  // Debug: Check if kontaktor positions are available and force regeneration if needed
  useEffect(() => {
    console.log('🔧 Current manual positions:', manualPositions);
    console.log('🌐 localStorage keys:', Object.keys(localStorage).filter(k => k.includes('iot-')));
    
    // Check for kontaktor positions
    const kontaktorPositions = Object.keys(manualPositions).filter(key => key.includes('-k'));
    const areaPositions = Object.keys(manualPositions).filter(key => !key.includes('-k'));
    console.log('📍 Available kontaktor positions:', kontaktorPositions);
    console.log('🏭 Available area positions:', areaPositions);
    
    // Check for old main lane positions that should be removed
    const mainLanePositions = Object.keys(manualPositions).filter(key => 
      key.includes('fp1-lane-') && !key.includes('-k')
    );
    
    if (kontaktorPositions.length === 0 || mainLanePositions.length > 0) {
      console.warn('⚠️ Detected old layout or missing kontaktors! Regenerating positions...');
      
      // Check if user has saved default - if yes, DON'T delete it, just regenerate current
      const hasSavedDefault = localStorage.getItem('iot-plant-default-positions');
      if (hasSavedDefault) {
        console.log('🛡️ Preserving user saved default, only clearing current positions');
        localStorage.removeItem('iot-plant-positions');
        // DON'T delete iot-plant-default-positions - keep user's saved layout!
      } else {
        console.log('🧹 No saved default found, clearing all positions');
        localStorage.removeItem('iot-plant-positions');
        localStorage.removeItem('iot-plant-default-positions');
      }
      
      setManualPositions(getDefaultPositions());
    }
  }, []);  // Authentication state listener with timeout
  useEffect(() => {
    console.log('🔐 Setting up Firebase auth listener...');
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setCurrentView('login');
      }
    }, 5000);
    const unsubscribe = authService.onAuthStateChange((authUser) => {
      clearTimeout(timeoutId);
      if (authUser && authUser.uid) {
        setUser(authUser);
        setIsLoading(false);
        setCurrentView('monitoring'); // hanya jika user valid
      } else {
        setUser(null);
        setIsLoading(false);
        setCurrentView('login'); // jika user tidak valid
      }
    });
    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [isLoading]);

  // Setup monitoring listeners when authenticated
  useEffect(() => {
    if (user && currentView === 'monitoring') {
      console.log(' Setting up monitoring listeners...');
      
      // Listen to areas changes
      const unsubscribeAreas = monitoringService.onAreasChange((areasData) => {
        console.log('📊 Raw areas data received:', areasData);
        setAreas(areasData);
        
        // Update area states based on Firebase data
        const newAreaStates: AreaStates = {};
        
        // Process all areas (both website format and ESP32 format)
        Object.values(areasData).forEach((area: Area) => {
          newAreaStates[area.id] = area.status === 'ON';
          console.log(`📊 Area Update: ${area.id} = ${area.status} (${area.status === 'ON' ? 'ON' : 'OFF'})`);
          console.log(`🔍 Device Info: ${area.device?.id || 'N/A'} - ${area.device?.name || 'N/A'}`);
          
          // 🚨 DEBUG: Special logging for Area 7 & 8 cross-activation issue
          if (area.id === 'fp1-lane-ab-selatan') {
            console.log('🚨 FIREBASE UPDATE - Area 7 (Lane A B Selatan):', area);
          }
          
          if (area.id === 'fp1-lane-cd-selatan') {
            console.log('🚨 FIREBASE UPDATE - Area 8 (Lane C D Selatan):', area);
          }
        });
        
        console.log('🚨 DEBUG - Full Areas Data:', areasData);
        console.log('🚨 DEBUG - Final Area States:', newAreaStates);
        
        // TEMPORARILY DISABLED: Legacy ESP32 format mapping for testing
        // Problem: fp1-area-2 data is being mapped to Lane B, causing confusion
        // Need to clean database first before re-enabling
        /*
        const legacyESP32Mapping = {
          'fp1-area-1': 'fp1-lane-a',           // Legacy ESP32 Area 1 → Lane A (if still used)
          'fp1-area-2': 'fp1-lane-b',           // Legacy ESP32 Area 2 → Lane B (if still used)  
          'fp1-area-3': 'fp1-lane-c',           // Legacy ESP32 Area 3 → Lane C (if still used)
          'fp1-area-7': 'fp1-lane-ab-selatan',  // Legacy ESP32 Area 7 → Lane A B Selatan (if still used)
        };
        
        // Process legacy ESP32 format areas only if they exist
        Object.entries(legacyESP32Mapping).forEach(([esp32Key, websiteKey]) => {
          if (areasData[esp32Key]) {
            const esp32Area = areasData[esp32Key];
            console.log(`🔄 Legacy ESP32 Mapping: ${esp32Key} (${esp32Area.status}) → ${websiteKey}`);
            newAreaStates[websiteKey] = esp32Area.status === 'ON';
            
            // Also create a proper area object for website format if not exists
            if (!areasData[websiteKey]) {
              setAreas(prev => ({
                ...prev,
                [websiteKey]: {
                  ...esp32Area,
                  id: websiteKey
                }
              }));
            }
          }
        });
        */
        
        console.log('📊 Final area states:', newAreaStates);
        setAreaStates(newAreaStates);
      });

      // Listen to devices changes
      // const unsubscribeDevices = monitoringService.onDevicesChange((devicesData) => {
      //   setDevices(devicesData);
      // });

      return () => {
        console.log(' Cleaning up monitoring listeners...');
        unsubscribeAreas();
        // unsubscribeDevices();
      };
    }
  }, [user, currentView]);

  // Test Firebase connection (development only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(' Firebase Config Check:');
      console.log('API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing');
      console.log('Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing');
      console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing');
      
      // Test auth service availability
      try {
        const currentUser = authService.getCurrentUser();
        console.log('Auth Service:', '✅ Available');
        console.log('Current User:', currentUser ? '✅ Logged In' : '❌ Not Logged In');
      } catch (error) {
        console.error('❌ Auth Service Error:', error);
        // Fallback to home if auth service fails
        setTimeout(() => {
          setIsLoading(false);
          setCurrentView('home');
        }, 2000);
      }
    }
  }, []);

  // Global mouse event handlers untuk edit mode
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if ((isDragging || isResizing) && selectedArea) {
        handleMouseMove(e);
      }
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isEditMode || !selectedArea) return;
      
      // Arrow keys for fine movement and resizing
      const areaKey = getAreaKey(selectedArea);
      const position = manualPositions[areaKey];
      const step = e.shiftKey ? 5 : 1; // Larger steps with Shift
      
      let newPos = { ...position };
      
      if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd + Arrow keys for resizing
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            newPos.width = Math.max(5, position.width - step);
            break;
          case 'ArrowRight':
            e.preventDefault();
            newPos.width = Math.min(80, position.width + step);
            break;
          case 'ArrowUp':
            e.preventDefault();
            newPos.height = Math.max(5, position.height - step);
            break;
          case 'ArrowDown':
            e.preventDefault();
            newPos.height = Math.min(80, position.height + step);
            break;
        }
      } else {
        // Regular arrow keys for movement
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            newPos.left = Math.max(0, position.left - step);
            break;
          case 'ArrowRight':
            e.preventDefault();
            newPos.left = Math.min(90, position.left + step);
            break;
          case 'ArrowUp':
            e.preventDefault();
            newPos.top = Math.max(0, position.top - step);
            break;
          case 'ArrowDown':
            e.preventDefault();
            newPos.top = Math.min(90, position.top + step);
            break;
        }
      }
      
      // Other shortcuts
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setSelectedArea(null);
          break;
        case 'c':
          if (e.ctrlKey) {
            e.preventDefault();
            copySize();
          }
          break;
        case 'v':
          if (e.ctrlKey) {
            e.preventDefault();
            pasteSize();
          }
          break;
      }
      
      if (newPos !== position) {
        setManualPositions((prev: ManualPositions) => ({
          ...prev,
          [areaKey]: newPos
        }));
      }
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }
    
    if (isEditMode) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDragging, isResizing, selectedArea, isEditMode, manualPositions]);

  // Helper function to get area key from number - Updated for new lane names
  // ESP32 compatibility: Map between website format and ESP32 format
  const getESP32AreaKey = (areaNum: number): string => {
    const esp32Mapping: { [key: number]: string } = {
      1: 'fp1-lane-b',           // ESP32 Area 1 → Lane B (CHANGED: was fp1-lane-a)
      2: 'fp1-lane-c',           // ESP32 Area 2 → Lane C (CHANGED: was fp1-lane-b)
      3: 'fp1-lane-d',           // ESP32 Area 3 → Lane D (CHANGED: corrected mapping)
      7: 'fp1-lane-ab-selatan',  // ESP32 Area 7 → Lane A B Selatan (FIXED: was cd-selatan!)
      // Add more ESP32 mappings as needed
    };
    
    return esp32Mapping[areaNum] || `fp1-area-${areaNum}`;
  };

  const getAreaKey = (areaNum: number): string => {
    const areaMapping: { [key: number]: string } = {
      1: 'fp1-lane-b',           // Area 1 → Lane B (CHANGED: was Lane A)
      2: 'fp1-lane-c',           // Area 2 → Lane C (CHANGED: was Lane B)
      3: 'fp1-lane-d',           // Area 3 → Lane D (CHANGED: was Lane C)
      4: 'fp1-lane-a',           // Area 4 → Lane A (CHANGED: was Lane D)
      5: 'fp1-lane-melting-p2',  // Area 5 → Lane Melting (Plant 2)
      // Area 6 dihapus
      7: 'fp1-lane-ab-selatan',  // Area 7 → Lane A B Selatan (CORRECTED: kotak biasa)
      8: 'fp1-lane-cd-selatan',    // Area 8 → Lane C D Selatan (SWAPPED: was cd-utara)
      9: 'fp1-lane-ab-utara',    // Area 9 → Lane A B Utara (CHANGED: was Lane C D Utara)
      10: 'fp1-lane-cd-utara', // Area 10 → Lane C D Utara (SWAPPED: was cd-selatan)
      11: 'fp1-lane-melting-p1'  // Area 11 → Lane Melting (Plant 1)
      // Area 12 dihapus
    };
    
    return areaMapping[areaNum] || `fp1-area-${areaNum}`;
  };

  // Helper function to get area name from number
  const getAreaName = (areaNum: number): string => {
    const nameMapping: { [key: number]: string } = {
      1: 'Lane B',                   // CHANGED: Area 1 → Lane B (was Lane A)
      2: 'Lane C',                   // CHANGED: Area 2 → Lane C (was Lane B) 
      3: 'Lane D',                   // CHANGED: Area 3 → Lane D (was Lane C)
      4: 'Lane A',                   // CHANGED: Area 4 → Lane A (was Lane D)
      5: 'Lane Melting (Plant 2)',
      7: 'Lane A B Selatan',       // CORRECTED: Area 7 → Lane A B Selatan (kotak biasa)
      8: 'Lane C D Selatan',         // SWAPPED: Area 8 → Lane C D Selatan (was Lane C D Utara)
      9: 'Lane A B Utara',         // CHANGED: Area 9 → Lane A B Utara (was Lane C D Utara)
      10: 'Lane C D Utara',      // SWAPPED: Area 10 → Lane C D Utara (was Lane C D Selatan)
      11: 'Lane Melting (Plant 1)'
    };
    
    return nameMapping[areaNum] || `Area ${areaNum}`;
  };

  // Helper function to get kontaktor configuration per lane
  const getLaneKontaktorConfig = (areaKey: string) => {
    const kontaktorConfig: { [key: string]: { count: number; names: string[] } } = {
      'fp1-lane-ab-selatan': { 
        count: 2, 
        names: ['Kontaktor 1', 'Kontaktor 2'] 
      },
      'fp1-lane-ab-utara': { 
        count: 4, 
        names: ['Kontaktor 1', 'Kontaktor 2', 'Kontaktor 3', 'Kontaktor 4'] 
      },
      'fp1-lane-cd-selatan': { 
        count: 2, 
        names: ['Kontaktor 1', 'Kontaktor 2'] 
      },
      'fp1-lane-cd-utara': { 
        count: 2, 
        names: ['Kontaktor 1', 'Kontaktor 2'] 
      },
      'fp1-lane-d': { 
        count: 3, 
        names: ['Kontaktor 1', 'Kontaktor 2', 'Kontaktor 3'] 
      },
      'fp1-lane-c': { 
        count: 3, 
        names: ['Kontaktor 1', 'Kontaktor 2', 'Kontaktor 3'] 
      },
      'fp1-lane-a': { 
        count: 3, 
        names: ['Kontaktor 1', 'Kontaktor 2', 'Kontaktor 3'] 
      },
      'fp1-lane-b': { 
        count: 2, 
        names: ['Kontaktor 1', 'Kontaktor 2'] 
      },
    };
    
    return kontaktorConfig[areaKey] || { count: 0, names: [] };
  };

  // Helper function to get sub-area keys for kontaktor
  const getKontaktorKeys = (areaKey: string): string[] => {
    const config = getLaneKontaktorConfig(areaKey);
    const keys: string[] = [];
    
    for (let i = 1; i <= config.count; i++) {
      keys.push(`${areaKey}-k${i}`);
    }
    
    return keys;
  };

  // Toggle individual kontaktor
  const toggleKontaktor = async (kontaktorKey: string) => {
    if (isEditMode) return;

    const currentStatus = areaStates[kontaktorKey];
    const newStatus = !currentStatus;

    try {
      console.log(`🔄 Toggling kontaktor: ${kontaktorKey}`);
      console.log(`📊 Kontaktor ${kontaktorKey}: ${currentStatus ? 'ON' : 'OFF'} → ${newStatus ? 'ON' : 'OFF'}`);
      
      // Update local state immediately for responsive UI
      setAreaStates(prev => ({
        ...prev,
        [kontaktorKey]: newStatus
      }));
      
      // Update Firebase
      await monitoringService.updateAreaStatus(kontaktorKey, newStatus ? 'ON' : 'OFF');
      
      // Update main lane status based on individual kontaktors
      const laneKey = kontaktorKey.split('-k')[0];
      const kontaktorKeys = getKontaktorKeys(laneKey);
      const anyKontaktorOn = kontaktorKeys.some(key => 
        key === kontaktorKey ? newStatus : areaStates[key]
      );
      
      // Update main lane status
      setAreaStates(prev => ({
        ...prev,
        [laneKey]: anyKontaktorOn
      }));
      
      await monitoringService.updateAreaStatus(laneKey, anyKontaktorOn ? 'ON' : 'OFF');
      
      console.log(`✅ Kontaktor ${kontaktorKey} updated successfully`);
      
    } catch (error) {
      console.error('❌ Failed to toggle kontaktor:', error);
      
      // Revert state if Firebase update fails
      setAreaStates(prev => ({
        ...prev,
        [kontaktorKey]: currentStatus
      }));
    }
  };

  // Toggle main lane control (controls all kontaktors in lane)
  const toggleMainLane = async (laneKey: string) => {
    if (isEditMode) return;

    console.log(`🚨🚨🚨 MAIN CONTROL BUTTON DITEKAN UNTUK ${laneKey}! 🚨🚨🚨`);

    const kontaktorKeys = getKontaktorKeys(laneKey);
    if (kontaktorKeys.length === 0) {
      // Fallback to original toggle for lanes without kontaktors
      console.log(`🔄 Main lane ${laneKey} has no kontaktors, using toggleArea`);
      return toggleArea(laneKey);
    }

    const currentMainStatus = areaStates[laneKey];
    const newMainStatus = !currentMainStatus;

    try {
      console.log(`🎯 MAIN CONTROL ACTIVATED for ${laneKey}!`);
      console.log(`🔄 Toggling main lane: ${laneKey} with ${kontaktorKeys.length} kontaktors`);
      console.log(`📊 Main Lane ${laneKey}: ${currentMainStatus ? 'ON' : 'OFF'} → ${newMainStatus ? 'ON' : 'OFF'}`);
      console.log(`🎛️ Kontaktors to be affected: ${kontaktorKeys.join(', ')}`);
      
      // Update all kontaktors in the lane
      const newStates: { [key: string]: boolean } = {};
      newStates[laneKey] = newMainStatus;
      
      kontaktorKeys.forEach(kontaktorKey => {
        newStates[kontaktorKey] = newMainStatus;
        console.log(`🔧 Setting kontaktor ${kontaktorKey} to ${newMainStatus ? 'ON' : 'OFF'}`);
      });
      
      // Update local state immediately for responsive UI
      console.log(`📊 Before state update - current areaStates for ${laneKey}:`, areaStates[laneKey]);
      kontaktorKeys.forEach(key => {
        console.log(`📊 Before state update - kontaktor ${key}:`, areaStates[key]);
      });
      console.log(`📊 New states to be applied:`, newStates);
      
      setAreaStates(prev => {
        const newState = {
          ...prev,
          ...newStates
        };
        console.log(`📊 After state update - new areaStates:`, newState);
        return newState;
      });
      
      // Update Firebase for main lane
      await monitoringService.updateAreaStatus(laneKey, newMainStatus ? 'ON' : 'OFF');
      
      // Update Firebase for all kontaktors
      for (const kontaktorKey of kontaktorKeys) {
        await monitoringService.updateAreaStatus(kontaktorKey, newMainStatus ? 'ON' : 'OFF');
      }
      
      console.log(`✅ Main lane ${laneKey} and all kontaktors updated successfully`);
      
    } catch (error) {
      console.error('❌ Failed to toggle main lane:', error);
      
      // Revert state if Firebase update fails
      setAreaStates(prev => ({
        ...prev,
        [laneKey]: currentMainStatus
      }));
    }
  };



  // Function to save current layout as default
  const saveAsDefaultLayout = () => {
    try {
      console.log('🌟 SAVE AS DEFAULT - Current positions:', manualPositions);
      
      // Save current layout as the new default
      localStorage.setItem('iot-plant-default-positions', JSON.stringify(manualPositions));
      console.log('✅ Saved to iot-plant-default-positions');
      
      // CLEAR current positions so default takes priority on refresh
      localStorage.removeItem('iot-plant-positions');
      console.log('🗑️ Cleared iot-plant-positions to prioritize default');
      
      // Layout saved as default
      
      console.log('📊 localStorage after save as default:');
      console.log('- iot-plant-positions:', localStorage.getItem('iot-plant-positions') ? 'EXISTS' : 'CLEARED ✅');
      console.log('- iot-plant-default-positions:', localStorage.getItem('iot-plant-default-positions') ? 'EXISTS ✅' : 'NOT FOUND');
      
      setSaveMessage('✅ Layout saved as default! Will persist on refresh.');
      setTimeout(() => setSaveMessage(''), 2000);
    } catch (error) {
      console.error('❌ Failed to save layout as default:', error);
      setSaveMessage('❌ Failed to save as default');
      setTimeout(() => setSaveMessage(''), 2000);
    }
  };



  // Function to reset to default layout (same as loadDefaultLayout but different message)
  const resetToDefaultLayout = () => {
    try {
      const savedDefault = localStorage.getItem('iot-plant-default-positions');
      if (savedDefault) {
        const defaultPositions = JSON.parse(savedDefault);
        setManualPositions(defaultPositions);
        // Clear current edits when resetting to default
        localStorage.removeItem('iot-plant-positions');
        setIsEditMode(false);
        setSaveMessage('✅ Layout reset to saved default!');
        setTimeout(() => setSaveMessage(''), 2000);
        console.log('✅ Layout reset to saved default and cleared current edits:', defaultPositions);
      } else {
        // Fall back to built-in default
        const builtInDefault = getDefaultPositions();
        setManualPositions(builtInDefault);
        // Clear current edits when resetting to default
        localStorage.removeItem('iot-plant-positions');
        setIsEditMode(false);
        setSaveMessage('✅ Layout reset to built-in default!');
        setTimeout(() => setSaveMessage(''), 2000);
        console.log('✅ Layout reset to built-in default and cleared current edits:', builtInDefault);
      }
    } catch (error) {
      console.error('❌ Failed to reset layout:', error);
      setSaveMessage('❌ Failed to reset layout');
      setTimeout(() => setSaveMessage(''), 2000);
    }
  };

  // Function to clear all saved layouts and reset to built-in default
  const clearAllLayouts = () => {
    try {
      // Clear ALL localStorage data related to layout
      localStorage.removeItem('iot-plant-positions');
      localStorage.removeItem('iot-plant-default-positions');
      localStorage.removeItem('iot-t-foot-width');
      
      // Clear any old localStorage keys that might conflict
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('iot-') || key.startsWith('plant-') || key.startsWith('layout-')) {
          localStorage.removeItem(key);
        }
      });
      
      const builtInDefault = getDefaultPositions();
      setManualPositions(builtInDefault);
      setIsEditMode(false);
      
      // Reset T-foot width to default
      setTFootWidth(580);
      
      setSaveMessage('✅ All layouts cleared & regenerated! Positions synchronized.');
      setTimeout(() => setSaveMessage(''), 3000);
      console.log('✅ All layouts cleared and reset to built-in default:', builtInDefault);
      
      // Force page reload to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      console.error('❌ Failed to clear all layouts:', error);
      setSaveMessage('❌ Failed to clear layouts');
      setTimeout(() => setSaveMessage(''), 2000);
    }
  };

  // Toggle area function - interact with Firebase
  const toggleArea = async (areaKey: string) => {
    if (isEditMode) return;

    // Calculate new status BEFORE updating state
    const currentStatus = areaStates[areaKey];
    const newStatus = !currentStatus;

    try {
      console.log(`🔄 Toggling area: ${areaKey}`);
      console.log(`📊 Area ${areaKey}: ${currentStatus ? 'ON' : 'OFF'} → ${newStatus ? 'ON' : 'OFF'}`);
      
      // SPECIAL DEBUG FOR LANE B
      // 🚨 DEBUG: Special logging for Area 7 & 8 cross-activation issue
      if (areaKey === 'fp1-lane-ab-selatan') {
        console.log('🚨 AREA 7 DEBUG: Lane A B Selatan toggle triggered');
        console.log('🚨 Current status:', currentStatus);
        console.log('🚨 New status:', newStatus);
        console.log('🚨 Area Key:', areaKey);
      }
      
      if (areaKey === 'fp1-lane-cd-selatan') {
        console.log('🚨 AREA 8 DEBUG: Lane C D Selatan toggle triggered');
        console.log('🚨 Current status:', currentStatus);
        console.log('🚨 New status:', newStatus);
        console.log('🚨 Area Key:', areaKey);
      }
      
      if (areaKey === 'fp1-lane-b') {
        console.log('🐛 LANE B DEBUG: Toggle triggered');
        console.log('🐛 Current status:', currentStatus);
        console.log('🐛 New status:', newStatus);
      }
      
      // Update local state immediately for responsive UI
      setAreaStates(prev => ({
        ...prev,
        [areaKey]: newStatus
      }));
      
      // Send command to ESP32 devices via Firebase (for areas with ESP32)
      const areaNum = getAreaNumFromKey(areaKey);
      console.log(`🔢 Area number for ${areaKey}: ${areaNum}`);
      
      if (areaNum <= 3 || areaNum === 7) { // ESP32 devices for Area 1, 2, 3, and 7 (AB Selatan)
        const esp32DeviceId = areaNum === 1 ? 'ESP32_AREA1' : 
                              areaNum === 2 ? 'ESP32_AREA2' : 
                              areaNum === 3 ? 'ESP32_AREA3' :  // FIXED: Added ESP32_AREA3 for Lane C
                              'ESP32_AREA3_LANE_AB_SELATAN'; // For area 7
        const esp32AreaKey = getESP32AreaKey(areaNum);
        
        console.log(`📡 Sending command to ${esp32DeviceId} for ${esp32AreaKey}`);
        console.log(`🎯 ESP32 Area Key: ${esp32AreaKey}`);
        
        // SPECIAL DEBUG FOR LANE B
        if (areaKey === 'fp1-lane-b') {
          console.log('🐛 LANE B DEBUG: ESP32 command preparation');
          console.log('🐛 ESP32 Device ID:', esp32DeviceId);
          console.log('🐛 ESP32 Area Key:', esp32AreaKey);
        }
        
        // Send command to ESP32 via Firebase
        const command = {
          action: newStatus ? 'turn_on' : 'turn_off',
          areaKey: esp32AreaKey,
          timestamp: Date.now()
        };
        
        console.log(`🚀 Command object:`, command);
        
        // Update both website format and ESP32 format in Firebase
        console.log(`📤 Updating Firebase: ${areaKey} = ${newStatus ? 'ON' : 'OFF'}`);
        
        // 🚨 DEBUG: Track what's being written to Firebase
        if (areaKey === 'fp1-lane-ab-selatan') {
          console.log('🚨 FIREBASE WRITE - Area 7 (Lane A B Selatan)');
          console.log('🚨 Writing to path:', areaKey);
          console.log('🚨 Status:', newStatus ? 'ON' : 'OFF');
        }
        
        if (areaKey === 'fp1-lane-cd-selatan') {
          console.log('🚨 FIREBASE WRITE - Area 8 (Lane C D Selatan)');
          console.log('🚨 Writing to path:', areaKey);
          console.log('🚨 Status:', newStatus ? 'ON' : 'OFF');
        }
        
        await monitoringService.updateAreaStatus(areaKey, newStatus ? 'ON' : 'OFF');
        
        console.log(`📤 Updating Firebase: ${esp32AreaKey} = ${newStatus ? 'ON' : 'OFF'}`);
        
        // 🚨 DEBUG: Track ESP32 path writes
        if (esp32AreaKey === 'fp1-lane-ab-selatan') {
          console.log('🚨 ESP32 FIREBASE WRITE - Area 7 ESP32 path');
          console.log('🚨 ESP32 Writing to path:', esp32AreaKey);
          console.log('🚨 ESP32 Status:', newStatus ? 'ON' : 'OFF');
        }
        
        await monitoringService.updateAreaStatus(esp32AreaKey, newStatus ? 'ON' : 'OFF');
        
        console.log(`📤 Sending command to ${esp32DeviceId}`);
        await monitoringService.sendCommand(esp32DeviceId, command);
        
        console.log(`✅ Command sent to ESP32: ${JSON.stringify(command)}`);
        
        // SPECIAL DEBUG FOR LANE B
        if (areaKey === 'fp1-lane-b') {
          console.log('🐛 LANE B DEBUG: All Firebase operations completed');
        }
      } else {
        // For areas without ESP32, just update Firebase (areas 3,4,5,8,9,10,11)
        console.log(`💡 Updating manual area: ${areaKey} (Area ${areaNum}) → ${newStatus ? 'ON' : 'OFF'}`);
        await monitoringService.updateAreaStatus(areaKey, newStatus ? 'ON' : 'OFF');
        console.log(`✅ Manual area updated in Firebase`);
      }
      
    } catch (error) {
      console.error('❌ Failed to toggle area:', error);
      
      // Revert state if Firebase update fails
      setAreaStates(prev => ({
        ...prev,
        [areaKey]: currentStatus  // Revert to original status
      }));
      
      console.log(`🔄 Reverted ${areaKey} back to: ${currentStatus ? 'ON' : 'OFF'}`);
    }
  };

  // Helper function to get area number from key
  const getAreaNumFromKey = (areaKey: string): number => {
    const reverseMapping: { [key: string]: number } = {
      'fp1-lane-b': 1,             // CHANGED: Lane B → Area 1 (was fp1-lane-a: 1)
      'fp1-lane-c': 2,             // CHANGED: Lane C → Area 2 (was fp1-lane-b: 2)
      'fp1-lane-d': 3,             // CHANGED: Lane D → Area 3 (was fp1-lane-c: 3)
      'fp1-lane-a': 4,             // CHANGED: Lane A → Area 4 (was fp1-lane-d: 4)
      'fp1-lane-melting-p2': 5,
      'fp1-lane-ab-selatan': 7,    // CORRECTED: Lane A B Selatan → Area 7 (kotak biasa)
      'fp1-lane-cd-selatan': 8,      // SWAPPED: Lane C D Selatan → Area 8 (was cd-utara)
      'fp1-lane-ab-utara': 9,      // CHANGED: Lane A B Utara → Area 9 (was fp1-lane-cd-utara: 9)
      'fp1-lane-cd-utara': 10,   // SWAPPED: Lane C D Utara → Area 10 (was cd-selatan)
      'fp1-lane-melting-p1': 11
    };
    
    return reverseMapping[areaKey] || 0;
  };

  // Enhanced mouse handlers for drag and resize
  const handleMouseDown = (areaNum: number, e: React.MouseEvent | MouseEvent, action: 'drag' | 'resize' = 'drag', direction: string = '') => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedArea(areaNum);
    
    if (action === 'drag') {
      setIsDragging(true);
      // Calculate offset from mouse to area's top-left corner
      const areaKey = getAreaKey(areaNum);
      const position = manualPositions[areaKey];
      
      const container = areaNum <= 6 ? plant2Ref.current : plant1Ref.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        const mouseX = (e as React.MouseEvent).clientX;
        const mouseY = (e as React.MouseEvent).clientY;
        
        const areaLeft = (position.left / 100) * rect.width + rect.left;
        const areaTop = (position.top / 100) * rect.height + rect.top;
        
        setDragOffset({
          x: mouseX - areaLeft,
          y: mouseY - areaTop
        });
      }
    } else if (action === 'resize') {
      setIsResizing(true);
      setResizeDirection(direction);
    }
  };

  const handleMouseMove = (e: MouseEvent | React.MouseEvent) => {
    if (!selectedArea || !isEditMode) return;
    
    const areaKey = getAreaKey(selectedArea);
    const container = selectedArea <= 6 ? plant2Ref.current : plant1Ref.current;
    
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const mouseX = (e as MouseEvent).clientX || (e as React.MouseEvent).clientX;
    const mouseY = (e as MouseEvent).clientY || (e as React.MouseEvent).clientY;
    
    if (isDragging) {
      // Drag to move
      const newLeft = ((mouseX - dragOffset.x - rect.left) / rect.width) * 100;
      const newTop = ((mouseY - dragOffset.y - rect.top) / rect.height) * 100;
      
      setManualPositions((prev: ManualPositions) => ({
        ...prev,
        [areaKey]: {
          ...prev[areaKey],
          left: Math.max(0, Math.min(97, newLeft)),
          top: Math.max(0, Math.min(97, newTop))
        }
      }));
    } else if (isResizing) {
      // Resize area
      const currentPos = manualPositions[areaKey];
      const relativeX = ((mouseX - rect.left) / rect.width) * 100;
      const relativeY = ((mouseY - rect.top) / rect.height) * 100;
      
      let newPos = { ...currentPos };
      
      // Handle different resize directions
      if (resizeDirection.includes('right')) {
        newPos.width = Math.max(3, Math.min(95, relativeX - currentPos.left));
      }
      if (resizeDirection.includes('left')) {
        const newWidth = currentPos.width + (currentPos.left - relativeX);
        if (newWidth >= 3 && relativeX >= 0) {
          newPos.left = relativeX;
          newPos.width = Math.min(95, newWidth);
        }
      }
      if (resizeDirection.includes('bottom')) {
        newPos.height = Math.max(3, Math.min(95, relativeY - currentPos.top));
      }
      if (resizeDirection.includes('top')) {
        const newHeight = currentPos.height + (currentPos.top - relativeY);
        if (newHeight >= 3 && relativeY >= 0) {
          newPos.top = relativeY;
          newPos.height = Math.min(95, newHeight);
        }
      }
      
      setManualPositions((prev: ManualPositions) => ({
        ...prev,
        [areaKey]: newPos
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection('');
    setDragOffset({ x: 0, y: 0 });
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    // Entering edit mode
    if (!isEditMode) {
      console.log('🎯 Entering edit mode - auto-save enabled again');
    }
    
    setIsEditMode(!isEditMode);
    setSelectedArea(null);
    setSelectedKontaktor(null);
    setIsShapeEditing(false);
    setIsResizeEditing(false);
    setControlMode(null);
    if (clickTimer) {
      clearTimeout(clickTimer);
      setClickTimer(null);
    }
    setIsDragging(false);
    setIsResizing(false);
  };

  // Copy and paste size functions
  const copySize = () => {
    if (selectedArea) {
      const areaKey = getAreaKey(selectedArea);
      const { width, height } = manualPositions[areaKey];
      setCopiedSize({ width, height });
    }
  };

  const pasteSize = () => {
    if (selectedArea && copiedSize) {
      const areaKey = getAreaKey(selectedArea);
      setManualPositions((prev: ManualPositions) => ({
        ...prev,
        [areaKey]: { ...prev[areaKey], ...copiedSize }
      }));
    }
  };



  // Helper function to get area details - Updated for new lane system
  const getAreaDetails = (areaNum: number) => {
    const areaKey = getAreaKey(areaNum);
    const area = areas[areaKey];
    
    // PERBAIKAN: Gunakan areaStates sebagai sumber utama untuk konsistensi UI
    // areaStates selalu terupdate langsung dari toggleMainLane dan toggleArea
    const isOn = areaStates[areaKey] || false;
    
    console.log(`🔍 getAreaDetails(${areaNum}): areaKey=${areaKey}, area=${area ? 'exists' : 'null'}, isOn=${isOn} (from areaStates)`);
    
    let plant = '';
    let zone = '';
    
    // Updated plant assignment based on new lane structure
    if ([1, 2, 3, 4, 5].includes(areaNum)) {
      plant = 'Plant 2';
      if (areaNum === 5) {
        zone = 'Melting Section';
      } else {
        zone = 'Production Line';
      }
    } else if ([7, 8, 9, 10, 11].includes(areaNum)) {
      plant = 'Plant 1';
      if (areaNum === 11) {
        zone = 'Melting Section';
      } else {
        zone = 'Production Line';
      }
    }
    
    return { areaKey, isOn, plant, zone, area };
  };

  // Handle kontaktor resize with different cursors
  const handleKontaktorResize = (e: React.MouseEvent, kontaktorKey: string, position: any, direction: string) => {
    e.stopPropagation();
    
    const container = e.currentTarget.parentElement!.parentElement!.getBoundingClientRect();
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    const startWidth = position.width;
    const startHeight = position.height;
    const startLeft = position.left;
    const startTop = position.top;
    
    const handleResize = (resizeE: MouseEvent) => {
      const deltaX = resizeE.clientX - startMouseX;
      const deltaY = resizeE.clientY - startMouseY;
      
      const deltaXPercent = (deltaX / container.width) * 100;
      const deltaYPercent = (deltaY / container.height) * 100;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newLeft = startLeft;
      let newTop = startTop;
      
      // Handle different resize directions
      switch (direction) {
        case 'se-resize': // Bottom-right
          newWidth = startWidth + deltaXPercent;
          newHeight = startHeight + deltaYPercent;
          break;
        case 'sw-resize': // Bottom-left
          newWidth = startWidth - deltaXPercent;
          newHeight = startHeight + deltaYPercent;
          newLeft = startLeft + deltaXPercent;
          break;
        case 'ne-resize': // Top-right
          newWidth = startWidth + deltaXPercent;
          newHeight = startHeight - deltaYPercent;
          newTop = startTop + deltaYPercent;
          break;
        case 'nw-resize': // Top-left
          newWidth = startWidth - deltaXPercent;
          newHeight = startHeight - deltaYPercent;
          newLeft = startLeft + deltaXPercent;
          newTop = startTop + deltaYPercent;
          break;
        case 'e-resize': // Right
          newWidth = startWidth + deltaXPercent;
          break;
        case 'w-resize': // Left
          newWidth = startWidth - deltaXPercent;
          newLeft = startLeft + deltaXPercent;
          break;
        case 'n-resize': // Top
          newHeight = startHeight - deltaYPercent;
          newTop = startTop + deltaYPercent;
          break;
        case 's-resize': // Bottom
          newHeight = startHeight + deltaYPercent;
          break;
      }
      
      // Clamp values dengan batas yang lebih fleksibel
      const clampedWidth = Math.max(3, Math.min(50, newWidth));
      const clampedHeight = Math.max(2, Math.min(60, newHeight));
      const clampedLeft = Math.max(0, Math.min(95 - clampedWidth, newLeft));
      const clampedTop = Math.max(0, Math.min(95 - clampedHeight, newTop));
      
      setManualPositions(prev => ({
        ...prev,
        [kontaktorKey]: {
          ...prev[kontaktorKey],
          width: clampedWidth,
          height: clampedHeight,
          left: clampedLeft,
          top: clampedTop
        }
      }));
      
      // Debug log untuk T-shape
      if (manualPositions[kontaktorKey]?.customShape === 'T') {
        console.log(`🔧 T-shape ${kontaktorKey} resized:`, { width: clampedWidth, height: clampedHeight, left: clampedLeft, top: clampedTop });
      }
    };
    
    const stopResize = () => {
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', stopResize);
    };
    
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
  };

  // Function to handle T-shape specific resize
  const handleTShapeResize = (e: React.MouseEvent, kontaktorKey: string, position: any, resizeType: string) => {
    e.stopPropagation();
    
    const container = e.currentTarget.parentElement!.parentElement!.getBoundingClientRect();
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    
    // Get current T-shape parameters
    const startStemWidth = position.stemWidth || 25;
    const startHeadWidth = position.headWidth || 100;
    const startHeadHeight = position.headHeight || 35;
    
    const handleTResize = (resizeE: MouseEvent) => {
      const deltaX = resizeE.clientX - startMouseX;
      const deltaY = resizeE.clientY - startMouseY;
      
      const deltaXPercent = (deltaX / container.width) * 100;
      const deltaYPercent = (deltaY / container.height) * 100;
      
      let newStemWidth = startStemWidth;
      let newHeadWidth = startHeadWidth;
      let newHeadHeight = startHeadHeight;
      
      // Handle different T-shape resize types
      switch (resizeType) {
        case 'stem-width-left':
        case 'stem-width-right':
          // Adjust stem width based on horizontal movement
          newStemWidth = resizeType === 'stem-width-right' 
            ? Math.max(10, Math.min(60, startStemWidth + deltaXPercent * 2))
            : Math.max(10, Math.min(60, startStemWidth - deltaXPercent * 2));
          break;
          
        case 'head-width-left':
        case 'head-width-right':
          // Adjust head width based on horizontal movement
          newHeadWidth = resizeType === 'head-width-right' 
            ? Math.max(60, Math.min(100, startHeadWidth + deltaXPercent * 2))
            : Math.max(60, Math.min(100, startHeadWidth - deltaXPercent * 2));
          break;
          
        case 'head-height':
          // Adjust head height based on vertical movement
          newHeadHeight = Math.max(20, Math.min(80, startHeadHeight + deltaYPercent));
          break;
      }
      
      setManualPositions(prev => ({
        ...prev,
        [kontaktorKey]: {
          ...prev[kontaktorKey],
          stemWidth: newStemWidth,
          headWidth: newHeadWidth,
          headHeight: newHeadHeight
        }
      }));
      
      console.log(`🎨 T-shape ${kontaktorKey} ${resizeType}:`, { 
        stemWidth: newStemWidth, 
        headWidth: newHeadWidth, 
        headHeight: newHeadHeight 
      });
    };
    
    const stopTResize = () => {
      document.removeEventListener('mousemove', handleTResize);
      document.removeEventListener('mouseup', stopTResize);
    };
    
    document.addEventListener('mousemove', handleTResize);
    document.addEventListener('mouseup', stopTResize);
  };

  // Function to handle melting area T-shape specific resize
  const handleMeltingTShapeResize = (e: React.MouseEvent, areaNum: number, position: any, resizeType: string) => {
    e.stopPropagation();
    
    const container = e.currentTarget.parentElement!.parentElement!.getBoundingClientRect();
    const startMouseX = e.clientX;
    const startMouseY = e.clientY;
    
    // Get current T-shape parameters
    const startStemWidth = position.stemWidth || 25;
    const startHeadWidth = position.headWidth || 100;
    const startHeadHeight = position.headHeight || 35;
    
    const handleMeltingTResize = (resizeE: MouseEvent) => {
      const deltaX = resizeE.clientX - startMouseX;
      const deltaY = resizeE.clientY - startMouseY;
      
      const deltaXPercent = (deltaX / container.width) * 100;
      const deltaYPercent = (deltaY / container.height) * 100;
      
      let newStemWidth = startStemWidth;
      let newHeadWidth = startHeadWidth;
      let newHeadHeight = startHeadHeight;
      
      // Handle different T-shape resize types
      switch (resizeType) {
        case 'stem-width-left':
        case 'stem-width-right':
          // Adjust stem width based on horizontal movement
          newStemWidth = resizeType === 'stem-width-right' 
            ? Math.max(10, Math.min(60, startStemWidth + deltaXPercent * 2))
            : Math.max(10, Math.min(60, startStemWidth - deltaXPercent * 2));
          break;
          
        case 'head-width-left':
        case 'head-width-right':
          // Adjust head width based on horizontal movement
          newHeadWidth = resizeType === 'head-width-right' 
            ? Math.max(60, Math.min(100, startHeadWidth + deltaXPercent * 2))
            : Math.max(60, Math.min(100, startHeadWidth - deltaXPercent * 2));
          break;
          
        case 'head-height':
          // Adjust head height based on vertical movement
          newHeadHeight = Math.max(20, Math.min(80, startHeadHeight + deltaYPercent));
          break;
      }
      
      const { areaKey } = getAreaDetails(areaNum);
      setManualPositions(prev => ({
        ...prev,
        [areaKey]: {
          ...prev[areaKey],
          stemWidth: newStemWidth,
          headWidth: newHeadWidth,
          headHeight: newHeadHeight
        }
      }));
      
      console.log(`🎨 Melting T-shape ${areaKey} ${resizeType}:`, { 
        stemWidth: newStemWidth, 
        headWidth: newHeadWidth, 
        headHeight: newHeadHeight 
      });
    };
    
    const stopMeltingTResize = () => {
      document.removeEventListener('mousemove', handleMeltingTResize);
      document.removeEventListener('mouseup', stopMeltingTResize);
    };
    
    document.addEventListener('mousemove', handleMeltingTResize);
    document.addEventListener('mouseup', stopMeltingTResize);
  };

  // Function to render kontaktor boxes (replaces main lane areas)
  const renderKontaktorBoxes = (areaKey: string) => {
    const kontaktorKeys = getKontaktorKeys(areaKey);
    if (kontaktorKeys.length === 0) return null;


    
    console.log(`🔧 Rendering kontaktor boxes for ${areaKey}, keys:`, kontaktorKeys);

    return kontaktorKeys.map((kontaktorKey, index) => {
      const position = manualPositions[kontaktorKey];
      if (!position) {
        console.warn(`❌ No position found for kontaktor: ${kontaktorKey}`);
        return null;
      }

      const isOn = areaStates[kontaktorKey];
      const kontaktorNum = index + 1;
      const laneName = getAreaName(getAreaNumFromKey(areaKey));
      const isSelected = selectedKontaktor === kontaktorKey;

      console.log(`📍 Kontaktor ${kontaktorKey} position:`, position, `isOn: ${isOn}, customShape: ${position.customShape}`);

      const boxStyle: React.CSSProperties = {
        position: 'absolute',
        top: `${position.top}%`,
        left: `${position.left}%`,
        width: `${position.width}%`,
        height: `${position.height}%`,
        backgroundColor: 'transparent', // Background akan di background div terpisah
        border: position.customShape === 'T' || position.customShape === 'L' 
          ? 'none' // Remove border for T/L shapes, will be handled by border overlay
          : (isEditMode
              ? (isSelected ? '3px solid #0057e4' : '2px dashed #ff9800')
              : (isOn ? '2px solid #4caf50' : '2px solid #d32f2f')),
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '9px',
        fontWeight: 'bold',
        color: '#fff',
        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
        cursor: isEditMode ? (isSelected ? 'move' : 'pointer') : 'pointer',
        transition: isEditMode ? 'none' : 'all 0.3s ease',
        userSelect: 'none',
        zIndex: isSelected ? 1000 : (isEditMode ? 100 : 1),
        outline: isEditMode && isSelected ? '2px solid #ffeb3b' : 'none',
        outlineOffset: '2px',
        boxSizing: 'border-box',
        // Jangan apply clip-path di container utama kontaktor
      };

      return (
        <div
          key={kontaktorKey}
          style={boxStyle}
          onClick={(e) => {
            e.stopPropagation();
            if (isEditMode) {
              // Single click to select and show control panel - keep selected
              console.log(`🎯 Kontaktor ${kontaktorKey} clicked! CustomShape: ${position.customShape}`);
              setSelectedKontaktor(kontaktorKey);
              setControlMode(null); // Reset control mode to show main panel
              setIsShapeEditing(false);
              setIsResizeEditing(false);
              console.log(`📊 Control state: selectedKontaktor=${kontaktorKey}, controlMode=null`);
            } else {
              toggleKontaktor(kontaktorKey);
            }
          }}
          onMouseDown={(e) => {
            if (isEditMode && e.button === 0) {
              e.stopPropagation();
              setSelectedKontaktor(kontaktorKey);
              
              const rect = e.currentTarget.getBoundingClientRect();
              const container = e.currentTarget.parentElement!.getBoundingClientRect();
              
              const offsetX = e.clientX - rect.left;
              const offsetY = e.clientY - rect.top;
              
              const handleMouseMove = (moveE: MouseEvent) => {
                const newLeft = ((moveE.clientX - container.left - offsetX) / container.width) * 100;
                const newTop = ((moveE.clientY - container.top - offsetY) / container.height) * 100;
                
                const clampedLeft = Math.max(0, Math.min(95, newLeft));
                const clampedTop = Math.max(0, Math.min(95, newTop));
                
                setManualPositions(prev => ({
                  ...prev,
                  [kontaktorKey]: {
                    ...prev[kontaktorKey],
                    left: clampedLeft,
                    top: clampedTop
                  }
                }));
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }
          }}
          onMouseEnter={(e) => {
            if (!isEditMode) {
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isEditMode) {
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          {/* Background div dengan clip-path untuk kontaktor shape */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: isEditMode 
                ? (isSelected ? 'rgba(0,87,228,0.9)' : 'rgba(255,193,7,0.7)')
                : (isOn ? 'rgba(76,175,80,0.8)' : 'rgba(244,67,54,0.8)'),
              zIndex: 0,
              ...getShapeStyles(position.customShape, position), // Apply clip-path hanya di sini
            }}
          />
          
          {/* Border overlay untuk T dan L shapes */}
          {(position.customShape === 'T' || position.customShape === 'L') && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent',
                border: isEditMode
                  ? (isSelected ? '3px solid #0057e4' : '2px dashed #ff9800')
                  : (isOn ? '2px solid #4caf50' : '2px solid #d32f2f'),
                zIndex: 1,
                pointerEvents: 'none',
                ...getShapeStyles(position.customShape, position), // Apply same clip-path untuk border
              }}
            />
          )}
          
          <div style={{ textAlign: 'center', pointerEvents: 'none', position: 'relative', zIndex: 2 }}>
            <div style={{ fontSize: '8px', marginBottom: '2px' }}>
              {laneName}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>
              K{kontaktorNum}
            </div>
            {!isEditMode && (
              <div style={{ fontSize: '7px', marginTop: '2px' }}>
                {isOn ? '✅ ON' : '❌ OFF'}
              </div>
            )}
            {isEditMode && isSelected && (
              <div style={{ fontSize: '6px', marginTop: '2px', color: '#ff9800' }}>
                {isShapeEditing ? '🎨 Shape Edit' :
                 isResizeEditing ? '� Manual Resize' :
                 '✅ Selected'}
              </div>
            )}
            {isEditMode && !isSelected && (
              <div style={{ fontSize: '5px', marginTop: '2px', color: '#ffeb3b' }}>
                Click to Select
              </div>
            )}
          </div>
          
          {/* Invisible overlay for L and T shaped kontaktors to capture clicks */}
          {(position.customShape === 'L' || position.customShape === 'T') && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent',
                background: 'none',
                border: 'none',
                zIndex: 1,
                cursor: 'inherit',
                pointerEvents: 'auto'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (isEditMode) {
                  console.log(`🎯 T/L-shape kontaktor ${kontaktorKey} clicked via overlay! CustomShape: ${position.customShape}`);
                  setSelectedKontaktor(kontaktorKey);
                  setControlMode(null);
                  setIsShapeEditing(false);
                  setIsResizeEditing(false);
                  console.log(`📊 Control state: selectedKontaktor=${kontaktorKey}, controlMode=null`);
                } else {
                  toggleKontaktor(kontaktorKey);
                }
              }}
            />
          )}
          
          {/* Resize handles for selected kontaktor - Same style as melting areas */}
          {isEditMode && isSelected && (
            <>
              {/* Corner handles */}
              <div
                style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '-8px',
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#0066cc',
                  border: '2px solid white',
                  borderRadius: '50%',
                  cursor: 'nw-resize',
                  zIndex: 1001,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleKontaktorResize(e, kontaktorKey, position, 'nw-resize');
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#0066cc',
                  border: '2px solid white',
                  borderRadius: '50%',
                  cursor: 'ne-resize',
                  zIndex: 1001,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleKontaktorResize(e, kontaktorKey, position, 'ne-resize');
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '-8px',
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#0066cc',
                  border: '2px solid white',
                  borderRadius: '50%',
                  cursor: 'sw-resize',
                  zIndex: 1001,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleKontaktorResize(e, kontaktorKey, position, 'sw-resize');
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-8px',
                  right: '-8px',
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#0066cc',
                  border: '2px solid white',
                  borderRadius: '50%',
                  cursor: 'se-resize',
                  zIndex: 1001,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleKontaktorResize(e, kontaktorKey, position, 'se-resize');
                }}
              />
              
              {/* Side handles */}
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '-8px',
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#0066cc',
                  border: '2px solid white',
                  borderRadius: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'w-resize',
                  zIndex: 1001,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleKontaktorResize(e, kontaktorKey, position, 'w-resize');
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '-8px',
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#0066cc',
                  border: '2px solid white',
                  borderRadius: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'e-resize',
                  zIndex: 1001,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleKontaktorResize(e, kontaktorKey, position, 'e-resize');
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '50%',
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#0066cc',
                  border: '2px solid white',
                  borderRadius: '50%',
                  transform: 'translateX(-50%)',
                  cursor: 'n-resize',
                  zIndex: 1001,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleKontaktorResize(e, kontaktorKey, position, 'n-resize');
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#0066cc',
                  border: '2px solid white',
                  borderRadius: '50%',
                  transform: 'translateX(-50%)',
                  cursor: 's-resize',
                  zIndex: 1001,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleKontaktorResize(e, kontaktorKey, position, 's-resize');
                }}
              />
              
              {/* T-shape specific resize handles */}
              {position.customShape === 'T' && (
                <>
                  {/* Handle untuk lebar kaki T (stem width) - di kiri kaki */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '25%',
                      left: `${25 - (position.stemWidth || 25)/2}%`,
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#ff9800',
                      border: '2px solid white',
                      borderRadius: '50%',
                      cursor: 'ew-resize',
                      zIndex: 1002,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                    title="Lebar Kaki T"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleTShapeResize(e, kontaktorKey, position, 'stem-width-left');
                    }}
                  />
                  
                  {/* Handle untuk lebar kaki T (stem width) - di kanan kaki */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '25%',
                      left: `${75 + (position.stemWidth || 25)/2}%`,
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#ff9800',
                      border: '2px solid white',
                      borderRadius: '50%',
                      cursor: 'ew-resize',
                      zIndex: 1002,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                    title="Lebar Kaki T"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleTShapeResize(e, kontaktorKey, position, 'stem-width-right');
                    }}
                  />
                  
                  {/* Handle untuk lebar topi T (head width) - di kiri topi */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10%',
                      left: `${25 - (position.headWidth || 100)/2}%`,
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#9c27b0',
                      border: '2px solid white',
                      borderRadius: '50%',
                      cursor: 'ew-resize',
                      zIndex: 1002,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                    title="Lebar Topi T"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleTShapeResize(e, kontaktorKey, position, 'head-width-left');
                    }}
                  />
                  
                  {/* Handle untuk lebar topi T (head width) - di kanan topi */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10%',
                      left: `${75 + (position.headWidth || 100)/2}%`,
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#9c27b0',
                      border: '2px solid white',
                      borderRadius: '50%',
                      cursor: 'ew-resize',
                      zIndex: 1002,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                    title="Lebar Topi T"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleTShapeResize(e, kontaktorKey, position, 'head-width-right');
                    }}
                  />
                  
                  {/* Handle untuk tinggi topi T (head height) - di tengah batas topi-kaki */}
                  <div
                    style={{
                      position: 'absolute',
                      top: `${position.headHeight || 35}%`,
                      left: '50%',
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#4caf50',
                      border: '2px solid white',
                      borderRadius: '50%',
                      transform: 'translateX(-50%)',
                      cursor: 'ns-resize',
                      zIndex: 1002,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                    title="Tinggi Topi T"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleTShapeResize(e, kontaktorKey, position, 'head-height');
                    }}
                  />
                </>
              )}
              
              {/* T-shape toggle button for Lane CD Selatan Kontaktor 2 */}
              {kontaktorKey === 'area14_kontaktor2' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#ff5722',
                    color: 'white',
                    padding: '2px 6px',
                    fontSize: '8px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    border: '1px solid #333',
                    zIndex: 1002
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setManualPositions(prev => ({
                      ...prev,
                      [kontaktorKey]: {
                        ...prev[kontaktorKey],
                        customShape: prev[kontaktorKey].customShape === 'T' ? undefined : 'T'
                      }
                    }));
                  }}
                >
                  {position.customShape === 'T' ? '□ Normal' : 'T Shape'}
                </div>
              )}

              {/* Shape editing panel for kontaktors */}
              {isEditMode && isSelected && isShapeEditing && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-50px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    border: '2px solid #ffeb3b',
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    gap: '4px',
                    zIndex: 1002,
                    fontSize: '10px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {(['rectangle', 'square', 'L', 'T'] as ShapeType[]).map((shape) => (
                    <button
                      key={shape}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: position.customShape === shape ? '#ffeb3b' : '#666',
                        color: position.customShape === shape ? '#000' : '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '9px',
                        fontWeight: 'bold',
                      }}
                      onClick={() => {
                        setManualPositions(prev => ({
                          ...prev,
                          [kontaktorKey]: {
                            ...prev[kontaktorKey],
                            customShape: shape,
                            // Set default cutout values for L and T shapes
                            cutoutWidth: shape === 'L' || shape === 'T' ? 30 : undefined,
                            cutoutHeight: shape === 'L' || shape === 'T' ? 40 : undefined,
                            cutoutPosition: shape === 'L' ? 'top-right' : undefined,
                          }
                        }));
                        // Close shape editor after selection
                        setIsShapeEditing(false);
                      }}
                    >
                      {shape === 'rectangle' ? '▭' : 
                       shape === 'square' ? '□' : 
                       shape === 'L' ? 'L' : 'T'}
                    </button>
                  ))}
                  <button
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#e74c3c',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '9px',
                      marginLeft: '4px',
                    }}
                    onClick={() => setIsShapeEditing(false)}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Manual resize editing panel for kontaktors - 4-directional */}
              {isEditMode && isSelected && isResizeEditing && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-120px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(33,150,243,0.95)',
                    border: '2px solid #1976d2',
                    borderRadius: '8px',
                    padding: '12px',
                    zIndex: 1003,
                    fontSize: '9px',
                    color: 'white',
                    minWidth: '280px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '10px' }}>
                    � 4-Direction Manual Resize
                  </div>
                  
                  {/* Cross-style layout for 4-direction controls */}
                  <div style={{ position: 'relative', width: '200px', height: '120px', margin: '0 auto' }}>
                    
                    {/* Top controls - Extend Up */}
                    <div style={{ 
                      position: 'absolute', 
                      top: '0', 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '7px', marginBottom: '2px', fontWeight: 'bold' }}>↑ Extend Up</div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button
                          style={{
                            padding: '3px 6px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '8px',
                          }}
                          onClick={() => {
                            setManualPositions(prev => ({
                              ...prev,
                              [kontaktorKey]: {
                                ...prev[kontaktorKey],
                                top: Math.min(prev[kontaktorKey].top + 0.5, 90),
                                height: Math.max(1.5, prev[kontaktorKey].height - 0.5)
                              }
                            }));
                          }}
                        >
                          -
                        </button>
                        <button
                          style={{
                            padding: '3px 6px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '8px',
                          }}
                          onClick={() => {
                            setManualPositions(prev => ({
                              ...prev,
                              [kontaktorKey]: {
                                ...prev[kontaktorKey],
                                top: Math.max(0, prev[kontaktorKey].top - 0.5),
                                height: Math.min(30, prev[kontaktorKey].height + 0.5)
                              }
                            }));
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Left controls - Extend Left */}
                    <div style={{ 
                      position: 'absolute', 
                      left: '0', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '7px', marginBottom: '2px', fontWeight: 'bold' }}>← Extend Left</div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button
                          style={{
                            padding: '3px 6px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '8px',
                          }}
                          onClick={() => {
                            setManualPositions(prev => ({
                              ...prev,
                              [kontaktorKey]: {
                                ...prev[kontaktorKey],
                                left: Math.min(prev[kontaktorKey].left + 0.5, 90),
                                width: Math.max(2, prev[kontaktorKey].width - 0.5)
                              }
                            }));
                          }}
                        >
                          -
                        </button>
                        <button
                          style={{
                            padding: '3px 6px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '8px',
                          }}
                          onClick={() => {
                            setManualPositions(prev => ({
                              ...prev,
                              [kontaktorKey]: {
                                ...prev[kontaktorKey],
                                left: Math.max(0, prev[kontaktorKey].left - 0.5),
                                width: Math.min(50, prev[kontaktorKey].width + 0.5)
                              }
                            }));
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Center info */}
                    <div style={{ 
                      position: 'absolute', 
                      top: '50%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      <div style={{ fontSize: '7px', fontWeight: 'bold' }}>K{kontaktorNum}</div>
                      <div style={{ fontSize: '6px' }}>{Math.round(position.width)}% × {Math.round(position.height * 10)/10}%</div>
                    </div>

                    {/* Right controls - Extend Right */}
                    <div style={{ 
                      position: 'absolute', 
                      right: '0', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '7px', marginBottom: '2px', fontWeight: 'bold' }}>→ Extend Right</div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button
                          style={{
                            padding: '3px 6px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '8px',
                          }}
                          onClick={() => {
                            setManualPositions(prev => ({
                              ...prev,
                              [kontaktorKey]: {
                                ...prev[kontaktorKey],
                                width: Math.max(2, prev[kontaktorKey].width - 0.5)
                              }
                            }));
                          }}
                        >
                          -
                        </button>
                        <button
                          style={{
                            padding: '3px 6px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '8px',
                          }}
                          onClick={() => {
                            setManualPositions(prev => ({
                              ...prev,
                              [kontaktorKey]: {
                                ...prev[kontaktorKey],
                                width: Math.min(50, prev[kontaktorKey].width + 0.5)
                              }
                            }));
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Bottom controls - Extend Down */}
                    <div style={{ 
                      position: 'absolute', 
                      bottom: '0', 
                      left: '50%', 
                      transform: 'translateX(-50%)',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '7px', marginBottom: '2px', fontWeight: 'bold' }}>↓ Extend Down</div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        <button
                          style={{
                            padding: '3px 6px',
                            backgroundColor: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '8px',
                          }}
                          onClick={() => {
                            setManualPositions(prev => ({
                              ...prev,
                              [kontaktorKey]: {
                                ...prev[kontaktorKey],
                                height: Math.max(1.5, prev[kontaktorKey].height - 0.5)
                              }
                            }));
                          }}
                        >
                          -
                        </button>
                        <button
                          style={{
                            padding: '3px 6px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '8px',
                          }}
                          onClick={() => {
                            setManualPositions(prev => ({
                              ...prev,
                              [kontaktorKey]: {
                                ...prev[kontaktorKey],
                                height: Math.min(30, prev[kontaktorKey].height + 0.5)
                              }
                            }));
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    <button
                      style={{
                        padding: '6px 16px',
                        backgroundColor: '#e74c3c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '9px',
                        fontWeight: 'bold',
                      }}
                      onClick={() => setIsResizeEditing(false)}
                    >
                      ✅ Done
                    </button>
                  </div>
                </div>
              )}

              {/* Unified Control Panel for Kontaktors */}
              {(() => {
                const shouldShow = isEditMode && isSelected && !controlMode;
                console.log(`🎛️ Control Panel for ${kontaktorKey}: isEditMode=${isEditMode}, isSelected=${isSelected}, controlMode=${controlMode}, shouldShow=${shouldShow}`);
                return shouldShow;
              })() && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-80px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(0,0,0,0.9)',
                    border: '2px solid #ffeb3b',
                    borderRadius: '8px',
                    padding: '10px',
                    display: 'flex',
                    gap: '8px',
                    zIndex: 1001,
                    fontSize: '9px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    onClick={() => setControlMode('move')}
                  >
                    🔄 Pindah Posisi
                  </button>
                  
                  <button
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#ff9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    onClick={() => {
                      setControlMode('shape');
                      setIsShapeEditing(true);
                    }}
                  >
                    🎨 Rubah Shape
                  </button>
                  
                  <button
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '9px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    onClick={() => {
                      setControlMode('resize');
                      setIsResizeEditing(true);
                    }}
                  >
                    📐 Resize Ukuran
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      );
    });
  };

  // Function to generate CSS styles for different shapes
  const getShapeStyles = (shape: ShapeType | undefined, position: any) => {
    if (!shape || shape === 'rectangle') return {};
    
    const cutoutWidth = position.cutoutWidth || 30; // Default 30%
    const cutoutHeight = position.cutoutHeight || 40; // Default 40%
    const cutoutPos = position.cutoutPosition || 'top-right';
    
    switch (shape) {
      case 'square':
        return {
          aspectRatio: '1 / 1',
        };
      
      case 'L':
        // Create L shape using clip-path
        let clipPath = '';
        switch (cutoutPos) {
          case 'top-right':
            clipPath = `polygon(0% 0%, ${100 - cutoutWidth}% 0%, ${100 - cutoutWidth}% ${cutoutHeight}%, 100% ${cutoutHeight}%, 100% 100%, 0% 100%)`;
            break;
          case 'top-left':
            clipPath = `polygon(${cutoutWidth}% 0%, 100% 0%, 100% 100%, 0% 100%, 0% ${cutoutHeight}%, ${cutoutWidth}% ${cutoutHeight}%)`;
            break;
          case 'bottom-right':
            clipPath = `polygon(0% 0%, 100% 0%, 100% ${100 - cutoutHeight}%, ${100 - cutoutWidth}% ${100 - cutoutHeight}%, ${100 - cutoutWidth}% 100%, 0% 100%)`;
            break;
          case 'bottom-left':
            clipPath = `polygon(0% 0%, 100% 0%, 100% 100%, ${cutoutWidth}% 100%, ${cutoutWidth}% ${100 - cutoutHeight}%, 0% ${100 - cutoutHeight}%)`;
            break;
        }
        return { clipPath };
      
      case 'T':
        // Enhanced T shape dengan 4 parameter terpisah
        const stemWidth = Math.min(Math.max(position.stemWidth || cutoutWidth || 25, 15), 60); // Lebar kaki T
        const headWidth = Math.min(Math.max(position.headWidth || 100, 60), 100); // Lebar topi T (default full width)
        const headHeight = Math.min(Math.max(position.headHeight || cutoutHeight || 35, 20), 80); // Tinggi topi T
        
        // Calculate T-shape dengan parameter yang lebih fleksibel
        const leftStem = 50 - stemWidth/2;
        const rightStem = 50 + stemWidth/2;
        const leftHead = 50 - headWidth/2;
        const rightHead = 50 + headWidth/2;
        
        const clipPathT = `polygon(${leftHead}% 0%, ${rightHead}% 0%, ${rightHead}% ${headHeight}%, ${rightStem}% ${headHeight}%, ${rightStem}% 100%, ${leftStem}% 100%, ${leftStem}% ${headHeight}%, ${leftHead}% ${headHeight}%)`;
        
        return { 
          clipPath: clipPathT,
          // Force re-render on changes
          willChange: 'auto',
          // Ensure proper background rendering
          backgroundClip: 'border-box'
        };
      
      default:
        return {};
    }
  };

  // Function to render melting areas (Lane Melting Plant 1 & 2) - Keep as single area
  const renderMeltingArea = (areaNum: number) => {
    const { areaKey, isOn } = getAreaDetails(areaNum);
    const position = manualPositions[areaKey];
    const isSelected = selectedArea === areaNum;
    
    if (!position) {
      console.warn(`❌ No position found for melting area: ${areaKey}`);
      return null;
    }

    const shapeStyles = getShapeStyles(position.customShape, position);
    
    const boxStyle: React.CSSProperties = {
      position: 'absolute',
      top: `${position.top}%`,
      left: `${position.left}%`,
      width: `${position.width}%`,
      height: `${position.height}%`,
      backgroundColor: 'transparent', // Background sekarang di div terpisah
      border: position.customShape === 'T' || position.customShape === 'L' 
        ? 'none' // Remove border for T/L shapes, will be handled by border overlay
        : (isEditMode
            ? (isSelected ? '3px solid #0057e4' : '2px dashed #666')
            : (isOn ? '2px solid #4caf50' : '2px solid #d32f2f')),
      borderRadius: position.customShape === 'square' ? '6px' : '6px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      fontWeight: 'bold',
      color: '#fff',
      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
      cursor: isEditMode ? (isSelected ? 'move' : 'pointer') : 'pointer',
      transition: isEditMode ? 'none' : 'all 0.3s ease',
      userSelect: 'none',
      zIndex: isSelected ? 1000 : (isEditMode ? 100 : 1),
      outline: isEditMode && isSelected ? '2px solid #ffeb3b' : 'none',
      outlineOffset: '2px',
      boxSizing: 'border-box',
      // Jangan apply clip-path di sini - akan diterapkan ke background div terpisah
    };

    // For L and T shapes, add an invisible overlay to capture clicks
    const needsClickOverlay = position.customShape === 'L' || position.customShape === 'T';

    const renderResizeHandles = () => {
      if (!isEditMode || !isSelected) return null;
      
      const handleStyle = {
        position: 'absolute' as const,
        backgroundColor: '#0066cc',
        border: '2px solid white',
        borderRadius: '50%',
        zIndex: 1001,
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
      };

      // All shapes get full 8 resize handles
      return (
        <>
          {/* Corner handles */}
          <div
            style={{
              ...handleStyle,
              top: '-8px',
              left: '-8px',
              width: '16px',
              height: '16px',
              cursor: 'nw-resize'
            }}
            onMouseDown={(e) => handleMouseDown(areaNum, e, 'resize', 'top-left')}
          />
          <div
            style={{
              ...handleStyle,
              top: '-8px',
              right: '-8px',
              width: '16px',
              height: '16px',
              cursor: 'ne-resize'
            }}
            onMouseDown={(e) => handleMouseDown(areaNum, e, 'resize', 'top-right')}
          />
          <div
            style={{
              ...handleStyle,
              bottom: '-8px',
              left: '-8px',
              width: '16px',
              height: '16px',
              cursor: 'sw-resize'
            }}
            onMouseDown={(e) => handleMouseDown(areaNum, e, 'resize', 'bottom-left')}
          />
          <div
            style={{
              ...handleStyle,
              bottom: '-8px',
              right: '-8px',
              width: '16px',
              height: '16px',
              cursor: 'se-resize'
            }}
            onMouseDown={(e) => handleMouseDown(areaNum, e, 'resize', 'bottom-right')}
          />
          
          {/* Edge handles */}
          <div
            style={{
              ...handleStyle,
              top: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '16px',
              height: '16px',
              cursor: 'n-resize'
            }}
            onMouseDown={(e) => handleMouseDown(areaNum, e, 'resize', 'top')}
          />
          <div
            style={{
              ...handleStyle,
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '16px',
              height: '16px',
              cursor: 's-resize'
            }}
            onMouseDown={(e) => handleMouseDown(areaNum, e, 'resize', 'bottom')}
          />
          <div
            style={{
              ...handleStyle,
              top: '50%',
              left: '-8px',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              cursor: 'w-resize'
            }}
            onMouseDown={(e) => handleMouseDown(areaNum, e, 'resize', 'left')}
          />
          <div
            style={{
              ...handleStyle,
              top: '50%',
              right: '-8px',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              cursor: 'e-resize'
            }}
            onMouseDown={(e) => handleMouseDown(areaNum, e, 'resize', 'right')}
          />
          
          {/* T-shape specific resize handles untuk melting areas */}
          {position.customShape === 'T' && (
            <>
              {/* Handle untuk lebar kaki T (stem width) - di kiri kaki */}
              <div
                style={{
                  ...handleStyle,
                  bottom: '25%',
                  left: `${25 - (position.stemWidth || 25)/2}%`,
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#ff9800',
                  cursor: 'ew-resize'
                }}
                title="Lebar Kaki T"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMeltingTShapeResize(e, areaNum, position, 'stem-width-left');
                }}
              />
              
              {/* Handle untuk lebar kaki T (stem width) - di kanan kaki */}
              <div
                style={{
                  ...handleStyle,
                  bottom: '25%',
                  left: `${75 + (position.stemWidth || 25)/2}%`,
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#ff9800',
                  cursor: 'ew-resize'
                }}
                title="Lebar Kaki T"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMeltingTShapeResize(e, areaNum, position, 'stem-width-right');
                }}
              />
              
              {/* Handle untuk lebar topi T (head width) - di kiri topi */}
              <div
                style={{
                  ...handleStyle,
                  top: '10%',
                  left: `${25 - (position.headWidth || 100)/2}%`,
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#9c27b0',
                  cursor: 'ew-resize'
                }}
                title="Lebar Topi T"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMeltingTShapeResize(e, areaNum, position, 'head-width-left');
                }}
              />
              
              {/* Handle untuk lebar topi T (head width) - di kanan topi */}
              <div
                style={{
                  ...handleStyle,
                  top: '10%',
                  left: `${75 + (position.headWidth || 100)/2}%`,
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#9c27b0',
                  cursor: 'ew-resize'
                }}
                title="Lebar Topi T"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMeltingTShapeResize(e, areaNum, position, 'head-width-right');
                }}
              />
              
              {/* Handle untuk tinggi topi T (head height) - di tengah batas topi-kaki */}
              <div
                style={{
                  ...handleStyle,
                  top: `${position.headHeight || 35}%`,
                  left: '50%',
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#4caf50',
                  transform: 'translateX(-50%)',
                  cursor: 'ns-resize'
                }}
                title="Tinggi Topi T"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMeltingTShapeResize(e, areaNum, position, 'head-height');
                }}
              />
            </>
          )}
        </>
      );
    };

    return (
      <>
        <div
          key={areaNum}
          style={boxStyle}
          onMouseDown={(e) => handleMouseDown(areaNum, e, 'drag')}
          onClick={(e) => {
            e.stopPropagation();
            if (isEditMode) {
              // Single click to select and show control panel - keep selected
              setSelectedArea(areaNum);
              setControlMode(null); // Reset control mode to show main panel
              setIsShapeEditing(false);
              setIsResizeEditing(false);
            } else {
              // Check if this area has kontaktors
              const kontaktorKeys = getKontaktorKeys(areaKey);
              if (kontaktorKeys.length > 0) {
                toggleMainLane(areaKey);
              } else {
                toggleArea(areaKey);
              }
            }
          }}
          onMouseEnter={(e) => {
            if (!isEditMode && !isDragging && !isResizing) {
              e.currentTarget.style.transform = 'scale(1.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isEditMode && !isDragging && !isResizing) {
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          {/* Background div dengan clip-path untuk shape */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: isEditMode 
                ? (isSelected ? 'rgba(0,87,228,0.9)' : 'rgba(158,158,158,0.7)')
                : (isOn ? 'rgba(76,175,80,0.5)' : 'rgba(244,67,54,0.7)'),
              zIndex: 0,
              ...shapeStyles, // Apply clip-path hanya di sini
            }}
          />
          
          {/* Border overlay untuk T dan L shapes */}
          {(position.customShape === 'T' || position.customShape === 'L') && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent',
                border: isEditMode
                  ? (isSelected ? '3px solid #0057e4' : '2px dashed #666')
                  : (isOn ? '2px solid #4caf50' : '2px solid #d32f2f'),
                zIndex: 1,
                pointerEvents: 'none',
                ...shapeStyles, // Apply same clip-path untuk border
              }}
            />
          )}
          
          {/* Invisible overlay untuk L dan T shapes - di atas background */}
          {needsClickOverlay && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent',
                zIndex: 1,
                cursor: 'inherit'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (isEditMode) {
                  setSelectedArea(areaNum);
                  setControlMode(null);
                  setIsShapeEditing(false);
                  setIsResizeEditing(false);
                } else {
                  // Check if this area has kontaktors
                  const kontaktorKeys = getKontaktorKeys(areaKey);
                  if (kontaktorKeys.length > 0) {
                    toggleMainLane(areaKey);
                  } else {
                    toggleArea(areaKey);
                  }
                }
              }}
            />
          )}

          {/* Area content */}
          <div style={{ textAlign: 'center', pointerEvents: 'none', zIndex: 2 }}>
            <div>{getAreaName(areaNum)}</div>
            {isEditMode && isSelected && (
              <div style={{ fontSize: '8px', marginTop: '2px' }}>
                {isDragging ? '🔄 Moving...' : 
                 isResizing ? '📏 Resizing...' : 
                 controlMode === 'shape' && isShapeEditing ? '🎨 Shape Edit' :
                 controlMode === 'resize' && isResizeEditing ? '📐 Manual Resize' :
                 controlMode === 'move' ? '🔄 Move Mode' :
                 '✅ Selected - Choose Action'}
              </div>
            )}
            {isEditMode && !isSelected && (
              <div style={{ fontSize: '7px', marginTop: '2px', color: '#ffeb3b' }}>
                Click to Select
              </div>
            )}
            {!isEditMode && (
              <div style={{ fontSize: '8px', marginTop: '2px' }}>
                {isOn ? '✅ ON' : '❌ OFF'}
              </div>
            )}
          </div>
        
          {renderResizeHandles()}
        
        {/* Shape editing panel */}
        {isEditMode && isSelected && isShapeEditing && (
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: '2px solid #ffeb3b',
              borderRadius: '8px',
              padding: '8px',
              display: 'flex',
              gap: '4px',
              zIndex: 1002,
              fontSize: '10px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(['rectangle', 'square', 'L', 'T'] as ShapeType[]).map((shape) => (
              <button
                key={shape}
                style={{
                  padding: '4px 8px',
                  backgroundColor: position.customShape === shape ? '#ffeb3b' : '#666',
                  color: position.customShape === shape ? '#000' : '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '9px',
                  fontWeight: 'bold',
                }}
                onClick={() => {
                  setManualPositions(prev => ({
                    ...prev,
                    [areaKey]: {
                      ...prev[areaKey],
                      customShape: shape,
                      // Set default cutout values for L and T shapes
                      cutoutWidth: shape === 'L' || shape === 'T' ? 30 : undefined,
                      cutoutHeight: shape === 'L' || shape === 'T' ? 40 : undefined,
                      cutoutPosition: shape === 'L' ? 'top-right' : undefined,
                    }
                  }));
                  // Close shape editor after selection
                  setIsShapeEditing(false);
                }}
              >
                {shape === 'rectangle' ? '▭' : 
                 shape === 'square' ? '□' : 
                 shape === 'L' ? 'L' : 'T'}
              </button>
            ))}
            <button
              style={{
                padding: '4px 8px',
                backgroundColor: '#e74c3c',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '9px',
                marginLeft: '4px',
              }}
              onClick={() => setIsShapeEditing(false)}
            >
              ✕
            </button>
          </div>
        )}

        {/* L-shape cutout position controls */}
        {isEditMode && isSelected && position.customShape === 'L' && (
          <div
            style={{
              position: 'absolute',
              top: '-25px',
              right: '-60px',
              backgroundColor: 'rgba(255,87,34,0.9)',
              color: 'white',
              padding: '4px',
              borderRadius: '4px',
              fontSize: '8px',
              zIndex: 1003,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: '2px', fontWeight: 'bold' }}>Cutout Position:</div>
            <div style={{ display: 'grid', gridTemplate: '1fr 1fr / 1fr 1fr', gap: '2px' }}>
              {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((pos) => (
                <button
                  key={pos}
                  style={{
                    padding: '2px 4px',
                    backgroundColor: position.cutoutPosition === pos ? '#ffeb3b' : '#666',
                    color: position.cutoutPosition === pos ? '#000' : '#fff',
                    border: 'none',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    fontSize: '7px',
                  }}
                  onClick={() => {
                    setManualPositions(prev => ({
                      ...prev,
                      [areaKey]: {
                        ...prev[areaKey],
                        cutoutPosition: pos,
                      }
                    }));
                  }}
                >
                  {pos.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Manual resize editing panel for melting areas - 4-directional */}
        {isEditMode && isSelected && isResizeEditing && (
          <div
            style={{
              position: 'absolute',
              top: '-140px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(33,150,243,0.95)',
              border: '2px solid #1976d2',
              borderRadius: '8px',
              padding: '15px',
              zIndex: 1003,
              fontSize: '10px',
              color: 'white',
              minWidth: '320px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '12px' }}>
              � 4-Direction Manual Resize - {getAreaName(areaNum)}
            </div>
            
            {/* Cross-style layout for 4-direction controls */}
            <div style={{ position: 'relative', width: '250px', height: '140px', margin: '0 auto' }}>
              
              {/* Top controls - Extend Up */}
              <div style={{ 
                position: 'absolute', 
                top: '0', 
                left: '50%', 
                transform: 'translateX(-50%)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '8px', marginBottom: '3px', fontWeight: 'bold' }}>↑ Extend Up</div>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <button
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '9px',
                      fontWeight: 'bold',
                    }}
                    onClick={() => {
                      setManualPositions(prev => ({
                        ...prev,
                        [areaKey]: {
                          ...prev[areaKey],
                          top: Math.min(prev[areaKey].top + 1, 90),
                          height: Math.max(3, prev[areaKey].height - 1)
                        }
                      }));
                    }}
                  >
                    --
                  </button>
                  <button
                    style={{
                      padding: '4px 6px',
                      backgroundColor: '#ff5722',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '9px',
                    }}
                    onClick={() => {
                      setManualPositions(prev => ({
                        ...prev,
                        [areaKey]: {
                          ...prev[areaKey],
                          top: Math.min(prev[areaKey].top + 0.5, 90),
                          height: Math.max(3, prev[areaKey].height - 0.5)
                        }
                      }));
                    }}
                  >
                    -
                  </button>
                  <button
                    style={{
                      padding: '4px 6px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '9px',
                    }}
                    onClick={() => {
                      setManualPositions(prev => ({
                        ...prev,
                        [areaKey]: {
                          ...prev[areaKey],
                          top: Math.max(0, prev[areaKey].top - 0.5),
                          height: Math.min(80, prev[areaKey].height + 0.5)
                        }
                      }));
                    }}
                  >
                    +
                  </button>
                  <button
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#2e7d32',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '9px',
                      fontWeight: 'bold',
                    }}
                    onClick={() => {
                      setManualPositions(prev => ({
                        ...prev,
                        [areaKey]: {
                          ...prev[areaKey],
                          top: Math.max(0, prev[areaKey].top - 1),
                          height: Math.min(80, prev[areaKey].height + 1)
                        }
                      }));
                    }}
                  >
                    ++
                  </button>
                </div>
              </div>

              {/* Left controls - Extend Left */}
              <div style={{ 
                position: 'absolute', 
                left: '0', 
                top: '50%', 
                transform: 'translateY(-50%)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '8px', marginBottom: '3px', fontWeight: 'bold' }}>← Extend Left</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <button
                    style={{
                      padding: '3px 6px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '8px',
                      fontWeight: 'bold',
                    }}
                    onClick={() => {
                      setManualPositions(prev => ({
                        ...prev,
                        [areaKey]: {
                          ...prev[areaKey],
                          left: Math.min(prev[areaKey].left + 1, 90),
                          width: Math.max(5, prev[areaKey].width - 1)
                        }
                      }));
                    }}
                  >
                    --
                  </button>
                  <button
                    style={{
                      padding: '3px 6px',
                      backgroundColor: '#ff5722',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '8px',
                    }}
                    onClick={() => {
                      setManualPositions(prev => ({
                        ...prev,
                        [areaKey]: {
                          ...prev[areaKey],
                          left: Math.min(prev[areaKey].left + 0.5, 90),
                          width: Math.max(5, prev[areaKey].width - 0.5)
                        }
                      }));
                    }}
                  >
                    -
                  </button>
                  <button
                    style={{
                      padding: '3px 6px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '8px',
                    }}
                    onClick={() => {
                      setManualPositions(prev => ({
                        ...prev,
                        [areaKey]: {
                          ...prev[areaKey],
                          left: Math.max(0, prev[areaKey].left - 0.5),
                          width: Math.min(90, prev[areaKey].width + 0.5)
                        }
                      }));
                    }}
                  >
                    +
                  </button>
                  <button
                    style={{
                      padding: '3px 6px',
                      backgroundColor: '#2e7d32',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '8px',
                      fontWeight: 'bold',
                    }}
                    onClick={() => {
                      setManualPositions(prev => ({
                        ...prev,
                        [areaKey]: {
                          ...prev[areaKey],
                          left: Math.max(0, prev[areaKey].left - 1),
                          width: Math.min(90, prev[areaKey].width + 1)
                        }
                      }));
                    }}
                  >
                    ++
                  </button>
                </div>
              </div>

              {/* Center info */}
              <div style={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #ffeb3b'
              }}>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#ffeb3b' }}>{getAreaName(areaNum)}</div>
                <div style={{ fontSize: '7px', marginTop: '2px' }}>
                  {Math.round(position.width * 10)/10}% × {Math.round(position.height * 10)/10}%
                </div>
                <div style={{ fontSize: '6px', marginTop: '1px', color: '#ccc' }}>
                  Pos: {Math.round(position.left)}%, {Math.round(position.top)}%
                </div>
              </div>

              {/* Right controls - Extend Right */}
              <div style={{ 
                position: 'absolute', 
                right: '0', 
                top: '50%', 
                transform: 'translateY(-50%)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '8px', marginBottom: '3px', fontWeight: 'bold' }}>→ Extend Right</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <button
                    style={{
                      padding: '3px 6px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '8px',
                      fontWeight: 'bold',
                    }}
                    onClick={() => {
                      setManualPositions(prev => ({
                        ...prev,
                        [areaKey]: {
                          ...prev[areaKey],
                          width: Math.max(5, prev[areaKey].width - 1)
                        }
                      }));
                    }}
                  >
                    --
                  </button>
                  <button
                    style={{
                      padding: '3px 6px',
                      backgroundColor: '#ff5722',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '8px',
                    }}
                    onClick={() => {
                      setManualPositions(prev => ({
                        ...prev,
                        [areaKey]: {
                          ...prev[areaKey],
                          width: Math.max(5, prev[areaKey].width - 0.5)
                        }
                      }));
                    }}
                  >
                    -
                  </button>
                  <button
                    style={{
                      padding: '3px 6px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '8px',
                    }}
                    onClick={() => {
                      setManualPositions(prev => ({
                        ...prev,
                        [areaKey]: {
                          ...prev[areaKey],
                          width: Math.min(90, prev[areaKey].width + 0.5)
                        }
                      }));
                    }}
                  >
                    +
                  </button>
                  <button
                    style={{
                      padding: '3px 6px',
                      backgroundColor: '#2e7d32',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '8px',
                      fontWeight: 'bold',
                    }}
                    onClick={() => {
                      setManualPositions(prev => ({
                        ...prev,
                        [areaKey]: {
                          ...prev[areaKey],
                          width: Math.min(90, prev[areaKey].width + 1)
                        }
                      }));
                    }}
                  >
                    ++
                  </button>
                </div>
              </div>

              {/* Bottom controls - Extend Down */}
              <div style={{ 
                position: 'absolute', 
                bottom: '0', 
                left: '50%', 
                transform: 'translateX(-50%)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '8px', marginBottom: '3px', fontWeight: 'bold' }}>↓ Extend Down</div>
                <div style={{ display: 'flex', gap: '3px' }}>
                  <button
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '9px',
                      fontWeight: 'bold',
                    }}
                    onClick={() => {
                      setManualPositions(prev => ({
                        ...prev,
                        [areaKey]: {
                          ...prev[areaKey],
                          height: Math.max(3, prev[areaKey].height - 1)
                        }
                      }));
                    }}
                  >
                    --
                  </button>
                  <button
                    style={{
                      padding: '4px 6px',
                      backgroundColor: '#ff5722',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '9px',
                    }}
                    onClick={() => {
                      setManualPositions(prev => ({
                        ...prev,
                        [areaKey]: {
                          ...prev[areaKey],
                          height: Math.max(3, prev[areaKey].height - 0.5)
                        }
                      }));
                    }}
                  >
                    -
                  </button>
                  <button
                    style={{
                      padding: '4px 6px',
                      backgroundColor: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '9px',
                    }}
                    onClick={() => {
                      setManualPositions(prev => ({
                        ...prev,
                        [areaKey]: {
                          ...prev[areaKey],
                          height: Math.min(80, prev[areaKey].height + 0.5)
                        }
                      }));
                    }}
                  >
                    +
                  </button>
                  <button
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#2e7d32',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '9px',
                      fontWeight: 'bold',
                    }}
                    onClick={() => {
                      setManualPositions(prev => ({
                        ...prev,
                        [areaKey]: {
                          ...prev[areaKey],
                          height: Math.min(80, prev[areaKey].height + 1)
                        }
                      }));
                    }}
                  >
                    ++
                  </button>
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <button
                style={{
                  padding: '8px 20px',
                  backgroundColor: '#e74c3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}
                onClick={() => setIsResizeEditing(false)}
              >
                ✅ Done Resizing
              </button>
            </div>
          </div>
        )}

        {/* Unified Control Panel for Melting Areas */}
        {isEditMode && isSelected && !controlMode && (
          <div
            style={{
              position: 'absolute',
              top: '-80px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: '2px solid #ffeb3b',
              borderRadius: '8px',
              padding: '10px',
              display: 'flex',
              gap: '8px',
              zIndex: 1001,
              fontSize: '10px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              style={{
                padding: '8px 14px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={() => setControlMode('move')}
            >
              🔄 Pindah Posisi
            </button>
            
            <button
              style={{
                padding: '8px 14px',
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={() => {
                setControlMode('shape');
                setIsShapeEditing(true);
              }}
            >
              🎨 Rubah Shape
            </button>
            
            <button
              style={{
                padding: '8px 14px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '10px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={() => {
                setControlMode('resize');
                setIsResizeEditing(true);
              }}
            >
              📐 Resize Ukuran
            </button>
          </div>
        )}
      </div>
      </>
    );
  };

  console.log('IoT App rendering with view:', currentView);

  // Login handler
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setAuthError('Mohon masukkan email dan password');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    console.log(' Attempting login with:', username.trim());

    try {
      const result = await authService.login({
        email: username.trim(),
        password: password.trim()
      });
      console.log('✅ Login successful:', result);
      setUsername('');
      setPassword('');
      setCurrentView('monitoring'); // hanya jika login sukses
    } catch (error) {
      console.error('❌ Login error:', error);
      setUser(null); // Pastikan user null jika login gagal
      setCurrentView('login'); // Tetap di login jika gagal
      let errorMessage = 'Email atau Password Salah';
      if (error && typeof error === 'object' && 'code' in error) {
  const code = (error as any).code;
  if (code === 'auth/user-not-found') errorMessage = 'Email atau Password Salah';
  else if (code === 'auth/wrong-password') errorMessage = 'Email atau Password Salah';
  else if (code === 'auth/invalid-credential') errorMessage = 'Email atau Password Salah';
  else if (code === 'auth/invalid-email') errorMessage = 'Format email tidak valid';
  else if (code === 'auth/user-disabled') errorMessage = 'Akun telah dinonaktifkan';
}
      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  console.log(' Current App State:', { currentView, isLoading, user: !!user });

  // Loading screen saat check authentication state
  if (isLoading) {
    console.log('⏳ Showing loading screen...');
    return (
      <div style={{ 
        height: '100vh', 
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #667eea 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}></div>
          <h2 style={{ margin: '0 0 10px 0' }}>IoT Foundry Plant</h2>
          <p style={{ margin: '0 0 20px 0', opacity: 0.8 }}>Checking authentication...</p>
          
          {/* Fallback button if loading takes too long */}
          <button
            onClick={() => {
              setIsLoading(false);
              setCurrentView('home');
            }}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.3)',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              marginTop: '20px'
            }}
          >
            Skip to Home
          </button>
        </div>
      </div>
    );
  }

  // Home view - only login button
  if (currentView === 'home') {
    console.log(' Rendering Home view...');
    return (
      <div style={{ 
        height: '100vh', 
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #667eea 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          padding: '60px 40px',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}>
          {/* Logo Komatsu */}
          <div style={{ marginBottom: '20px' }}>
            <img 
              src="/images/komatsu.png" 
              alt="Komatsu Logo" 
              style={{ 
                height: '60px', 
                width: 'auto',
                marginBottom: '10px'
              }} 
            />
          </div>
          
          <div style={{ fontSize: '48px', marginBottom: '20px' }}></div>
          <h1 style={{ 
            color: '#1976d2', 
            margin: '0 0 20px 0',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            IoT Foundry Plant Control System
          </h1>
          
          <p style={{
            color: '#666',
            fontSize: '16px',
            margin: '0 0 30px 0',
            lineHeight: '1.6'
          }}>
            Real-time monitoring and control system for 12 lighting areas across 2 foundry plants
          </p>
          
          <div style={{ 
            backgroundColor: '#e8f5e8', 
            color: '#2e7d32', 
            padding: '15px', 
            borderRadius: '8px',
            marginBottom: '30px',
            border: '1px solid #c8e6c9'
          }}>
            ✅ System Online - Ready for Operation
          </div>

          <button 
            onClick={() => setCurrentView('login')}
            style={{
              backgroundColor: '#1a1aff',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(26,26,255,0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#1515dd';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#1a1aff';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
             Access Control System
          </button>
        </div>
      </div>
    );
  }

  // Login view
  if (currentView === 'login') {
    return (
      <div style={{ 
        height: '100vh', 
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            {/* Logo Komatsu */}
            <div style={{ marginBottom: '15px' }}>
              <img 
                src="/images/komatsu.png" 
                alt="Komatsu Logo" 
                style={{ 
                  height: '50px', 
                  width: 'auto'
                }} 
              />
            </div>
            
            <div style={{ fontSize: '48px', marginBottom: '10px' }}></div>
            <h2 style={{ color: '#333', margin: '0 0 10px 0' }}>Login</h2>
            <p style={{ color: '#666', margin: 0 }}>Enter your credentials to access the system</p>
          </div>

          {/* Error Message */}
          {authError && (
            <div style={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              textAlign: 'center',
              border: '1px solid #ffcdd2'
            }}>
              {authError}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '5px', 
                color: '#333',
                fontWeight: 'bold'
              }}>
                Email
              </label>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                placeholder="Enter your email address"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  opacity: isLoading ? 0.6 : 1
                }}
              />
            </div>

            {/* Password input (login view) */}
<div style={{ position: 'relative', width: '100%', marginBottom: 24 }}>
  <input
    type={showPassword ? 'text' : 'password'}
    value={password}
    onChange={e => setPassword(e.target.value)}
    placeholder="Password"
    style={{
      width: '100%',
      padding: '12px 44px 12px 16px',
      borderRadius: 8,
      border: '2px solid #222',
      background: '#23232b',
      color: 'white',
      fontSize: 18,
      outline: 'none',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}
    autoComplete="current-password"
    onKeyDown={e => { if (e.key === 'Enter') handleLogin(); }}
  />
  <button
    type="button"
    aria-label={showPassword ? 'Hide password' : 'Show password'}
    onClick={() => setShowPassword(v => !v)}
    style={{
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: 'translateY(-50%)', // center vertically
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      outline: 'none',
      color: '#fff', // warna putih
      fontSize: 22
    }}
    tabIndex={-1}
  >
    {showPassword ? (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5 0-9.27-3.11-11-7 1.21-2.73 3.29-5 6-6.32"/><path d="M1 1l22 22"/><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5c1.38 0 2.63-.56 3.54-1.47"/><path d="M14.47 14.47A3.5 3.5 0 0 1 12 8.5c-.41 0-.8.07-1.17.2"/></svg>
    ) : (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3.5"/></svg>
    )}
  </button>
</div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: isLoading ? '#999' : '#1a1aff',
                color: 'white',
                border: 'none',
                padding: '15px',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '15px',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? '🔄 Logging in...' : '🔐 Login to Dashboard'}
            </button>
          </form>

          <button 
            onClick={() => {
              setCurrentView('home');
              setAuthError('');
            }}
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              padding: '10px',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            🏠 Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Monitoring Dashboard - Single slide, no scrollbars
  if (currentView === 'monitoring') {
    // Prevent dashboard access if not authenticated or still loading
    if (!user || !user.uid || isLoading) {
      // Render nothing to prevent dashboard flash
      return null;
    }
    // Pastikan tidak ada kode dashboard lain yang dijalankan sebelum return null
    return (
      <div style={{
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Arial, sans-serif'
      }}>
        {/* Header - Fixed height */}
        <div style={{
          backgroundColor: '#1a1aff',
          color: 'white',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '60px',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          position: 'relative'
        }}>
          {/* Logo Komatsu - Left */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: '200px' 
          }}>
            <img 
              src="/images/komatsu.png" 
              alt="Komatsu Logo" 
              style={{ 
                height: '40px', 
                width: 'auto',
                filter: 'brightness(0) invert(1)', // Convert to white
                marginRight: '10px'
              }} 
            />
          </div>

          {/* Title - Center */}
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center'
          }}>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
              🏭 IoT Foundry Plant Monitoring Dashboard
            </h1>
            <p style={{ margin: '2px 0 0 0', opacity: 0.9, fontSize: '12px' }}>
              Real-time lighting control system - 10 production lanes across 2 plants
              {isEditMode && <span style={{ color: '#ffeb3b', fontWeight: 'bold' }}> ⚡ EDIT MODE ACTIVE</span>}
            </p>
          </div>

          {/* Buttons - Right */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '4px', 
            alignItems: 'flex-end', 
            minWidth: '300px'
          }}>
            {/* Top row - Main buttons */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {/* Edit Mode Toggle */}
              <button 
                onClick={toggleEditMode}
                style={{
                  backgroundColor: isEditMode ? '#ff9800' : '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
              >
                {isEditMode ? '✅ Exit Edit' : '✏️ Edit Layout'}
              </button>
              
              {/* Logout */}
              <button 
                onClick={async () => {
                  try {
                    await authService.logout();
                    setCurrentView('login'); // Arahkan ke login page setelah logout
                  } catch (error) {
                    setCurrentView('home');
                  }
                }}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                🚪 Logout
              </button>
            </div>
            

          </div>
        </div>

        {/* Save Message Display */}
        {saveMessage && (
          <div style={{
            position: 'fixed',
            top: '70px',
            right: '20px',
            backgroundColor: '#4caf50',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            zIndex: 1000,
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            {saveMessage}
          </div>
        )}

        {/* Edit Mode Control Panel - Bottom Right */}
        {isEditMode && (
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'rgba(33, 150, 243, 0.95)',
            borderRadius: '12px',
            padding: '15px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 1000,
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '12px',
              textAlign: 'center'
            }}>
              🔧 Layout Editor
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '8px',
              minWidth: '200px'
            }}>
              <button 
                onClick={clearAllLayouts}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  width: '100%'
                }}
                title="Load from kontaktor positions (Firebase default)"
              >
                ♻ Reset & Sync All
              </button>
              
              <button 
                onClick={saveAsDefaultLayout}
                style={{
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  width: '100%'
                }}
                title="Save current layout changes to localStorage"
              >
                ⭐ Save as Default
              </button>
              
              <button 
                onClick={resetToDefaultLayout}
                style={{
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  width: '100%'
                }}
                title="Load from saved localStorage default"
              >
                � Reset to Default
              </button>

            </div>
            
            <div style={{ marginTop: '8px' }}>
              <button 
                onClick={clearAllLayouts}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  width: '100%'
                }}

              >
                � Reset & Sync All
              </button>
            </div>
          </div>
        )}

        {/* Main Content - Full remaining height */}
        <div style={{
          flex: 1,
          display: 'flex',
          height: 'calc(100vh - 60px)'
        }}>
          {/* Left Side - Foundry Plant 2 */}
          <div style={{
            flex: 1,
            position: 'relative',
            borderRight: '2px solid #ddd'
          }}>
            <div style={{
              backgroundColor: '#d4edda',
              color: '#155724',
              padding: '6px',
              textAlign: 'center',
              fontWeight: 'bold',
              borderBottom: '1px solid #ddd',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              🏭 Foundry Plant 2
              {isEditMode && (
                <span style={{ fontSize: '12px', marginLeft: '10px', opacity: 0.8 }}>
                  (Lanes A, B, C, D, Melting P2)
                </span>
              )}
            </div>
            <div 
              ref={plant2Ref}
              style={{
                height: 'calc(100% - 30px)',
                backgroundImage: 'url("/images/foundry-plant-2.jpg")',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                position: 'relative',
                backgroundColor: isEditMode ? '#f0f8ff' : '#f5f5f5',
                cursor: isEditMode ? 'crosshair' : 'default'
              }}
              onClick={() => {
                if (isEditMode) {
                  // Deselect any selected area when clicking on empty space
                  setSelectedArea(null);
                  setSelectedKontaktor(null);
                  setControlMode(null);
                  setIsShapeEditing(false);
                  setIsResizeEditing(false);
                }
              }}
            >
              {/* Render Plant 2 Kontaktor Areas - Direct kontaktor boxes instead of main lanes */}
              {[1, 2, 3, 4].map(areaNum => {
                const areaKey = getAreaKey(areaNum);
                return renderKontaktorBoxes(areaKey);
              })}
              
              {/* Render Lane Melting Plant 2 - Keep as single area */}
              {renderMeltingArea(5)}
              
              {/* Edit mode instructions */}
              {isEditMode && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  backgroundColor: 'rgba(33,150,243,0.9)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  zIndex: 50
                }}>
                  📝 Click to select • Drag to move • Use handles to resize
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Foundry Plant 1 */}
          <div style={{
            flex: 1,
            position: 'relative'
          }}>
            <div style={{
              backgroundColor: '#d4edda',
              color: '#155724',
              padding: '6px',
              textAlign: 'center',
              fontWeight: 'bold',
              borderBottom: '1px solid #ddd',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}>
              🏭 Foundry Plant 1
              {isEditMode && (
                <span style={{ fontSize: '12px', marginLeft: '10px', opacity: 0.8 }}>
                  (AB Selatan, AB Utara, CD Utara, CD Selatan, Melting P1)
                </span>
              )}
            </div>
            <div 
              ref={plant1Ref}
              style={{
                height: 'calc(100% - 30px)',
                backgroundImage: 'url("/images/foundry-plant-1.jpg")',
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                position: 'relative',
                backgroundColor: isEditMode ? '#f0f8ff' : '#f5f5f5',
                cursor: isEditMode ? 'crosshair' : 'default'
              }}
              onClick={() => {
                if (isEditMode) {
                  // Deselect any selected area when clicking on empty space
                  setSelectedArea(null);
                  setSelectedKontaktor(null);
                  setControlMode(null);
                  setIsShapeEditing(false);
                  setIsResizeEditing(false);
                }
              }}
            >
              {/* Render Plant 1 Kontaktor Areas - Direct kontaktor boxes instead of main lanes */}
              {[7, 8, 9, 10].map(areaNum => {
                const areaKey = getAreaKey(areaNum);
                return renderKontaktorBoxes(areaKey);
              })}
              
              {/* Render Lane Melting Plant 1 - Keep as single area */}
              {renderMeltingArea(11)}
              
              {/* Edit mode instructions */}
              {isEditMode && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '10px',
                  backgroundColor: 'rgba(33,150,243,0.9)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  zIndex: 50
                }}>
                  📝 Click to select • Drag to move • Use handles to resize
                </div>
              )}
                       </div>
          </div>

          {/* Right Sidebar - Area Controls */}
          <div style={{
            width: '380px',
            backgroundColor: '#f8f9fa',
            borderLeft: '3px solid #1976d2',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflowY: 'auto'
          }}>
            <div style={{
              backgroundColor: '#1a1aff',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                {isEditMode ? '🛠️ Layout Editor' : '💡 Lighting Control Panel'}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                {isEditMode ? 'Design your plant layout' : 'Individual area controls'}
              </p>
            </div>
            
            {/* Edit Mode Panel */}
            {isEditMode && selectedArea && (
              <div style={{
                backgroundColor: '#e3f2fd',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '2px solid #1976d2'
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>
                   {getAreaName(selectedArea)} Selected
                </h4>
                
                <div style={{ fontSize: '10px', color: '#555', lineHeight: '1.4' }}>
                  <div><strong>Movement:</strong></div>
                  <div>◆ <strong>Drag</strong> area to move</div>
                  <div>◆ <strong>Arrow keys</strong> for fine movement</div>
                  <div>◆ <strong>Shift+Arrow</strong> for larger steps</div>
                  
                  <div style={{ marginTop: '6px' }}><strong>Resizing:</strong></div>
                  <div>◆ <strong>Drag handles</strong> to resize</div>
                  <div>◆ <strong>Ctrl+Arrow</strong> to resize with keyboard</div>
                  
                  <div style={{ marginTop: '6px' }}><strong>Other:</strong></div>
                  <div>◆ <strong>Ctrl+C</strong> to copy size</div>
                  <div>◆ <strong>Ctrl+V</strong> to paste size</div>
                  <div>◆ <strong>ESC</strong> to deselect</div>
                </div>
                
                {/* Special controls for Lane C D Selatan (T-shape) */}
                {selectedArea === 8 && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '6px',
                    border: '1px solid #ffeaa7'
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#856404', marginBottom: '8px' }}>
                      ⚙️ T-Shape Settings
                    </div>
                    <div style={{ fontSize: '10px', color: '#666', marginBottom: '6px' }}>
                      Lebar kaki T: {tFootWidth}%
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="40"
                      value={tFootWidth}
                      onChange={(e) => setTFootWidth(parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        height: '4px',
                        background: '#ddd',
                        borderRadius: '2px',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    />
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '8px',
                      color: '#999',
                      marginTop: '2px',
                      marginBottom: '8px'
                    }}>
                      <span>Sempit (10%)</span>
                      <span>Lebar (40%)</span>
                    </div>
                    
                    {/* Preset buttons */}
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                      {[15, 20, 25, 30, 35].map(width => (
                        <button
                          key={width}
                          onClick={() => setTFootWidth(width)}
                          style={{
                            flex: 1,
                            padding: '4px 2px',
                            fontSize: '8px',
                            border: tFootWidth === width ? '2px solid #1976d2' : '1px solid #ccc',
                            borderRadius: '3px',
                            backgroundColor: tFootWidth === width ? '#e3f2fd' : 'white',
                            color: tFootWidth === width ? '#1976d2' : '#666',
                            cursor: 'pointer',
                            fontWeight: tFootWidth === width ? 'bold' : 'normal'
                          }}
                        >
                          {width}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Area Controls - Only show when not in edit mode */}
            {!isEditMode && (
              <div style={{ 
                flex: 1, 
                overflowY: 'auto',
                paddingRight: '4px',
                paddingBottom: '8px'
              }}>
              {/* Plant 2 Areas */}
              <div style={{
                backgroundColor: '#fff3cd',
                color: '#856404',
                padding: '8px 12px',
                borderRadius: '6px',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                🏭 Foundry Plant 2
              </div>
              
              {[4, 1, 2, 3, 5].map((areaNum) => { // Lane A, B, C, D, Melting (alphabetical order)
                const { areaKey, isOn, zone, area } = getAreaDetails(areaNum);
                const kontaktorKeys = getKontaktorKeys(areaKey);
                const hasKontaktors = kontaktorKeys.length > 0;
                
                // DEBUG LOG
                console.log(`🔍 Plant 2 - Area ${areaNum} (${areaKey}): hasKontaktors=${hasKontaktors}, kontaktorKeys=`, kontaktorKeys);
                
                return (
                  <div key={areaNum} style={{
                    marginBottom: '12px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: isOn ? '2px solid #4caf50' : '2px solid #f44336',
                    overflow: 'hidden'
                  }}>
                    {/* Main Lane Control */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: isOn ? '#f8fff8' : '#fff5f5'
                    }}>
                      {/* Status Indicator Circle */}
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: isOn ? '#4caf50' : '#f44336',
                        marginRight: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'white'
                        }}></div>
                      </div>
                      
                      {/* Area Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: 'bold',
                          color: '#333',
                          fontSize: '13px'
                        }}>
                          {getAreaName(areaNum)}
                          {hasKontaktors && <span style={{ fontSize: '10px', color: '#666' }}> (Main Control)</span>}
                        </div>
                        <div style={{ 
                          fontSize: '10px',
                          color: '#666'
                        }}>
                          {zone} {area && area.device ? `� ${area.device.status}` : ''}
                          {hasKontaktors && <span> • {kontaktorKeys.length} Kontaktors</span>}
                        </div>
                      </div>
                      
                      {/* ON/OFF Button */}
                      <button
                        onClick={() => hasKontaktors ? toggleMainLane(areaKey) : toggleArea(areaKey)}
                        style={{
                          backgroundColor: isOn ? '#4caf50' : '#f44336',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          minWidth: '45px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isOn ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    {/* Individual Kontaktor Controls */}
                    {hasKontaktors && (
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '8px 12px',
                        borderTop: '1px solid #e9ecef'
                      }}>
                        <div style={{ 
                          fontSize: '10px', 
                          color: '#666', 
                          marginBottom: '6px',
                          fontWeight: 'bold'
                        }}>
                          Individual Kontaktor Controls:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {kontaktorKeys.map((kontaktorKey, index) => {
                            const kontaktorIsOn = areaStates[kontaktorKey];
                            const kontaktorNum = index + 1;
                            
                            return (
                              <button
                                key={kontaktorKey}
                                onClick={() => toggleKontaktor(kontaktorKey)}
                                style={{
                                  backgroundColor: kontaktorIsOn ? '#4caf50' : '#f44336',
                                  color: 'white',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                  fontSize: '9px',
                                  fontWeight: 'bold',
                                  minWidth: '35px',
                                  transition: 'all 0.2s ease',
                                  flex: '1',
                                  maxWidth: '70px'
                                }}
                              >
                                K{kontaktorNum}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Plant 1 Areas */}
              <div style={{
                backgroundColor: '#d4edda',
                color: '#155724',
                padding: '8px 12px',
                borderRadius: '6px',
                marginBottom: '8px',
                marginTop: '12px',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                🏭 Foundry Plant 1
              </div>

              {[7,8,9,10,11].map((areaNum) => {
                const { areaKey, isOn, zone, area } = getAreaDetails(areaNum);
                const kontaktorKeys = getKontaktorKeys(areaKey);
                const hasKontaktors = kontaktorKeys.length > 0;
                
                // Special rendering for Lane C D Utara dengan monitoring daya
                if (areaNum === 10) {
                  return <LaneCDUtaraPanel 
                    key={areaNum} 
                    isOn={isOn} 
                    areaKey={areaKey} 
                    getAreaName={getAreaName} 
                    toggleArea={toggleArea}
                    toggleMainLane={toggleMainLane}
                    kontaktorKeys={kontaktorKeys}
                    areaStates={areaStates}
                    toggleKontaktor={toggleKontaktor}
                  />;
                }
                
                // Default rendering untuk area lain dengan kontaktor controls
                return (
                  <div key={areaNum} style={{
                    marginBottom: '12px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: isOn ? '2px solid #4caf50' : '2px solid #f44336',
                    overflow: 'hidden'
                  }}>
                    {/* Main Lane Control */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: isOn ? '#f8fff8' : '#fff5f5'
                    }}>
                      {/* Status Indicator Circle */}
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: isOn ? '#4caf50' : '#f44336',
                        marginRight: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'white'
                        }}></div>
                      </div>
                      
                      {/* Area Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontWeight: 'bold',
                          color: '#333',
                          fontSize: '13px'
                        }}>
                          {getAreaName(areaNum)}
                          {hasKontaktors && <span style={{ fontSize: '10px', color: '#666' }}> (Main Control)</span>}
                        </div>
                        <div style={{ 
                          fontSize: '10px',
                          color: '#666'
                        }}>
                          {zone} {area && area.device ? `� ${area.device.status}` : ''}
                          {hasKontaktors && <span> • {kontaktorKeys.length} Kontaktors</span>}
                        </div>
                      </div>
                      
                      {/* ON/OFF Button */}
                      <button
                        onClick={() => hasKontaktors ? toggleMainLane(areaKey) : toggleArea(areaKey)}
                        style={{
                          backgroundColor: isOn ? '#4caf50' : '#f44336',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          minWidth: '45px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isOn ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    {/* Individual Kontaktor Controls */}
                    {hasKontaktors && (
                      <div style={{
                        backgroundColor: '#f8f9fa',
                        padding: '8px 12px',
                        borderTop: '1px solid #e9ecef'
                      }}>
                        <div style={{ 
                          fontSize: '10px', 
                          color: '#666', 
                          marginBottom: '6px',
                          fontWeight: 'bold'
                        }}>
                          Individual Kontaktor Controls:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {kontaktorKeys.map((kontaktorKey, index) => {
                            const kontaktorIsOn = areaStates[kontaktorKey];
                            const kontaktorNum = index + 1;
                            
                            return (
                              <button
                                key={kontaktorKey}
                                onClick={() => toggleKontaktor(kontaktorKey)}
                                style={{
                                  backgroundColor: kontaktorIsOn ? '#4caf50' : '#f44336',
                                  color: 'white',
                                  border: 'none',
                                  padding: '4px 8px',
                                  borderRadius: '3px',
                                  cursor: 'pointer',
                                  fontSize: '9px',
                                  fontWeight: 'bold',
                                  minWidth: '35px',
                                  transition: 'all 0.2s ease',
                                  flex: '1',
                                  maxWidth: '70px'
                                }}
                              >
                                K{kontaktorNum}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            )}

            {/* Summary Stats */}
            <div style={{
              backgroundColor: '#e3f2fd',
              padding: '12px',
              borderRadius: '8px',
              marginTop: '12px',
              marginBottom: '16px',
              border: '1px solid #bbdefb'
            }}>
              <div style={{ fontSize: '12px', color: '#1976d2', fontWeight: 'bold' }}>
                System Status
              </div>
              {/* Hitung area utama (main lane, bukan kontaktor) untuk status summary */}
              {(() => {
                // Area utama Plant 2: 4,1,2,3,5 (Lane A,B,C,D,Melting P2)
                // Area utama Plant 1: 7,8,9,10,11 (AB Selatan, CD Selatan, AB Utara, CD Utara, Melting P1)
                const plant2Nums = [4,1,2,3,5];
                const plant1Nums = [7,8,9,10,11];
                const getMainAreaKey = (num: number) => {
                  const areaMapping: Record<number, string> = {
                    1: 'fp1-lane-b', 2: 'fp1-lane-c', 3: 'fp1-lane-d', 4: 'fp1-lane-a', 5: 'fp1-lane-melting-p2',
                    7: 'fp1-lane-ab-selatan', 8: 'fp1-lane-cd-selatan', 9: 'fp1-lane-ab-utara', 10: 'fp1-lane-cd-utara', 11: 'fp1-lane-melting-p1'
                  };
                  return areaMapping[num];
                };
                const plant2Keys = plant2Nums.map(getMainAreaKey);
                const plant1Keys = plant1Nums.map(getMainAreaKey);
                const onlinePlant2 = plant2Keys.filter(key => areaStates[key]).length;
                const onlinePlant1 = plant1Keys.filter(key => areaStates[key]).length;
                const totalPlant2 = plant2Keys.length;
                const totalPlant1 = plant1Keys.length;
                const totalOnline = onlinePlant2 + onlinePlant1;
                const totalArea = totalPlant2 + totalPlant1;
                return <>
                  <div style={{ fontSize: '11px', color: '#333', marginTop: '4px' }}>
                    Online: {totalOnline}/{totalArea} area utama
                  </div>
                  <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                    {(() => {
                      // Daftar kontaktor valid Plant 2 (A,B,C,D,Melting P2)
                      const plant2Kontaktor = [
                        'fp1-lane-a-k1','fp1-lane-a-k2','fp1-lane-a-k3',
                        'fp1-lane-b-k1','fp1-lane-b-k2',
                        'fp1-lane-c-k1','fp1-lane-c-k2','fp1-lane-c-k3',
                        'fp1-lane-d-k1','fp1-lane-d-k2','fp1-lane-d-k3',
                        'fp1-lane-melting-p2',    // Melting P2 sebagai kontaktor virtual (selalu dihitung)
                      ];
                      // Daftar kontaktor valid Plant 1 (AB Selatan, AB Utara, CD Selatan, CD Utara, Melting P1)
                      const plant1Kontaktor = [
                        'fp1-lane-ab-selatan-k1','fp1-lane-ab-selatan-k2',
                        'fp1-lane-ab-utara-k1','fp1-lane-ab-utara-k2','fp1-lane-ab-utara-k3','fp1-lane-ab-utara-k4',
                        'fp1-lane-cd-selatan-k1','fp1-lane-cd-selatan-k2',
                        'fp1-lane-cd-utara-k1','fp1-lane-cd-utara-k2',
                        'fp1-lane-melting-p1',    // Melting P1 sebagai kontaktor virtual (selalu dihitung)
                      ];
                      // Jika melting p2/p1 punya kontaktor, tambahkan key-nya ke array di atas
                      const onlinePlant2K = plant2Kontaktor.filter(key => areaStates[key]).length;
                      const onlinePlant1K = plant1Kontaktor.filter(key => areaStates[key]).length;
                      return <>
                        Plant 2: {onlinePlant2K}/{plant2Kontaktor.length} ◆ Plant 1: {onlinePlant1K}/{plant1Kontaktor.length}
                      </>;
                    })()}
                  </div>
                </>;
              })()}
              
              {/* Save Status Message */}
              {saveMessage && (
                <div style={{
                  backgroundColor: '#e8f5e8',
                  color: '#2e7d32',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  textAlign: 'center',
                  marginTop: '8px',
                  border: '1px solid #c8e6c9'
                }}>
                  {saveMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div>Unknown view</div>;
}

export default App;


