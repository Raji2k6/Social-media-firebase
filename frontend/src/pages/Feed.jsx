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
  addDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Feed.css";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  /* ================= LOAD POSTS ================= */
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

    const unsubPosts = onSnapshot(postsQuery, async (snapshot) => {
      const postsData = await Promise.all(
        snapshot.docs.map(async (postDoc) => {
          const postData = postDoc.data();
          const likeDocRef = doc(db, "likes", `${user.uid}_${postDoc.id}`);
          const likeDoc = await getDoc(likeDocRef);

          return {
            id: postDoc.id,
            ...postData,
            isLiked: likeDoc.exists(),
          };
        })
      );
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubPosts();
  }, [navigate]);

  /* ================= LOAD COMMENTS ================= */
  useEffect(() => {
    const commentsQuery = query(
      collection(db, "comments"),
      orderBy("createdAt", "asc")
    );

    const unsubComments = onSnapshot(commentsQuery, (snapshot) => {
      const grouped = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (!grouped[data.postId]) grouped[data.postId] = [];
        grouped[data.postId].push({ id: doc.id, ...data });
      });
      setComments(grouped);
    });

    return () => unsubComments();
  }, []);

  /* ================= LIKE ================= */
  const handleLike = async (postId, isLiked) => {
    const likeRef = doc(db, "likes", `${currentUser.uid}_${postId}`);
    const postRef = doc(db, "posts", postId);

    if (isLiked) {
      await deleteDoc(likeRef);
      await updateDoc(postRef, { likeCount: increment(-1) });
    } else {
      await setDoc(likeRef, {
        postId,
        userId: currentUser.uid,
        createdAt: new Date(),
      });
      await updateDoc(postRef, { likeCount: increment(1) });
    }
  };

  /* ================= ADD COMMENT ================= */
  const handleCommentPost = async (postId) => {
    const text = commentText[postId];
    if (!text || !text.trim()) return;

    await addDoc(collection(db, "comments"), {
      postId,
      userId: currentUser.uid,
      text: text.trim(),
      createdAt: serverTimestamp(),
    });

    setCommentText((prev) => ({ ...prev, [postId]: "" }));
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const diff = Math.floor((new Date() - timestamp.toDate()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) return <div className="feed-loading">Loading...</div>;

  return (
  <div className="feed-page">
    <div className="feed-container">
      <h2 className="feed-title">Feed</h2>

      {/* ✅ POSTS LIST WRAPPER */}
      <div className="posts-list">
        {posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
  <div className="post-avatar">
    {post.username?.charAt(0).toUpperCase()}
  </div>

  <div className="post-user-meta">
    <span className="post-username">{post.username}</span>
    <span className="post-timestamp">
      {formatTimestamp(post.createdAt)}
    </span>
  </div>
</div>


            <p>{post.content}</p>

            {post.imageUrl && (
              <img src={post.imageUrl} className="post-image" />
            )}

            <button
              className={`post-like-btn ${post.isLiked ? "liked" : ""}`}
              onClick={() => handleLike(post.id, post.isLiked)}
            >
              👍 {post.likeCount || 0}
            </button>

            {/* COMMENTS */}
            <div className="comments-section">
              {(comments[post.id] || []).map((c) => (
                <div key={c.id} className="comment">
                  <strong>
                    {c.userId === currentUser.uid ? "You" : "User"}:
                  </strong>{" "}
                  {c.text}
                </div>
              ))}

              <input
                type="text"
                placeholder="Write a comment..."
                value={commentText[post.id] || ""}
                onChange={(e) =>
                  setCommentText((prev) => ({
                    ...prev,
                    [post.id]: e.target.value,
                  }))
                }
              />
              <button onClick={() => handleCommentPost(post.id)}>
                Post
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* ✅ END POSTS LIST */}
    </div>
  </div>
);

};

export default Feed;
