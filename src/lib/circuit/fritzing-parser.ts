import { CircuitSpec, FritzingPart } from '@/types/circuit';
import { getFritzingPart, getBreadboardPosition, getBreadboardHolePosition } from './component-library';

export interface BreadboardLayout {
  width: number;
  height: number;
  components: BreadboardComponent[];
  connections: BreadboardConnection[];
  powerRails: PowerRail[];
}

export interface BreadboardComponent {
  id: string;
  part: FritzingPart;
  position: { x: number; y: number };
  rotation: number;
  pins: BreadboardPin[];
}

export interface BreadboardPin {
  id: string;
  position: { x: number; y: number };
  connected: boolean;
  net?: string;
}

export interface BreadboardConnection {
  from: { component: string; pin: string };
  to: { component: string; pin: string };
  color: string;
  path: { x: number; y: number }[];
}

export interface PowerRail {
  type: 'VCC' | 'GND';
  position: { x: number; y: number };
  length: number;
  connections: string[];
}

export function generateBreadboardLayout(circuitSpec: CircuitSpec): BreadboardLayout {
  const layout: BreadboardLayout = {
    width: 800,
    height: 600,
    components: [],
    connections: [],
    powerRails: []
  };

  // Add power rails
  layout.powerRails = [
    {
      type: 'VCC',
      position: { x: 50, y: 50 },
      length: 700,
      connections: []
    },
    {
      type: 'GND',
      position: { x: 50, y: 550 },
      length: 700,
      connections: []
    }
  ];

  // Convert components to breadboard components
  circuitSpec.components.forEach(component => {
    const fritzingPart = getFritzingPart(component.type, component.value);
    if (!fritzingPart) return;

    const breadboardPlacement = circuitSpec.breadboard.find(b => b.component_id === component.id);
    if (!breadboardPlacement) return;

    const position = getBreadboardPosition(breadboardPlacement.row, breadboardPlacement.col);
    const rotation = breadboardPlacement.orientation === 'vertical' ? 90 : 0;

    const breadboardComponent: BreadboardComponent = {
      id: component.id,
      part: fritzingPart,
      position,
      rotation,
      pins: fritzingPart.breadboard.pins.map(pin => ({
        id: pin.id,
        position: {
          x: position.x + pin.x * 2.54,
          y: position.y + pin.y * 2.54
        },
        connected: false,
        net: undefined
      }))
    };

    layout.components.push(breadboardComponent);
  });

  // Generate connections
  circuitSpec.connections.forEach(connection => {
    const fromComponent = layout.components.find(c => c.id === connection.from.split('-')[0]);
    const toComponent = layout.components.find(c => c.id === connection.to.split('-')[0]);
    
    if (!fromComponent || !toComponent) return;

    const fromPin = fromComponent.pins.find(p => p.id === connection.from.split('-')[1]);
    const toPin = toComponent.pins.find(p => p.id === connection.to.split('-')[1]);
    
    if (!fromPin || !toPin) return;

    // Mark pins as connected
    fromPin.connected = true;
    toPin.connected = true;
    fromPin.net = connection.from;
    toPin.net = connection.to;

    // Create connection path
    const path = generateConnectionPath(fromPin.position, toPin.position);
    
    layout.connections.push({
      from: { component: fromComponent.id, pin: fromPin.id },
      to: { component: toComponent.id, pin: toPin.id },
      color: connection.wire_color,
      path
    });
  });

  return layout;
}

function generateConnectionPath(from: { x: number; y: number }, to: { x: number; y: number }): { x: number; y: number }[] {
  // Simple L-shaped path for breadboard connections
  const midX = (from.x + to.x) / 2;
  
  return [
    from,
    { x: midX, y: from.y },
    { x: midX, y: to.y },
    to
  ];
}

