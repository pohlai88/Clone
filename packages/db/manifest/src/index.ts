/**
 * @axis/db-manifest
 * 
 * Manifest Database Adapter (Read-Only)
 * 
 * Materialized database for white-collar users (Quorum - CFO, CTO, CEO).
 * Provides read-only access to materialized views from transactional DB.
 * Features: ACID, RBAC, cross-app search, audit, predict.
 * 
 * Can be frontend-accessible (read-only).
 */

import type { IDatabaseAdapter } from "@axis/db-core/adapter";
import type { DatabaseConnection, QueryResult } from "@axis/db-core/contracts";
import { aliasRegistry } from "@axis/db-core/aliases";

/**
 * Manifest Database Adapter
 * 
 * Read-only adapter for materialized database.
 * All writes are blocked - this is for analytics and reporting only.
 */
export class ManifestAdapter implements IDatabaseAdapter {
  private connection: DatabaseConnection | null = null;
  private connected: boolean = false;
  private sourceAdapter: IDatabaseAdapter | null = null;

  constructor(sourceAdapter?: IDatabaseAdapter) {
    this.sourceAdapter = sourceAdapter || null;
  }

  /**
   * Connect to manifest database (read-only)
   */
  async connect(config: DatabaseConnection): Promise<void> {
    // Manifest connects to a separate database instance (materialized)
    // or uses the source adapter's connection in read-only mode
    this.connection = config;
    this.connected = true;
  }

  /**
   * Disconnect from manifest database
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    this.connection = null;
  }

  /**
   * Execute read-only query on manifest
   * 
   * All queries are validated to be SELECT-only.
   */
  async query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult & { rows: T[] }> {
    if (!this.connected) {
      throw new Error("Not connected to Manifest database");
    }

    // Validate that query is read-only (SELECT only)
    const normalizedSql = sql.trim().toUpperCase();
    if (!normalizedSql.startsWith("SELECT")) {
      throw new Error("Manifest adapter is read-only. Only SELECT queries are allowed.");
    }

    // Check for aliases in the query
    // If aliases are referenced, ensure they're registered
    const aliasMatches = sql.match(/@(\w+\.\w+)/g);
    if (aliasMatches) {
      for (const match of aliasMatches) {
        const aliasId = match.substring(1); // Remove @
        if (!aliasRegistry.has(aliasId)) {
          aliasRegistry.requestRegistration(aliasId);
        }
      }
    }

    // TODO: Execute query against materialized database
    // This will be implemented when we set up the actual materialized DB
    // For now, return empty result
    
    return {
      rows: [] as T[],
      rowCount: 0,
    };
  }

  /**
   * Transactions are not supported in read-only manifest
   */
  async transaction<T>(
    callback: (tx: any) => Promise<T>,
    options?: any
  ): Promise<T> {
    throw new Error("Manifest adapter is read-only. Transactions are not supported.");
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get adapter name
   */
  getName(): string {
    return "Manifest (Read-Only)";
  }

  /**
   * Get manifest features
   */
  getFeatures(): string[] {
    return [
      "ACID",
      "RBAC",
      "Cross-App Search",
      "Audit",
      "Predict",
    ];
  }

  /**
   * Set source adapter (for materialization)
   */
  setSourceAdapter(adapter: IDatabaseAdapter): void {
    this.sourceAdapter = adapter;
  }

  /**
   * Get source adapter
   */
  getSourceAdapter(): IDatabaseAdapter | null {
    return this.sourceAdapter;
  }
}
