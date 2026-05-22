import type { UpdateOptions } from "mongodb";
import type { HydratedDocument, ProjectionType, QueryFilter, Types, UpdateQuery } from "mongoose";
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
  
  public async findOneAndUpdate({ filter, update, options }: {
    filter?: QueryFilter<T>,
    update?: UpdateQuery<T>,
    options?: QueryOptions<T>
  }) {
    return await this.Model.findOneAndUpdate(filter, update, options)
  }
  public async find({ filter, projection, options }: {
    filter?: QueryFilter<T>,
    projection?: ProjectionType<T> | null | undefined,
    options?: QueryOptions<T>
  }) {
    return await this.Model.find(filter, projection, options)
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
  
  getDBDoc(data : T){
    return new this.Model(data)
  }
   async saveDBDoc(doc:HydratedDocument<T>){
       return await doc.save()
   }
  
   async paginate({ filter, projection, options,page=1,size=3 }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T> | null | undefined;
    options?: QueryOptions<T>;
    page?:number;
    size?:number;
  }){
     const skip = (page-1) * size
     const docs = await this.Model.find(filter,projection,options).skip(skip).limit(size)
  
     const totalDoc = await this.Model.countDocuments(filter)
     return{
      docs,
      page,
      totalDoc,
      totalPages: Math.ceil(totalDoc / size)
     }
   }

}

export default DBRepo