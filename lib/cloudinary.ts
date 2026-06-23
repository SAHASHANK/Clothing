// Simple Cloudinary Helper
// In real setup, credentials would be loaded from env.

export const getCloudinaryUrl = (publicId: string): string => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'unhrd-lab';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
};

export const uploadToCloudinary = async (fileBase64: string): Promise<string> => {
  // If no credentials are setup, return a beautiful placeholder image from unsplash
  if (!process.env.CLOUDINARY_URL) {
    console.log('No Cloudinary URL. Returning mock asset.');
    return 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80';
  }

  // Real upload implementation
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: fileBase64,
          upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unhrd_preset',
        }),
      }
    );

    const data = await response.json();
    return data.secure_url || data.url;
  } catch (error) {
    console.error('Cloudinary upload failure:', error);
    return 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80';
  }
};
