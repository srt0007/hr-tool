const googleDriveService = require('../services/googleDriveService');

/**
 * List root folders
 */
async function listFolders(req, res) {
  try {
    const folders = await googleDriveService.listRootFolders();

    res.json({
      success: true,
      folders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Search folders
 */
async function searchFolders(req, res) {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    const folders = await googleDriveService.searchFolders(query);

    res.json({
      success: true,
      folders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * Get folder details and file count
 */
async function getFolderDetails(req, res) {
  try {
    const { folderId } = req.params;

    if (!folderId) {
      return res.status(400).json({
        success: false,
        error: 'Folder ID is required',
      });
    }

    const [metadata, files] = await Promise.all([
      googleDriveService.getFolderMetadata(folderId),
      googleDriveService.listFilesInFolder(folderId),
    ]);

    res.json({
      success: true,
      folder: {
        ...metadata,
        fileCount: files.length,
      },
      files: files.map((f) => ({
        id: f.id,
        name: f.name,
        size: f.size,
        modifiedTime: f.modifiedTime,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

module.exports = {
  listFolders,
  searchFolders,
  getFolderDetails,
};
