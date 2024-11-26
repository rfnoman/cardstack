import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function saveBase64Image(base64String: string): string {
  try {
    console.log('Saving base64 image...');
    
    // Extract the base64 data (remove data:image/jpeg;base64, prefix)
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
    
    // Create a unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.jpg`;
    const filepath = path.join(UPLOAD_DIR, filename);
    
    console.log('Writing to filepath:', filepath);
    
    // Save the file
    fs.writeFileSync(filepath, base64Data, 'base64');
    
    // Return the public URL
    const publicUrl = `/uploads/${filename}`;
    console.log('Image saved, public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in saveBase64Image:', error);
    throw error;
  }
}

export function deleteImage(imageUrl: string): void {
  if (!imageUrl) return;
  
  try {
    const filename = imageUrl.split('/').pop();
    if (!filename) return;
    
    const filepath = path.join(UPLOAD_DIR, filename);
    console.log('Deleting image at:', filepath);
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log('Image deleted successfully');
    } else {
      console.log('Image file not found');
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}
