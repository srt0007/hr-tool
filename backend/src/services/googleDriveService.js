const { getDriveInstance } = require('../config/googleDrive');

/**
 * List files in a Google Drive folder
 */
async function listFilesInFolder(folderId) {
  try {
    const drive = getDriveInstance();

    const response = await drive.files.list({
      q: `'${folderId}' in parents and (mimeType='application/pdf' or mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document' or mimeType='application/msword') and trashed=false`,
      fields: 'files(id, name, mimeType, size, modifiedTime)',
      orderBy: 'modifiedTime desc',
    });

    return response.data.files || [];
  } catch (error) {
    console.error('Error listing files from Google Drive:', error);
    throw new Error('Failed to list files from Google Drive');
  }
}

/**
 * Download file content from Google Drive
 */
async function downloadFile(fileId) {
  try {
    const drive = getDriveInstance();

    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: 'media',
      },
      { responseType: 'arraybuffer' }
    );

    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error downloading file from Google Drive:', error);
    throw new Error('Failed to download file from Google Drive');
  }
}

/**
 * Get folder metadata
 */
async function getFolderMetadata(folderId) {
  try {
    const drive = getDriveInstance();

    const response = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, mimeType',
    });

    if (response.data.mimeType !== 'application/vnd.google-apps.folder') {
      throw new Error('Provided ID is not a folder');
    }

    return response.data;
  } catch (error) {
    console.error('Error getting folder metadata:', error);
    throw new Error('Failed to get folder information');
  }
}

/**
 * List user's root folders for selection
 */
async function listRootFolders() {
  try {
    const drive = getDriveInstance();

    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false",
      fields: 'files(id, name, modifiedTime)',
      orderBy: 'name',
      pageSize: 50,
    });

    return response.data.files || [];
  } catch (error) {
    console.error('Error listing root folders:', error);
    throw new Error('Failed to list folders');
  }
}

/**
 * Search folders by name
 */
async function searchFolders(searchTerm) {
  try {
    const drive = getDriveInstance();

    const response = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name contains '${searchTerm}' and trashed=false`,
      fields: 'files(id, name, modifiedTime)',
      orderBy: 'name',
      pageSize: 20,
    });

    return response.data.files || [];
  } catch (error) {
    console.error('Error searching folders:', error);
    throw new Error('Failed to search folders');
  }
}

module.exports = {
  listFilesInFolder,
  downloadFile,
  getFolderMetadata,
  listRootFolders,
  searchFolders,
};
