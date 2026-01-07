import React from "react";
import {
  doc,
  setDoc,
  deleteDoc,
  increment,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import "./PostCard.css"; // Import the CSS file

const PostCard = ({ post }) => {
  const currentUser = auth.currentUser;

  const handleLike = async () => {
    if (!currentUser) return;

    try {
      const likeDocRef = doc(db, "likes", `${currentUser.uid}_${post.id}`);
      const postDocRef = doc(db, "posts", post.id);

      if (post.isLiked) {
        await deleteDoc(likeDocRef);
        await updateDoc(postDocRef, { likeCount: increment(-1) });
      } else {
        await setDoc(likeDocRef, {
          postId: post.id,
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

  return (
    <div className="post-card">
      {/* User Info */}
      <div className="user-info">
        <div className="user-avatar">
          {post.username?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="username">{post.username}</h3>
          <p className="timestamp">{formatTimestamp(post.createdAt)}</p>
        </div>
      </div>

      {/* Post Content */}
      <p className="post-content">{post.content}</p>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="post-image-container">
          <img src={post.imageUrl} alt="Post" className="post-image" />
        </div>
      )}

      {/* Actions */}
      <div className="post-actions">
        <button
          onClick={handleLike}
          className={`action-btn ${post.isLiked ? "liked" : ""}`}
        >
          <span>👍</span>
          <span>{post.likeCount || 0}</span>
        </button>

        <button className="action-btn">
          <span>💬</span>
          <span>Comment</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
