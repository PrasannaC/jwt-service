const express = require("express");
const app = express();
const router = express.Router();
const jwt = require("jsonwebtoken");

require("dotenv").config();
app.use(express.json());

async function getToken(payload, expiresIn, audience, issuer, subject) {
  if (!audience) audience = [];
  if (!issuer) issuer = "";
  if (!subject) subject = "";
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.SECRET,
      /*options*/
      {
        expiresIn,
        audience,
        issuer,
        subject,
      },
      (error, token) => {
        if (error) {
          reject(error);
        } else {
          resolve(token);
        }
      }
    );
  });
}

async function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET, (error, payload) => {
      if (error) {
        reject(error);
      } else {
        resolve(payload);
      }
    });
  });
}

router.get("/getToken", async (req, res) => {
  console.log("Generating token");

  const { userId } = req.query;

  // Negative case handling
  if (!userId) {
    res.status(500);
    res.json({
      message: "Invalid params.",
    });
  } else {
    try {
      // calling the async function to create a token
      let token = await getToken(
        {
          userId,
        },
        process.env.EXPIRES_IN
      );

      console.log(token);
      res.status(200);
      res.contentType("application/json");
      res.send(token);

    } catch (error) {
      console.log(error);
      
      res.status(500);
      res.json({
        message: error,
      });
    }
  }
});

router.post("/verifyToken", async (req, res) => {
  try {
    let { token } = req.body;

    // Negative case handling
    if (!token) {
      res.status(500);
      res.json({
        message: "Invalid params.",
      });
    } else {
      // calling the async function to verify
      let payload = await verifyToken(token);
      res.status(200);
      res.contentType("application/json");
      res.send(payload);
    }
  } catch (error) {
    console.log(error);
    
    res.status(500);
    res.json({
      message: error,
    });
  }
});

app.use("/", router);

const port = process.env.PORT || process.env.PORT_fallback;
app.listen(port, () => console.log(`Started on port: ${port}`));
