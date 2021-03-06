const express = require('express');
const router = express.Router();

const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const User = require('../../models/User');
//@route GET api/post
//@desc test route
//@access public
router.post('/', [ auth,
    check('text', 'Text is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
    }


    try {
        const user = await User.findById(req.user.id).select('-password');

        const newpost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });
        const post = await newpost.save();
        res.json(post);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error 12');
    }
    
});

//@route GET api/post
//@desc get all post
//@access private
router.get('/',auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ data: -1 });
        res.json(posts);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error 13');
    }
});

//@route GET api/posts/:id
//@desc get post by id
//@access private

router.get('/:id',auth, async (req, res) => {
    try {
        const posts = await Post.findById(req.params.id);
        if(!posts) {
            return res.status(404).json({ msg: 'post not found'});
        }
        res.json(posts);
    } catch (error) {
        console.error(error.message);
        if(error.kend === 'ObjectId') {
            return res.status(404).json({ msg: 'post not found'});
        }
        res.status(500).send('Server error 14');
    }
});

//@route delete api/post/:id
//@desc delete a post
//@access private
router.delete('/:id',auth, async (req, res) => {
    try {
        const posts = await Post.findById(req.params.id);
        //check user
        if(posts.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        await posts.remove();
        res.json({smg: 'removed'});
    } catch (error) {
        console.error(error.message);
        if(error.kend === 'ObjectId') {
            return res.status(404).json({ msg: 'post not found'});
        }
        res.status(500).send('Server error 15');
    }
});

//@route put api/post/like/:id
//@desc like a post
//@access private

router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        //check if the post has already been liked
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.json(400).json({ msg: 'post already liked'});
        }

        post.likes.unshift({ user: req.user.id });

        await post.save();
        res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error 16');
    }
});


//@route put api/post/unlikelike/:id
//@desc unlike a post
//@access private

router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        //check if the post has already been liked
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.json(400).json({ msg: 'post not been liked'});
        }

        //get remove index
        const removeindex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeindex, 1);

        await post.save();
        res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error 17');
    }
});



//@route GET api/post/comment/:id
//@desc comment on a post
//@access private
router.post('/comment/:id', [ auth,
    check('text', 'Text is required').not().isEmpty()
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
    }


    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);
        const newComment = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });
        post.comments.unshift(newComment)
        await newpost.save();
        res.json(post.comments);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error 18');
    }
    
});

//@route GET api/post/comment/:id
//@desc comment on a post
//@access private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        //pull out comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        //make sure exist
        if(!comment) {
            return res.status(404).json({ msg: 'comment not exist'});
        }
        //check user
        if(comment.user.toString() !== req.user.id) {
            return res.status(401).json({ msg:'user not authorized'});
        }
        //get remove index
        const removeindex = post.comment.map(comment => comment.user.toString()).indexOf(req.user.id);

        post.comment.splice(removeindex, 1);

        await post.save();
        res.json(post.comment);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error 19');
    }
});


module.exports = router;