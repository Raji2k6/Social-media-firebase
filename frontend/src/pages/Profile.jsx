import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Profile.css"; // Import CSS file

const Profile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUser({ uid: currentUser.uid, ...userDoc.data() });
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();

    const postsQuery = query(
      collection(db, "posts"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.error("Error logging out:", err);
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
      <div className="profile-loading">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.name}
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar-fallback">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="profile-name">{user?.name}</h2>
              <p className="profile-email">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>

        <h3 className="posts-title">Your Posts</h3>
        <div className="posts-list">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-content-wrapper">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="post-avatar"
                  />
                ) : (
                  <div className="post-avatar-fallback">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="post-details">
                  <div className="post-user-info">
                    <h3 className="post-username">{user?.name}</h3>
                    <p className="post-timestamp">
                      {formatTimestamp(post.createdAt)}
                    </p>
                  </div>
                  <p className="post-text">{post.content}</p>
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="Post" className="post-image" />
                  )}
                  <div className="post-actions">
                    <span className="post-action">
                      <span>👍</span>
                      <span>{post.likeCount || 0}</span>
                    </span>
                    <span className="post-action">
                      <span>💬</span>
                      <span>Comments</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="no-posts">
            <p>You haven't posted anything yet</p>
            <button
              onClick={() => navigate("/create-post")}
              className="btn-primary"
            >
              Create Your First Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
