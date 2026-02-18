import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale } from "lucide-react"
import { MemberBalanceCard } from "./MemberBalanceCard"
import type { MemberBalance } from "@/lib/calculations"

type BalancesSummaryProps = {
    balances: MemberBalance[]
}

export function BalancesSummary({ balances }: BalancesSummaryProps) {
    const totalOwed = balances
        .filter(b => b.balance > 0.01)
        .reduce((sum, b) => sum + b.balance, 0)

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Scale className="h-5 w-5" />
                        Balances
                    </CardTitle>
                    {totalOwed > 0.01 && (
                        <span className="text-sm text-muted-foreground">
                            Total outstanding: <span className="font-semibold text-foreground">₨{totalOwed.toFixed(2)}</span>
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {balances.map(b => (
                        <MemberBalanceCard key={b.member.id} balance={b} />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
