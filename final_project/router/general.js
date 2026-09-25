const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();
const BASE_URL = "http://localhost:5000"; // adjust if your server runs elsewhere

// Task 7: Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username, password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Task 2: Get the full book list
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 3: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(books[isbn]);
  }
  return res.status(404).json({ message: "Book not found" });
});

// Task 4: Get book(s) based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const matches = Object.values(books).filter(b => b.author === author);
  return res.status(200).send(matches);
});

// Task 5: Get book(s) based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const matches = Object.values(books).filter(b => b.title === title);
  return res.status(200).send(matches);
});

// Task 6: Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(books[isbn].reviews);
  }
  return res.status(404).json({ message: "Book not found" });
});

/* ------------------------------------------------------------------
   TASK 11 — Async/await + Promise implementations using Axios.
   These call the routes above over HTTP, demonstrating non-blocking
   retrieval. They are separate from the route handlers themselves.
------------------------------------------------------------------ */

// Get all books — async/await
async function getAllBooks() {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log("All books:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching all books:", error.message);
    throw error;
  }
}

// Search by ISBN — Promise callbacks (.then/.catch)
function getBookByISBN(isbn) {
  return axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then((response) => {
      console.log(`Book with ISBN ${isbn}:`, response.data);
      return response.data;
    })
    .catch((error) => {
      console.error(`Error fetching ISBN ${isbn}:`, error.message);
      throw error;
    });
}

// Search by Author — async/await
async function getBookByAuthor(author) {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    console.log(`Books by ${author}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching books by ${author}:`, error.message);
    throw error;
  }
}

// Search by Title — async/await
async function getBookByTitle(title) {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    console.log(`Books titled "${title}":`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching books titled "${title}":`, error.message);
    throw error;
  }
}

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBookByAuthor = getBookByAuthor;
module.exports.getBookByTitle = getBookByTitle;