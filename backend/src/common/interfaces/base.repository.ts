export interface IGenericRepository<T, TCreate, TUpdate> {
  create(data: TCreate): Promise<T>;
  update(id: string, data: TUpdate): Promise<T | null>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<T | null>;
  findAll(skip?: number, limit?: number): Promise<T[]>;
}
