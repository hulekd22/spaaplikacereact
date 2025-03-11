import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

function Register({ setUser }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Načtení existujících uživatelů
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Kontrola, zda uživatel existuje
    if (users.some((user) => user.username === formData.username)) {
      alert("Uživatel už existuje!");
      return;
    }

    // Přidání nového uživatele
    users.push(formData);
    localStorage.setItem("users", JSON.stringify(users));
    alert("Registrace úspěšná!");

    setUser(formData.username);
    navigate("/dashboard");
  };

  return (
    <div>
      <h2>Registrace</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Uživatelské jméno"
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Heslo"
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <button type="submit">Registrovat</button>
      </form>
    </div>
  );
}

function Login({ setUser }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Načtení uživatelů
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Ověření přihlašovacích údajů
    const user = users.find((u) => u.username === formData.username && u.password === formData.password);
    if (!user) {
      alert("Špatné jméno nebo heslo!");
      return;
    }

    alert("Přihlášení úspěšné!");
    setUser(formData.username);
    navigate("/dashboard");
  };

  return (
    <div>
      <h2>Přihlášení</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Uživatelské jméno"
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Heslo"
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <button type="submit">Přihlásit</button>
      </form>
    </div>
  );
}

function Dashboard({ user }) {
  return <h2>Vítej, {user}!</h2>;
}

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="App">
        <nav>
          <Link to="/register">Registrace</Link> | <Link to="/login">Přihlášení</Link>
        </nav>
        <Routes>
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Login setUser={setUser} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
