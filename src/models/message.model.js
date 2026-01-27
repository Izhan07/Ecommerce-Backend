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
    reciver:[
        {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
    ],
     isGroup:{
        type: Boolean,
        default: false
    },
     group:{
        type: mongoose.Types.ObjectId,
        ref: "Group"
    }
},
{
    timestamps: true
}
)

export const Message = mongoose.model("Message", messageSchema)