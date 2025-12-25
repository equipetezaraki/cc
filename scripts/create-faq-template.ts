/**
 * INSTRUÇÕES PARA RESOLVER O PROBLEMA DE QUOTA:
 * 
 * O erro "quota exceeded" acontece porque a planilha template original
 * está em um Drive que excedeu o limite de armazenamento.
 * 
 * SOLUÇÃO:
 * 1. Abra a planilha template no navegador:
 *    https://docs.google.com/spreadsheets/d/1KLA-qqVD9fxToEXSm0nAFK8Z_KrhpoZ-KzOqEX9YQYY/edit
 * 
 * 2. Faça uma cópia manual para o Drive da service account:
 *    - Clique em "Arquivo" > "Fazer uma cópia"
 *    - Compartilhe com: n8n-979@n8n-credencial-oficial.iam.gserviceaccount.com
 *    - Dê permissão de "Editor"
 * 
 * 3. Copie o ID da nova planilha (está na URL)
 * 
 * 4. Atualize o código em:
 *    - src/lib/google-drive.ts (linha 135)
 *    - Substitua o FAQ_TEMPLATE_ID pelo novo ID
 * 
 * ALTERNATIVA MAIS RÁPIDA:
 * Execute o script abaixo que tenta criar uma planilha em branco
 * e você pode preenchê-la manualmente depois.
 */

import { google } from 'googleapis'
import path from 'path'

const KEY_FILE_PATH = path.join(process.cwd(), 'google-credentials.json')
const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/spreadsheets'
]

async function createBlankFAQTemplate() {
    try {
        console.log('📝 Criando planilha FAQ em branco...\n')

        const auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE_PATH,
            scopes: SCOPES,
        })

        const sheets = google.sheets({ version: 'v4', auth })
        const drive = google.drive({ version: 'v3', auth })

        // Criar planilha em branco
        const spreadsheet = await sheets.spreadsheets.create({
            requestBody: {
                properties: {
                    title: 'FAQ Template - Tezaraki'
                },
                sheets: [{
                    properties: {
                        title: 'FAQ',
                        gridProperties: {
                            rowCount: 100,
                            columnCount: 10
                        }
                    }
                }]
            }
        })

        const spreadsheetId = spreadsheet.data.spreadsheetId
        console.log('✅ Planilha criada!')
        console.log('   ID:', spreadsheetId)
        console.log('   URL:', `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`)

        // Mover para a pasta correta
        const PARENT_FOLDER_ID = '1oal7WxxZKhq1VungsTDD8g8XVRrH_0iv'

        await drive.files.update({
            fileId: spreadsheetId!,
            addParents: PARENT_FOLDER_ID,
            fields: 'id, parents',
            supportsAllDrives: true,
        })

        console.log('\n✅ Planilha movida para a pasta correta!')
        console.log('\n📋 PRÓXIMOS PASSOS:')
        console.log('1. Abra a planilha no link acima')
        console.log('2. Preencha com o conteúdo do FAQ')
        console.log('3. Atualize o FAQ_TEMPLATE_ID em src/lib/google-drive.ts para:')
        console.log(`   ${spreadsheetId}`)

    } catch (error: any) {
        console.error('❌ Erro:', error.message)
        if (error.response) {
            console.error('Detalhes:', JSON.stringify(error.response.data, null, 2))
        }
    }
}

createBlankFAQTemplate()
