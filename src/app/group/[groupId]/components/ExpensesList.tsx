'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Receipt } from "lucide-react"
import { ExpenseCard } from "./ExpenseCard"

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

type ExpensesListProps = {
    expenses: Expense[]
    groupId: string
}

export function ExpensesList({ expenses, groupId }: ExpensesListProps) {
    if (expenses.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Expenses
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No expenses yet</p>
                        <p className="text-sm">Add your first expense to get started</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Calculate total expenses
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Expenses ({expenses.length})
                    </CardTitle>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-xl font-bold">${totalAmount.toFixed(2)}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {expenses.map((expense: typeof expenses[number]) => (
                        <ExpenseCard
                            key={expense.id}
                            expense={expense}
                            groupId={groupId}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
