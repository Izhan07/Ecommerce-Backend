import mongoose, {Schema} from "mongoose";

const messageSchema = new Schema({
    text:{
        type: String, 
    },
    media:[
        {
            type: String,
        }
    ],
    sender:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reciver:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},
{
    timestamps: true
}
)

export const Message = mongoose.model("Message", messageSchema)