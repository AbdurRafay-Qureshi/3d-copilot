import { CircuitSpec, Netlist, NetlistNode, NetlistConnection } from '@/types/circuit';
import { getKiCadFootprint } from './component-library';

export function convertCircuitToNetlist(circuitSpec: CircuitSpec): Netlist {
  const nodes: NetlistNode[] = [];
  const connections: NetlistConnection[] = [];
  const netMap = new Map<string, string[]>();

  // Convert components to netlist nodes
  circuitSpec.components.forEach(component => {
    const footprint = getKiCadFootprint(component.type, component.value);
    const pins = footprint?.pins.map(pin => `${component.id}-${pin.number}`) || [`${component.id}-1`, `${component.id}-2`];
    
    nodes.push({
      id: component.id,
      type: component.type,
      pins: pins,
      properties: {
        value: component.value,
        footprint: component.footprint,
        description: component.description || ''
      }
    });
  });

  // Convert connections to netlist connections
  circuitSpec.connections.forEach(connection => {
    const netName = `net_${connection.from}_${connection.to}`;
    
    if (!netMap.has(netName)) {
      netMap.set(netName, []);
    }
    
    netMap.get(netName)!.push(connection.from, connection.to);
  });

  // Create netlist connections
  netMap.forEach((nodes, netName) => {
    connections.push({
      net: netName,
      nodes: [...new Set(nodes)] // Remove duplicates
    });
  });

  return {
    nodes,
    connections,
    metadata: {
      title: circuitSpec.circuit_name,
      author: 'Real Circuit Image Copilot',
      date: new Date().toISOString().split('T')[0]
    }
  };
}

export function generateNetlistSVG(netlist: Netlist): string {
  // This is a simplified SVG generator for demonstration
  // In a real implementation, you would use the netlistsvg library
  
  const width = 800;
  const height = 600;
  const margin = 50;
  
  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Add background
  svg += `<rect width="${width}" height="${height}" fill="white" stroke="none"/>`;
  
  // Add title
  svg += `<text x="${width/2}" y="30" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="bold">${netlist.metadata.title}</text>`;
  
  // Position nodes in a grid
  const cols = Math.ceil(Math.sqrt(netlist.nodes.length));
  const rows = Math.ceil(netlist.nodes.length / cols);
  const cellWidth = (width - 2 * margin) / cols;
  const cellHeight = (height - 2 * margin - 50) / rows; // Leave space for title
  
  netlist.nodes.forEach((node, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    const x = margin + col * cellWidth + cellWidth / 2;
    const y = margin + 50 + row * cellHeight + cellHeight / 2;
    
    // Draw component box
    const boxWidth = 80;
    const boxHeight = 40;
    svg += `<rect x="${x - boxWidth/2}" y="${y - boxHeight/2}" width="${boxWidth}" height="${boxHeight}" fill="#f8f9fa" stroke="#6c757d" stroke-width="2" rx="4"/>`;
    
    // Add component label
    svg += `<text x="${x}" y="${y - 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold">${node.id}</text>`;
    svg += `<text x="${x}" y="${y + 10}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10">${node.properties.value}</text>`;
    
    // Draw pins
    const pinCount = node.pins.length;
    const pinSpacing = boxWidth / (pinCount + 1);
    
    node.pins.forEach((pin, pinIndex) => {
      const pinX = x - boxWidth/2 + (pinIndex + 1) * pinSpacing;
      const pinY = y - boxHeight/2;
      
      // Pin dot
      svg += `<circle cx="${pinX}" cy="${pinY}" r="3" fill="#007bff" stroke="white" stroke-width="1"/>`;
      
      // Pin label
      svg += `<text x="${pinX}" y="${pinY - 8}" text-anchor="middle" font-family="Arial, sans-serif" font-size="8">${pin.split('-')[1]}</text>`;
    });
  });
  
  // Draw connections
  netlist.connections.forEach(connection => {
    const nodePositions = new Map<string, { x: number; y: number }>();
    
    // Calculate node positions
    netlist.nodes.forEach((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = margin + col * cellWidth + cellWidth / 2;
      const y = margin + 50 + row * cellHeight + cellHeight / 2;
      nodePositions.set(node.id, { x, y });
    });
    
    // Draw wires between connected nodes
    const connectedNodes = new Set<string>();
    connection.nodes.forEach(nodeId => {
      const nodeName = nodeId.split('-')[0];
      if (!connectedNodes.has(nodeName)) {
        connectedNodes.add(nodeName);
      }
    });
    
    if (connectedNodes.size >= 2) {
      const nodeArray = Array.from(connectedNodes);
      for (let i = 0; i < nodeArray.length - 1; i++) {
        const pos1 = nodePositions.get(nodeArray[i]);
        const pos2 = nodePositions.get(nodeArray[i + 1]);
        
        if (pos1 && pos2) {
          svg += `<line x1="${pos1.x}" y1="${pos1.y}" x2="${pos2.x}" y2="${pos2.y}" stroke="#dc3545" stroke-width="2" marker-end="url(#arrowhead)"/>`;
        }
      }
    }
  });
  
  // Add arrow marker
  svg += `<defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#dc3545"/>
    </marker>
  </defs>`;
  
  svg += `</svg>`;
  
  return svg;
}

export function generateSchematicSVG(circuitSpec: CircuitSpec): string {
  const netlist = convertCircuitToNetlist(circuitSpec);
  return generateNetlistSVG(netlist);
}

// Advanced netlist generation for more complex circuits
export function generateAdvancedNetlist(circuitSpec: CircuitSpec): Netlist {
  const netlist = convertCircuitToNetlist(circuitSpec);
  
  // Add power and ground nodes
  const powerNodes: NetlistNode[] = [
    {
      id: 'VCC',
      type: 'Power',
      pins: ['VCC'],
      properties: { value: '5V', footprint: 'Power', description: 'Positive power supply' }
    },
    {
      id: 'GND',
      type: 'Ground',
      pins: ['GND'],
      properties: { value: '0V', footprint: 'Ground', description: 'Ground reference' }
    }
  ];
  
  // Add power connections
  const powerConnections: NetlistConnection[] = [
    {
      net: 'VCC_NET',
      nodes: ['VCC']
    },
    {
      net: 'GND_NET',
      nodes: ['GND']
    }
  ];
  
  // Find components that need power connections
  circuitSpec.components.forEach(component => {
    if (component.type === 'IC') {
      // Add VCC and GND connections for ICs
      powerConnections[0].nodes.push(`${component.id}-VCC`);
      powerConnections[1].nodes.push(`${component.id}-GND`);
    }
  });
  
  return {
    nodes: [...netlist.nodes, ...powerNodes],
    connections: [...netlist.connections, ...powerConnections],
    metadata: netlist.metadata
  };
}
