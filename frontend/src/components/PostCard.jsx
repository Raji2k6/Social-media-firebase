import React from "react";
import {
  doc,
  setDoc,
  deleteDoc,
  increment,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";

const PostCard = ({ post }) => {
  const currentUser = auth.currentUser;

  const handleLike = async () => {
    if (!currentUser) return;

    try {
      const likeDocRef = doc(db, "likes", `${currentUser.uid}_${post.id}`);
      const postDocRef = doc(db, "posts", post.id);

      if (post.isLiked) {
        // Unlike
        await deleteDoc(likeDocRef);
        await updateDoc(postDocRef, {
          likeCount: increment(-1),
        });
      } else {
        // Like
        await setDoc(likeDocRef, {
          postId: post.id,
          userId: currentUser.uid,
          createdAt: new Date(),
        });
        await updateDoc(postDocRef, {
          likeCount: increment(1),
        });
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
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* User Info */}
      <div className="flex items-center mb-3">
        {post.photoURL ? (
          <img
            src={post.photoURL}
            alt={post.username}
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
        ) : (
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
            {post.username?.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-gray-800">{post.username}</h3>
          <p className="text-sm text-gray-500">
            {formatTimestamp(post.createdAt)}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-gray-800 mb-4">{post.content}</p>

      {/* Post Image */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post"
          className="w-full rounded-lg mb-4 max-h-96 object-cover"
        />
      )}

      {/* Actions */}
      <div className="flex gap-4 text-gray-600">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 transition duration-200 ${
            post.isLiked ? "text-blue-600" : "hover:text-blue-600"
          }`}
        >
          <span>{post.isLiked ? "👍" : "👍"}</span>
          <span>{post.likeCount || 0}</span>
        </button>
        <button className="flex items-center gap-1 hover:text-blue-600 transition duration-200">
          <span>💬</span>
          <span>Comment</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
