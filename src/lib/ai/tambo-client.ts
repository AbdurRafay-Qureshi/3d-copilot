import axios from 'axios';
import { CircuitSpec } from '@/types/circuit';
import { validateCircuitSpec } from '@/lib/validation';
import { CIRCUIT_SPEC_PROMPT } from './prompts';

export interface TamboConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

export class TamboClient {
  private config: TamboConfig;

  constructor(config: TamboConfig) {
    this.config = {
      baseUrl: 'https://api.tambo.ai/v1',
      model: 'gpt-4',
      ...config,
    };
  }

  async generateCircuitSpec(description: string): Promise<CircuitSpec> {
    try {
      const prompt = CIRCUIT_SPEC_PROMPT(description);
      
      const response = await axios.post(
        `${this.config.baseUrl}/chat/completions`,
        {
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert electronic circuit design assistant. Always return valid JSON that matches the exact schema provided.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from Tambo AI');
      }

      // Extract JSON from the response (handle cases where AI includes extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const jsonString = jsonMatch[0];
      const parsedData = JSON.parse(jsonString);

      // Validate the parsed data
      const validation = validateCircuitSpec(parsedData);
      if (!validation.success) {
        throw new Error(`Validation failed: ${validation.error}`);
      }

      return validation.data as CircuitSpec;
    } catch (error) {
      console.error('Tambo AI API error:', error);
      throw new Error(`Failed to generate circuit spec: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async refineCircuitSpec(circuitSpec: CircuitSpec, refinementType: 'schematic' | 'breadboard' | 'pcb' | 'assembly'): Promise<CircuitSpec> {
    try {
      let prompt: string;
      
      switch (refinementType) {
        case 'schematic':
          prompt = `Refine the schematic layout for this circuit: ${JSON.stringify(circuitSpec, null, 2)}`;
          break;
        case 'breadboard':
          prompt = `Optimize the breadboard layout for this circuit: ${JSON.stringify(circuitSpec, null, 2)}`;
          break;
        case 'pcb':
          prompt = `Improve the PCB layout hints for this circuit: ${JSON.stringify(circuitSpec, null, 2)}`;
          break;
        case 'assembly':
          prompt = `Enhance the assembly steps for this circuit: ${JSON.stringify(circuitSpec, null, 2)}`;
          break;
        default:
          throw new Error(`Unknown refinement type: ${refinementType}`);
      }

      const response = await axios.post(
        `${this.config.baseUrl}/chat/completions`,
        {
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert electronic circuit design assistant. Return the refined circuit specification as valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 4000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from Tambo AI');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const jsonString = jsonMatch[0];
      const parsedData = JSON.parse(jsonString);

      const validation = validateCircuitSpec(parsedData);
      if (!validation.success) {
        throw new Error(`Validation failed: ${validation.error}`);
      }

      return validation.data as CircuitSpec;
    } catch (error) {
      console.error('Tambo AI refinement error:', error);
      throw new Error(`Failed to refine circuit spec: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateImagePrompt(circuitSpec: CircuitSpec, imageType: 'schematic' | 'breadboard' | 'pcb' | 'photorealistic'): Promise<string> {
    try {
      let basePrompt: string;
      
      switch (imageType) {
        case 'schematic':
          basePrompt = circuitSpec.schematic_prompt || `Electronic schematic diagram of ${circuitSpec.circuit_name}`;
          break;
        case 'breadboard':
          basePrompt = circuitSpec.breadboard_prompt || `Breadboard layout of ${circuitSpec.circuit_name}`;
          break;
        case 'pcb':
          basePrompt = circuitSpec.pcb_prompt || `PCB layout of ${circuitSpec.circuit_name}`;
          break;
        case 'photorealistic':
          basePrompt = `Photorealistic photograph of ${circuitSpec.circuit_name} circuit built on breadboard, professional lighting, high resolution`;
          break;
        default:
          throw new Error(`Unknown image type: ${imageType}`);
      }

      const response = await axios.post(
        `${this.config.baseUrl}/chat/completions`,
        {
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert at creating detailed image generation prompts. Create a detailed, specific prompt for generating high-quality images.'
            },
            {
              role: 'user',
              content: `Create a detailed image generation prompt for: ${basePrompt}. Include specific details about lighting, composition, style, and technical accuracy.`
            }
          ],
          temperature: 0.8,
          max_tokens: 500,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0]?.message?.content || basePrompt;
    } catch (error) {
      console.error('Tambo AI image prompt error:', error);
      return circuitSpec.schematic_prompt || `Image of ${circuitSpec.circuit_name}`;
    }
  }
}

// Singleton instance
let tamboClient: TamboClient | null = null;

export function getTamboClient(): TamboClient {
  if (!tamboClient) {
    const apiKey = process.env.TAMBO_API_KEY;
    if (!apiKey) {
      throw new Error('TAMBO_API_KEY environment variable is required');
    }
    tamboClient = new TamboClient({ apiKey });
  }
  return tamboClient;
}

// Mock client for development/testing
export class MockTamboClient extends TamboClient {
  async generateCircuitSpec(description: string): Promise<CircuitSpec> {
    // Return a mock circuit spec for development
    return {
      circuit_name: "555 LED Blinker",
      description: "A simple LED blinker circuit using the NE555 timer IC",
      components: [
        {
          id: "U1",
          type: "IC",
          value: "NE555",
          footprint: "DIP-8",
          model: "NE555.step",
          description: "Timer IC"
        },
        {
          id: "R1",
          type: "Resistor",
          value: "1kΩ",
          footprint: "R_0805_2012Metric",
          description: "Current limiting resistor"
        },
        {
          id: "C1",
          type: "Capacitor",
          value: "10µF",
          footprint: "C_0805_2012Metric",
          description: "Timing capacitor"
        },
        {
          id: "LED1",
          type: "LED",
          value: "Red 5mm",
          footprint: "LED_D5.0mm",
          description: "Status indicator LED"
        }
      ],
      connections: [
        {
          from: "U1-3",
          to: "LED1-A",
          wire_color: "red",
          description: "Output to LED anode"
        },
        {
          from: "LED1-K",
          to: "R1-1",
          wire_color: "black",
          description: "LED cathode to resistor"
        },
        {
          from: "R1-2",
          to: "GND",
          wire_color: "black",
          description: "Resistor to ground"
        }
      ],
      breadboard: [
        {
          component_id: "U1",
          row: "E",
          col: 20,
          orientation: "horizontal"
        },
        {
          component_id: "R1",
          row: "F",
          col: 15,
          orientation: "horizontal"
        },
        {
          component_id: "LED1",
          row: "F",
          col: 10,
          orientation: "horizontal"
        }
      ],
      pcb_hints: {
        layer: "single",
        trace_width: 0.3,
        via_size: 0.2,
        clearance: 0.2
      },
      assembly_steps: [
        {
          step_number: 1,
          description: "Place the NE555 timer IC in the center of the breadboard",
          components: ["U1"],
          tools: ["Breadboard", "NE555 IC"]
        },
        {
          step_number: 2,
          description: "Insert the 1kΩ resistor between the LED cathode and ground",
          components: ["R1"],
          tools: ["1kΩ Resistor", "Wire strippers"]
        },
        {
          step_number: 3,
          description: "Place the LED with proper polarity (long leg to positive)",
          components: ["LED1"],
          tools: ["Red LED", "Wire strippers"]
        },
        {
          step_number: 4,
          description: "Connect power and ground rails",
          components: ["VCC", "GND"],
          tools: ["Jumper wires", "Power supply"]
        }
      ],
      schematic_prompt: "Clean electronic schematic diagram showing NE555 timer circuit with LED and timing components",
      breadboard_prompt: "Realistic breadboard layout with NE555 IC, resistors, capacitors, and LED properly connected",
      pcb_prompt: "Professional PCB layout with proper trace routing and component placement",
      estimated_difficulty: "beginner",
      estimated_time: "15-30 minutes",
      required_tools: ["Breadboard", "Jumper wires", "Wire strippers", "Power supply", "Multimeter"]
    };
  }
}
