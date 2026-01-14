/**
 * Database Adapter Pattern (Gang of 4)
 * 
 * Abstract interface for database adapters.
 * Enables plug-and-play database provider swapping.
 */

import type { DatabaseConnection, QueryResult, TransactionOptions, DatabaseOperationResult } from "../contracts/index.js";

/**
 * Abstract database adapter interface
 */
export interface IDatabaseAdapter {
  /**
   * Connect to the database
   */
  connect(config: DatabaseConnection): Promise<void>;

  /**
   * Disconnect from the database
   */
  disconnect(): Promise<void>;

  /**
   * Execute a query
   */
  query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult & { rows: T[] }>;

  /**
   * Execute a transaction
   */
  transaction<T>(callback: (tx: ITransaction) => Promise<T>, options?: TransactionOptions): Promise<T>;

  /**
   * Check if connected
   */
  isConnected(): boolean;

  /**
   * Get adapter name
   */
  getName(): string;
}

/**
 * Transaction interface
 */
export interface ITransaction {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult & { rows: T[] }>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

/**
 * Circuit breaker state
 */
export enum CircuitBreakerState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
}

/**
 * Base adapter with circuit breaker
 */
export abstract class BaseAdapter implements IDatabaseAdapter {
  protected connection: DatabaseConnection | null = null;
  protected connected: boolean = false;
  protected circuitBreakerState: CircuitBreakerState = CircuitBreakerState.CLOSED;
  protected failureCount: number = 0;
  protected lastFailureTime: number = 0;
  protected config: CircuitBreakerConfig;

  constructor(circuitBreakerConfig?: Partial<CircuitBreakerConfig>) {
    this.config = {
      failureThreshold: circuitBreakerConfig?.failureThreshold ?? 5,
      resetTimeout: circuitBreakerConfig?.resetTimeout ?? 60000, // 1 minute
      monitoringPeriod: circuitBreakerConfig?.monitoringPeriod ?? 60000, // 1 minute
    };
  }

  abstract connect(config: DatabaseConnection): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract query<T = unknown>(sql: string, params?: unknown[]): Promise<QueryResult & { rows: T[] }>;
  abstract transaction<T>(callback: (tx: ITransaction) => Promise<T>, options?: TransactionOptions): Promise<T>;
  abstract getName(): string;

  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Check circuit breaker before operation
   */
  protected async checkCircuitBreaker(): Promise<void> {
    const now = Date.now();

    if (this.circuitBreakerState === CircuitBreakerState.OPEN) {
      if (now - this.lastFailureTime > this.config.resetTimeout) {
        this.circuitBreakerState = CircuitBreakerState.HALF_OPEN;
      } else {
        throw new Error(`Circuit breaker is OPEN for adapter ${this.getName()}`);
      }
    }
  }

  /**
   * Record success (reset circuit breaker)
   */
  protected recordSuccess(): void {
    if (this.circuitBreakerState === CircuitBreakerState.HALF_OPEN) {
      this.circuitBreakerState = CircuitBreakerState.CLOSED;
      this.failureCount = 0;
    }
  }

  /**
   * Record failure (potentially open circuit breaker)
   */
  protected recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.config.failureThreshold) {
      this.circuitBreakerState = CircuitBreakerState.OPEN;
    }
  }

  /**
   * Get circuit breaker state
   */
  getCircuitBreakerState(): CircuitBreakerState {
    return this.circuitBreakerState;
  }
}
