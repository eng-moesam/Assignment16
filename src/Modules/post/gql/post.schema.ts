import { reactpostArgs } from "./post.args.js";
import postResolver from "./post.resolver.js";
import { ReactPostType } from "./post.types.js";

   

   class PostSchema{

    postMutation(){
        return {
            reactPost:{
                type:ReactPostType,
                args:reactpostArgs,
                resolve:postResolver.reactPost
            }
        }
    }
   }

   export default new PostSchema()