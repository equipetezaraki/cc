import { getClients } from './actions'
import { ClientList } from './client-list'

export default async function ClientsPage() {
    const clients = await getClients()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Clientes</h1>
                <p className="text-muted-foreground">
                    Gerencie os clientes e suas credenciais de acesso
                </p>
            </div>

            <ClientList clients={clients} />
        </div>
    )
}
