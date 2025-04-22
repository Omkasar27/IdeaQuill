const express = require('express')
const authorApp = express.Router();
const expressAsyncHandler = require("express-async-handler");
const createUserOrAuthor = require('./createUserOrAuthor');
const Article = require("../models/articleModel");
const { requireAuth } = require("@clerk/express");
require('dotenv').config();

// Create new author
authorApp.post("/author", expressAsyncHandler(createUserOrAuthor));

// Create new article
authorApp.post("/article", expressAsyncHandler(async (req, res) => {
    const newArticle = new Article(req.body);
    const savedArticle = await newArticle.save();
    res.status(201).send({ message: "article published", payload: savedArticle });
}));

// Get all active articles
authorApp.get('/articles', requireAuth({ signInUrl: "unauthorized" }), expressAsyncHandler(async (req, res) => {
    const listOfArticles = await Article.find({ isArticleActive: true });
    res.status(200).send({ message: "articles", payload: listOfArticles });
}));

// Unauthorized fallback route
authorApp.get('/unauthorized', (req, res) => {
    res.send({ message: "Unauthorized request" });
});

// Modify (Edit) article
authorApp.put('/article/:articleId', requireAuth({ signInUrl: "unauthorized" }), expressAsyncHandler(async (req, res) => {
    const { articleId } = req.params;
    const { userId } = req.auth;
    const modifiedArticle = req.body;

    const article = await Article.findById(articleId);

    if (!article) {
        return res.status(404).send({ message: "Article not found" });
    }

    if (article.authorId !== userId) {
        return res.status(403).send({ message: "Forbidden: Only the original author can modify this article" });
    }

    const updatedArticle = await Article.findByIdAndUpdate(articleId, modifiedArticle, { new: true });
    res.status(200).send({ message: "article modified", payload: updatedArticle });
}));

// Soft delete or restore article
authorApp.put('/articles/:articleId', requireAuth({ signInUrl: "unauthorized" }), expressAsyncHandler(async (req, res) => {
    const { articleId } = req.params;
    const { userId } = req.auth;
    const modifiedArticle = req.body;

    const article = await Article.findById(articleId);

    if (!article) {
        return res.status(404).send({ message: "Article not found" });
    }

    if (article.authorId !== userId) {
        return res.status(403).send({ message: "Forbidden: Only the original author can delete or restore this article" });
    }

    const updatedArticle = await Article.findByIdAndUpdate(articleId, modifiedArticle, { new: true });
    res.status(200).send({ message: "article deleted or restored", payload: updatedArticle });
}));

module.exports = authorApp;
