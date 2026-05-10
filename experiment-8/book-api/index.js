const express = require('express');
const app = express();
app.use(express.json());

// ── In-memory data store ──────────────────────────
let books  = [];
let nextId = 1;

// ── GET all books ─────────────────────────────────
app.get('/books', (req, res) => {
  res.json({
    success: true,
    count: books.length,
    data: books
  });
});

// ── GET one book by ID ────────────────────────────
app.get('/books/:id', (req, res) => {
  const book = books.find(b => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ success: false, error: 'Book not found' });
  res.json({ success: true, data: book });
});

// ── POST create a new book ────────────────────────
app.post('/books', (req, res) => {
  const { bookid, bookname, bookauthor, year } = req.body;

  if (!bookname) return res.status(400).json({ success: false, error: 'bookname is required' });
  if (!bookauthor) return res.status(400).json({ success: false, error: 'bookauthor is required' });

  const newBook = { id: nextId++, bookid, bookname, bookauthor, year };
  books.push(newBook);
  res.status(201).json({ success: true, data: newBook });
});

// ── PUT update a book ─────────────────────────────
app.put('/books/:id', (req, res) => {
  const index = books.findIndex(b => b.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, error: 'Book not found' });

  const { bookid, bookname, bookauthor, year } = req.body;
  books[index] = { ...books[index], bookid, bookname, bookauthor, year };
  res.json({ success: true, data: books[index] });
});

// ── DELETE a book ─────────────────────────────────
app.delete('/books/:id', (req, res) => {
  const index = books.findIndex(b => b.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, error: 'Book not found' });

  const deleted = books.splice(index, 1)[0];
  res.json({ success: true, message: `Book "${deleted.bookname}" deleted` });
});

// ── Root welcome route ────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'Book Collection API',
    endpoints: {
      'GET    /books'      : 'Get all books',
      'GET    /books/:id'  : 'Get one book',
      'POST   /books'      : 'Create a book',
      'PUT    /books/:id'  : 'Update a book',
      'DELETE /books/:id'  : 'Delete a book',
    }
  });
});

// ── Start server ──────────────────────────────────
app.listen(3000, () => console.log('Server running on http://localhost:3000'));