const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

const app = express();
app.use(bodyParser.json());
app.use(cors());

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, imageUrl TEXT)");
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, row) => {
    if (row) {
      return res.status(400).send('Uživatel už existuje');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], (err) => {
      if (err) {
        return res.status(500).send('Registrace selhala');
      }
      res.send('Registrace úspěšná');
    });
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, row) => {
    if (!row) {
      return res.status(400).send('Špatné jméno nebo heslo');
    }

    const isValid = await bcrypt.compare(password, row.password);
    if (!isValid) {
      return res.status(400).send('Špatné jméno nebo heslo');
    }
    res.send('Přihlášení úspěšné');
  });
});

app.post('/addImage', (req, res) => {
  const { username, imageUrl } = req.body;
  db.run("INSERT INTO images (username, imageUrl) VALUES (?, ?)", [username, imageUrl], (err) => {
    if (err) {
      return res.status(500).send('Přidání obrázku selhalo');
    }
    res.send('Obrázek přidán');
  });
});

app.get('/images', (req, res) => {
  db.all("SELECT * FROM images", [], (err, rows) => {
    if (err) {
      return res.status(500).send('Načítání obrázků selhalo');
    }
    res.send(rows);
  });
});

app.post('/deleteImage', (req, res) => {
  const { username, imageUrl } = req.body;
  db.run("DELETE FROM images WHERE username = ? AND imageUrl = ?", [username, imageUrl], function (err) {
    if (err) {
      return res.status(500).send('Mazání obrázku selhalo');
    }
    if (this.changes === 0) {
      return res.status(400).send('Obrázek nenalezen');
    }
    res.send('Obrázek smazán');
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
