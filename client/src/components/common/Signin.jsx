import React from "react";
import { SignIn } from "@clerk/clerk-react";
import "./sigin.css"; // Import external styles

function Signin() {
  return (
    <div className="signin-container">
      
        <SignIn />
      </div>
 
  );
}

export default Signin;
