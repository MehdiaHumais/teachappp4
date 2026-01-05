// File cache service to manage file URLs in mock API
// This helps maintain file URLs across component re-renders while in the same session

class FileCache {
  constructor() {
    this.fileMap = new Map(); // Maps file references to URLs
    this.urlToFileMap = new Map(); // Maps URLs back to file info
  }

  // Store a file and return a persistent URL during the session
  createObjectURL(file, fileName) {
    // Create a unique key for this file
    const fileKey = `${fileName}_${file.size}_${file.lastModified}`;

    // If we already have a URL for this file, return it
    if (this.fileMap.has(fileKey)) {
      return this.fileMap.get(fileKey);
    }

    // Create a new object URL
    const url = URL.createObjectURL(file);

    // Store the mapping
    this.fileMap.set(fileKey, url);
    this.urlToFileMap.set(url, { file, fileName, fileKey });

    return url;
  }

  // Get file info from URL
  getFileFromURL(url) {
    return this.urlToFileMap.get(url) || null;
  }

  // Clear all cached files
  clear() {
    this.fileMap.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        // URL might already be revoked
      }
    });
    this.fileMap.clear();
    this.urlToFileMap.clear();
  }
}

export const fileCache = new FileCache();

// Function to handle file persistence in mock API
export const prepareFileForStorage = (file, fileName) => {
  if (file) {
    // For mock API, we'll create a persistent URL reference
    const url = fileCache.createObjectURL(file, fileName);
    return {
      url,
      fileName,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    };
  }
  return null;
};

// Function to recreate file from stored metadata
export const recreateFileFromMetadata = (metadata) => {
  if (!metadata) return null;

  // Try to get the file from cache first
  const cached = fileCache.getFileFromURL(metadata.url);
  if (cached) {
    return cached.file;
  }

  // If not in cache (e.g., after page refresh), we return null
  // The UI should handle this case by showing a placeholder
  return null;
};