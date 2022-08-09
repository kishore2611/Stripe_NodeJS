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
        const token = await stripe.tokens.create({
          card: {
            number: req.body.cardNumber,
            exp_month: req.body.expMonth,
            exp_year: req.body.expYear,
            cvc: req.body.cvv,
          },
        });
        // const customer = await 
        const customer = await stripe.customers.create({
            email: req.user.email,
            source: token.id,
            name: req.body.cardHolderName,
            address: {
              line1: "23 Valley Karachi",
              postal_code: "112233",
              city: "karachi",
              state: "sindh",
              country: "Pakistan",
            },
          })
          // .then(() => {
          //   return stripe.charges.create({
          //     amount: req.body.amount,
          //     description: req.body.description,
          //     currency: "USD",
          //     customer: customer.id
          //   });
          // });
          const charge = await stripe.charges.create({
            amount: req.body.amount,
            description: req.body.description,
            currency: "USD",
            customer: customer.id
          })

          

        // const paymentIntent = await stripe.paymentIntents.create({
        //   customer: customer.id,
        //   setup_future_usage: "off_session",
        //   amount: req.body.amount,
        //   currency: "usd",
        //   payment_method_types: ["card"],
        //   description: req.body.description,
        // });

        const date = token.card.exp_month + "/" + token.card.exp_year;
        const card = await Card({
          cardHolderName: req.body.cardHolderName,
          cardNumber: token.card.last4,
          expDate: date,
          cvv: token.card.cvc_check,
          default: req.body.default,
          user_id: req.user._id,
          customerId: customer.id,
          "transaction.tokenId": token.id,
          "transaction.amount": charge.amount,
          "transaction.description": charge.description
        });
        card.save();

        // const session = await stripe.checkout.sessions.create({
        //   line_items: [
        //     {
        //       price_data: {
        //         currency: 'usd',
        //         product_data: {
        //           name: 'T-shirt',
        //         },
        //         unit_amount: req.body.amount,
        //       },
        //       quantity: req.body.quantity,
        //     },
        //   ],
        //   mode: 'payment',
        //   success_url: 'https://example.com/success',
        //   cancel_url: 'https://example.com/cancel',
        // });

        // const newcard = await stripe.customers.createSource(
        //     'cus_MBlU0qEpPYY3sP',
        //     {source: 'tok_visa'}
        //   );

        return res.status(200).send({
          status: 1,
          message: "card added",
          card
        });
      }
    }
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

const getCard = async (req, res) => {
  try {
    const card = await Card.findById(req.body.cardNumber);

    if (!card) {
      return res.status(400).send("card not found");
    } else {
      return res.status(200).send({
        status: 1,
        message: "card",
        card,
      });
    }
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

const payment = async (req, res) => {
  try {
    const customer = await stripe.customers.create();

    const paymentIntent = await stripe.paymentIntents.create({
      customer: customer.id,
      setup_future_usage: "off_session",
      amount: 1099,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    const token = await stripe.tokens.create({
      card: {
        number: req.body.cardNumber,
        exp_month: req.body.exp_month,
        exp_year: req.body.exp_year,
        cvc: req.body.cvv,
      },
    });

    return res.status(200).send({
      status: 1,
      message: "payment",
      customer: customer.id
    });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};
module.exports = {
  addCard,
  getCard,
  payment,
};
