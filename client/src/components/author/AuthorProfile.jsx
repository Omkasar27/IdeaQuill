import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { FileText, PlusCircle } from 'lucide-react'
import './AuthorProfile.css'

function AuthorProfile() {
  return (
    <div className="author-profile">
      <div className="author-profile-nav">
        <NavLink 
          to='articles' 
          className={({ isActive }) => 
            `profile-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <FileText size={20} />
          Articles
        </NavLink>

        <NavLink 
          to='article' 
          className={({ isActive }) => 
            `profile-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <PlusCircle size={20} />
          Add New Article
        </NavLink>
      </div>

      <div className="author-profile-content">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthorProfile;