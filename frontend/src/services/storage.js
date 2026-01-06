// Upload image to Cloudinary
export const uploadImage = async (file) => {
  try {
    // Get Cloudinary credentials from environment variables
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    // Validate credentials
    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary credentials not found in environment variables');
    }

    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Return the secure URL of uploaded image
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error('No URL returned from Cloudinary');
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Optional: Delete image from Cloudinary (requires backend API)
// Cloudinary doesn't allow deleting from frontend directly
//export const deleteImage = async (imageUrl) => {
//  console.warn('Image deletion requires backend implementation');
  // Would need to call your backend API that uses Cloudinary Admin API
  // Not implemented in frontend for security reasons
//};