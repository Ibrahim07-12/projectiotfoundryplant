import { useState, useRef, useEffect } from 'react';
import { authService } from './services/authService';
import { monitoringService } from './services/monitoringService';
import type { User } from './types/auth';
import type { Area, AreaStates, ManualPositions } from './types/monitoring';
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
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
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
  
  // State untuk kontrol ON/OFF setiap area - akan di-sync dengan Firebase
  const [areaStates, setAreaStates] = useState<AreaStates>({
    'fp1-lane-b': false,        // Area 1 → Lane B (CHANGED: was fp1-lane-a)
    'fp1-lane-c': false,        // Area 2 → Lane C (CHANGED: was fp1-lane-b)
    'fp1-lane-d': false,        // Area 3 → Lane D (CHANGED: was fp1-lane-c)
    'fp1-lane-a': false,        // Area 4 → Lane A (CHANGED: was fp1-lane-d)
    'fp1-lane-melting-p2': false, // Area 5 → Lane Melting (Plant 2)
    // fp1-area-6 dihapus
    'fp1-lane-ab-selatan': false, // Area 7 → Lane A B Selatan (CORRECTED: yang kotak biasa)
    'fp1-lane-cd-selatan': false,   // Area 8 → Lane C D Selatan (SWAPPED: was cd-utara)
    'fp1-lane-ab-utara': false,   // Area 9 → Lane A B Utara (CHANGED: was fp1-lane-cd-utara)
    'fp1-lane-cd-utara': false, // Area 10 → Lane C D Utara (SWAPPED: was cd-selatan)
    'fp1-lane-melting-p1': false  // Area 11 → Lane Melting (Plant 1)
    // fp1-area-12 dihapus
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
    
    // Built-in default layout (updated with new mapping)
    console.log('📐 Using built-in default layout...');
    return {
      // Plant 2 lanes (remapped according to new order)
      'fp1-lane-b': { top: 9.852877429603895, left: 37.63919821826282, width: 13.318485523385306, height: 80 },        // Area 1 → Lane B (was fp1-lane-a)
      'fp1-lane-c': { top: 9.852877429603895, left: 51.67037861915388, width: 13.632516703786195, height: 62.15791388256016 }, // Area 2 → Lane C (was fp1-lane-b)
      'fp1-lane-d': { top: 10.059560660280302, left: 65.9247761692603, width: 14.160356347438764, height: 80 },        // Area 3 → Lane D (was fp1-lane-c)
      'fp1-lane-a': { top: 10.255035920356707, left: 23.385300668514448, width: 13.806236808078174, height: 61.32913502100383 }, // Area 4 → Lane A (was fp1-lane-d)
      'fp1-lane-melting-p2': { top: 72.58956360912256, left: 51.67037861915367, width: 13.585746102440889, height: 27.23252945960823 },
      
      // Plant 1 lanes (remapped according to new order)
      'fp1-lane-ab-selatan': { top: 47.65575409828823, left: 46.10244988864143, width: 37.63919821826806, height: 25.93920726961638 }, // Area 7 → Lane A B Selatan (kotak biasa)
      'fp1-lane-cd-selatan': { top: 47.65575409828823, left: 15.812917594658788, width: 29.39866369710467, height: 43.83529066517651 },   // Area 8 → Lane C D Selatan (SWAPPED)
      'fp1-lane-ab-utara': { top: 14.276618316364829, left: 45.8797327394204, width: 37.41648106904231, height: 32.77599619040059 },      // Area 9 → Lane A B Utara (was fp1-lane-cd-utara)
      'fp1-lane-cd-utara': { 
        top: 14.477697447581233, left: 15.590200445434299, width: 29.398663697104674, height: 32.77589988827418,                        // Area 10 → Lane C D Utara (SWAPPED)
        customShape: 'T'
      },
      'fp1-lane-melting-p1': { top: 74.39927855007022, left: 35.63474387527836, width: 27.171492248997, height: 17.236332780071118 }
    };
  };

  // State untuk posisi manual kotak - bisa diubah secara interaktif
  const [manualPositions, setManualPositions] = useState<ManualPositions>(() => {
    console.log('🔧 Initializing manual positions...');
    
    // Load from localStorage if available
    const saved = localStorage.getItem('iot-plant-positions');
    if (saved) {
      try {
        const loadedPositions = JSON.parse(saved);
        console.log('✅ Layout berhasil dimuat dari localStorage:', loadedPositions);
        
        // Check if loaded positions have new lane keys
        const hasNewKeys = Object.keys(loadedPositions).some(key => key.includes('lane'));
        if (!hasNewKeys) {
          console.log('🔄 Old position keys detected, using default new positions');
          localStorage.removeItem('iot-plant-positions'); // Clear old data
          return getDefaultPositions();
        }
        
        return loadedPositions;
      } catch (e) {
        console.warn('❌ Gagal memuat layout tersimpan, menggunakan default:', e);
      }
    } else {
      console.log('ℹ️ Tidak ada layout tersimpan, menggunakan posisi default');
    }
    
    return getDefaultPositions();
  });

  // Save positions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('iot-plant-positions', JSON.stringify(manualPositions));
    
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

  // Authentication state listener with timeout
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

  // Function to save current layout as default
  const saveAsDefaultLayout = () => {
    try {
      localStorage.setItem('iot-plant-default-positions', JSON.stringify(manualPositions));
      setSaveMessage('✅ Layout saved as default!');
      setTimeout(() => setSaveMessage(''), 2000);
      console.log('✅ Layout saved as default:', manualPositions);
    } catch (error) {
      console.error('❌ Failed to save layout as default:', error);
      setSaveMessage('❌ Failed to save as default');
      setTimeout(() => setSaveMessage(''), 2000);
    }
  };

  // Function to reset to default layout
  const resetToDefaultLayout = () => {
    try {
      const savedDefault = localStorage.getItem('iot-plant-default-positions');
      if (savedDefault) {
        const defaultPositions = JSON.parse(savedDefault);
        setManualPositions(defaultPositions);
        setSaveMessage('✅ Layout reset to saved default!');
        setTimeout(() => setSaveMessage(''), 2000);
        console.log('✅ Layout reset to saved default:', defaultPositions);
      } else {
        // Fall back to built-in default
        const builtInDefault = getDefaultPositions();
        setManualPositions(builtInDefault);
        setSaveMessage('✅ Layout reset to built-in default!');
        setTimeout(() => setSaveMessage(''), 2000);
        console.log('✅ Layout reset to built-in default:', builtInDefault);
      }
    } catch (error) {
      console.error('❌ Failed to reset layout:', error);
      setSaveMessage('❌ Failed to reset layout');
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
          left: Math.max(0, Math.min(90, newLeft)),
          top: Math.max(0, Math.min(90, newTop))
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
        newPos.width = Math.max(5, Math.min(80, relativeX - currentPos.left));
      }
      if (resizeDirection.includes('left')) {
        const newWidth = currentPos.width + (currentPos.left - relativeX);
        if (newWidth >= 5 && relativeX >= 0) {
          newPos.left = relativeX;
          newPos.width = Math.min(80, newWidth);
        }
      }
      if (resizeDirection.includes('bottom')) {
        newPos.height = Math.max(5, Math.min(80, relativeY - currentPos.top));
      }
      if (resizeDirection.includes('top')) {
        const newHeight = currentPos.height + (currentPos.top - relativeY);
        if (newHeight >= 5 && relativeY >= 0) {
          newPos.top = relativeY;
          newPos.height = Math.min(80, newHeight);
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
    setIsEditMode(!isEditMode);
    setSelectedArea(null);
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

  // Reset positions to default
  const resetPositions = () => {
    if (confirm('Reset all area positions to default? This cannot be undone.')) {
      const defaultPositions: ManualPositions = {
        'fp1-area-1': { top: 20, left: 30, width: 12, height: 8 },
        'fp1-area-2': { top: 20, left: 43, width: 12, height: 8 },
        'fp1-area-3': { top: 20, left: 56, width: 12, height: 8 },
        'fp1-area-4': { top: 65, left: 20, width: 12, height: 12 },
        'fp1-area-5': { top: 65, left: 33, width: 12, height: 12 },
        'fp1-area-6': { top: 65, left: 46, width: 12, height: 12 },
        'fp1-area-7': { top: 25, left: 53, width: 12, height: 8 },
        'fp1-area-8': { top: 35, left: 53, width: 12, height: 8 },
        'fp1-area-9': { top: 45, left: 53, width: 12, height: 8 },
        'fp1-area-10': { top: 70, left: 45, width: 12, height: 8 },
        'fp1-area-11': { top: 70, left: 58, width: 12, height: 8 },
        'fp1-area-12': { top: 70, left: 71, width: 12, height: 8 }
      };
      setManualPositions(defaultPositions);
      setSelectedArea(null);
    }
  };

  // Helper function to get area details - Updated for new lane system
  const getAreaDetails = (areaNum: number) => {
    const areaKey = getAreaKey(areaNum);
    const area = areas[areaKey];
    const isOn = area ? area.status === 'ON' : areaStates[areaKey] || false;
    
    console.log(`🔍 getAreaDetails(${areaNum}): areaKey=${areaKey}, area=${area ? 'exists' : 'null'}, isOn=${isOn}`);
    
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

  // Enhanced function to render area box with full editing capabilities
  const renderAreaBox = (areaNum: number) => {
    const { areaKey, isOn } = getAreaDetails(areaNum);
    const position = manualPositions[areaKey];
    const isSelected = selectedArea === areaNum;
    
    // Special handling for Lane C D Selatan (Area 8) - T shape
    const isShapeT = areaNum === 8;
    
    const boxStyle: React.CSSProperties = {
      position: 'absolute',
      top: `${position.top}%`,
      left: `${position.left}%`,
      width: `${position.width}%`,
      height: `${position.height}%`,
      backgroundColor: isEditMode 
        ? (isSelected ? 'rgba(0,87,228,0.9)' : 'rgba(158,158,158,0.7)')
        : (isOn ? 'rgba(76,175,80,0.5)' : 'rgba(244,67,54,0.7)'),
      border: isEditMode
        ? (isSelected ? '3px solid #0057e4' : '2px dashed #666')
        : (isOn ? '2px solid #4caf50' : '2px solid #d32f2f'),
      borderRadius: isShapeT ? '6px 6px 0 0' : '6px', // T shape has square bottom
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
      // Special T-shape styling with dynamic foot width
      ...(isShapeT && {
        clipPath: `polygon(0% 0%, 100% 0%, 100% 60%, ${100 - tFootWidth}% 60%, ${100 - tFootWidth}% 100%, ${tFootWidth}% 100%, ${tFootWidth}% 60%, 0% 60%)`
      })
    };

    const renderResizeHandles = () => {
      if (!isEditMode || !isSelected) return null;
      
      const handleStyle = {
        position: 'absolute' as const,
        backgroundColor: '#1976d2',
        border: '2px solid white',
        borderRadius: '3px',
        zIndex: 1001
      };

      return (
        <>
          {/* Corner handles */}
          <div
            style={{
              ...handleStyle,
              top: '-6px',
              left: '-6px',
              width: '12px',
              height: '12px',
              cursor: 'nw-resize'
            }}
            onMouseDown={(e) => handleMouseDown(areaNum, e, 'resize', 'top-left')}
          />
          <div
            style={{
              ...handleStyle,
              top: '-6px',
              right: '-6px',
              width: '12px',
              height: '12px',
              cursor: 'ne-resize'
            }}
            onMouseDown={(e) => handleMouseDown(areaNum, e, 'resize', 'top-right')}
          />
          <div
            style={{
              ...handleStyle,
              bottom: '-6px',
              left: '-6px',
              width: '12px',
              height: '12px',
              cursor: 'sw-resize'
            }}
            onMouseDown={(e) => handleMouseDown(areaNum, e, 'resize', 'bottom-left')}
          />
          <div
            style={{
              ...handleStyle,
              bottom: '-6px',
              right: '-6px',
              width: '12px',
              height: '12px',
              cursor: 'se-resize'
            }}
            onMouseDown={(e) => handleMouseDown(areaNum, e, 'resize', 'bottom-right')}
          />
          
          {/* Side handles */}
          <div
            style={{
              ...handleStyle,
              top: '50%',
              left: '-6px',
              width: '12px',
              height: '20px',
              transform: 'translateY(-50%)',
              cursor: 'w-resize'
            }}
            onMouseDown={(e) => handleMouseDown(areaNum, e, 'resize', 'left')}
          />
          <div
            style={{
              ...handleStyle,
              top: '50%',
              right: '-6px',
              width: '12px',
              height: '20px',
              transform: 'translateY(-50%)',
              cursor: 'e-resize'
            }}
            onMouseDown={(e) => handleMouseDown(areaNum, e, 'resize', 'right')}
          />
          <div
            style={{
              ...handleStyle,
              top: '-6px',
              left: '50%',
              width: '20px',
              height: '12px',
              transform: 'translateX(-50%)',
              cursor: 'n-resize'
            }}
            onMouseDown={(e) => handleMouseDown(areaNum, e, 'resize', 'top')}
          />
          <div
            style={{
              ...handleStyle,
              bottom: '-6px',
              left: '50%',
              width: '20px',
              height: '12px',
              transform: 'translateX(-50%)',
              cursor: 's-resize'
            }}
            onMouseDown={(e) => handleMouseDown(areaNum, e, 'resize', 'bottom')}
          />
        </>
      );
    };

    return (
      <div
        key={areaNum}
        style={boxStyle}
        onMouseDown={(e) => handleMouseDown(areaNum, e, 'drag')}
        onClick={(e) => {
          e.stopPropagation();
          if (isEditMode) {
            setSelectedArea(isSelected ? null : areaNum);
          } else {
            toggleArea(areaKey);
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
        <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
          <div>{getAreaName(areaNum)}</div>
          {isEditMode && isSelected && (
            <div style={{ fontSize: '8px', marginTop: '2px' }}>
              {isDragging ? '🔄 Moving...' : isResizing ? '📏 Resizing...' : '✅ Selected'}
            </div>
          )}
          {!isEditMode && (
            <div style={{ fontSize: '8px', marginTop: '2px' }}>
              {isOn ? '✅ ON' : '❌ OFF'}
            </div>
          )}
        </div>
        
        {renderResizeHandles()}
      </div>
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
            
            {/* Bottom row - Edit mode buttons */}
            {isEditMode && (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => {
                    localStorage.setItem('iot-plant-positions', JSON.stringify(manualPositions));
                    setSaveMessage('💾 Layout saved!');
                    setTimeout(() => setSaveMessage(''), 2000);
                  }}
                  style={{
                    backgroundColor: '#2196f3',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}
                >
                  💾 Save
                </button>
                
                <button 
                  onClick={saveAsDefaultLayout}
                  style={{
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}
                >
                  ⭐ Save as Default
                </button>
                
                <button 
                  onClick={resetToDefaultLayout}
                  style={{
                    backgroundColor: '#ff9800',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}
                >
                  🔄 Reset to Default
                </button>
                
                <button 
                  onClick={resetPositions}
                  style={{
                    backgroundColor: '#9e9e9e',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}
                >
                  🔄 Reset Layout
                </button>
              </div>
            )}
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
                }
              }}
            >
              {/* Render Plant 2 Areas - Updated for new lanes */}
              {[1, 2, 3, 4, 5].map(areaNum => renderAreaBox(areaNum))}
              
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
                }
              }}
            >
              {/* Render Plant 1 Areas - Updated for new lanes */}
              {[7, 8, 9, 10, 11].map(areaNum => renderAreaBox(areaNum))}
              
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
                
                return (
                  <div key={areaNum} style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    backgroundColor: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: isOn ? '2px solid #4caf50' : '2px solid #f44336'
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
                      </div>
                      <div style={{ 
                        fontSize: '10px',
                        color: '#666'
                      }}>
                        {zone} {area && area.device ? `� ${area.device.status}` : ''}
                      </div>
                    </div>
                    
                    {/* ON/OFF Button */}
                    <button
                      onClick={() => toggleArea(areaKey)}
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
                
                return (
                  <div key={areaNum} style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    backgroundColor: 'white',
                    padding: '12px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: isOn ? '2px solid #4caf50' : '2px solid #f44336'
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
                      </div>
                      <div style={{ 
                        fontSize: '10px',
                        color: '#666'
                      }}>
                        {zone} {area && area.device ? `� ${area.device.status}` : ''}
                      </div>
                    </div>
                    
                    {/* ON/OFF Button */}
                    <button
                      onClick={() => toggleArea(areaKey)}
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
              <div style={{ fontSize: '11px', color: '#333', marginTop: '4px' }}>
                Online: {Object.values(areaStates).filter(Boolean).length}/10 lanes
              </div>
              <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                Plant 2: {Object.entries(areaStates).slice(0,5).filter(([, value]) => value).length}/5 ◆ 
                Plant 1: {Object.entries(areaStates).slice(5,10).filter(([, value]) => value).length}/5
              </div>
              
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