export function generateBreadboardSVG(layout: BreadboardLayout): string {
  const width = layout.width;
  const height = layout.height;
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Add background
  svg += `<rect width="${width}" height="${height}" fill="#f8f9fa" stroke="none"/>`;
  
  // Add breadboard grid
  svg += generateBreadboardGrid(width, height);
  
  // Add power rails
  layout.powerRails.forEach(rail => {
    const color = rail.type === 'VCC' ? '#dc3545' : '#6c757d';
    svg += `<line x1="${rail.position.x}" y1="${rail.position.y}" x2="${rail.position.x + rail.length}" y2="${rail.position.y}" stroke="${color}" stroke-width="4"/>`;
    svg += `<text x="${rail.position.x - 10}" y="${rail.position.y + 5}" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${color}">${rail.type}</text>`;
  });
  
  // Add components
  layout.components.forEach(component => {
    svg += generateComponentSVG(component);
  });
  
  // Add connections
  layout.connections.forEach(connection => {
    svg += generateConnectionSVG(connection);
  });
  
  svg += `</svg>`;
  
  return svg;
}

function generateBreadboardGrid(width: number, height: number): string {
  let grid = '';
  const gridSize = 2.54; // 2.54mm spacing
  
  // Vertical lines
  for (let x = 50; x < width - 50; x += gridSize) {
    grid += `<line x1="${x}" y1="100" x2="${x}" y2="${height - 100}" stroke="#dee2e6" stroke-width="0.5"/>`;
  }
  
  // Horizontal lines
  for (let y = 100; y < height - 100; y += gridSize) {
    grid += `<line x1="50" y1="${y}" x2="${width - 50}" y2="${y}" stroke="#dee2e6" stroke-width="0.5"/>`;
  }
  
  return grid;
}

function generateComponentSVG(component: BreadboardComponent): string {
  const { part, position, rotation } = component;
  const centerX = position.x;
  const centerY = position.y;
  
  let componentSvg = `<g transform="translate(${centerX}, ${centerY}) rotate(${rotation})">`;
  
  // Component body
  componentSvg += `<rect x="-20" y="-15" width="40" height="30" fill="#ffffff" stroke="#6c757d" stroke-width="2" rx="4"/>`;
  
  // Component label
  componentSvg += `<text x="0" y="-5" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold">${component.id}</text>`;
  componentSvg += `<text x="0" y="8" text-anchor="middle" font-family="Arial, sans-serif" font-size="8">${part.name}</text>`;
  
  // Pins
  component.pins.forEach(pin => {
    const pinX = pin.position.x - centerX;
    const pinY = pin.position.y - centerY;
    const color = pin.connected ? '#28a745' : '#6c757d';
    
    componentSvg += `<circle cx="${pinX}" cy="${pinY}" r="3" fill="${color}" stroke="white" stroke-width="1"/>`;
    componentSvg += `<text x="${pinX}" y="${pinY - 8}" text-anchor="middle" font-family="Arial, sans-serif" font-size="6">${pin.id}</text>`;
  });
  
  componentSvg += `</g>`;
  
  return componentSvg;
}

function generateConnectionSVG(connection: BreadboardConnection): string {
  const { path, color } = connection;
  
  let pathData = `M ${path[0].x} ${path[0].y}`;
  for (let i = 1; i < path.length; i++) {
    pathData += ` L ${path[i].x} ${path[i].y}`;
  }
  
  return `<path d="${pathData}" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
}

export function generateBreadboardFromCircuit(circuitSpec: CircuitSpec): string {
  const layout = generateBreadboardLayout(circuitSpec);
  return generateBreadboardSVG(layout);
}

// Advanced breadboard layout optimization
export function optimizeBreadboardLayout(circuitSpec: CircuitSpec): CircuitSpec {
  // This would implement algorithms to optimize component placement
  // for minimal wire crossings and better organization
  
  const optimizedSpec = { ...circuitSpec };
  
  // Sort components by type for better organization
  optimizedSpec.components.sort((a, b) => {
    const typeOrder = { 'IC': 0, 'Resistor': 1, 'Capacitor': 2, 'LED': 3 };
    return (typeOrder[a.type as keyof typeof typeOrder] || 4) - (typeOrder[b.type as keyof typeof typeOrder] || 4);
  });
  
  // Reassign breadboard positions
  optimizedSpec.breadboard = optimizedSpec.breadboard.map((placement, index) => {
    const row = String.fromCharCode(65 + Math.floor(index / 10)); // A, B, C, etc.
    const col = (index % 10) + 1;
    return { ...placement, row, col };
  });
  
  return optimizedSpec;
}
