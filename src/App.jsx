import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import ProtectedLayout from "./layouts/ProtectedLayout";
import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
//import Home from "./pages/Home";
import Profile from "./pages/Profile";
//import AddBook from "./pages/AddBook";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<AuthPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedLayout />}>
          {/* <Route path="/home" element={<Home />} /> */}
          <Route path="/profile" element={<Profile />} />
          {/* <Route path="/add" element={<AddBook />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
