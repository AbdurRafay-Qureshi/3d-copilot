import { CircuitSpec, KiCadFootprint } from '@/types/circuit';
import { getKiCadFootprint } from './component-library';

export interface KiCadSchematic {
  title: string;
  components: KiCadSchematicComponent[];
  connections: KiCadSchematicConnection[];
  powerNets: string[];
  groundNets: string[];
}

export interface KiCadSchematicComponent {
  id: string;
  type: string;
  value: string;
  footprint: string;
  position: { x: number; y: number };
  rotation: number;
  pins: KiCadSchematicPin[];
}

export interface KiCadSchematicPin {
  number: string;
  name: string;
  position: { x: number; y: number };
  type: 'input' | 'output' | 'power' | 'passive';
  connected: boolean;
  net?: string;
}

export interface KiCadSchematicConnection {
  from: { component: string; pin: string };
  to: { component: string; pin: string };
  net: string;
  wirePoints: { x: number; y: number }[];
}

export interface KiCadPCB {
  title: string;
  dimensions: { width: number; height: number };
  layers: number;
  components: KiCadPCBComponent[];
  traces: KiCadTrace[];
  vias: KiCadVia[];
  pads: KiCadPad[];
}

export interface KiCadPCBComponent {
  id: string;
  footprint: string;
  position: { x: number; y: number };
  rotation: number;
  layer: 'top' | 'bottom';
  pads: KiCadPad[];
}

export interface KiCadTrace {
  net: string;
  width: number;
  layer: 'top' | 'bottom';
  points: { x: number; y: number }[];
}

export interface KiCadVia {
  position: { x: number; y: number };
  diameter: number;
  drill: number;
  net: string;
}

export interface KiCadPad {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  shape: 'round' | 'rect' | 'oval';
  layer: 'top' | 'bottom';
  net?: string;
}

export function generateKiCadSchematic(circuitSpec: CircuitSpec): KiCadSchematic {
  const schematic: KiCadSchematic = {
    title: circuitSpec.circuit_name,
    components: [],
    connections: [],
    powerNets: ['VCC', 'GND'],
    groundNets: ['GND']
  };

  // Convert components to KiCad schematic components
  circuitSpec.components.forEach((component, index) => {
    const footprint = getKiCadFootprint(component.type, component.value);
    if (!footprint) return;

    // Position components in a grid
    const cols = Math.ceil(Math.sqrt(circuitSpec.components.length));
    const row = Math.floor(index / cols);
    const col = index % cols;
    const spacing = 100;
    
    const position = {
      x: 100 + col * spacing,
      y: 100 + row * spacing
    };

    const schematicComponent: KiCadSchematicComponent = {
      id: component.id,
      type: component.type,
      value: component.value,
      footprint: component.footprint,
      position,
      rotation: 0,
      pins: footprint.pins.map(pin => ({
        number: pin.number,
        name: pin.name,
        position: {
          x: position.x + pin.position.x,
          y: position.y + pin.position.y
        },
        type: pin.type,
        connected: false,
        net: undefined
      }))
    };

    schematic.components.push(schematicComponent);
  });

  // Convert connections to KiCad schematic connections
  circuitSpec.connections.forEach(connection => {
    const fromComponent = schematic.components.find(c => c.id === connection.from.split('-')[0]);
    const toComponent = schematic.components.find(c => c.id === connection.to.split('-')[0]);
    
    if (!fromComponent || !toComponent) return;

    const fromPin = fromComponent.pins.find(p => p.number === connection.from.split('-')[1]);
    const toPin = toComponent.pins.find(p => p.number === connection.to.split('-')[1]);
    
    if (!fromPin || !toPin) return;

    // Mark pins as connected
    fromPin.connected = true;
    toPin.connected = true;
    fromPin.net = connection.from;
    toPin.net = connection.to;

    // Create connection
    const net = `net_${connection.from}_${connection.to}`;
    const wirePoints = generateWirePath(fromPin.position, toPin.position);
    
    schematic.connections.push({
      from: { component: fromComponent.id, pin: fromPin.number },
      to: { component: toComponent.id, pin: toPin.number },
      net,
      wirePoints
    });
  });

  return schematic;
}

function generateWirePath(from: { x: number; y: number }, to: { x: number; y: number }): { x: number; y: number }[] {
  // Simple L-shaped wire path
  const midX = (from.x + to.x) / 2;
  
  return [
    from,
    { x: midX, y: from.y },
    { x: midX, y: to.y },
    to
  ];
}

export function generateKiCadSchematicSVG(schematic: KiCadSchematic): string {
  const width = 800;
  const height = 600;
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Add background
  svg += `<rect width="${width}" height="${height}" fill="white" stroke="none"/>`;
  
  // Add title
  svg += `<text x="${width/2}" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold">${schematic.title}</text>`;
  
  // Add components
  schematic.components.forEach(component => {
    svg += generateSchematicComponentSVG(component);
  });
  
  // Add connections
  schematic.connections.forEach(connection => {
    svg += generateSchematicConnectionSVG(connection);
  });
  
  svg += `</svg>`;
  
  return svg;
}

function generateSchematicComponentSVG(component: KiCadSchematicComponent): string {
  const { position, pins } = component;
  const centerX = position.x;
  const centerY = position.y;
  
  let componentSvg = `<g>`;
  
  // Component body
  componentSvg += `<rect x="${centerX - 30}" y="${centerY - 20}" width="60" height="40" fill="#f8f9fa" stroke="#6c757d" stroke-width="2" rx="4"/>`;
  
  // Component label
  componentSvg += `<text x="${centerX}" y="${centerY - 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold">${component.id}</text>`;
  componentSvg += `<text x="${centerX}" y="${centerY + 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10">${component.value}</text>`;
  
  // Pins
  pins.forEach(pin => {
    const color = pin.connected ? '#28a745' : '#6c757d';
    
    componentSvg += `<circle cx="${pin.position.x}" cy="${pin.position.y}" r="3" fill="${color}" stroke="white" stroke-width="1"/>`;
    componentSvg += `<text x="${pin.position.x + 8}" y="${pin.position.y + 3}" font-family="Arial, sans-serif" font-size="8">${pin.number}</text>`;
  });
  
  componentSvg += `</g>`;
  
  return componentSvg;
}

