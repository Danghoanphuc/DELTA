// src/interfaces/repository.interface.ts
// ✅ Repository Interfaces - Dependency Inversion Principle

import { FilterQuery, UpdateQuery } from "mongoose";

/**
 * Generic Repository Interface
 * Tuân thủ Dependency Inversion Principle (DIP)
 */
export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findOne(filter: FilterQuery<T>): Promise<T | null>;
  find(filter: FilterQuery<T>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: UpdateQuery<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(filter?: FilterQuery<T>): Promise<number>;
}

/**
 * Paginated Result
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Order Repository Interface
 */
export interface IOrderRepository<T> extends IRepository<T> {
  findWithPagination(
    filter: FilterQuery<T>,
    page: number,
    limit: number,
    sort?: Record<string, 1 | -1>
  ): Promise<PaginatedResult<T>>;

  aggregate(pipeline: any[]): Promise<any[]>;
}

/**
 * Inventory Repository Interface
 */
export interface IInventoryRepository<T> extends IRepository<T> {
  findByOrganization(organizationId: string): Promise<T[]>;
  findItemById(
    itemId: string
  ): Promise<{ inventory: T; itemIndex: number } | null>;
  updateItem(
    inventoryId: string,
    itemIndex: number,
    update: any
  ): Promise<T | null>;
}
