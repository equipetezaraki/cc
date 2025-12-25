import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testPasswordUpdate() {
    // Find first client
    const client = await prisma.client.findFirst()

    if (!client) {
        console.log('❌ No client found')
        return
    }

    console.log('📋 Client found:', {
        id: client.id,
        name: client.name,
        email: client.email,
        hasPassword: !!client.passwordHash
    })

    // Test password
    const testPassword = '123123'
    const hashedPassword = await bcrypt.hash(testPassword, 10)

    console.log('\n🔐 Updating password to:', testPassword)

    // Update password
    await prisma.client.update({
        where: { id: client.id },
        data: { passwordHash: hashedPassword }
    })

    console.log('✅ Password updated successfully')

    // Verify update
    const updatedClient = await prisma.client.findUnique({
        where: { id: client.id }
    })

    if (updatedClient?.passwordHash) {
        const isValid = await bcrypt.compare(testPassword, updatedClient.passwordHash)
        console.log('\n✅ Password verification:', isValid ? 'SUCCESS' : 'FAILED')
        console.log('Password hash:', updatedClient.passwordHash.substring(0, 20) + '...')
    }
}

testPasswordUpdate()
    .then(() => {
        console.log('\n✅ Test completed')
        prisma.$disconnect()
    })
    .catch((error) => {
        console.error('❌ Error:', error)
        prisma.$disconnect()
    })
