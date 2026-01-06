import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { uploadImage } from "../services/storage";
import { updateDoc } from "firebase/firestore";


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

      // Create post document in Firestore
      const postRef = await addDoc(collection(db, "posts"), {
        userId: user.uid,
        username: username,
        content: content,
        imageUrl: uploadedImageUrl || "",
        likeCount: 0,
        createdAt: serverTimestamp(),
      });

      // Update the post with its own ID
      await updateDoc(postRef, {
        postId: postRef.id,
      });

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
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          Create New Post
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              What's on your mind?
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows="6"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              {content.length}/500 characters
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Upload Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>  
          
          {imageFile && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="max-w-lg max-h-64 object-cover rounded-lg mx-auto block"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || uploading}
              className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-300"
            >
              {loading || uploading ? "Posting..." : "Post"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-400 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-500 transition duration-200"
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
