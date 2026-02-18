'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, CheckCheck, Trash2, History } from "lucide-react"
import { recordSettlement, deleteSettlement } from "@/app/actions"
import type { Transaction, SettlementInput } from "@/lib/calculations"

type SettlementPlanProps = {
    groupId: string
    transactions: Transaction[]
    recordedSettlements: SettlementInput[]
}

export function SettlementPlan({ groupId, transactions, recordedSettlements }: SettlementPlanProps) {
    const [loadingIndex, setLoadingIndex] = useState<number | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [showHistory, setShowHistory] = useState(false)

    const isSettled = transactions.length === 0

    async function handleMarkPaid(tx: Transaction, index: number) {
        setLoadingIndex(index)
        try {
            await recordSettlement(groupId, tx.from.id, tx.to.id, tx.amount)
        } finally {
            setLoadingIndex(null)
        }
    }

    async function handleDelete(id: string) {
        setDeletingId(id)
        try {
            await deleteSettlement(id, groupId)
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ArrowRight className="h-5 w-5" />
                    Suggested Settlements
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

                {/* Pending transactions */}
                {isSettled ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted-foreground">
                        <CheckCircle className="h-10 w-10 text-green-500" />
                        <p className="font-semibold text-green-600">All settled up!</p>
                        <p className="text-sm">No payments needed.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((tx, i) => (
                            <div
                                key={i}
                                className="rounded-xl border bg-card p-4 space-y-3"
                            >
                                {/* People row */}
                                <div className="flex items-center gap-3">
                                    {/* Debtor */}
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                            <span className="text-sm font-bold text-red-700">
                                                {tx.from.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm truncate">{tx.from.name}</p>
                                            <p className="text-xs font-medium text-red-500">pays</p>
                                        </div>
                                    </div>

                                    {/* Amount + arrow */}
                                    <div className="flex flex-col items-center shrink-0">
                                        <span className="text-base font-bold">₨{tx.amount.toFixed(2)}</span>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    </div>

                                    {/* Creditor */}
                                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                                        <div className="min-w-0 text-right">
                                            <p className="font-semibold text-sm truncate">{tx.to.name}</p>
                                            <p className="text-xs font-medium text-green-600">receives</p>
                                        </div>
                                        <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <span className="text-sm font-bold text-green-700">
                                                {tx.to.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Mark paid row */}
                                <div className="flex justify-end pt-1 border-t">
                                    <Button
                                        size="sm"
                                        variant="default"
                                        className="gap-1.5 bg-green-600 hover:bg-green-700 text-white shadow-sm mt-2"
                                        disabled={loadingIndex === i}
                                        onClick={() => handleMarkPaid(tx, i)}
                                    >
                                        <CheckCheck className="h-3.5 w-3.5" />
                                        {loadingIndex === i ? "Saving…" : "Mark as paid"}
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <p className="text-xs text-muted-foreground pt-1">
                            {transactions.length} payment{transactions.length !== 1 ? "s" : ""} needed to settle all debts
                        </p>
                    </div>
                )}

                {/* Settlement history */}
                {recordedSettlements.length > 0 && (
                    <div className="pt-2 border-t">
                        <button
                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowHistory(h => !h)}
                        >
                            <History className="h-4 w-4" />
                            {showHistory ? "Hide" : "Show"} payment history ({recordedSettlements.length})
                        </button>

                        {showHistory && (
                            <div className="mt-3 space-y-2">
                                {recordedSettlements.map(s => (
                                    <div
                                        key={s.id}
                                        className="flex items-center gap-3 p-3 rounded-lg border bg-green-50/50"
                                    >
                                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm">
                                                <span className="font-medium">{s.from.user.name || s.from.user.email}</span>
                                                {" → "}
                                                <span className="font-bold text-primary">₨{s.amount.toFixed(2)}</span>
                                                {" → "}
                                                <span className="font-medium">{s.to.user.name || s.to.user.email}</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(s.settledAt))}
                                                {s.note && ` · ${s.note}`}
                                            </p>
                                        </div>
                                        <Button
                                            size="icon-sm"
                                            variant="ghost"
                                            className="text-destructive hover:bg-destructive/10 shrink-0"
                                            disabled={deletingId === s.id}
                                            onClick={() => handleDelete(s.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
