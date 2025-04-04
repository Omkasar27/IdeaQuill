import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import './Articles.css';

function Articles() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();
  const { getToken } = useAuth();

  async function getArticles() {
    const token = await getToken();
    try {
      let res = await axios.get('http://localhost:4000/author-api/articles', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.message === 'articles') {
        setArticles(res.data.payload);
        setFilteredArticles(res.data.payload);
        setError('');
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('Error fetching articles');
    }
  }

  function gotoArticleById(articleObj) {
    navigate(`../${articleObj.articleId}`, { state: articleObj });
  }

  useEffect(() => {
    getArticles();
  }, []);

  useEffect(() => {
    let filtered = articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (category === '' || article.category === category)
    );
    setFilteredArticles(filtered);
  }, [searchTerm, category, articles]);

  return (
    <div className='container'>
      {error && <p className='error'>{error}</p>}
      <div className='filters'>
        <input 
          type='text' 
          placeholder='Search by title...' 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
        />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value=''>All Categories</option>
          {[...new Set(articles.map(article => article.category))].map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className='articles-grid'>
        {filteredArticles.map((articleObj) => (
          <div className='card' key={articleObj.articleId}>
            <div className='card-body'>
              <div className='author-details'>
                {/* <img src={articleObj.authorData?.profileImageUrL} className='author-img' alt='' /> */}
                {/* <p className='author-name'>{articleObj.authorData.nameOfAuthor}</p> */}
              </div>
              <h5 className='card-title'>{articleObj.title}</h5>
              <p className='card-text'>{articleObj.content.substring(0, 80)}...</p>
              <button className='read-more' onClick={() => gotoArticleById(articleObj)}>
                Read more
              </button>
            </div>
            <div className='card-footer'>
              <small>Last updated on {articleObj.dateOfModification}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Articles;