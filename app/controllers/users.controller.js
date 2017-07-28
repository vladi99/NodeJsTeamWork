const passport = require('passport');

const usersController = (data, helpers) => {
    return {
        renderAllUsers(req, res) {
            return data.users.getAll()
                .then((users) => {
                    return res.render('users/all', {
                        context: users,
                    });
                });
        },
        renderRegisterPage(req, res) {
            return res.render('users/register');
        },
        registerUser(req, res) {
            const user = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                stringProfilePicture: 'defaultpic.png',
                favorites: [],
                liked: [],
                disliked: [],
            };

            return data.users.create(user)
                .then((dbUser) => {
                    req.login(user, (err) => {
                        if (err) {
                            req.flash('error', req);
                        }
                        req.flash('success', 'You are registered!');
                        return res.redirect('/users/' + dbUser._id);
                    });
                })
                .catch((err) => {
                    req.flash('error', err);
                    return res.redirect('/register');
                });
        },
        renderLoginPage(req, res) {
            if (req.user) {
                return res.redirect('/users/' + req.user._id);
            }
            return res.render('users/login');
        },
        loginUser(req, res, next) {
            return passport.authenticate('local', (err, user) => {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/login');
                }
                req.login(user, (error) => {
                    if (error) {
                        req.flash(error);
                        return res.redirect('/login');
                    }
                    req.flash('success', 'You are logged in!');
                    return res.redirect('/users/' + user._id);
                });
                return next();
            })(req, res, next);
        },
        getProfilePage(req, res) {
            if (!req.user) {
                return res.redirect('/login');
            }
            const id = req.params.id;
            return data.users.getById(id)
                .then((user) => {
                    return Promise.all(
                        [data.posts.getPostsByUsername(user.name), user]
                    );
                }).then(([posts, user]) => {
                    return res.render('users/profile', {
                        context: user,
                        posts: posts,
                        currentUserId: req.user._id.toString(),
                    });
                });
        },
        updateProfilePicture(req, res) {
            const id = req.params.id;
            return data.users.getByObjectName(req.user.name)
                .then((user) => {
                    const currentUserId = user._id.toString();
                    if (id !== currentUserId) {
                        return Promise.reject('It is not your profile');
                    }
                    const photo = req.file;
                    helpers.uploadPicture(photo);
                    return data.users.updateProfilePicture(id, photo)
                })
                .then(() => {
                    req.flash('info', 'File upload successfully.');
                    return res.redirect('/users/' + id);
                })
                .catch((err) => {
                    req.flash('error', err);
                });
        },

        searchUser(req, res) {
            const canSeeProfiles = !!(req.user);
            const input = req.body.searchedUser;
            return data.users.getAllUsersByMatchingString(input)
                .then((users) => {
                    return res.render('users/all', {
                        context: users,
                        lastInput: input,
                        canSeeProfiles: canSeeProfiles,
                    });
                });
        },

        userLogout(req, res) {
            req.logout();
            req.flash('info', 'You are logged out!');
            return res.redirect('/');
        },

        likePost(req, res) {
            if (req.user) {
                const postId = req.body.postId;
                return data.users.addToLiked(req.user._id, postId)
                    .then(() => {
                        return data.posts.like(postId);
                    }).then(() => {
                        return res.send({});
                    });
            }
            return res.redirect('/login');
        },
        unlikePost(req, res) {
            if (req.user) {
                const postId = req.body.postId;
                return data.users.deleteFromLiked(req.user._id, postId)
                    .then(() => {
                        return data.posts.unlike(postId);
                    }).then(() => {
                        return res.send({});
                    });
            }
            return res.redirect('/login');
        },
        dislikePost(req, res) {
            if (req.user) {
                const postId = req.body.postId;
                return data.users.addToDisliked(req.user._id, postId)
                    .then(() => {
                        return data.posts.dislike(postId);
                    }).then(() => {
                        return res.send({});
                    });
            }
            return res.redirect('/login');
        },
        undislikePost(req, res) {
            if (req.user) {
                const postId = req.body.postId;
                return data.users.deleteFromDisliked(req.user._id, postId)
                    .then(() => {
                        return data.posts.undislike(postId);
                    }).then(() => {
                        return res.send({});
                    });
            }
            return res.redirect('/login');
        },
    };
};

module.exports = usersController;