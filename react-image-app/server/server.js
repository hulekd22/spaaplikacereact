const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )
`);

db.query(`
  CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL,
    imageUrl TEXT NOT NULL
  )
`);

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length > 0) {
      return res.status(400).send('Uživatel už existuje');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, hashedPassword]);
    res.send('Registrace úspěšná');
  } catch (error) {
    res.status(500).send('Registrace selhala');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = result.rows[0];
    if (!user) {
      return res.status(400).send('Špatné jméno nebo heslo');
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).send('Špatné jméno nebo heslo');
    }
    res.send('Přihlášení úspěšné');
  } catch (error) {
    res.status(500).send('Přihlášení selhalo');
  }
});

app.post('/addImage', async (req, res) => {
  const { username, imageUrl } = req.body;
  try {
    await db.query("INSERT INTO images (username, imageUrl) VALUES ($1, $2)", [username, imageUrl]);
    res.send('Obrázek přidán');
  } catch (error) {
    res.status(500).send('Přidání obrázku selhalo');
  }
});

app.get('/images', async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM images");
    res.send(result.rows);
  } catch (error) {
    res.status(500).send('Načítání obrázků selhalo');
  }
});

app.post('/deleteImage', async (req, res) => {
  const { username, imageUrl } = req.body;
  try {
    const result = await db.query("DELETE FROM images WHERE username = $1 AND imageUrl = $2", [username, imageUrl]);
    if (result.rowCount === 0) {
      return res.status(400).send('Obrázek nenalezen');
    }
    res.send('Obrázek smazán');
  } catch (error) {
    res.status(500).send('Mazání obrázku selhalo');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
});
