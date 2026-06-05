import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { useUser } from "./hooks/useUser";

export default function App() {
  const { isModerator } = useUser();

  useEffect(() => {
    const darkMode = localStorage.getItem("madalDarkMode") === "true";
    document.documentElement.classList.toggle("dark", darkMode);
  }, []);

  if (isModerator) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="md:ml-64">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
