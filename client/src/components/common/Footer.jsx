import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h2>Let's Talk</h2>
        <p>"In the world of ideas, the journey is just as important as the destination."</p>
        <Link to="/" className="contact-button">Tell us about your project</Link>
        <div className="contact-info">
          <p><strong>Email:</strong> omkasar80@gmail.com</p>
        </div>
        <div className="social-icons">
          <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer">
            <FaTwitter className="social-icon" />
          </a>
          <a href="https://www.instagram.com/omkasar_027/" target="_blank" rel="noopener noreferrer">
            <FaInstagram className="social-icon" />
          </a>
          <a href="https://www.linkedin.com/in/om-kasar-630079323/" target="_blank" rel="noopener noreferrer">
            <FaLinkedinIn className="social-icon" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
