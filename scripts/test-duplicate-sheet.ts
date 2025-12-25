import { google } from 'googleapis'
import path from 'path'

const KEY_FILE_PATH = path.join(process.cwd(), 'google-credentials.json')
const SCOPES = ['https://www.googleapis.com/auth/drive']
const TEMPLATE_ID = '1KLA-qqVD9fxToEXSm0nAFK8Z_KrhpoZ-KzOqEX9YQYY'
const PARENT_FOLDER_ID = '1oal7WxxZKhq1VungsTDD8g8XVRrH_0iv'

async function testDuplicateSheet() {
    try {
        console.log('🔧 Iniciando teste de duplicação...\n')

        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE_PATH,
            scopes: SCOPES,
        })

        const drive = google.drive({ version: 'v3', auth })

        console.log('📋 Template ID:', TEMPLATE_ID)
        console.log('📁 Pasta destino:', PARENT_FOLDER_ID)
        console.log('\n⏳ Tentando duplicar planilha...\n')

        const result = await drive.files.copy({
            fileId: TEMPLATE_ID,
            requestBody: {
                name: `TESTE - FAQ - ${new Date().toISOString()}`,
                parents: [PARENT_FOLDER_ID],
            },
            fields: 'id, name, webViewLink, parents',
            supportsAllDrives: true,
        })

        console.log('✅ SUCESSO! Planilha duplicada:')
        console.log('   ID:', result.data.id)
        console.log('   Nome:', result.data.name)
        console.log('   Link:', result.data.webViewLink)
        console.log('   Pasta:', result.data.parents)

    } catch (error: any) {
        console.error('❌ ERRO ao duplicar planilha:')
        console.error('   Mensagem:', error.message)
        console.error('   Código:', error.code)

        if (error.response) {
            console.error('   Detalhes:', JSON.stringify(error.response.data, null, 2))
        }

        if (error.errors) {
            console.error('   Erros:', JSON.stringify(error.errors, null, 2))
        }
    }
}

testDuplicateSheet()
