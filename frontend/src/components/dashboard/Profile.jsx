import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import './Profile.css';
import { FaRegCommentAlt } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { PiHandHeartFill } from "react-icons/pi";
import { PiHandHeartLight } from "react-icons/pi";
import { MdDeleteOutline } from "react-icons/md";
import Modal from 'react-modal';
import { useLocation } from 'react-router-dom';

Modal.setAppElement('#root');

function Profile() {
    const [userProfile, setUserProfile] = useState({
        username: '',
        email: '',
        bio: '',
        city: '',
        country: '',
        photo: '',
    });
    const [posts, setPosts] = useState([]);
    const [reposts, setReposts] = useState([]);
    const [comments, setComments] = useState([]); // Store comments for the selected post
    const [newComment, setNewComment] = useState(''); // For user input
    const [activeTab, setActiveTab] = useState('posts');
    const [error, setError] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [commentsModalIsOpen, setCommentsModalIsOpen] = useState(false); // New modal state for comments
    const [selectedPost, setSelectedPost] = useState(null); // For storing selected post details
    const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);

    let { state } = useLocation();
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                let response;
                const token = localStorage.getItem('token'); // Get JWT token
                if (state == null) {

                    response = await API.get('/user/profile', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                }
                else {
                    response = await API.get(`/user/profile/${state._id}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                }
                setUserProfile(response.data);
                fetchPosts();
                fetchReposts();
            } catch (err) {
                console.error('Fetch Profile Error:', err);
                setError('Failed to load profile.');
            }
        };

        fetchProfile();
    }, []);

    const fetchPosts = async () => {
        try {
            let response;
            const token = localStorage.getItem('token');
            if (state == null) {
                response = await API.get('/posts/user', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }
            else {
                response = await API.get(`/posts/user/${state._id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                });

            }
            setPosts(response.data);
        } catch (err) {
            console.error('Fetch Posts Error:', err);
            setError('Failed to load posts.');
        }
    };

    const fetchReposts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await API.get('/reposts/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setReposts(response.data);
        } catch (err) {
            console.error('Fetch Reposts Error:', err);
            setError('Failed to load reposts.');
        }
    };

    const handleLike = async (postId, isLiked) => {
        const token = localStorage.getItem('token');
        try {
            if (isLiked) {
                // Unlike the post (remove userId from likedBy)
                await API.patch(`/posts/${postId}/unlike`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            } else {
                // Like the post (add userId to likedBy)
                await API.patch(`/posts/${postId}/like`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }

            // Refresh posts after like/unlike
            fetchPosts();
        } catch (err) {
            console.error('Like/Unlike Error:', err);
            setError('Failed to update like status.');
        }
    };
    const openDeleteModal = (postId) => {
        setPostToDelete(postId);
        setDeleteModalIsOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalIsOpen(false);
        setPostToDelete(null);
    };

    const confirmDeletePost = async () => {
        await handleDeletePost(postToDelete);
        closeDeleteModal();
    };

    const handleDeletePost = async (postId) => {
        const token = localStorage.getItem('token');
        try {
            // Make API call to delete the post
            await API.delete(`/posts/${postId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Remove the post from the state
            setPosts(posts.filter(post => post._id !== postId));
        } catch (err) {
            console.error('Delete Post Error:', err);
            setError('Failed to delete post.');
        }
        fetchPosts();
    };


    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleRepost = async (postId) => {
        const token = localStorage.getItem('token');
        try {
            // API call to repost the post
            await API.post(`/reposts/${postId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });


            // Fetch reposts again to reflect the new reposted post
            fetchReposts();
        } catch (err) {
            console.error('Repost Error:', err);
            setError('Failed to repost.');
        }
    };

    const openCommentsModal = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await API.get(`/posts/${postId}/comments`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },

            });
            console.log(response);
            setComments(response.data); // Fetch and set comments
            setSelectedPost(postId); // Set selected post
            setCommentsModalIsOpen(true); // Open comments modal
        } catch (err) {
            console.error('Fetch Comments Error:', err);
            setError('Failed to load comments.');
        }
    };

    const submitComment = async () => {
        if (!newComment) return;

        try {
            const token = localStorage.getItem('token');
            const response = await API.post(`/posts/${selectedPost}/comment`, { comment: newComment }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response);
            setComments([...comments, response.data]); // Add new comment to the list
            setNewComment(''); // Clear input field
        } catch (err) {
            console.error('Submit Comment Error:', err);
            setError('Failed to submit comment.');
        }
    };

    const closeCommentsModal = () => {
        setCommentsModalIsOpen(false);
        setComments([]);
        setSelectedPost(null);
    };

    // Function to open the image modal and set selected post
    const openModal = (post) => {
        setSelectedPost(post);
        setModalIsOpen(true);
    };

    // Function to close the image modal
    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedPost(null);
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-photo-container">
                    {userProfile.photo && (
                        <img src={userProfile.photo} alt="Profile" className="profile-photo" />
                    )}
                </div>
                <div className="profile-info-container">
                    <h2>{userProfile.username}</h2>
                    <h6> {userProfile.bio}</h6>
                    <p><strong>Contact:</strong> {userProfile.email}</p>
                </div>
            </div>

            <div className="profile-tabs">
                <button
                    className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
                    onClick={() => handleTabClick('posts')}
                >
                    Posts
                </button>
                {/* <button
                    className={`tab-button ${activeTab === 'reposts' ? 'active' : ''}`}
                    onClick={() => handleTabClick('reposts')}
                >
                    Reposts
                </button> */}
            </div>

            {activeTab === 'posts' && (
                <div className="posts-container">
                    {error && <p className="error-message">{error}</p>}
                    {posts.length > 0 ? (
                        posts.map((post) => {
                            const isLiked = post.likedBy.includes(userProfile._id);

                            return (
                                <div key={post._id} className="post-card">
                                    <img
                                        src={`http://localhost:5000/uploads/${encodeURIComponent(post.imageUrl)}`}
                                        alt="Post"
                                        className="post-image"
                                        onClick={() => openModal(post)} // Open image modal on click
                                    />
                                    <div className='post-details'>
                                        <h6>{post.title}</h6>
                                        <p>{post.description}</p>
                                    </div>
                                    <div className='justify-content-around'>
                                        {isLiked ? (
                                            <button
                                                onClick={() => handleLike(post._id, true)}
                                                style={{ padding: 0, margin: 0, marginBottom: 15, border: 'none', background: 'none' }}
                                            >
                                                <PiHandHeartFill className='fs-2' />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleLike(post._id, false)}
                                                style={{ padding: 0, margin: 0, marginBottom: 15, border: 'none', background: 'none' }}
                                            >
                                                <PiHandHeartLight className='fs-2' />
                                            </button>
                                        )}
                                        <button onClick={() => openCommentsModal(post._id)}
                                            style={{ padding: 0, margin: 0, marginBottom: 15, border: 'none', background: 'none' }}>
                                            <FaRegCommentAlt className='fs-4' />
                                        </button>
                                        {/* <button
                                            onClick={() => handleRepost(post._id)} // Trigger repost
                                            style={{ padding: 0, margin: 0, marginBottom: 15, border: 'none', background: 'none' }}>
                                            <BiRepost className='fs-2' />
                                        </button> */}
                                        <button
                                            onClick={() => openDeleteModal(post._id)} // Open delete confirmation modal
                                            style={{ padding: 0, margin: 0, marginBottom: 15, border: 'none', background: 'none' }}>
                                            <MdDeleteOutline className='fs-2' />
                                        </button>


                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p>No posts available.</p>
                    )}
                </div>
            )}

            {activeTab === 'reposts' && (
                <div className="reposts-container">
                    {error && <p className="error-message">{error}</p>}
                    {reposts.length > 0 ? (
                        reposts.map((repost) => (
                            <div key={repost._id} className="post-card">
                                <img src={`http://localhost:5000/uploads/${encodeURIComponent(repost.imageUrl)}`}
                                    alt="Repost" className="repost-image" />
                                <p>{repost.caption}</p>

                            </div>
                        ))
                    ) : (
                        <p>No reposts available.</p>
                    )}
                </div>
            )}

            {/* Image Modal */}
            {selectedPost && (
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel="Post Details"
                    className="PostModal"
                    overlayClassName="PostOverlay"
                >
                    <h2>{selectedPost.title}</h2>
                    <img src={`http://localhost:5000/uploads/${encodeURIComponent(selectedPost.imageUrl)}`} alt="Post" className="modal-post-image" />
                    <p>{selectedPost.description}</p>

                    <div className="modalBtns">
                        <button onClick={closeModal}>Close</button>
                        {selectedPost && selectedPost.likedBy && selectedPost.likedBy.includes(userProfile._id) ? (
                            <button className='modalBtn'
                                onClick={() => handleLike(selectedPost._id, true)}
                                style={{ padding: 0, margin: 0 }}
                            >
                                <PiHandHeartFill className='fs-2' />
                            </button>
                        ) : (
                            <button className='modalBtn'
                                onClick={() => handleLike(selectedPost._id, false)}
                                style={{ padding: 0, margin: 0 }}
                            >
                                <PiHandHeartLight className='fs-2' />
                            </button>
                        )}

                        <button onClick={() => openCommentsModal(selectedPost._id)} className='modalBtn'
                            style={{ padding: 0, margin: 0 }}>
                            <FaRegCommentAlt className='fs-4' />
                        </button>
                        {/* <button
                            onClick={() => handleRepost(selectedPost._id)} className='modalBtn'
                            style={{ padding: 0, margin: 0 }}>
                            <BiRepost className='fs-2' />
                        </button> */}
                        <button
                            onClick={() => openDeleteModal(selectedPost._id)} className='modalBtn'
                            style={{ padding: 0, margin: 0 }}>
                            <MdDeleteOutline className='fs-2' />
                        </button>


                    </div>
                </Modal>
            )}
            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalIsOpen}
                onRequestClose={closeDeleteModal}
                contentLabel="Confirm Delete"
                className="DeleteModal"
                overlayClassName="DeleteOverlay"
            >
                <p className='text-center'>Are you sure you want to delete this post?</p>
                <div className="modal-buttons">
                    <button className="confirm-btn" onClick={confirmDeletePost}>Delete</button>
                    <button onClick={closeDeleteModal} className='cancel-btn'>Cancel</button>
                </div>
            </Modal>

            {/* Comments Modal */}
            {commentsModalIsOpen && (
                <Modal
                    isOpen={commentsModalIsOpen}
                    onRequestClose={closeCommentsModal}
                    contentLabel="Comments"
                    className="CommentsModal"
                    overlayClassName="CommentsOverlay"
                >
                    <h2>Comments</h2>
                    <div className="comments-container">
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment._id} className="comment-item">
                                    <p>{comment.comment}</p>
                                    <p><strong>By:</strong> {comment.madeBy ? comment.madeBy.username : 'Unknown User'}</p>
                                </div>
                            ))
                        ) : (
                            <p>No comments available.</p>
                        )}
                    </div>

                    {/* Add Comment Form */}
                    <div className="add-comment">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                        />
                        <button onClick={submitComment}>Submit</button>
                    </div>

                    <button onClick={closeCommentsModal}>Close</button>
                </Modal>
            )}
        </div>

    );
}

export default Profile;
