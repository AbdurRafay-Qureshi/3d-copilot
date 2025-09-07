import { z } from 'zod';

export const ComponentSchema = z.object({
  id: z.string().min(1, "Component ID is required"),
  type: z.string().min(1, "Component type is required"),
  value: z.string().min(1, "Component value is required"),
  footprint: z.string().min(1, "KiCad footprint is required"),
  model: z.string().optional(),
  description: z.string().optional(),
});

export const ConnectionSchema = z.object({
  from: z.string().min(1, "Connection from is required"),
  to: z.string().min(1, "Connection to is required"),
  wire_color: z.string().min(1, "Wire color is required"),
  description: z.string().optional(),
});

export const BreadboardPlacementSchema = z.object({
  component_id: z.string().min(1, "Component ID is required"),
  row: z.string().min(1, "Row is required"),
  col: z.number().min(0, "Column must be positive"),
  orientation: z.enum(['horizontal', 'vertical']).optional(),
});

export const PCBHintSchema = z.object({
  layer: z.enum(['single', 'double']),
  trace_width: z.number().positive("Trace width must be positive"),
  via_size: z.number().positive().optional(),
  clearance: z.number().positive().optional(),
});

export const AssemblyStepSchema = z.object({
  step_number: z.number().positive("Step number must be positive"),
  description: z.string().min(1, "Step description is required"),
  image_prompt: z.string().optional(),
  components: z.array(z.string()).optional(),
  tools: z.array(z.string()).optional(),
});

export const CircuitSpecSchema = z.object({
  circuit_name: z.string().min(1, "Circuit name is required"),
  description: z.string().min(1, "Circuit description is required"),
  components: z.array(ComponentSchema).min(1, "At least one component is required"),
  connections: z.array(ConnectionSchema).min(1, "At least one connection is required"),
  breadboard: z.array(BreadboardPlacementSchema),
  pcb_hints: PCBHintSchema,
  assembly_steps: z.array(AssemblyStepSchema).min(1, "At least one assembly step is required"),
  schematic_prompt: z.string().optional(),
  breadboard_prompt: z.string().optional(),
  pcb_prompt: z.string().optional(),
  estimated_difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimated_time: z.string().min(1, "Estimated time is required"),
  required_tools: z.array(z.string()),
});

export const ExportOptionsSchema = z.object({
  format: z.enum(['pdf', 'png', 'svg']),
  include_schematic: z.boolean(),
  include_breadboard: z.boolean(),
  include_pcb: z.boolean(),
  include_3d: z.boolean(),
  include_assembly: z.boolean(),
});

export const KiCadFootprintSchema = z.object({
  name: z.string(),
  library: z.string(),
  description: z.string(),
  pins: z.array(z.object({
    number: z.string(),
    name: z.string(),
    type: z.enum(['input', 'output', 'power', 'passive']),
    position: z.object({
      x: z.number(),
      y: z.number(),
    }),
  })),
  dimensions: z.object({
    width: z.number(),
    height: z.number(),
  }),
});

export const FritzingPartSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  svg: z.string(),
  breadboard: z.object({
    width: z.number(),
    height: z.number(),
    pins: z.array(z.object({
      id: z.string(),
      x: z.number(),
      y: z.number(),
      type: z.enum(['male', 'female']),
    })),
  }),
});

export const NetlistNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  pins: z.array(z.string()),
  properties: z.record(z.string()),
});

export const NetlistConnectionSchema = z.object({
  net: z.string(),
  nodes: z.array(z.string()),
});

export const NetlistSchema = z.object({
  nodes: z.array(NetlistNodeSchema),
  connections: z.array(NetlistConnectionSchema),
  metadata: z.object({
    title: z.string(),
    author: z.string(),
    date: z.string(),
  }),
});

// Validation helper functions
export function validateCircuitSpec(data: unknown): { success: boolean; data?: any; error?: string } {
  try {
    const validated = CircuitSpecSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}

export function validateExportOptions(data: unknown): { success: boolean; data?: any; error?: string } {
  try {
    const validated = ExportOptionsSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}
