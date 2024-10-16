const express = require('express');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const app = express();

// Dropbox Sign credentials
const dropboxSignApiKey = 'your_dropbox_sign_api_key';
const signatureRequestId = 'your_signature_request_id';  // Replace with the actual signature request ID

// HiBob credentials
const hibobApiKey = 'your_hibob_api_key';
const employeeId = 'employee_id_to_upload_document';  // Replace with the actual employee ID
const folderId = 'folder_id_in_hibob';  // Replace with the actual folder ID in HiBob

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Function to fetch the document from Dropbox Sign
const fetchDocumentFromDropboxSign = async () => {
  const url = `https://api.hellosign.com/v3/signature_request/files/${signatureRequestId}?file_type=pdf`;

  try {
    const response = await axios.get(url, {
      auth: {
        username: dropboxSignApiKey,
        password: ''
      },
      responseType: 'stream'
    });

    const filePath = path.join(__dirname, 'signed_document.pdf');  // Save the file locally
    const writer = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on('finish', () => {
        console.log('Document downloaded successfully.');
        resolve(filePath);  // Return file path for upload later
      });
      writer.on('error', (err) => {
        console.error('Error writing file', err);
        reject(err);
      });
    });

  } catch (error) {
    console.error('Error fetching document from Dropbox Sign:', error);
    throw error;
  }
};

// Function to upload the document to HiBob
const uploadDocumentToHiBob = async (filePath) => {
  const hibobUrl = `https://api.hibob.com/v1/people/${employeeId}/files`;

  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));  // Upload the document file
  form.append('folderId', folderId);  // Specify folder ID in HiBob

  try {
    const response = await axios.post(hibobUrl, form, {
      headers: {
        'Authorization': `Bearer ${hibobApiKey}`,
        ...form.getHeaders()
      }
    });

    if (response.status === 200) {
      console.log('File uploaded successfully to HiBob.');
    } else {
      console.error('Failed to upload file to HiBob:', response.data);
    }
  } catch (error) {
    console.error('Error uploading file to HiBob:', error);
  }
};

// API route to trigger the Dropbox Sign to HiBob document upload
app.get('/api/upload-signed-document', async (req, res) => {
  try {
    // Step 1: Fetch the document from Dropbox Sign
    const filePath = await fetchDocumentFromDropboxSign();
    
    // Step 2: Upload the document to HiBob
    await uploadDocumentToHiBob(filePath);

    res.status(200).send('Document uploaded successfully from Dropbox Sign to HiBob.');
  } catch (error) {
    console.error('Error during the document upload process:', error);
    res.status(500).send('Error during document upload.');
  }
});

// Fallback to React for any unhandled routes in production
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

