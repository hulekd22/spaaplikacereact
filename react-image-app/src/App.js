import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from 'axios';

const API_URL = "https://spaaplikacereact.onrender.com"; // Upravte podle URL serveru po nasazení

function Register({ setUser }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/register`, formData);
      alert(response.data);
      if (response.status === 200) {
        setUser(formData.username);
        navigate("/dashboard");
      }
    } catch (error) {
      alert(error.response.data);
    }
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
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/login`, formData);
      alert(response.data);
      if (response.status === 200) {
        setUser(formData.username);
        navigate("/dashboard");
      }
    } catch (error) {
      alert(error.response.data);
    }
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
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState([]);
 
  useEffect(() => {
    const fetchImages = async () => {
      const response = await axios.get(`${API_URL}/images`);
      setImages(response.data);
    };
 
    fetchImages();
  }, []);
 
  const handleAddImage = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/addImage`, { username: user, imageUrl });
      alert(response.data);
      setImages([...images, { username: user, imageUrl }]);
    } catch (error) {
      alert(error.response.data);
    }
  };
 
  const handleDeleteImage = async (image) => {
    try {
      const response = await axios.post(`${API_URL}/deleteImage`, { username: user, imageUrl: image.imageUrl });
      alert(response.data);
      setImages(images.filter(img => img.imageUrl !== image.imageUrl));
    } catch (error) {
      alert(error.response.data);
    }
  };
 
  return (
    <div>
      <h2>Vítej, {user}!</h2>
      <form onSubmit={handleAddImage}>
        <input
          type="text"
          placeholder="URL obrázku"
          onChange={(e) => setImageUrl(e.target.value)}
          required
        />
        <button type="submit">Přidat obrázek</button>
      </form>
      <h3>Obrázky</h3>
      <ul>
        {images.map((image, index) => (
          <li key={index}>
            {image.username}: <img src={image.imageUrl} alt="obrázek" style={{ maxWidth: "200px" }} />
            {user === image.username && <button onClick={() => handleDeleteImage(image)}>Smazat</button>}
          </li>
        ))}
      </ul>
    </div>
  );
}
 
// ... Další komponenty (Login, Dashboard) jsou podobně upravené s použitím `${API_URL}` místo `http://localhost:5000`

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
