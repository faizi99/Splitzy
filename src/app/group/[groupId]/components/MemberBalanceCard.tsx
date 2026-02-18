import { TrendingDown, TrendingUp, CheckCircle } from "lucide-react"
import type { MemberBalance } from "@/lib/calculations"

type MemberBalanceCardProps = {
    balance: MemberBalance
}

export function MemberBalanceCard({ balance }: MemberBalanceCardProps) {
    const { member, totalPaid, totalOwed, balance: net } = balance

    const isCreditor = net > 0.01
    const isDebtor = net < -0.01

    return (
        <div className="flex items-center justify-between py-3 px-4 rounded-lg border bg-card">
            <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                    Paid ₨{totalPaid.toFixed(2)} · Owes ₨{totalOwed.toFixed(2)}
                </p>
            </div>

            <div className="flex items-center gap-2 ml-4 shrink-0">
                {isCreditor ? (
                    <>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <div className="text-right">
                            <p className="text-sm font-semibold text-green-700">gets back</p>
                            <p className="text-base font-bold text-green-600">₨{net.toFixed(2)}</p>
                        </div>
                    </>
                ) : isDebtor ? (
                    <>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <div className="text-right">
                            <p className="text-sm font-semibold text-red-700">owes</p>
                            <p className="text-base font-bold text-red-600">₨{Math.abs(net).toFixed(2)}</p>
                        </div>
                    </>
                ) : (
                    <>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <div className="text-right">
                            <p className="text-sm font-medium text-muted-foreground">settled</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
