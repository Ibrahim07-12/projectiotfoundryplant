// Utility function to get system status summary from area data
export function getSystemStatusFromAreas(areas: { [key: string]: Area }) {
  let totalArea = 0;
  let onlineArea = 0;
  const plantStats: { [plant: string]: { total: number; online: number } } = {};

  Object.values(areas).forEach(area => {
    totalArea++;
    if (area.status === 'ON') onlineArea++;
    if (!plantStats[area.plant]) plantStats[area.plant] = { total: 0, online: 0 };
    plantStats[area.plant].total++;
    if (area.status === 'ON') plantStats[area.plant].online++;
  });

  // Format string status
  const plantStatusStr = Object.entries(plantStats)
    .map(([plant, stat]) => `${plant}: ${stat.online}/${stat.total}`)
    .join(' ◆ ');

  return {
    summary: `Online: ${onlineArea}/${totalArea} area`,
    detail: plantStatusStr
  };
}
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

export interface KontaktorConfig {
  count: number;
  names: string[];
}

export type ShapeType = 'rectangle' | 'square' | 'L' | 'T';

export interface ManualPositions {
  [key: string]: {
    top: number;
    left: number;
    width: number;
    height: number;
    customShape?: ShapeType; // Shape options for layout areas
    // For L and T shapes
    cutoutWidth?: number; // Width of the cutout area (percentage)
    cutoutHeight?: number; // Height of the cutout area (percentage)
    cutoutPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'; // Position of cutout for L shape
    // For T-shape
    headHeight?: number; // Height of the T head (percentage)
    stemWidth?: number; // Width of the T stem (percentage)
    headWidth?: number; // Width of the T head (percentage, default 100)
  };
}
