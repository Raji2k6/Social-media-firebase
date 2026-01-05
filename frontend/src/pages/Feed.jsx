import React, { useState } from "react";

const Feed = () => {
  const [posts] = useState([
    { id: 1, text: "Hello World!" },
    { id: 2, text: "My first post" },
  ]);

  return (
    <div>
      <h2>Feed</h2>

      {posts.map((post) => (
        <div key={post.id}>
          <p>{post.text}</p>
        </div>
      ))}
    </div>
  );
};

export default Feed;
