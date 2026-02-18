import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Scale, TrendingDown, TrendingUp, CheckCircle } from "lucide-react"
import { getSettlementPlan } from "@/lib/calculations"

type Member = {
    id: string
    user: { name: string | null; email: string }
}

type Expense = {
    amount: number
    payer: { id: string; user: { name: string | null; email: string } }
    splits: {
        amount: number
        member: { id: string; user: { name: string | null; email: string } }
    }[]
}

type SettlementPanelProps = {
    members: Member[]
    expenses: Expense[]
}

export function SettlementPanel({ members, expenses }: SettlementPanelProps) {
    if (members.length === 0 || expenses.length === 0) {
        return null
    }

    const { balances, transactions } = getSettlementPlan(members, expenses)

    const isSettled = transactions.length === 0

    return (
        <div className="space-y-4">
            {/* Member Balances */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Scale className="h-5 w-5" />
                        Balances
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {balances.map(({ member, totalPaid, totalOwed, balance }) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between py-2 border-b last:border-0"
                            >
                                <div>
                                    <p className="font-medium">{member.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Paid ₨{totalPaid.toFixed(2)} · Owes ₨{totalOwed.toFixed(2)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {balance > 0.01 ? (
                                        <>
                                            <TrendingUp className="h-4 w-4 text-green-500" />
                                            <span className="text-xs font-medium px-2 py-1 rounded-full border border-green-300 bg-green-50 text-green-700">
                                                +₨{balance.toFixed(2)}
                                            </span>
                                        </>
                                    ) : balance < -0.01 ? (
                                        <>
                                            <TrendingDown className="h-4 w-4 text-red-500" />
                                            <span className="text-xs font-medium px-2 py-1 rounded-full border border-red-300 bg-red-50 text-red-700">
                                                -₨{Math.abs(balance).toFixed(2)}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs font-medium px-2 py-1 rounded-full border border-border text-muted-foreground">
                                                Settled
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Settlement Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowRight className="h-5 w-5" />
                        Suggested Settlements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isSettled ? (
                        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground gap-2">
                            <CheckCircle className="h-10 w-10 text-green-500" />
                            <p className="font-medium text-green-600">All settled up!</p>
                            <p className="text-sm">No payments needed.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {transactions.map((tx, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border"
                                >
                                    <span className="font-medium flex-1 text-sm">{tx.from.name}</span>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <ArrowRight className="h-4 w-4 shrink-0" />
                                        <span className="font-bold text-primary whitespace-nowrap">
                                            ₨{tx.amount.toFixed(2)}
                                        </span>
                                        <ArrowRight className="h-4 w-4 shrink-0" />
                                    </div>
                                    <span className="font-medium flex-1 text-sm text-right">{tx.to.name}</span>
                                </div>
                            ))}
                            <p className="text-xs text-muted-foreground pt-1">
                                {transactions.length} payment{transactions.length !== 1 ? "s" : ""} to settle all debts
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
