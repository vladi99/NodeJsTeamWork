const { expect } = require('chai');

const postsController =
    require('../../../../app/controllers/posts.controller');

describe('renderPostsOfUser', () => {
    let data = null;
    let controller = null;
    const helpers = {
        getLikedAndDisliked: (posts, req) => {
            return posts;
        },
        getFavourites: (posts, req) => {
            return posts;
        },
    };

    let req = null;
    let res = null;

    beforeEach(() => {
        res = require('../req.res').getResponseMock();
    });
    it('should return correct post', () => {
        data = {
            posts: {
                getPostsByUsername: (user) => {
                    return Promise.resolve(user);
                },
            },
        };
        req = require('../req.res').getRequestMock({
            user: {
                name: [1, 2, 3],
            },
        });
        controller = postsController(data, helpers);
        return controller.renderPostsOfUser(req, res)
            .then(() => {
                 expect(res.viewName).to.equal('posts/gallery');
                 return expect(res.context.context).to.deep.equal([3, 2, 1]);
            });
    });
});
