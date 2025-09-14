export interface Area {
  id: string;
  name: string;
  plant: string;
  status: 'ON' | 'OFF';
  lastUpdate: number;
  coordinates: {
    x: number;
    y: number;
  };
  device: {
    id: string;
    name: string;
    type: string;
    status: string;
    isOnline: boolean;
    ip: string;
    lastSeen: number;
  };
  relayChannels: {
    [key: string]: RelayChannel;
  };
}

export interface RelayChannel {
  id: string;
  name: string;
  areaId: string;
  channel: number;
  isOn: boolean;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline';
  areaId: string;
  ip: string;
  lastSeen: string;
}

export interface AreaStates {
  [key: string]: boolean;
}

export interface ManualPositions {
  [key: string]: {
    top: number;
    left: number;
    width: number;
    height: number;
    customShape?: string; // Optional property for special shapes
  };
}
