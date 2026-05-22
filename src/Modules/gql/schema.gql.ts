import { GraphQLObjectType, GraphQLSchema } from "graphql"
import userSchema from "../user/gql/user.schema.js"
import postSchema from "../post/gql/post.schema.js"







  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: "queryschema",
      fields: {
        ... userSchema.userQueries()
      }
    }),
    mutation: new GraphQLObjectType({
      name:"mutationName",
      fields:{
        ... postSchema.postMutation()
      }
    })
  })


  export default schema