import { 
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  where,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { getCurrentUser } from './auth';

// Create new post
export const createPost = async (postData) => {
  try {
    const user = getCurrentUser();
    
    if (!user) {
      throw new Error('User must be logged in to create post');
    }

    const post = {
      uid: user.uid,
      username: user.displayName || 'Anonymous',
      text: postData.text,
      imageUrl: postData.imageUrl || null,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'posts'), post);
    
    return {
      id: docRef.id,
      ...post
    };
  } catch (error) {
    console.error('Create post error:', error);
    throw error;
  }
};

// Get all posts (sorted by newest first)
export const getPosts = async (limitCount = 50) => {
  try {
    const q = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return posts;
  } catch (error) {
    console.error('Get posts error:', error);
    throw error;
  }
};

// Get single post by ID
export const getPost = async (postId) => {
  try {
    const docRef = doc(db, 'posts', postId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Post not found');
    }
  } catch (error) {
    console.error('Get post error:', error);
    throw error;
  }
};

// Get posts by specific user
export const getUserPosts = async (uid) => {
  try {
    const q = query(
      collection(db, 'posts'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return posts;
  } catch (error) {
    console.error('Get user posts error:', error);
    throw error;
  }
};

// Update post
export const updatePost = async (postId, updates) => {
  try {
    const user = getCurrentUser();
    
    if (!user) {
      throw new Error('User must be logged in');
    }

    const postRef = doc(db, 'posts', postId);
    
    // Only allow updating text and imageUrl
    const allowedUpdates = {
      text: updates.text,
      imageUrl: updates.imageUrl
    };

    await updateDoc(postRef, allowedUpdates);
    
    return { id: postId, ...allowedUpdates };
  } catch (error) {
    console.error('Update post error:', error);
    throw error;
  }
};

// Delete post
export const deletePost = async (postId) => {
  try {
    const user = getCurrentUser();
    
    if (!user) {
      throw new Error('User must be logged in');
    }

    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
    
    return { id: postId };
  } catch (error) {
    console.error('Delete post error:', error);
    throw error;
  }
};