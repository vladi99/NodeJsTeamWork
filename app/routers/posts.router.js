const attachTo = (app, { postsController }) => {
    app.get('/gallery', postsController.renderAllPosts);
    app.get('/myphotos', postsController.renderPostsOfUser);
    app.get('/createPost', postsController.renderCreatePost);
    app.get('/myFavourites', postsController.renderUserFavourites);
    app.post('/createPost', postsController.createPost);
    app.post('/showPicture', postsController.showPicture);
    app.post('/deletePost', postsController.deletePost);
};

module.exports = { attachTo };
