import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  increment,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Feed.css"; // Import the CSS file

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }
    setCurrentUser(user);

    const postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
      const postsData = await Promise.all(
        snapshot.docs.map(async (postDoc) => {
          const postData = postDoc.data();
          const likeDocRef = doc(db, "likes", `${user.uid}_${postDoc.id}`);
          const likeDoc = await getDoc(likeDocRef);
          const isLiked = likeDoc.exists();

          return { id: postDoc.id, ...postData, isLiked };
        })
      );
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLike = async (postId, isCurrentlyLiked) => {
    try {
      const likeDocRef = doc(db, "likes", `${currentUser.uid}_${postId}`);
      const postDocRef = doc(db, "posts", postId);

      if (isCurrentlyLiked) {
        await deleteDoc(likeDocRef);
        await updateDoc(postDocRef, { likeCount: increment(-1) });
      } else {
        await setDoc(likeDocRef, {
          postId: postId,
          userId: currentUser.uid,
          createdAt: new Date(),
        });
        await updateDoc(postDocRef, { likeCount: increment(1) });
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="feed-loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="feed-page">
      <div className="feed-container">
        <div className="feed-header">
          <h2 className="feed-title">Feed</h2>
          <div className="feed-buttons">
            <Link to="/create-post" className="btn-primary">
              Create Post
            </Link>
            <Link to="/profile" className="btn-secondary">
              Profile
            </Link>
          </div>
        </div>

        <div className="posts-list">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-content-wrapper">
                {post.photoURL ? (
                  <img
                    src={post.photoURL}
                    alt={post.username}
                    className="post-user-image"
                  />
                ) : (
                  <div className="post-avatar">
                    {post.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="post-details">
                  <div className="post-user-info">
                    <h3 className="post-username">{post.username}</h3>
                    <p className="post-timestamp">
                      {formatTimestamp(post.createdAt)}
                    </p>
                  </div>

                  <p className="post-text">{post.content}</p>

                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="post-image"
                    />
                  )}

                  <div className="post-actions">
                    <button
                      onClick={() => handleLike(post.id, post.isLiked)}
                      className={`post-like-btn ${post.isLiked ? "liked" : ""}`}
                    >
                      <span>👍</span>
                      <span>{post.likeCount || 0}</span>
                    </button>

                    <button className="post-comment-btn">
                      <span>💬</span>
                      <span>Comments</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="no-posts">
            <p>No posts yet</p>
            <Link to="/create-post" className="btn-primary">
              Create the first post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
