import { GraphQLNonNull, GraphQLString } from "graphql";



export const userProfileArgs={
    userId :{userId:{type:new GraphQLNonNull(GraphQLString)}}
}