import { google } from 'googleapis'
import path from 'path'

// Scopes required for Google Drive API
const SCOPES = ['https://www.googleapis.com/auth/drive']

// Path to the credentials file
const KEY_FILE_PATH = path.join(process.cwd(), 'google-credentials.json')

// Parent folder ID where all client folders will be created
const PARENT_FOLDER_ID = '1oal7WxxZKhq1VungsTDD8g8XVRrH_0iv'

/**
 * Authenticates with Google and returns the Drive service.
 */
function getDriveService() {
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_FILE_PATH,
        scopes: SCOPES,
    })
    return google.drive({ version: 'v3', auth })
}

/**
 * Creates a folder in Google Drive.
 * @param folderName Name of the folder to create
 * @param parentFolderId Optional ID of the parent folder
 * @returns The ID of the created folder
 */
export async function createDriveFolder(folderName: string, parentFolderId?: string): Promise<string | null> {
    try {
        const drive = getDriveService()
        const fileMetadata: any = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
        }

        if (parentFolderId) {
            fileMetadata.parents = [parentFolderId]
        }

        const file = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id',
        })

        return file.data.id || null
    } catch (error) {
        console.error('Error creating Google Drive folder:', error)
        return null
    }
}

/**
 * Searches for a folder by name within a specific parent folder (or root).
 * @param folderName Name of the folder to search for
 * @param parentFolderId Optional ID of the parent folder to search within
 * @returns The ID of the found folder, or null if not found
 */
export async function findDriveFolder(folderName: string, parentFolderId?: string): Promise<string | null> {
    try {
        const drive = getDriveService()
        let query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`

        if (parentFolderId) {
            query += ` and '${parentFolderId}' in parents`
        }

        const res = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
        })

        if (res.data.files && res.data.files.length > 0) {
            return res.data.files[0].id || null
        }

        return null
    } catch (error) {
        console.error('Error finding Google Drive folder:', error)
        return null
    }
}

/**
 * Ensures a Client folder exists.
 * Format: "001 - Company Name"
 */
export async function ensureClientFolder(companyName: string, clientCode: number): Promise<string | null> {
    const formattedCode = clientCode.toString().padStart(3, '0')
    const folderName = `${formattedCode} - ${companyName}`

    // 1. Try to find existing folder in the parent folder
    const existingId = await findDriveFolder(folderName, PARENT_FOLDER_ID)
    if (existingId) return existingId

    // 2. Create if not exists, inside the parent folder
    return await createDriveFolder(folderName, PARENT_FOLDER_ID)
}

/**
 * Creates a Project folder inside a Client folder.
 */
export async function createProjectFolder(projectName: string, clientFolderId: string): Promise<string | null> {
    return await createDriveFolder(projectName, clientFolderId)
}

/**
 * Duplicates a Google Sheet.
 */
export async function duplicateSpreadsheet(templateId: string, newName: string, parentFolderId: string): Promise<string | null> {
    try {
        const drive = getDriveService()
        const file = await drive.files.copy({
            fileId: templateId,
            requestBody: {
                name: newName,
                parents: [parentFolderId],
            },
            fields: 'id, webViewLink',
            supportsAllDrives: true,
        })

        return file.data.webViewLink || null
    } catch (error) {
        console.error('Error duplicating spreadsheet:', error)
        return null
    }
}

/**
 * Creates FAQ spreadsheet from template in client folder.
 * Uses supportsAllDrives to avoid service account quota issues.
 */
export async function createFAQSpreadsheet(companyName: string, parentFolderId: string): Promise<string | null> {
    const FAQ_TEMPLATE_ID = '1KLA-qqVD9fxToEXSm0nAFK8Z_KrhpoZ-KzOqEX9YQYY'
    const faqName = `FAQ - ${companyName}`

    try {
        const drive = getDriveService()

        // Copy the file with supportsAllDrives parameter
        const file = await drive.files.copy({
            fileId: FAQ_TEMPLATE_ID,
            requestBody: {
                name: faqName,
                parents: [parentFolderId],
            },
            fields: 'id, webViewLink',
            supportsAllDrives: true,
        })

        const fileId = file.data.id
        if (!fileId) {
            console.error('No file ID returned from copy operation')
            return null
        }

        // Set permissions to make it accessible
        try {
            await drive.permissions.create({
                fileId: fileId,
                requestBody: {
                    role: 'writer',
                    type: 'anyone',
                },
                supportsAllDrives: true,
            })
        } catch (permError) {
            console.warn('Could not set permissions, but file was created:', permError)
        }

        return file.data.webViewLink || null
    } catch (error) {
        console.error('Error creating FAQ spreadsheet:', error)
        return null
    }
}
