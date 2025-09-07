export interface Component {
  id: string;
  type: string;
  value: string;
  footprint: string;
  model?: string;
  description?: string;
}

export interface Connection {
  from: string;
  to: string;
  wire_color: string;
  description?: string;
}

export interface BreadboardPlacement {
  component_id: string;
  row: string;
  col: number;
  orientation?: 'horizontal' | 'vertical';
}

export interface PCBHint {
  layer: 'single' | 'double';
  trace_width: number;
  via_size?: number;
  clearance?: number;
}

export interface AssemblyStep {
  step_number: number;
  description: string;
  image_prompt?: string;
  components?: string[];
  tools?: string[];
}

export interface CircuitSpec {
  circuit_name: string;
  description: string;
  components: Component[];
  connections: Connection[];
  breadboard: BreadboardPlacement[];
  pcb_hints: PCBHint;
  assembly_steps: AssemblyStep[];
  schematic_prompt?: string;
  breadboard_prompt?: string;
  pcb_prompt?: string;
  estimated_difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_time: string;
  required_tools: string[];
}

export interface CircuitImages {
  schematic: string; // SVG string
  breadboard: string; // SVG string
  pcb: string; // SVG string
  render_3d?: string; // Base64 image
  photorealistic?: string; // Base64 image
}

export interface ExportOptions {
  format: 'pdf' | 'png' | 'svg';
  include_schematic: boolean;
  include_breadboard: boolean;
  include_pcb: boolean;
  include_3d: boolean;
  include_assembly: boolean;
}

export interface KiCadFootprint {
  name: string;
  library: string;
  description: string;
  pins: KiCadPin[];
  dimensions: {
    width: number;
    height: number;
  };
}

export interface KiCadPin {
  number: string;
  name: string;
  type: 'input' | 'output' | 'power' | 'passive';
  position: { x: number; y: number };
}

export interface FritzingPart {
  id: string;
  name: string;
  category: string;
  svg: string;
  breadboard: {
    width: number;
    height: number;
    pins: FritzingPin[];
  };
}

export interface FritzingPin {
  id: string;
  x: number;
  y: number;
  type: 'male' | 'female';
}

export interface NetlistNode {
  id: string;
  type: string;
  pins: string[];
  properties: Record<string, string>;
}

export interface NetlistConnection {
  net: string;
  nodes: string[];
}

export interface Netlist {
  nodes: NetlistNode[];
  connections: NetlistConnection[];
  metadata: {
    title: string;
    author: string;
    date: string;
  };
}
