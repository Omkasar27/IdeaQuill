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

    const isArticleAuthor =
        currentUser?.role === 'author' &&
        currentUser?.userId === currentArticle?.authorData?.authorId

    useEffect(() => {
        if (editArticleStatus && !isArticleAuthor) {
            setEditArticleStatus(false)
            setUnauthorized(true)
            setTimeout(() => setUnauthorized(false), 3000)
        }
    }, [editArticleStatus, isArticleAuthor])

    function enableEdit() {
        if (isArticleAuthor) {
            setEditArticleStatus(true)
        } else {
            setUnauthorized(true)
            setTimeout(() => setUnauthorized(false), 3000)
        }
    }

    async function onSave(modifiedArticle) {
        if (!isArticleAuthor) {
            setUnauthorized(true)
            setTimeout(() => setUnauthorized(false), 3000)
            return
        }

        const articleAfterChanges = { ...currentArticle, ...modifiedArticle }
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
                setCurrentArticle(res.data.payload)
                navigate(`/author-profile/articles/${articleAfterChanges.articleId}`, { state: res.data.payload })
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
                document.querySelector('.comment-form').reset()

                if (res.data.payload) {
                    setCurrentArticle(res.data.payload)
                } else {
                    const updatedArticle = { ...currentArticle }
                    if (!updatedArticle.comments) {
                        updatedArticle.comments = []
                    }
                    updatedArticle.comments.push({
                        nameOfUser: currentUser.firstName,
                        comment: commentObj.comment
                    })
                    setCurrentArticle(updatedArticle)
                }

                setTimeout(() => setCommentStatus(''), 3000)
            }
        } catch (error) {
            setCommentStatus('Failed to add comment')
            setTimeout(() => setCommentStatus(''), 3000)
        }
    }

    async function deleteArticle() {
        if (!isArticleAuthor) {
            setUnauthorized(true)
            setTimeout(() => setUnauthorized(false), 3000)
            return
        }

        try {
            const token = await getToken()
            const updatedState = { ...currentArticle, isArticleActive: false }

            let res = await axios.put(
                `https://ideaquill-1.onrender.com/author-api/articles/${currentArticle.articleId}`,
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
        if (!isArticleAuthor) {
            setUnauthorized(true)
            setTimeout(() => setUnauthorized(false), 3000)
            return
        }

        try {
            const token = await getToken()
            const updatedState = { ...currentArticle, isArticleActive: true }

            let res = await axios.put(
                `https://ideaquill-1.onrender.com/author-api/articles/${currentArticle.articleId}`,
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

    return (
        <div className="article-container">
            {unauthorized && (
                <div className="unauthorized-banner">
                    You are not authorized to edit this article. Only the original author can modify it.
                </div>
            )}

            {!editArticleStatus ? (
                <>
                    <div className="article-header">
                        <div className="article-header-left">
                            <h1 className="article-title">{currentArticle.title}</h1>
                            <div className="article-meta">
                                <span className="meta-date">Created: {currentArticle.dateOfCreation}</span>
                                <span className="meta-divider">|</span>
                                <span className="meta-date">Modified: {currentArticle.dateOfModification}</span>
                                <span className="meta-divider">|</span>
                                <span className="meta-category">{currentArticle.category}</span>
                            </div>

                            <div className="article-author">
                                {currentArticle.authorData.profileImageUrl && (
                                    <img
                                        src={currentArticle.authorData.profileImageUrl}
                                        alt="Author"
                                        className="author-avatar"
                                    />
                                )}
                                <p className="article-author-name">By {currentArticle.authorData.nameOfAuthor}</p>
                                {isArticleAuthor && (
                                    <span className="author-badge">You are the author</span>
                                )}
                            </div>
                        </div>

                        {isArticleAuthor && (
                            <div className="article-actions">
                                <button className="action-button edit-button" onClick={enableEdit}>
                                    <Pencil size={18} />
                                    <span>Edit</span>
                                </button>

                                {currentArticle.isArticleActive ? (
                                    <button className="action-button delete-button" onClick={deleteArticle}>
                                        <Trash2 size={18} />
                                        <span>Delete</span>
                                    </button>
                                ) : (
                                    <button className="action-button restore-button" onClick={restoreArticle}>
                                        <Undo size={18} />
                                        <span>Restore</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {!currentArticle.isArticleActive && isArticleAuthor && (
                        <div className="article-status-banner">
                            This article has been deleted and is only visible to you as the author.
                        </div>
                    )}

                    <div className="article-content">
                        <p style={{ whiteSpace: 'pre-line' }}>{currentArticle.content}</p>
                    </div>

                    <div className="comments-section">
                        <h3 className="comments-title">
                            Comments ({currentArticle.comments?.length || 0})
                        </h3>

                        {!currentArticle.comments || currentArticle.comments.length === 0 ? (
                            <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
                        ) : (
                            <div className="comments-list">
                                {currentArticle.comments.map((commentObj, index) => (
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
                            defaultValue={currentArticle.title}
                            {...register("title", { required: true })}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            {...register("category")}
                            defaultValue={currentArticle.category}
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
                            defaultValue={currentArticle.content}
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
