import React from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import './Header.css';
import logo from '../../assets/icons.svg'; // Adjust the path as necessary

const Header = () => (
  <header className="header">
    <div className="logo">
      <Link to="/" className="logo-link">
        <img src={logo} alt="IdeaQuill Logo" className="logo-image" />
        <span className="logo-text">IdeaQuill</span>
      </Link>
    </div>
    <nav className="nav-links">
      <SignedOut>
        <Link to="/" className="nav-item">Home</Link>
        <Link to="/signin" className="nav-item">Sign In</Link>
        <Link to="/signup" className="nav-item">Sign Up</Link>
      </SignedOut>

      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </nav>
  </header>
);

export default Header;