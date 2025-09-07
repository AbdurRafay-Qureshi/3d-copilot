import axios from 'axios';
import { CircuitSpec } from '@/types/circuit';
import { validateCircuitSpec } from '@/lib/validation';
import { CIRCUIT_SPEC_PROMPT } from './prompts';

export interface OllamaConfig {
  baseUrl?: string;
  model?: string;
}

export class OllamaClient {
  private config: OllamaConfig;

  constructor(config: OllamaConfig = {}) {
    this.config = {
      baseUrl: 'http://localhost:11434',
      model: 'llama2',
      ...config,
    };
  }

  async generateCircuitSpec(description: string): Promise<CircuitSpec> {
    try {
      const prompt = CIRCUIT_SPEC_PROMPT(description);
      
      const response = await axios.post(
        `${this.config.baseUrl}/api/generate`,
        {
          model: this.config.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 4000,
          }
        }
      );

      const content = response.data.response;
      if (!content) {
        throw new Error('No response content from Ollama');
      }

      // Extract JSON from the response
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
      console.error('Ollama API error:', error);
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
        `${this.config.baseUrl}/api/generate`,
        {
          model: this.config.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.5,
            top_p: 0.9,
            max_tokens: 4000,
          }
        }
      );

      const content = response.data.response;
      if (!content) {
        throw new Error('No response content from Ollama');
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
      console.error('Ollama refinement error:', error);
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
        `${this.config.baseUrl}/api/generate`,
        {
          model: this.config.model,
          prompt: `Create a detailed image generation prompt for: ${basePrompt}. Include specific details about lighting, composition, style, and technical accuracy.`,
          stream: false,
          options: {
            temperature: 0.8,
            top_p: 0.9,
            max_tokens: 500,
          }
        }
      );

      return response.data.response || basePrompt;
    } catch (error) {
      console.error('Ollama image prompt error:', error);
      return circuitSpec.schematic_prompt || `Image of ${circuitSpec.circuit_name}`;
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      await axios.get(`${this.config.baseUrl}/api/tags`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.config.baseUrl}/api/tags`);
      return response.data.models?.map((model: any) => model.name) || [];
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
      return [];
    }
  }
}

// Singleton instance
let ollamaClient: OllamaClient | null = null;

export function getOllamaClient(): OllamaClient {
  if (!ollamaClient) {
    ollamaClient = new OllamaClient();
  }
  return ollamaClient;
}
