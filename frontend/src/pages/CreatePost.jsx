import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { uploadImage } from "../services/storage";
import "./CreatePost.css"; // Import the CSS file

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsername = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().name);
        }
      } catch (err) {
        console.error("Error fetching username:", err);
      }
    };
    fetchUsername();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!content.trim()) {
      setError("Post content cannot be empty");
      return;
    }
    if (content.length > 500) {
      setError("Post content must be less than 500 characters");
      return;
    }

    setLoading(true);
    let uploadedImageUrl = "";
    if (imageFile) {
      setUploading(true);
      try {
        uploadedImageUrl = await uploadImage(imageFile);
      } catch (err) {
        setError("Image upload failed: " + err.message);
        setLoading(false);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      const postRef = await addDoc(collection(db, "posts"), {
        userId: user.uid,
        username: username,
        content: content,
        imageUrl: uploadedImageUrl || "",
        likeCount: 0,
        createdAt: serverTimestamp(),
      });

      await updateDoc(postRef, { postId: postRef.id });

      navigate("/feed");
    } catch (err) {
      setError(err.message || "Failed to create post. Please try again.");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/feed");
  };

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        <h2 className="create-post-title">Create New Post</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">What's on your mind?</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows="6"
              className="form-textarea"
            />
            <p className="char-count">{content.length}/500 characters</p>
          </div>

          <div className="form-group">
            <label className="form-label">Upload Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="form-input"
            />
          </div>

          {imageFile && (
            <div className="image-preview-container">
              <p className="preview-label">Image Preview:</p>
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="image-preview"
                onError={(e) => (e.target.style.display = "none")}
              />
            </div>
          )}

          <div className="form-buttons">
            <button
              type="submit"
              disabled={loading || uploading}
              className="btn-primary"
            >
              {loading || uploading ? "Posting..." : "Post"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
