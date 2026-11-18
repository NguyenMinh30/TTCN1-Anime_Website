// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Favorites from "./components/Favorites";
import Policy from "./pages/Policy";
import "./App.css";

import Home from "./components/Home";
import AnimeDetail from "./components/anime-detail";
import Historys from "./components/Historys";
import Login from "./components/Login";
import Signup from "./components/signup";
import Watching from "./components/anime-watching";
import AdminAnime from "./pages/AdminAnime";
import Premium from "./pages/Premium";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminAnime />} />
        <Route path="/anime/:id" element={<AnimeDetail />} />
        <Route path="/anime-watching/:id/:ep" element={<Watching />} />
        <Route path="/historys" element={<Historys />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/anime" element={<AdminAnime />} />
        <Route path="/policy" element={<Policy />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/premium" element={<Premium />} />
      </Routes>
    </Router>
  );
}

export default App;