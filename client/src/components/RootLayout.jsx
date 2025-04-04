import React from "react";
import Header from "./common/Header.jsx";
import Footer from "./common/Footer.jsx";
import { Outlet } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import "./RootLayout.css"; // Import the CSS file
import {neobrutalism}  from '@clerk/themes';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

function RootLayout() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} appearance={{
      baseTheme: neobrutalism,
    }}>
      <div className="root-layout">
        <Header />
        <div className="main-content">
          <Outlet />
        </div>
      </div>
      <Footer />
    </ClerkProvider>
  );
}

export default RootLayout;
