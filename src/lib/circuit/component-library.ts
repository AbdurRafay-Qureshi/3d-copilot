import { KiCadFootprint, FritzingPart } from '@/types/circuit';

// KiCad footprint library
export const KICAD_FOOTPRINTS: Record<string, KiCadFootprint> = {
  'DIP-8': {
    name: 'DIP-8',
    library: 'Package_DIP',
    description: '8-pin DIP package',
    pins: [
      { number: '1', name: 'VCC', type: 'power', position: { x: -2.54, y: 0 } },
      { number: '2', name: 'TRIG', type: 'input', position: { x: -1.27, y: 0 } },
      { number: '3', name: 'OUT', type: 'output', position: { x: 0, y: 0 } },
      { number: '4', name: 'RESET', type: 'input', position: { x: 1.27, y: 0 } },
      { number: '5', name: 'CTRL', type: 'input', position: { x: 2.54, y: 0 } },
      { number: '6', name: 'THRES', type: 'input', position: { x: 2.54, y: -7.62 } },
      { number: '7', name: 'DISCH', type: 'output', position: { x: 1.27, y: -7.62 } },
      { number: '8', name: 'GND', type: 'power', position: { x: -1.27, y: -7.62 } },
    ],
    dimensions: { width: 9.4, height: 6.35 }
  },
  'R_0805_2012Metric': {
    name: 'R_0805_2012Metric',
    library: 'Resistor_SMD',
    description: '0805 resistor package',
    pins: [
      { number: '1', name: 'P1', type: 'passive', position: { x: -1, y: 0 } },
      { number: '2', name: 'P2', type: 'passive', position: { x: 1, y: 0 } },
    ],
    dimensions: { width: 2, height: 1.25 }
  },
  'C_0805_2012Metric': {
    name: 'C_0805_2012Metric',
    library: 'Capacitor_SMD',
    description: '0805 capacitor package',
    pins: [
      { number: '1', name: 'P1', type: 'passive', position: { x: -1, y: 0 } },
      { number: '2', name: 'P2', type: 'passive', position: { x: 1, y: 0 } },
    ],
    dimensions: { width: 2, height: 1.25 }
  },
  'LED_D5.0mm': {
    name: 'LED_D5.0mm',
    library: 'LED_THT',
    description: '5mm LED package',
    pins: [
      { number: '1', name: 'A', type: 'input', position: { x: -2.5, y: 0 } },
      { number: '2', name: 'K', type: 'output', position: { x: 2.5, y: 0 } },
    ],
    dimensions: { width: 5, height: 5 }
  },
  'R_Axial_DIN0207_L6.3mm_D2.5mm_P7.62mm_Horizontal': {
    name: 'R_Axial_DIN0207_L6.3mm_D2.5mm_P7.62mm_Horizontal',
    library: 'Resistor_THT',
    description: 'Axial resistor package',
    pins: [
      { number: '1', name: 'P1', type: 'passive', position: { x: -3.81, y: 0 } },
      { number: '2', name: 'P2', type: 'passive', position: { x: 3.81, y: 0 } },
    ],
    dimensions: { width: 7.62, height: 2.5 }
  }
};

