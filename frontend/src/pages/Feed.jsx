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

    // Real-time listener for posts
    const postsQuery = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(postsQuery, async (snapshot) => {
      const postsData = await Promise.all(
        snapshot.docs.map(async (postDoc) => {
          const postData = postDoc.data();

          // Check if current user liked this post
          const likeDocRef = doc(db, "likes", `${user.uid}_${postDoc.id}`);
          const likeDoc = await getDoc(likeDocRef);
          const isLiked = likeDoc.exists();

          return {
            id: postDoc.id,
            ...postData,
            isLiked,
          };
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
        // Unlike
        await deleteDoc(likeDocRef);
        await updateDoc(postDocRef, {
          likeCount: increment(-1),
        });
      } else {
        // Like
        await setDoc(likeDocRef, {
          postId: postId,
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
    const diff = Math.floor((now - date) / 1000); // difference in seconds

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Feed</h2>
          <div className="flex gap-3">
            <Link
              to="/create-post"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Create Post
            </Link>
            <Link
              to="/profile"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
            >
              Profile
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
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
                  <h3 className="font-semibold text-gray-800">
                    {post.username}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatTimestamp(post.createdAt)}
                  </p>
                </div>
              </div>

              <p className="text-gray-800 mb-4">{post.content}</p>

              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Post"
                  className="w-full rounded-lg mb-4 max-h-96 object-cover"
                />
              )}

              <div className="flex gap-4 text-gray-600">
                <button
                  onClick={() => handleLike(post.id, post.isLiked)}
                  className={`flex items-center gap-1 transition duration-200 ${
                    post.isLiked ? "text-blue-600" : "hover:text-blue-600"
                  }`}
                >
                  <span>{post.isLiked ? "👍" : "👍"}</span>
                  <span>{post.likeCount || 0}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-blue-600 transition duration-200">
                  <span>💬</span>
                  <span>Comments</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">No posts yet</p>
            <Link
              to="/create-post"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Create the first post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
