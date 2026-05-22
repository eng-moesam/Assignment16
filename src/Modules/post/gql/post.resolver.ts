import { validationGQL } from "../../../Middlewares/valdation.middleware.js"
import type { ContextType } from "../../gql/type.gql.js"
import postService from "../post.service.js"
import { LikesOrDisLikesSchema } from "./post.gql.validation.js"

class PostResolver{

    private _postService = postService
    reactPost = async (parent:any,args:any,context:ContextType)=>{


       validationGQL(LikesOrDisLikesSchema,args)
        const result = await this._postService.likeOrDisLilkePost(args.postId,args.react,context.user)
      return {
        _id : result._id,
        likes: result.likes
      }
    }
}


export default new PostResolver()