const router = require('express').Router();
const bcrypt = require('bcryptjs');

const { insertNewUser, userSchema, validateUser, getUserByEmail, getUserByID } = require('../models/user');
const { generateAuthToken, requireAuth, checkAdmin, extractUserFromJWT } = require('../lib/auth');
const { extractValidFields, validateAgainstSchema } = require('../lib/validation');


router.post('/', extractUserFromJWT, async (req, res, next) => {
  if (validateAgainstSchema(req.body, userSchema)) {
    try {
      const userToInsert = extractValidFields(req.body, userSchema);
      const user = await getUserByEmail(req.userEmail, false);

      let insertNeedsAdmin = false;
      let userIsAdmin = false;
      if(userToInsert.role == "admin" || userToInsert.role == "instructor") {
        insertNeedsAdmin = true;
        if (user != null) {
          userIsAdmin = await checkAdmin(user.id);
        }
      }

      if(!insertNeedsAdmin || userIsAdmin) {
        const passwordHash = await bcrypt.hash(userToInsert.password, 8);
        userToInsert.password = passwordHash;

        const id = await insertNewUser(userToInsert);
        res.status(201).send({
          id: id
        });
      }
      else {
        res.status(403).send({
          error: "The request was not made by an authenticated User satisfying the authorization criteria."
        });
      }
    } catch (err) {
      console.error("  -- Error:", err);
      res.status(500).send({
        error: "Error inserting new user.  Try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "The request body was either not present or did not contain a valid User object."
    });
  }
});

router.post('/login', async (req, res) => {
  if (req.body && req.body.email && req.body.password) {
    try {
      const authenticated = await validateUser(req.body.email, req.body.password);
      if (authenticated) {
        const token = generateAuthToken(req.body.email);
        res.status(200).send({
          token: token
        });
      } else {
        res.status(401).send({
          error: "Invalid credentials"
        });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({
        error: "Error validating user with db. Try again later."
      });
    }
  } else {
    res.status(400).send({
      error: "Request body was invalid"
    });
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const user = await getUserByEmail(req.userEmail, false);
    let userIsAdmin = false;
    if (user.role == "admin") {
      userIsAdmin = true;
    }

    if (user.id == req.params.id || userIsAdmin) {
      const returnUser = await getUserByID(req.params.id, false);
      if (returnUser) {
        let response = {};
        response.user = returnUser;
        if (returnUser.role == "instructor") {
          response.courses = "Placeholder";
        }
        else if (returnUser.role == "student") {
          response.courses = "Placeholder";
        }
        res.status(200).send(response);
      } else {
        next();
      }
    }    
    else {
      res.status(401).send({
        error: "Invalid credentials"
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({
      error: "Unable to fetch user.  Please try again later."
    });
  }
})



module.exports = router;