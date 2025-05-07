import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import ProtectedLayout from "./layouts/ProtectedLayout";
import Landing from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";
import JournalPage from "./pages/JournalPage";
import HomePage from "./pages/Home"
import LibraryPage from "./pages/LibraryPage";
import ViewCategoryPage from "./pages/ViewCategoryPage";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route — No layout */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Public Routes with layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          {/* add more public routes if needed */}
        </Route>

        {/* Protected Routes with layout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/library/category/:categoryId" element={<ViewCategoryPage />} />
          {/* other private routes */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
