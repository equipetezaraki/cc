import { google } from 'googleapis'
import path from 'path'

const KEY_FILE_PATH = path.join(process.cwd(), 'google-credentials.json')
const SCOPES = ['https://www.googleapis.com/auth/drive']

async function checkDriveStorage() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE_PATH,
            scopes: SCOPES,
        })

        const drive = google.drive({ version: 'v3', auth })

        // Get storage quota information
        const response = await drive.about.get({
            fields: 'storageQuota, user'
        })

        const quota = response.data.storageQuota
        const user = response.data.user

        console.log('\n📊 Google Drive Storage Information')
        console.log('=====================================')
        console.log('User:', user?.emailAddress || 'Service Account')
        console.log('\n💾 Storage Quota:')

        if (quota) {
            const limit = quota.limit ? parseInt(quota.limit) : 0
            const usage = quota.usage ? parseInt(quota.usage) : 0
            const usageInDrive = quota.usageInDrive ? parseInt(quota.usageInDrive) : 0
            const usageInDriveTrash = quota.usageInDriveTrash ? parseInt(quota.usageInDriveTrash) : 0

            const formatBytes = (bytes: number) => {
                if (bytes === 0) return '0 Bytes'
                const k = 1024
                const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
                const i = Math.floor(Math.log(bytes) / Math.log(k))
                return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
            }

            console.log(`  Total Limit: ${limit > 0 ? formatBytes(limit) : 'Unlimited'}`)
            console.log(`  Used: ${formatBytes(usage)}`)
            console.log(`  Used in Drive: ${formatBytes(usageInDrive)}`)
            console.log(`  Used in Trash: ${formatBytes(usageInDriveTrash)}`)

            if (limit > 0) {
                const percentUsed = (usage / limit) * 100
                console.log(`  Percentage Used: ${percentUsed.toFixed(2)}%`)
                console.log(`  Available: ${formatBytes(limit - usage)}`)
            }
        } else {
            console.log('  ⚠️  No quota information available')
        }

        // List recent files to see what's taking up space
        console.log('\n📁 Recent Files (Top 10 by size):')
        console.log('=====================================')

        const filesResponse = await drive.files.list({
            pageSize: 10,
            orderBy: 'quotaBytesUsed desc',
            fields: 'files(id, name, size, mimeType, createdTime, quotaBytesUsed)',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
        })

        if (filesResponse.data.files && filesResponse.data.files.length > 0) {
            filesResponse.data.files.forEach((file, index) => {
                const size = file.size ? parseInt(file.size) : 0
                const quotaUsed = file.quotaBytesUsed ? parseInt(file.quotaBytesUsed) : 0
                console.log(`${index + 1}. ${file.name}`)
                console.log(`   Size: ${formatBytes(size)} | Quota Used: ${formatBytes(quotaUsed)}`)
                console.log(`   Type: ${file.mimeType}`)
                console.log(`   Created: ${file.createdTime}`)
                console.log('')
            })
        } else {
            console.log('No files found or accessible.')
        }

    } catch (error: any) {
        console.error('❌ Error checking storage:', error.message)
        if (error.response) {
            console.error('Response:', error.response.data)
        }
    }
}

// Run the check
checkDriveStorage()

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