// Fritzing parts library
export const FRITZING_PARTS: Record<string, FritzingPart> = {
  'NE555': {
    id: 'NE555',
    name: 'NE555 Timer IC',
    category: 'IC',
    svg: `<svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="80" height="40" fill="#2c3e50" stroke="#34495e" stroke-width="2"/>
      <text x="50" y="35" text-anchor="middle" fill="white" font-size="12" font-family="monospace">NE555</text>
      <circle cx="15" cy="20" r="2" fill="#e74c3c"/>
      <circle cx="15" cy="30" r="2" fill="#e74c3c"/>
      <circle cx="15" cy="40" r="2" fill="#e74c3c"/>
      <circle cx="85" cy="20" r="2" fill="#e74c3c"/>
      <circle cx="85" cy="30" r="2" fill="#e74c3c"/>
      <circle cx="85" cy="40" r="2" fill="#e74c3c"/>
    </svg>`,
    breadboard: {
      width: 4,
      height: 2,
      pins: [
        { id: '1', x: 0, y: 0, type: 'male' },
        { id: '2', x: 1, y: 0, type: 'male' },
        { id: '3', x: 2, y: 0, type: 'male' },
        { id: '4', x: 3, y: 0, type: 'male' },
        { id: '5', x: 3, y: 1, type: 'male' },
        { id: '6', x: 2, y: 1, type: 'male' },
        { id: '7', x: 1, y: 1, type: 'male' },
        { id: '8', x: 0, y: 1, type: 'male' },
      ]
    }
  },
  'LED_5mm': {
    id: 'LED_5mm',
    name: '5mm LED',
    category: 'LED',
    svg: `<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="8" fill="#e74c3c" stroke="#c0392b" stroke-width="2"/>
      <line x1="5" y1="5" x2="15" y2="15" stroke="#2c3e50" stroke-width="2"/>
      <line x1="15" y1="5" x2="5" y2="15" stroke="#2c3e50" stroke-width="2"/>
    </svg>`,
    breadboard: {
      width: 2,
      height: 1,
      pins: [
        { id: 'A', x: 0, y: 0, type: 'male' },
        { id: 'K', x: 1, y: 0, type: 'male' },
      ]
    }
  },
  'Resistor_1k': {
    id: 'Resistor_1k',
    name: '1kΩ Resistor',
    category: 'Resistor',
    svg: `<svg viewBox="0 0 60 20" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="8" width="50" height="4" fill="#8b4513" stroke="#654321" stroke-width="1"/>
      <text x="30" y="15" text-anchor="middle" fill="white" font-size="10" font-family="monospace">1kΩ</text>
    </svg>`,
    breadboard: {
      width: 2,
      height: 1,
      pins: [
        { id: '1', x: 0, y: 0, type: 'male' },
        { id: '2', x: 1, y: 0, type: 'male' },
      ]
    }
  },
  'Capacitor_10uF': {
    id: 'Capacitor_10uF',
    name: '10µF Capacitor',
    category: 'Capacitor',
    svg: `<svg viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="20" height="10" fill="#f39c12" stroke="#e67e22" stroke-width="1"/>
      <text x="15" y="15" text-anchor="middle" fill="white" font-size="8" font-family="monospace">10µF</text>
    </svg>`,
    breadboard: {
      width: 2,
      height: 1,
      pins: [
        { id: '1', x: 0, y: 0, type: 'male' },
        { id: '2', x: 1, y: 0, type: 'male' },
      ]
    }
  }
};

// Component mapping functions
export function getKiCadFootprint(componentType: string, value: string): KiCadFootprint | null {
  // Map component types to KiCad footprints
  const footprintMap: Record<string, string> = {
    'IC': 'DIP-8',
    'Resistor': 'R_0805_2012Metric',
    'Capacitor': 'C_0805_2012Metric',
    'LED': 'LED_D5.0mm',
  };

  const footprintName = footprintMap[componentType];
  return footprintName ? KICAD_FOOTPRINTS[footprintName] : null;
}

export function getFritzingPart(componentType: string, value: string): FritzingPart | null {
  // Map component types to Fritzing parts
  const partMap: Record<string, string> = {
    'IC': 'NE555',
    'Resistor': 'Resistor_1k',
    'Capacitor': 'Capacitor_10uF',
    'LED': 'LED_5mm',
  };

  const partId = partMap[componentType];
  return partId ? FRITZING_PARTS[partId] : null;
}

// Breadboard layout helpers
export function getBreadboardPosition(row: string, col: number): { x: number; y: number } {
  const rowMap: Record<string, number> = {
    'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4,
    'F': 5, 'G': 6, 'H': 7, 'I': 8, 'J': 9
  };
  
  const rowIndex = rowMap[row.toUpperCase()] || 0;
  const colIndex = Math.max(0, Math.min(63, col - 1)); // Convert to 0-based index
  
  return {
    x: colIndex * 2.54, // 2.54mm spacing between holes
    y: rowIndex * 2.54
  };
}

export function getBreadboardHolePosition(row: string, col: number): { x: number; y: number } {
  const pos = getBreadboardPosition(row, col);
  return {
    x: pos.x + 1.27, // Center of hole
    y: pos.y + 1.27
  };
}

// Component dimension helpers
export function getComponentDimensions(componentType: string): { width: number; height: number } {
  const dimensions: Record<string, { width: number; height: number }> = {
    'IC': { width: 9.4, height: 6.35 },
    'Resistor': { width: 2, height: 1.25 },
    'Capacitor': { width: 2, height: 1.25 },
    'LED': { width: 5, height: 5 },
  };
  
  return dimensions[componentType] || { width: 2, height: 2 };
}
