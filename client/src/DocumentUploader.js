import React, { useState } from 'react';
import axios from 'axios';

const DocumentUploader = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const uploadSignedDocument = async () => {
    setLoading(true);
    setMessage('');  // Clear any previous messages

    try {
      const response = await axios.get('/api/upload-signed-document');
      
      if (response.status === 200) {
        setMessage('Document uploaded successfully from Dropbox Sign to HiBob.');
      } else {
        setMessage('Failed to upload document.');
      }
    } catch (error) {
      console.error('Error during document upload:', error);
      setMessage('An error occurred during document upload.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Upload Signed Document</h1>
      <button onClick={uploadSignedDocument} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload Document'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default DocumentUploader;
