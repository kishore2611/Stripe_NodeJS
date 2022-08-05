// const express = require("express");
// const app = express();
const Card = require("../models/Card");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// const checkout = async (req, res) => {
//     try {
//         console.log(req.query);
//         return
//         const { sessionId } = req.query;
//         const session = await stripe.checkout.sessions.retrieve(sessionId);
//         return res.send(session);

//     } catch (error) {
//         return res.status(400).send(error.message)
//     }
// }

// app.get("/checkout-session", async (req, res) => {
//     const { sessionId } = req.query;
//     const session = await stripe.checkout.sessions.retrieve(sessionId);
//     res.send(session);
//   });

const addCard = async (req, res) => {
  try {
    if (!req.body.cardHolderName) {
      return res.status(400).send({
        status: 0,
        message: "cardHolderName field is required",
      });
    } else if (!req.body.cardNumber) {
      return res.status(400).send({
        status: 0,
        message: "cardNumber field is required",
      });
    } else if (!req.body.expMonth) {
      return res.status(400).send({
        status: 0,
        message: "expMonth field is required",
      });
    } else if (!req.body.expYear) {
      return res.status(400).send({
        status: 0,
        message: "expYear field is required",
      });
    } else if (!req.body.cvv) {
      return res.status(400).send({
        status: 0,
        message: "cvv field is required",
      });
    } else {
      const alreadycard = await Card.find({ cardNumber: req.body.cardNumber });
      if (alreadycard.length > 0) {
        return res.status(400).send({
          status: 0,
          message: "card already exists",
        });
      } else {
        const date = req.body.expMonth + "/" + req.body.expYear;
        const card = await Card({
          cardHolderName: req.body.cardHolderName,
          cardNumber: req.body.cardNumber,
          expDate: date,
          cvv: req.body.cvv,
          default: req.body.default,
          user_id: req.user._id,
        });
        card.save();

        // const newcard = await stripe.customers.createSource(
        //     'cus_MBlU0qEpPYY3sP',
        //     {source: 'tok_visa'}
        //   );

        return res.status(200).send({
          status: 1,
          message: "card added",
          card,
        });
      }
    }
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

const getCard = async (req, res) => {
    try {
        const card = await Card.findById(req.body.cardNumber)

        if (!card) {
            return res.status(400).send("card not found");
        }
        else{
            return res.status(200).send({
                status: 1,
                message: "card",
                card
            });

        }
    } catch (error) {
        return res.status(400).send(error.message);
    }
}


const payment = async (req, res) => {
    try {
        
    } catch (error) {
        return res.status(400).send(error.message);
    }
}
module.exports = {
  addCard,
  getCard,
  payment
};
