import { useContext, useEffect, useState } from "react";
import { UserAuthorContextObj } from "../../contexts/UserAuthorContext";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  Globe,
  FileEdit,
  Shield,
  Share2,
  Rocket,
  Database,
  Code2,
  Layers,
  Hexagon,
  Pen,
  User,
  ShieldCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import "./Home.css"; // Import the CSS file

function Home() {
  const { currentUser, setCurrentUser } = useContext(UserAuthorContextObj);
  const { isSignedIn, user, isLoaded } = useUser();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function onSelectRole(role) {
    // Clear error property
    setError("");
    setIsLoading(true);
    
    const selectedRole = role;
    
    try {
      let res = null;
      
      if (selectedRole === "author") {
        res = await axios.post(
          "https://ideaquill-1.onrender.com/author-api/author",
          {...currentUser, role: selectedRole}
        );
        let { message, payload } = res.data;
        if (message === "author") {
          if (!payload.isActive) {
            setError("Your Account is blocked by Admin");
            setIsLoading(false);
            return; // Don't update currentUser if blocked
          } else {
            // Only set the role and save to localStorage if account is active
            setCurrentUser({ ...currentUser, ...payload, role: selectedRole });
            // Save user to localstorage
            localStorage.setItem("currentuser", JSON.stringify({...payload, role: selectedRole}));
          }
        } else {
          setError(message);
        }
      }

      if (selectedRole === "user") {
        res = await axios.post(
          "https://ideaquill-1.onrender.com/user-api/user",
          {...currentUser, role: selectedRole}
        );
        let { message, payload } = res.data;
        if (message === "user") {
          if (!payload.isActive) {
            setError("Your Account is blocked by Admin");
            setIsLoading(false);
            return; // Don't update currentUser if blocked
          } else {
            // Only set the role and save to localStorage if account is active
            setCurrentUser({ ...currentUser, ...payload, role: selectedRole });
            // Save user to localstorage
            localStorage.setItem("currentuser", JSON.stringify({...payload, role: selectedRole}));
          }
        } else {
          setError(message);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  // Check for admin status when user signs in
  useEffect(() => {
    if (isSignedIn === true && isLoaded) {
      const userData = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0].emailAddress,
        profileImageUrl: user.imageUrl,
      };
      
      // Update current user with basic info
      setCurrentUser({
        ...currentUser,
        ...userData
      });
      
      // Check if user is admin
      const checkAdminStatus = async () => {
        setIsLoading(true);
        try {
          // Since your backend expects a POST request with the email in the body
          const res = await axios.post(
            "https://ideaquill-1.onrender.com/admin-api/check-admin",
            { email: userData.email }  // Send email in request body
          );
          
          let { message, payload } = res.data;
          if (message === "Admin") {
            setCurrentUser({ ...currentUser, ...payload, role: "admin" });
            // Save user to localstorage
            localStorage.setItem("currentuser", JSON.stringify({...payload, role: "admin"}));
            navigate(`/admin-profile/${userData.email}`);
          }
        } catch (err) {
          console.log("Not an admin user, showing role selection:", err.message);
          // Not an admin, so we'll show the role selection component
          // No need to set error here as this is an expected flow
        } finally {
          setIsLoading(false);
        }
      };
      
      checkAdminStatus();
    }
  }, [isLoaded, isSignedIn]);

  // Navigate based on role only if there's no error
  useEffect(() => {
    if (error.length === 0) {
      if (currentUser?.role === "user") {
        navigate(`/user-profile/${currentUser.email}`);
      }
      if (currentUser?.role === "author") {
        navigate(`/author-profile/${currentUser.email}`);
      }
    }
  }, [currentUser, error, navigate]);

  return (
    <div className="container">
      {isSignedIn === false && (
        <div className="home-wrapper">
          <div className="hero-section">
            <div className="hero-content">
              <div className="hero-text">
                <h1 className="hero-title">
                  Empowering Content Creators
                  <span className="hero-subtitle">
                    A Comprehensive Platform for Writers, Developers, and
                    Innovators
                  </span>
                </h1>

                <div className="hero-stats">
                  <div className="stat-item">
                    <Users className="stat-icon" />
                    <div>
                      <span>Active Users</span>
                    </div>
                  </div>
                  <div className="stat-item">
                    <FileText className="stat-icon" />
                    <div>
                      <span>Published Articles</span>
                    </div>
                  </div>
                </div>

                <div className="hero-cta">
                  <Link to="/signup" className="primary-button">
                    Get Started
                  </Link>
                  <Link to="/signin" className="secondary-button">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="features-section">
            <h2 className="section-title">Platform Highlights</h2>
            <div className="features-grid">
              <div className="feature-card">
                <FileEdit className="feature-icon" />
                <h3>Seamless Writing</h3>
                <p>
                  Intuitive editor with markdown support and real-time
                  collaboration
                </p>
              </div>
              <div className="feature-card">
                <Shield className="feature-icon" />
                <h3>Secure Publishing</h3>
                <p>Advanced access controls and content management system</p>
              </div>
              <div className="feature-card">
                <Share2 className="feature-icon" />
                <h3>Community Driven</h3>
                <p>
                  Connect with writers, developers, and thought leaders globally
                </p>
              </div>
            </div>
          </div>

          <div className="tech-stack-section">
            <h2 className="section-title">Powered By</h2>
            <div className="tech-logos">
              <div className="tech-logo">
                <Database className="logo-icon" />
                <span>MongoDB</span>
              </div>
              <div className="tech-logo">
                <Code2 className="logo-icon" />
                <span>Express.js</span>
              </div>
              <div className="tech-logo">
                <Layers className="logo-icon" />
                <span>React</span>
              </div>
              <div className="tech-logo">
                <Hexagon className="logo-icon" />
                <span>Node.js</span>
              </div>
            </div>
          </div>
        </div>
      )}

{isSignedIn === true && (
  <div className="authenticated-section">
    {isLoading ? (
      <div className="loading-spinner">
        <p>Checking account status...</p>
        <div className="spinner"></div>
      </div>
    ) : (
      <>
        <div className="profile-card">
          <img
            src={user.imageUrl}
            className="profile-image"
            alt="User profile"
          />
          <p className="user-name">{user.firstName} {user.lastName}</p>
          <p className="user-email">{user.emailAddresses[0].emailAddress}</p>
        </div>

        <p className="role-title">Select your role</p>

        {error.length !== 0 && <p className="error-message">{error}</p>}

        <div className="role-cards">
          <div
            className={`role-card ${
              currentUser?.role === "author" && error.length === 0 ? "selected" : ""
            }`}
            onClick={() => onSelectRole("author")}
          >
            <div className="role-icon author-icon">
              <Pen size={28} />
            </div>
            <h3 className="role-name">Author</h3>
            <p className="role-description">
              Create and publish content for readers
            </p>
          </div>

          <div
            className={`role-card ${
              currentUser?.role === "user" && error.length === 0 ? "selected" : ""
            }`}
            onClick={() => onSelectRole("user")}
          >
            <div className="role-icon user-icon">
              <User size={28} />
            </div>
            <h3 className="role-name">User</h3>
            <p className="role-description">
              Browse and enjoy published content
            </p>
          </div>
        </div>
      </>
    )}
  </div>
)}
    </div>
  );
}

export default Home;
