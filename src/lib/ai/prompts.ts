import { CircuitSpec } from '@/types/circuit';

export const CIRCUIT_SPEC_PROMPT = (description: string) => `
You are an expert electronic circuit design assistant. Generate a detailed specification for an electronic circuit based on this request: "${description}"

Return a JSON object with the following structure:

{
  "circuit_name": "Descriptive name for the circuit",
  "description": "Detailed description of what the circuit does",
  "components": [
    {
      "id": "U1",
      "type": "IC",
      "value": "NE555",
      "footprint": "DIP-8",
      "model": "NE555.step",
      "description": "Timer IC"
    },
    {
      "id": "R1",
      "type": "Resistor",
      "value": "1kΩ",
      "footprint": "R_0805_2012Metric",
      "description": "Current limiting resistor"
    },
    {
      "id": "C1",
      "type": "Capacitor",
      "value": "10µF",
      "footprint": "C_0805_2012Metric",
      "description": "Timing capacitor"
    },
    {
      "id": "LED1",
      "type": "LED",
      "value": "Red 5mm",
      "footprint": "LED_D5.0mm",
      "description": "Status indicator LED"
    }
  ],
  "connections": [
    {
      "from": "U1-3",
      "to": "LED1-A",
      "wire_color": "red",
      "description": "Output to LED anode"
    },
    {
      "from": "LED1-K",
      "to": "R1-1",
      "wire_color": "black",
      "description": "LED cathode to resistor"
    },
    {
      "from": "R1-2",
      "to": "GND",
      "wire_color": "black",
      "description": "Resistor to ground"
    }
  ],
  "breadboard": [
    {
      "component_id": "U1",
      "row": "E",
      "col": 20,
      "orientation": "horizontal"
    },
    {
      "component_id": "R1",
      "row": "F",
      "col": 15,
      "orientation": "horizontal"
    },
    {
      "component_id": "LED1",
      "row": "F",
      "col": 10,
      "orientation": "horizontal"
    }
  ],
  "pcb_hints": {
    "layer": "single",
    "trace_width": 0.3,
    "via_size": 0.2,
    "clearance": 0.2
  },
  "assembly_steps": [
    {
      "step_number": 1,
      "description": "Place the NE555 timer IC in the center of the breadboard",
      "components": ["U1"],
      "tools": ["Breadboard", "NE555 IC"]
    },
    {
      "step_number": 2,
      "description": "Insert the 1kΩ resistor between the LED cathode and ground",
      "components": ["R1"],
      "tools": ["1kΩ Resistor", "Wire strippers"]
    },
    {
      "step_number": 3,
      "description": "Place the LED with proper polarity (long leg to positive)",
      "components": ["LED1"],
      "tools": ["Red LED", "Wire strippers"]
    },
    {
      "step_number": 4,
      "description": "Connect power and ground rails",
      "components": ["VCC", "GND"],
      "tools": ["Jumper wires", "Power supply"]
    }
  ],
  "schematic_prompt": "Clean electronic schematic diagram showing NE555 timer circuit with LED and timing components",
  "breadboard_prompt": "Realistic breadboard layout with NE555 IC, resistors, capacitors, and LED properly connected",
  "pcb_prompt": "Professional PCB layout with proper trace routing and component placement",
  "estimated_difficulty": "beginner",
  "estimated_time": "15-30 minutes",
  "required_tools": ["Breadboard", "Jumper wires", "Wire strippers", "Power supply", "Multimeter"]
}

IMPORTANT GUIDELINES:
1. Use real KiCad footprint names (e.g., "DIP-8", "R_0805_2012Metric", "LED_D5.0mm")
2. Use standard component values and part numbers
3. Ensure all connections are electrically valid
4. Provide realistic breadboard positions (rows A-J, columns 1-63)
5. Include proper wire colors for different signal types
6. Make assembly steps clear and sequential
7. Use appropriate difficulty levels and time estimates
8. Include all necessary tools and materials
9. Ensure the circuit is actually buildable and functional

Focus on creating a practical, buildable circuit that matches the user's request.
`;

export const SCHEMATIC_REFINEMENT_PROMPT = (circuitSpec: CircuitSpec) => `
Based on this circuit specification, generate an improved netlist for schematic generation:

Circuit: ${circuitSpec.circuit_name}
Components: ${circuitSpec.components.map(c => `${c.id}: ${c.value}`).join(', ')}
Connections: ${circuitSpec.connections.map(c => `${c.from} → ${c.to}`).join(', ')}

Optimize the netlist for:
1. Clear signal flow and readability
2. Proper power and ground distribution
3. Logical component placement
4. Standard schematic conventions
5. netlistsvg compatibility

Return a JSON netlist that can be directly used with netlistsvg.
`;

export const BREADBOARD_OPTIMIZATION_PROMPT = (circuitSpec: CircuitSpec) => `
Optimize this circuit for breadboard layout:

Circuit: ${circuitSpec.circuit_name}
Current breadboard placements: ${JSON.stringify(circuitSpec.breadboard, null, 2)}

Optimize for:
1. Minimal wire crossings
2. Logical component grouping
3. Easy assembly sequence
4. Clear visual organization
5. Standard breadboard conventions

Return an improved breadboard placement array with better positioning.
`;

export const PCB_LAYOUT_PROMPT = (circuitSpec: CircuitSpec) => `
Generate PCB layout hints for this circuit:

Circuit: ${circuitSpec.circuit_name}
Components: ${circuitSpec.components.length} components
PCB hints: ${JSON.stringify(circuitSpec.pcb_hints, null, 2)}

Provide:
1. Component placement strategy
2. Trace routing recommendations
3. Via placement suggestions
4. Ground plane considerations
5. Power distribution layout
6. Thermal considerations

Return detailed PCB layout guidance.
`;

export const ASSEMBLY_GUIDE_PROMPT = (circuitSpec: CircuitSpec) => `
Create a comprehensive assembly guide for this circuit:

Circuit: ${circuitSpec.circuit_name}
Difficulty: ${circuitSpec.estimated_difficulty}
Time: ${circuitSpec.estimated_time}
Tools: ${circuitSpec.required_tools.join(', ')}

Expand the assembly steps with:
1. Detailed instructions for each step
2. Safety considerations
3. Troubleshooting tips
4. Testing procedures
5. Common mistakes to avoid
6. Visual cues and indicators

Return an enhanced assembly guide with more detail and helpful tips.
`;
