import { GraphQLBoolean, GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql"
import { GenderEnum, ProviderEnum, RoleEnum } from "../../../Common/enums/enums.user.js"



export const userProfileTypes =  new GraphQLObjectType({
            name:"UserType",
            fields:{
            _id:{type:new GraphQLNonNull(GraphQLID)},
            userName: {type:GraphQLString,resolve:(parent)=>{
               return parent.gender == GenderEnum.Male ? `Mr ${parent.userName}`: `Ms ${parent.userName}`
            }},
            email: {type:GraphQLString},
            password: {type:GraphQLString},
            confrimEmail:{type:GraphQLBoolean} ,
            phone: {type:GraphQLString},
            gender:{type: new GraphQLEnumType({
              name:"genderEnum",
              values:{
                Male:{
                  value:GenderEnum.Male
                },
                Female:{
                  value:GenderEnum.Female
                }
              }
            }) },
            role:{type: new GraphQLEnumType({
              name:"roleEnum",
              values:{
                User:{
                  value:RoleEnum.User
                },
                Admin:{
                  value:RoleEnum.Admin
                }
              }
            }) },
            age: {type:GraphQLInt},
            frindes: {type:new GraphQLList(GraphQLString)},
            provider:{type: new GraphQLEnumType({
              name:"providerEnum",
              values:{
                Google:{
                  value:ProviderEnum.Google
                },
                System:{
                  value:ProviderEnum.System
                }
              }
            }) },
            profilePic: {type:GraphQLString},
            covPic: {type:new GraphQLList(GraphQLString)},
            changeCreditTime: {type:GraphQLString},
            deletedAt: {type:GraphQLString},}
          })