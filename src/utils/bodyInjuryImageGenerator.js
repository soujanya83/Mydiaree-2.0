/**
 * Utility function to generate a marked body diagram image using Canvas
 * Loads the original body diagram image, draws markers on it, and exports as blob
 */

const DEFAULT_BODY_IMAGE = "/accident/body-diagram.png";

/**
 * Generate a marked body diagram image with injury markers
 * @param {Array} markers - Array of marker objects with { view: 'front'|'back', x: number, y: number }
 * @param {string} imageSrc - Source URL of the body diagram image (default: /accident/body-diagram.png)
 * @returns {Promise<Blob>} - The generated image as a Blob
 */
export async function generateMarkedBodyImage(markers = [], imageSrc = DEFAULT_BODY_IMAGE) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      try {
        // Create offscreen canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match image
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        // Draw original image
        ctx.drawImage(img, 0, 0);
        
        // Draw markers
        markers.forEach((marker) => {
          const { view, x, y } = marker;
          
          // Convert percentage coordinates to pixel coordinates
          const pixelX = (x / 100) * canvas.width;
          const pixelY = (y / 100) * canvas.height;
          
          // Adjust x position based on view (front = left half, back = right half)
          const adjustedX = view === 'front' 
            ? pixelX / 2 
            : (canvas.width / 2) + (pixelX / 2);
          
          // Draw marker dot
          ctx.beginPath();
          ctx.arc(adjustedX, pixelY, 8, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.3)'; // emerald-500 with opacity
          ctx.fill();
          ctx.strokeStyle = '#10b981'; // emerald-500
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Draw inner dot
          ctx.beginPath();
          ctx.arc(adjustedX, pixelY, 3, 0, 2 * Math.PI);
          ctx.fillStyle = '#ef4444'; // red-500
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
        
        // Export as blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate image blob'));
          }
        }, 'image/png');
        
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load body diagram image'));
    };
    
    img.src = imageSrc;
  });
}

/**
 * Convert a blob to a File object for upload
 * @param {Blob} blob - The blob to convert
 * @param {string} filename - The filename for the file
 * @returns {File} - The File object
 */
export function blobToFile(blob, filename = 'body-injury-diagram.png') {
  return new File([blob], filename, { type: 'image/png' });
}