function generateSchematicConnectionSVG(connection: KiCadSchematicConnection): string {
  const { wirePoints } = connection;
  
  let pathData = `M ${wirePoints[0].x} ${wirePoints[0].y}`;
  for (let i = 1; i < wirePoints.length; i++) {
    pathData += ` L ${wirePoints[i].x} ${wirePoints[i].y}`;
  }
  
  return `<path d="${pathData}" stroke="#dc3545" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
}

export function generateKiCadPCB(circuitSpec: CircuitSpec): KiCadPCB {
  const pcb: KiCadPCB = {
    title: circuitSpec.circuit_name,
    dimensions: { width: 100, height: 80 },
    layers: circuitSpec.pcb_hints.layer === 'single' ? 1 : 2,
    components: [],
    traces: [],
    vias: [],
    pads: []
  };

  // Convert components to PCB components
  circuitSpec.components.forEach((component, index) => {
    const footprint = getKiCadFootprint(component.type, component.value);
    if (!footprint) return;

    // Position components on PCB
    const cols = Math.ceil(Math.sqrt(circuitSpec.components.length));
    const row = Math.floor(index / cols);
    const col = index % cols;
    const spacing = 20;
    
    const position = {
      x: 10 + col * spacing,
      y: 10 + row * spacing
    };

    const pcbComponent: KiCadPCBComponent = {
      id: component.id,
      footprint: component.footprint,
      position,
      rotation: 0,
      layer: 'top',
      pads: footprint.pins.map(pin => ({
        id: `${component.id}_${pin.number}`,
        position: {
          x: position.x + pin.position.x,
          y: position.y + pin.position.y
        },
        size: { width: 1.5, height: 1.5 },
        shape: 'round',
        layer: 'top',
        net: `${component.id}-${pin.number}`
      }))
    };

    pcb.components.push(pcbComponent);
    pcb.pads.push(...pcbComponent.pads);
  });

  // Generate traces based on connections
  circuitSpec.connections.forEach(connection => {
    const fromPad = pcb.pads.find(p => p.id === connection.from);
    const toPad = pcb.pads.find(p => p.id === connection.to);
    
    if (!fromPad || !toPad) return;

    const trace: KiCadTrace = {
      net: `net_${connection.from}_${connection.to}`,
      width: circuitSpec.pcb_hints.trace_width,
      layer: 'top',
      points: [
        fromPad.position,
        { x: (fromPad.position.x + toPad.position.x) / 2, y: fromPad.position.y },
        { x: (fromPad.position.x + toPad.position.x) / 2, y: toPad.position.y },
        toPad.position
      ]
    };

    pcb.traces.push(trace);
  });

  return pcb;
}

export function generateKiCadPCBSVG(pcb: KiCadPCB): string {
  const width = 800;
  const height = 600;
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Add background
  svg += `<rect width="${width}" height="${height}" fill="#2c3e50" stroke="none"/>`;
  
  // Add title
  svg += `<text x="${width/2}" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white">${pcb.title}</text>`;
  
  // Add PCB outline
  const pcbWidth = width - 100;
  const pcbHeight = height - 100;
  svg += `<rect x="50" y="50" width="${pcbWidth}" height="${pcbHeight}" fill="#34495e" stroke="#ecf0f1" stroke-width="2"/>`;
  
  // Add traces
  pcb.traces.forEach(trace => {
    let pathData = `M ${trace.points[0].x * 5 + 50} ${trace.points[0].y * 5 + 50}`;
    for (let i = 1; i < trace.points.length; i++) {
      pathData += ` L ${trace.points[i].x * 5 + 50} ${trace.points[i].y * 5 + 50}`;
    }
    svg += `<path d="${pathData}" stroke="#e74c3c" stroke-width="${trace.width * 2}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  });
  
  // Add components
  pcb.components.forEach(component => {
    svg += generatePCBComponentSVG(component);
  });
  
  // Add pads
  pcb.pads.forEach(pad => {
    const color = pad.net ? '#f39c12' : '#95a5a6';
    svg += `<circle cx="${pad.position.x * 5 + 50}" cy="${pad.position.y * 5 + 50}" r="${pad.size.width * 2}" fill="${color}" stroke="white" stroke-width="1"/>`;
  });
  
  svg += `</svg>`;
  
  return svg;
}

function generatePCBComponentSVG(component: KiCadPCBComponent): string {
  const { position } = component;
  const centerX = position.x * 5 + 50;
  const centerY = position.y * 5 + 50;
  
  return `<g>
    <rect x="${centerX - 15}" y="${centerY - 10}" width="30" height="20" fill="#ecf0f1" stroke="#bdc3c7" stroke-width="1" rx="2"/>
    <text x="${centerX}" y="${centerY + 3}" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" fill="#2c3e50">${component.id}</text>
  </g>`;
}

export function generateKiCadFromCircuit(circuitSpec: CircuitSpec): { schematic: string; pcb: string } {
  const schematic = generateKiCadSchematic(circuitSpec);
  const pcb = generateKiCadPCB(circuitSpec);
  
  return {
    schematic: generateKiCadSchematicSVG(schematic),
    pcb: generateKiCadPCBSVG(pcb)
  };
}
