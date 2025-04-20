import { useContext, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { UserAuthorContextObj } from '../../contexts/UserAuthorContext'
import { Pencil, Trash2, Undo } from 'lucide-react'
import { useForm } from 'react-hook-form'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import './ArticleByID.css'

function ArticleByID() {
    const { state } = useLocation()
    const { currentUser } = useContext(UserAuthorContextObj)
    const [editArticleStatus, setEditArticleStatus] = useState(false)
    const { register, handleSubmit } = useForm()
    const navigate = useNavigate()
    const { getToken } = useAuth()
    const [currentArticle, setCurrentArticle] = useState(state)
    const [commentStatus, setCommentStatus] = useState('')
    const [unauthorized, setUnauthorized] = useState(false)

    // The critical check: Is the current user the EXACT SAME author who created this article?
    const isArticleAuthor = 
        currentUser?.role === 'author' && 
        currentUser?.userId === state?.authorData?.authorId

    // Force disable edit mode and show error if unauthorized edit is attempted
    useEffect(() => {
        if (editArticleStatus && !isArticleAuthor) {
            setEditArticleStatus(false)
            setUnauthorized(true)
            setTimeout(() => setUnauthorized(false), 3000) // Clear error after 3 seconds
        }
    }, [editArticleStatus, isArticleAuthor])

    function enableEdit() {
        // STRICT permission check - only the original author can edit
        if (isArticleAuthor) {
            setEditArticleStatus(true)
        } else {
            setUnauthorized(true)
            setTimeout(() => setUnauthorized(false), 3000) // Clear error after 3 seconds
        }
    }

    async function onSave(modifiedArticle) {
        // Double-check permissions before saving
        if (!isArticleAuthor) {
            setUnauthorized(true)
            setTimeout(() => setUnauthorized(false), 3000)
            return
        }

        const articleAfterChanges = { ...state, ...modifiedArticle }
        const token = await getToken()
        const currentDate = new Date()
        articleAfterChanges.dateOfModification = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`

        try {
            let res = await axios.put(
                `https://ideaquill-1.onrender.com/author-api/article/${articleAfterChanges.articleId}`,
                articleAfterChanges,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (res.data.message === 'article modified') {
                setEditArticleStatus(false)
                navigate(`/author-profile/articles/${state.articleId}`, { state: res.data.payload })
            }
        } catch (error) {
            console.error("Error updating article:", error)
        }
    }

    async function addComment(commentObj) {
        commentObj.nameOfUser = currentUser.firstName
        try {
            let res = await axios.put(
                `https://ideaquill-1.onrender.com/user-api/comment/${currentArticle.articleId}`,
                commentObj
            )
            if (res.data.message === 'comment added') {
                setCommentStatus('Comment added successfully')
                // Reset comment form by clearing the fields
                document.querySelector('.comment-form').reset()
                
                // Update article with new comments if the API returned updated data
                if (res.data.payload) {
                    setCurrentArticle(res.data.payload)
                } else {
                    // If no updated article data returned, manually add the comment to the state
                    const updatedArticle = {...currentArticle}
                    if (!updatedArticle.comments) {
                        updatedArticle.comments = []
                    }
                    updatedArticle.comments.push({
                        nameOfUser: currentUser.firstName,
                        comment: commentObj.comment
                    })
                    setCurrentArticle(updatedArticle)
                }
                
                // Clear status message after 3 seconds
                setTimeout(() => setCommentStatus(''), 3000)
            }
        } catch (error) {
            setCommentStatus('Failed to add comment')
            setTimeout(() => setCommentStatus(''), 3000)
        }
    }

    async function deleteArticle() {
        // Only the original author can delete
        if (!isArticleAuthor) {
            setUnauthorized(true)
            setTimeout(() => setUnauthorized(false), 3000)
            return
        }

        try {
            const token = await getToken()
            const updatedState = { ...state, isArticleActive: false }
            
            let res = await axios.put(
                `https://ideaquill-1.onrender.com/author-api/articles/${state.articleId}`,
                updatedState,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            
            if (res.data.message === 'article deleted or restored') {
                setCurrentArticle(res.data.payload)
            }
        } catch (error) {
            console.error("Error deleting article:", error)
        }
    }

    async function restoreArticle() {
        // Only the original author can restore
        if (!isArticleAuthor) {
            setUnauthorized(true)
            setTimeout(() => setUnauthorized(false), 3000)
            return
        }

        try {
            const token = await getToken()
            const updatedState = { ...state, isArticleActive: true }
            
            let res = await axios.put(
                `https://ideaquill-1.onrender.com/author-api/articles/${state.articleId}`,
                updatedState,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            
            if (res.data.message === 'article deleted or restored') {
                setCurrentArticle(res.data.payload)
            }
        } catch (error) {
            console.error("Error restoring article:", error)
        }
    }

    // Display content or edit form based on edit status
    // Only the article author will ever get editArticleStatus=true due to the strict checks
    return (
        <div className="article-container">
            {/* Unauthorized action notification */}
            {unauthorized && (
                <div className="unauthorized-banner">
                    You are not authorized to edit this article. Only the original author can modify it.
                </div>
            )}
            
            {!editArticleStatus ? (
                <>
                    {/* Header Section */}
                    <div className="article-header">
                        <div className="article-header-left">
                            <h1 className="article-title">{state.title}</h1>
                            <div className="article-meta">
                                <span className="meta-date">Created: {state.dateOfCreation}</span>
                                <span className="meta-divider">|</span>
                                <span className="meta-date">Modified: {state.dateOfModification}</span>
                                <span className="meta-divider">|</span>
                                <span className="meta-category">{state.category}</span>
                            </div>

                            <div className="article-author">
                                {state.authorData.profileImageUrl && (
                                    <img 
                                        src={state.authorData.profileImageUrl} 
                                        alt="Author" 
                                        className="author-avatar"
                                    />
                                )}
                                <p className="article-author-name">By {state.authorData.nameOfAuthor}</p>
                                {isArticleAuthor && (
                                    <span className="author-badge">You are the author</span>
                                )}
                            </div>
                        </div>

                        {/* Actions (Edit/Delete/Restore) - ONLY displayed to original author */}
                        {isArticleAuthor && (
                            <div className="article-actions">
                                <button 
                                    className="action-button edit-button" 
                                    onClick={enableEdit} 
                                    title="Edit article"
                                >
                                    <Pencil size={18} />
                                    <span>Edit</span>
                                </button>
                                
                                {state.isArticleActive ? (
                                    <button 
                                        className="action-button delete-button" 
                                        onClick={deleteArticle}
                                        title="Delete article"
                                    >
                                        <Trash2 size={18} />
                                        <span>Delete</span>
                                    </button>
                                ) : (
                                    <button 
                                        className="action-button restore-button" 
                                        onClick={restoreArticle}
                                        title="Restore article"
                                    >
                                        <Undo size={18} />
                                        <span>Restore</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Status indicator for deleted articles */}
                    {!state.isArticleActive && isArticleAuthor && (
                        <div className="article-status-banner">
                            This article has been deleted and is only visible to you as the author.
                        </div>
                    )}

                    {/* Content Section */}
                    <div className="article-content">
                        <p style={{ whiteSpace: 'pre-line' }}>{state.content}</p>
                    </div>

                    {/* Comments Section */}
                    <div className="comments-section">
                        <h3 className="comments-title">Comments ({state.comments?.length || 0})</h3>
                        
                        {!state.comments || state.comments.length === 0 ? (
                            <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
                        ) : (
                            <div className="comments-list">
                                {state.comments.map((commentObj, index) => (
                                    <div key={commentObj._id || index} className="comment-block">
                                        <div className="comment-header">
                                            <p className="user-name">{commentObj.nameOfUser}</p>
                                        </div>
                                        <p className="comment-text">{commentObj.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {commentStatus && (
                            <div className={`comment-status ${commentStatus.includes('Failed') ? 'error' : 'success'}`}>
                                {commentStatus}
                            </div>
                        )}

                        {currentUser.role === 'user' && (
                            <form onSubmit={handleSubmit(addComment)} className="comment-form">
                                <textarea 
                                    {...register("comment", { required: true })} 
                                    placeholder="Share your thoughts..." 
                                    className="comment-input"
                                />
                                <button type="submit" className="comment-submit-btn">Post Comment</button>
                            </form>
                        )}
                    </div>
                </>
            ) : (
                <form onSubmit={handleSubmit(onSave)} className="edit-article-form">
                    <h2 className="form-title">Edit Article</h2>
                    
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input 
                            type="text" 
                            id="title"
                            defaultValue={state.title} 
                            {...register("title", { required: true })} 
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select 
                            id="category"
                            {...register("category")} 
                            defaultValue={state.category}
                            className="form-control"
                        >
                            <option value="programming">Programming</option>
                            <option value="AI&ML">AI & Machine Learning</option>
                            <option value="database">Database</option>
                            <option value="sports">Sports</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="content">Content</label>
                        <textarea 
                            id="content"
                            {...register("content", { required: true })} 
                            rows="15" 
                            defaultValue={state.content}
                            className="form-control content-editor"
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            onClick={() => setEditArticleStatus(false)} 
                            className="cancel-button"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="save-button">Save Changes</button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default ArticleByID
