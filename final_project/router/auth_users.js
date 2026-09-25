const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

// In-memory user store shared with general.js (same array reference)
let users = [];

const isValid = (username) => {
  return users.filter((user) => user.username === username).length > 0;
};

const authenticatedUser = (username, password) => {
  return users.filter((user) => user.username === username && user.password === password).length > 0;
};

const regd_users = express.Router();

// Task 8: Login as a registered user
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Task 9: Add or modify a book review (authenticated)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!review) {
    return res.status(400).json({ message: "Review text is required as a query parameter" });
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: `The review for ISBN ${isbn} has been added/updated`,
    reviews: books[isbn].reviews
  });
});

// Task 10: Delete a book review (authenticated, own review only)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (books[isbn] && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: `The review for ISBN ${isbn} has been deleted` });
  } else {
    return res.status(404).json({ message: "No review by this user found for the given ISBN" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;