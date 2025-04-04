import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { UserAuthorContextObj } from '../../contexts/UserAuthorContext';
import { useNavigate } from 'react-router-dom';
import { Pencil, BookOpen, AlignLeft } from 'lucide-react';  // icons

import './PostArticle.css'; // Add new styles here

function PostArticle() {

  const { register, handleSubmit, formState: { errors } } = useForm();
  const { currentUser } = useContext(UserAuthorContextObj);
  const navigate = useNavigate();

  async function postArticle(articleObj) {
    console.log(articleObj);

    const authorData = {
      nameOfAuthor: currentUser.firstName,
      email: currentUser.email,
      profileImageUrl: currentUser.profileImageUrl
    };
    articleObj.authorData = authorData;

    articleObj.articleId = Date.now();

    let currentDate = new Date();
    articleObj.dateOfCreation = currentDate.getDate() + "-"
      + currentDate.getMonth() + "-"
      + currentDate.getFullYear() + " "
      + currentDate.toLocaleTimeString("en-US", { hour12: true });

    articleObj.dateOfModification = articleObj.dateOfCreation;

    articleObj.comments = [];
    articleObj.isArticleActive = true;

    let res = await axios.post('http://localhost:4000/author-api/article', articleObj);
    if (res.status === 201) {
      navigate(`/author-profile/${currentUser.email}/articles`);
    } 
  }

  return (
    <div className="post-article-container">
      <div className="post-article-card">
        <h2 className="post-article-title">
          <Pencil size={28} className="icon" />
          Write an Article
        </h2>

        <form onSubmit={handleSubmit(postArticle)} className="post-article-form">
          <div className="form-group">
            <label htmlFor="title">
              <BookOpen size={20} className="icon" /> Title
            </label>
            <input
              type="text"
              id="title"
              {...register("title")}
              placeholder="Enter article title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">
              <AlignLeft size={20} className="icon" /> Select a Category
            </label>
            <select {...register("category")} id="category" defaultValue="">
              <option value="" disabled>--categories--</option>
              <option value="programming">Programming</option>
              <option value="AI&ML">AI & ML</option>
              <option value="database">Database</option>
              <option value="Sport">Sport</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">
              <AlignLeft size={20} className="icon" /> Content
            </label>
            <textarea
              {...register("content")}
              id="content"
              rows="8"
              placeholder="Write your article here..."
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="submit" className="post-btn">Post</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostArticle;
