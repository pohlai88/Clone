/**
 * Alias Registry System
 * 
 * Pre-defined aliases and registration mechanism for Prime Nomad kernel.
 * Kernel captures schema → reflects on Manifest.
 * Missing aliases trigger registration workflow.
 */

import { z } from "zod";

/**
 * Alias type definitions
 */
export const AliasTypeSchema = z.enum([
  "COLOR",
  "HEX",
  "HSL",
  "WEBSOCKET",
  "CUSTOM",
]);

export type AliasType = z.infer<typeof AliasTypeSchema>;

/**
 * Alias definition schema
 */
export const AliasDefinitionSchema = z.object({
  id: z.string(),
  type: AliasTypeSchema,
  name: z.string(),
  value: z.unknown(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  registeredAt: z.date().optional(),
});

export type AliasDefinition = z.infer<typeof AliasDefinitionSchema>;

/**
 * Pre-defined aliases
 */
export const PREDEFINED_ALIASES: Record<string, AliasDefinition> = {
  // Color aliases
  "color.blue": {
    id: "color.blue",
    type: "COLOR",
    name: "Blue",
    value: "#0000FF",
    metadata: { rgb: [0, 0, 255] },
  },
  "color.hex": {
    id: "color.hex",
    type: "HEX",
    name: "Hexadecimal Color",
    value: null, // Placeholder, will be set during registration
    metadata: { format: "hex" },
  },
  "color.hsl": {
    id: "color.hsl",
    type: "HSL",
    name: "HSL Color",
    value: null, // Placeholder, will be set during registration
    metadata: { format: "hsl" },
  },
  // WebSocket aliases
  "websocket.server": {
    id: "websocket.server",
    type: "WEBSOCKET",
    name: "WebSocket Server",
    value: null, // Will be set during registration
    metadata: { protocol: "ws" },
  },
};

/**
 * Alias Registry
 */
export class AliasRegistry {
  private aliases: Map<string, AliasDefinition> = new Map();
  private registrationCallbacks: Map<string, (alias: AliasDefinition) => void> = new Map();

  constructor() {
    // Initialize with pre-defined aliases
    Object.values(PREDEFINED_ALIASES).forEach((alias) => {
      this.aliases.set(alias.id, alias);
    });
  }

  /**
   * Register an alias
   */
  register(alias: AliasDefinition): void {
    const validated = AliasDefinitionSchema.parse({
      ...alias,
      registeredAt: new Date(),
    });

    this.aliases.set(validated.id, validated);

    // Notify callbacks
    const callback = this.registrationCallbacks.get(validated.id);
    if (callback) {
      callback(validated);
      this.registrationCallbacks.delete(validated.id);
    }
  }

  /**
   * Get an alias by ID
   */
  get(aliasId: string): AliasDefinition | undefined {
    return this.aliases.get(aliasId);
  }

  /**
   * Check if alias exists
   */
  has(aliasId: string): boolean {
    return this.aliases.has(aliasId);
  }

  /**
   * Get all aliases
   */
  getAll(): AliasDefinition[] {
    return Array.from(this.aliases.values());
  }

  /**
   * Get aliases by type
   */
  getByType(type: AliasType): AliasDefinition[] {
    return Array.from(this.aliases.values()).filter((alias) => alias.type === type);
  }

  /**
   * Request registration for missing alias
   */
  requestRegistration(aliasId: string, callback?: (alias: AliasDefinition) => void): void {
    if (this.has(aliasId)) {
      // Alias already exists
      const alias = this.get(aliasId);
      if (alias && callback) {
        callback(alias);
      }
      return;
    }

    // Register callback for when alias is registered
    if (callback) {
      this.registrationCallbacks.set(aliasId, callback);
    }

    // Trigger registration workflow (to be implemented by kernel)
    throw new Error(`Alias '${aliasId}' not found. Registration required.`);
  }

  /**
   * Validate alias against schema
   */
  validate(alias: unknown): AliasDefinition {
    return AliasDefinitionSchema.parse(alias);
  }
}

/**
 * Global alias registry instance
 */
export const aliasRegistry = new AliasRegistry();
