import React, { useState } from "react";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);

  const handlePost = (e) => {
    e.preventDefault();
    console.log("Post:", text, image);
  };

  return (
    <div>
      <h2>Create Post</h2>

      <form onSubmit={handlePost}>
        <textarea
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <br />

        <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        <br />

        <button type="submit">Post</button>
      </form>
    </div>
  );
};

export default CreatePost;
