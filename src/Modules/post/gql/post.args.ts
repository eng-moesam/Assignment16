import { GraphQLEnumType, GraphQLNonNull, GraphQLString } from "graphql";

 export const reactpostArgs={

    postId:{type:new GraphQLNonNull(GraphQLString)},
    react:{type: new GraphQLNonNull(new GraphQLEnumType({
        name:"reactEnum",
        values:{like:{value:1},unlike:{value:0}}
    }))}

 }

 