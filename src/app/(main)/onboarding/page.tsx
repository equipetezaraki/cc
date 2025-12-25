import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OnboardingForm } from "./onboarding-form"

export default function OnboardingPage() {
    return (
        <div className="container mx-auto py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Novo Briefing - Tezaraki OS</CardTitle>
                        <CardDescription>
                            Preencha os dados iniciais para criar o cliente e iniciar o fluxo de onboarding.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OnboardingForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
