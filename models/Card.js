const mongoose = require("mongoose");
const User = require("./User");

const cardSchema = new mongoose.Schema(
  {
    cardHolderName: {
      type: String,
    },
    cardNumber: {
      type: Number,
    },
    expDate: {
      type: String,
    },
    // ExpMonth: {
    //     type: String
    // },
    // ExpYear: {
    //     type: String
    // },
    cvv: {
      type: String,
    },
    default: {
      type: Boolean,
      default: false,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customerId:{
      type: String,
    },
    transaction:{
        tokenId:{type: String, default: null},
        amount:{type: Number, default:null},
        description:{type: String, default:null},
    }
  },
  { timestamps: true }
);

const Card = mongoose.model("Card", cardSchema);
module.exports = Card;
