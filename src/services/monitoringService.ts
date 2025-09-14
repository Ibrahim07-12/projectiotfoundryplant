import { 
  ref, 
  set, 
  get, 
  onValue, 
  off
  // push,
  // remove
} from 'firebase/database';
import { database } from '../config/firebase';
import type { Area, Device } from '../types/monitoring';
// import type { RelayChannel } from '../types/monitoring'; // Temporarily disabled

class MonitoringService {
  // Listen to areas data
  onAreasChange(callback: (areas: { [key: string]: Area }) => void): () => void {
    console.log('📡 MonitoringService: Setting up areas listener...');
    
    const areasRef = ref(database, 'areas');
    
    const unsubscribe = onValue(areasRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📊 MonitoringService: Areas data received:', data);
      callback(data || {});
    }, (error) => {
      console.error('❌ MonitoringService: Areas listener error:', error);
      callback({});
    });

    return () => {
      console.log('🔌 MonitoringService: Removing areas listener');
      off(areasRef, 'value', unsubscribe);
    };
  }

  // Listen to devices data
  onDevicesChange(callback: (devices: { [key: string]: Device }) => void): () => void {
    console.log('📡 MonitoringService: Setting up devices listener...');
    
    const devicesRef = ref(database, 'devices');
    
    const unsubscribe = onValue(devicesRef, (snapshot) => {
      const data = snapshot.val();
      console.log('🔧 MonitoringService: Devices data received:', data);
      callback(data || {});
    });

    return () => {
      console.log('🔌 MonitoringService: Removing devices listener');
      off(devicesRef, 'value', unsubscribe);
    };
  }

  // Send command to ESP32 device
  async sendCommand(deviceId: string, command: any): Promise<void> {
    try {
      console.log(`📤 MonitoringService: Sending command to ${deviceId}:`, command);
      
      // SPECIAL DEBUG FOR LANE B
      if (deviceId === 'ESP32_AREA2') {
        console.log('🐛 LANE B DEBUG: sendCommand triggered for ESP32_AREA2');
        console.log('🐛 Command details:', JSON.stringify(command, null, 2));
        console.log('🐛 Firebase path: commands/ESP32_AREA2');
      }
      
      const commandRef = ref(database, `commands/${deviceId}`);
      await set(commandRef, JSON.stringify(command));
      console.log(`✅ MonitoringService: Command sent successfully`);
      
      // SPECIAL DEBUG FOR LANE B
      if (deviceId === 'ESP32_AREA2') {
        console.log('🐛 LANE B DEBUG: Firebase write completed for ESP32_AREA2');
      }
      
    } catch (error) {
      console.error('❌ MonitoringService: Failed to send command:', error);
      
      // SPECIAL DEBUG FOR LANE B
      if (deviceId === 'ESP32_AREA2') {
        console.error('🐛 LANE B DEBUG: Firebase write error for ESP32_AREA2:', error);
      }
      
      throw error;
    }
  }

  // Update area status in Firebase
  async updateAreaStatus(areaId: string, status: 'ON' | 'OFF'): Promise<void> {
    try {
      console.log(`🔄 MonitoringService: Updating ${areaId} status to ${status}`);
      
      // SPECIAL DEBUG FOR LANE B
      if (areaId === 'fp1-lane-b' || areaId === 'fp1-lane-b') {
        console.log('🐛 LANE B DEBUG: updateAreaStatus triggered');
        console.log('🐛 Area ID:', areaId);
        console.log('🐛 Status:', status);
        console.log('🐛 Firebase path: areas/' + areaId);
      }
      
      // Get current area data first
      const areaRef = ref(database, `areas/${areaId}`);
      const snapshot = await get(areaRef);
      const currentData = snapshot.val() || {};
      
      // Update only the status while preserving other data
      const updates = {
        ...currentData,
        status: status,
        lastUpdate: Date.now(),
        // Ensure basic structure exists
        id: areaId,
        name: currentData.name || areaId
      };

      // SPECIAL DEBUG FOR LANE B
      if (areaId === 'fp1-lane-b' || areaId === 'fp1-lane-b') {
        console.log('🐛 LANE B DEBUG: Update object:', JSON.stringify(updates, null, 2));
      }

      await set(areaRef, updates);
      console.log(`✅ MonitoringService: Area ${areaId} status updated to ${status}`);
      
      // SPECIAL DEBUG FOR LANE B
      if (areaId === 'fp1-lane-b' || areaId === 'fp1-lane-b') {
        console.log('🐛 LANE B DEBUG: Firebase update completed');
      }
      
    } catch (error) {
      console.error('❌ MonitoringService: Failed to update area status:', error);
      
      // SPECIAL DEBUG FOR LANE B
      if (areaId === 'fp1-lane-b' || areaId === 'fp1-lane-b') {
        console.error('🐛 LANE B DEBUG: Firebase update error:', error);
      }
      
      throw error;
    }
  }

  // Toggle relay channel directly
  async toggleRelayChannel(areaId: string, channelId: string, isOn: boolean): Promise<void> {
    try {
      console.log(`🔄 MonitoringService: Toggling ${channelId} to ${isOn ? 'ON' : 'OFF'}`);
      
      const channelRef = ref(database, `areas/${areaId}/relayChannels/${channelId}/isOn`);
      await set(channelRef, isOn);
      
      console.log(`✅ MonitoringService: Relay channel toggled successfully`);
      
    } catch (error) {
      console.error('❌ MonitoringService: Failed to toggle relay channel:', error);
      throw error;
    }
  }

  // Get area data once
  async getArea(areaId: string): Promise<Area | null> {
    try {
      const areaRef = ref(database, `areas/${areaId}`);
      const snapshot = await get(areaRef);
      
      if (snapshot.exists()) {
        return snapshot.val() as Area;
      }
      
      return null;
    } catch (error) {
      console.error('❌ MonitoringService: Failed to get area:', error);
      return null;
    }
  }

  // Emergency stop all areas
  async emergencyStopAll(): Promise<void> {
    try {
      console.log('🚨 MonitoringService: Emergency stop all areas');
      
      // Send emergency stop command to all known devices
      const deviceIds = ['ESP32_AREA1', 'ESP32_AREA2']; // Add more as needed
      
      const promises = deviceIds.map(deviceId => 
        this.sendCommand(deviceId, 'turn_off')
      );
      
      await Promise.all(promises);
      console.log('✅ MonitoringService: Emergency stop completed');
      
    } catch (error) {
      console.error('❌ MonitoringService: Emergency stop failed:', error);
      throw error;
    }
  }

  // Check system health
  async getSystemHealth(): Promise<{
    totalAreas: number;
    onlineAreas: number;
    offlineAreas: number;
    totalDevices: number;
    onlineDevices: number;
    offlineDevices: number;
  }> {
    try {
      const areasRef = ref(database, 'areas');
      const devicesRef = ref(database, 'devices');
      
      const [areasSnapshot, devicesSnapshot] = await Promise.all([
        get(areasRef),
        get(devicesRef)
      ]);
      
      const areas = areasSnapshot.val() || {};
      const devices = devicesSnapshot.val() || {};
      
      const areasList = Object.values(areas) as Area[];
      const devicesList = Object.values(devices) as Device[];
      
      return {
        totalAreas: areasList.length,
        onlineAreas: areasList.filter(area => area.status === 'ON').length,
        offlineAreas: areasList.filter(area => area.status === 'OFF').length,
        totalDevices: devicesList.length,
        onlineDevices: devicesList.filter(device => device.status === 'online').length,
        offlineDevices: devicesList.filter(device => device.status === 'offline').length
      };
      
    } catch (error) {
      console.error('❌ MonitoringService: Failed to get system health:', error);
      return {
        totalAreas: 0,
        onlineAreas: 0,
        offlineAreas: 0,
        totalDevices: 0,
        onlineDevices: 0,
        offlineDevices: 0
      };
    }
  }
}

export const monitoringService = new MonitoringService();
