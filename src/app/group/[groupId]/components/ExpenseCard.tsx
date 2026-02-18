'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Pencil, Trash2, User } from "lucide-react"
import { deleteExpense } from "@/app/actions"
import { useState } from "react"
import { EditExpenseDialog } from "./EditExpenseDialog"

type Member = {
    id: string
    user: {
        name: string | null
        email: string
    }
}

type Expense = {
    id: string
    description: string
    amount: number
    date: Date
    payer: {
        id: string
        user: {
            name: string | null
            email: string
        }
    }
    splits: Array<{
        id: string
        amount: number
        member: {
            id: string
            user: {
                name: string | null
                email: string
            }
        }
    }>
}

type ExpenseCardProps = {
    expense: Expense
    groupId: string
    members: Member[]
}

export function ExpenseCard({ expense, groupId, members }: ExpenseCardProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [showSplits, setShowSplits] = useState(false)
    const [editOpen, setEditOpen] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this expense?")) {
            return
        }

        setIsDeleting(true)
        try {
            await deleteExpense(expense.id, groupId)
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to delete expense")
            setIsDeleting(false)
        }
    }

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date(expense.date))

    return (
        <>
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-semibold text-lg">{expense.description}</h3>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            Paid by {expense.payer.user.name || expense.payer.user.email}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {formattedDate}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary">
                                            ₨{expense.amount.toFixed(2)}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => setEditOpen(true)}
                                        disabled={isDeleting}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <Button
                                variant="link"
                                size="sm"
                                onClick={() => setShowSplits(!showSplits)}
                                className="h-auto p-0 text-xs"
                            >
                                {showSplits ? "Hide" : "Show"} split details ({expense.splits.length} people)
                            </Button>

                            {showSplits && (
                                <div className="mt-3 pt-3 border-t space-y-2">
                                    {expense.splits.map((split: typeof expense.splits[number]) => (
                                        <div
                                            key={split.id}
                                            className="flex justify-between items-center text-sm"
                                        >
                                            <span className="text-muted-foreground">
                                                {split.member.user.name || split.member.user.email}
                                            </span>
                                            <span className="font-medium">
                                                ₨{split.amount.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <EditExpenseDialog
                open={editOpen}
                onOpenChange={setEditOpen}
                expense={expense}
                groupId={groupId}
                members={members}
            />
        </>
    )
}
