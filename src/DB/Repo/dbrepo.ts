import type { UpdateOptions } from "mongodb";
import type { ProjectionType, QueryFilter, Types, UpdateQuery } from "mongoose";
import type { CreateOptions, QueryOptions } from "mongoose";
import type { Model } from "mongoose";



abstract class DBRepo<T> {
  constructor(protected Model: Model<T>) {

  }

  public async create({ data, options }: {
    // docs: Array<DeepPartial<ApplyBasicCreateCasting<Require_id<TRawDocType>>>>,
    data: any,
    options?: CreateOptions & { aggregateErrors: true }
  }) {
    return await this.Model.create(data, options)
  }
  public async findOne({ filter, projection, options }: {
    filter?: QueryFilter<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T>
  }) {
    return await this.Model.findOne(filter, projection, options)
  }
  public async findById({ id, projection, options }: {
    id: string | Types.ObjectId,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T>
  }) {
    return await this.Model.findById(id, projection, options)
  }
  public async updateOne({ filter, data, options = {} }:
    {
      filter: QueryFilter<T>,
      data: UpdateQuery<T>,
      options?: UpdateOptions
    }) {
    return await this.Model.updateOne(
      filter, data, options
    )
  }

  public async deleteOne({ filter, options = {} }: {
    filter: QueryFilter<T>,
    options?: UpdateOptions
  }) {
    return await this.Model.deleteOne(
      filter, options
    )
  }


}

export default DBRepo