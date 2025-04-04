import React from "react";
import { SignUp } from "@clerk/clerk-react";
import "./siginup.css";

function Signup() {
  return (
    <div className="signup-container">
      <SignUp 
        appearance={{
          elements: {
            card: { 
              boxShadow: "0px 5px 18px rgba(0, 0, 0, 0.12)", 
              borderRadius: "12px" 
            },
            rootBox: { maxWidth: "400px" }
          }
        }} 
      />
    </div>
  );
}

export default Signup;
