const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findBy, add } = require('../users/users-model');

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    }

    const existingUser = await findBy({ username });
    if (existingUser) {
      return res.status(400).json({ message: "username taken" });
    }

    const hash = bcrypt.hashSync(password, 8);
    const newUser = await add({ username, password: hash });
    
    res.status(201).json(newUser);
    
  } catch (err) {
    res.status(500).json({ message: "Error registering user" });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
    }

    const user = await findBy({ username });
    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const passwordValid = bcrypt.compareSync(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || "shh",
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: `welcome, ${user.username}`,
      token: token
    });
    
  } catch (err) {
    res.status(500).json({ message: "Error logging in" });
  }
});

module.exports = router;