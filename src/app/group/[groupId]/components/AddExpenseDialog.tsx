'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Equal, DollarSign, Percent, PieChart } from "lucide-react"
import { createExpense } from "@/app/actions"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

type Member = {
    id: string
    user: {
        name: string | null
        email: string
    }
}

type AddExpenseDialogProps = {
    groupId: string
    members: Member[]
}

export function AddExpenseDialog({ groupId, members }: AddExpenseDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [payerId, setPayerId] = useState("")
    const [splitType, setSplitType] = useState<"equal" | "custom" | "percentage" | "shares">("equal")
    const [customSplits, setCustomSplits] = useState<Record<string, string>>({})
    const [percentages, setPercentages] = useState<Record<string, string>>({})
    const [shares, setShares] = useState<Record<string, string>>({})
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!description || !amount || !payerId) {
            setError("Please fill in all required fields")
            return
        }

        const totalAmount = parseFloat(amount)
        if (isNaN(totalAmount) || totalAmount <= 0) {
            setError("Please enter a valid amount")
            return
        }

        setIsLoading(true)
        try {
            let splits

            if (splitType === "equal") {
                // Split equally among all members
                const splitAmount = totalAmount / members.length
                splits = members.map(member => ({
                    memberId: member.id,
                    amount: Math.round(splitAmount * 100) / 100, // Round to 2 decimals
                }))

                // Adjust the last split to account for rounding
                const splitsSum = splits.reduce((sum, s) => sum + s.amount, 0)
                const difference = totalAmount - splitsSum
                if (Math.abs(difference) > 0.01) {
                    splits[splits.length - 1].amount += difference
                }
            } else if (splitType === "custom") {
                // Custom splits
                splits = members.map(member => {
                    const splitAmount = parseFloat(customSplits[member.id] || "0")
                    return {
                        memberId: member.id,
                        amount: splitAmount,
                    }
                })

                // Validate splits sum to total
                const splitsSum = splits.reduce((sum, s) => sum + s.amount, 0)
                if (Math.abs(splitsSum - totalAmount) > 0.01) {
                    setError(`Splits must sum to ${totalAmount}. Current sum: ${splitsSum.toFixed(2)}`)
                    setIsLoading(false)
                    return
                }
            } else if (splitType === "percentage") {
                // Percentage-based splits
                const totalPercentage = Object.values(percentages).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)

                // Validate percentages sum to 100
                if (Math.abs(totalPercentage - 100) > 0.1) {
                    setError(`Percentages must sum to 100%. Current sum: ${totalPercentage.toFixed(1)}%`)
                    setIsLoading(false)
                    return
                }

                splits = members.map(member => {
                    const percentage = parseFloat(percentages[member.id] || "0")
                    const amount = Math.round((totalAmount * percentage / 100) * 100) / 100
                    return {
                        memberId: member.id,
                        amount: amount,
                    }
                })

                // Adjust the last split to account for rounding
                const splitsSum = splits.reduce((sum, s) => sum + s.amount, 0)
                const difference = totalAmount - splitsSum
                if (Math.abs(difference) > 0.01) {
                    const lastNonZeroIndex = splits.map((s, i) => s.amount > 0 ? i : -1).filter(i => i >= 0).pop()
                    if (lastNonZeroIndex !== undefined) {
                        splits[lastNonZeroIndex].amount += difference
                    }
                }
            } else if (splitType === "shares") {
                // Share-based splits
                const totalShares = Object.values(shares).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)

                // Validate there are shares
                if (totalShares === 0) {
                    setError("Please enter at least one share")
                    setIsLoading(false)
                    return
                }

                const amountPerShare = totalAmount / totalShares
                splits = members.map(member => {
                    const memberShares = parseFloat(shares[member.id] || "0")
                    const amount = Math.round((amountPerShare * memberShares) * 100) / 100
                    return {
                        memberId: member.id,
                        amount: amount,
                    }
                })

                // Adjust the last split to account for rounding
                const splitsSum = splits.reduce((sum, s) => sum + s.amount, 0)
                const difference = totalAmount - splitsSum
                if (Math.abs(difference) > 0.01) {
                    const lastNonZeroIndex = splits.map((s, i) => s.amount > 0 ? i : -1).filter(i => i >= 0).pop()
                    if (lastNonZeroIndex !== undefined) {
                        splits[lastNonZeroIndex].amount += difference
                    }
                }
            } else {
                setError("Invalid split type selected")
                setIsLoading(false)
                return
            }

            await createExpense(
                groupId,
                payerId,
                totalAmount,
                description,
                new Date(date),
                splits
            )

            // Reset form
            setDescription("")
            setAmount("")
            setDate(new Date().toISOString().split('T')[0])
            setPayerId("")
            setSplitType("equal")
            setCustomSplits({})
            setPercentages({})
            setShares({})
            setOpen(false)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create expense")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCustomSplitChange = (memberId: string, value: string) => {
        setCustomSplits(prev => ({
            ...prev,
            [memberId]: value,
        }))
    }

    const currentSplitsSum = Object.values(customSplits).reduce((sum, val) => {
        return sum + (parseFloat(val) || 0)
    }, 0)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Expense
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Expense</DialogTitle>
                        <DialogDescription>
                            Create an expense and split it among group members.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description *</Label>
                            <Input
                                id="description"
                                placeholder="e.g. Dinner at restaurant"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Amount *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="date">Date *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="payer">Paid By *</Label>
                            <Select
                                value={payerId}
                                onValueChange={setPayerId}
                                disabled={isLoading}
                            >
                                <SelectTrigger id="payer">
                                    <SelectValue placeholder="Select who paid" />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.map((member) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            {member.user.name || member.user.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-3">
                            <Label>Split Type</Label>
                            <TooltipProvider>
                                <div className="flex gap-2">
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                onClick={() => setSplitType("equal")}
                                                disabled={isLoading}
                                                className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                                                    splitType === "equal"
                                                        ? "border-primary bg-primary/10"
                                                        : "border-border hover:border-primary/50"
                                                } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                            >
                                                <Equal className="h-5 w-5" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Split Equally ({members.length} people)</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                onClick={() => setSplitType("custom")}
                                                disabled={isLoading}
                                                className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                                                    splitType === "custom"
                                                        ? "border-primary bg-primary/10"
                                                        : "border-border hover:border-primary/50"
                                                } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                            >
                                                <DollarSign className="h-5 w-5" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Custom Amounts</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                onClick={() => setSplitType("percentage")}
                                                disabled={isLoading}
                                                className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                                                    splitType === "percentage"
                                                        ? "border-primary bg-primary/10"
                                                        : "border-border hover:border-primary/50"
                                                } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                            >
                                                <Percent className="h-5 w-5" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Split by Percentages</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                onClick={() => setSplitType("shares")}
                                                disabled={isLoading}
                                                className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                                                    splitType === "shares"
                                                        ? "border-primary bg-primary/10"
                                                        : "border-border hover:border-primary/50"
                                                } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                            >
                                                <PieChart className="h-5 w-5" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Split by Shares</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </TooltipProvider>
                        </div>

                        {splitType === "equal" && amount && (
                            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                                Each person pays: ${(parseFloat(amount) / members.length).toFixed(2)}
                            </div>
                        )}

                        {splitType === "custom" && (
                            <div className="grid gap-3">
                                <div className="flex justify-between items-center">
                                    <Label>Custom Split Amounts</Label>
                                    <span className="text-sm text-muted-foreground">
                                        Total: ${currentSplitsSum.toFixed(2)} / ${amount || "0.00"}
                                    </span>
                                </div>
                                <div className="grid gap-2 max-h-[200px] overflow-y-auto border rounded-lg p-3">
                                    {members.map((member) => (
                                        <div key={member.id} className="flex items-center gap-2">
                                            <Label className="flex-1 text-sm font-normal">
                                                {member.user.name || member.user.email}
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="0.00"
                                                value={customSplits[member.id] || ""}
                                                onChange={(e) => handleCustomSplitChange(member.id, e.target.value)}
                                                disabled={isLoading}
                                                className="w-32"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {splitType === "percentage" && (
                            <div className="grid gap-3">
                                <div className="flex justify-between items-center">
                                    <Label>Percentage Split</Label>
                                    <span className="text-sm text-muted-foreground">
                                        Total: {Object.values(percentages).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(1)}% / 100%
                                    </span>
                                </div>
                                <div className="grid gap-2 max-h-[200px] overflow-y-auto border rounded-lg p-3">
                                    {members.map((member) => (
                                        <div key={member.id} className="flex items-center gap-2">
                                            <Label className="flex-1 text-sm font-normal">
                                                {member.user.name || member.user.email}
                                            </Label>
                                            <div className="flex items-center gap-1">
                                                <Input
                                                    type="number"
                                                    step="0.1"
                                                    min="0"
                                                    max="100"
                                                    placeholder="0"
                                                    value={percentages[member.id] || ""}
                                                    onChange={(e) => setPercentages(prev => ({
                                                        ...prev,
                                                        [member.id]: e.target.value,
                                                    }))}
                                                    disabled={isLoading}
                                                    className="w-24"
                                                />
                                                <span className="text-sm text-muted-foreground">%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {amount && (
                                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                                        <div className="font-medium mb-1">Preview:</div>
                                        {members.map((member) => {
                                            const percentage = parseFloat(percentages[member.id] || "0")
                                            const memberAmount = (parseFloat(amount) * percentage / 100).toFixed(2)
                                            return percentage > 0 ? (
                                                <div key={member.id} className="flex justify-between">
                                                    <span>{member.user.name || member.user.email}:</span>
                                                    <span>${memberAmount} ({percentage}%)</span>
                                                </div>
                                            ) : null
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {splitType === "shares" && (
                            <div className="grid gap-3">
                                <div className="flex justify-between items-center">
                                    <Label>Share Split</Label>
                                    <span className="text-sm text-muted-foreground">
                                        Total Shares: {Object.values(shares).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)}
                                    </span>
                                </div>
                                <div className="grid gap-2 max-h-[200px] overflow-y-auto border rounded-lg p-3">
                                    {members.map((member) => (
                                        <div key={member.id} className="flex items-center gap-2">
                                            <Label className="flex-1 text-sm font-normal">
                                                {member.user.name || member.user.email}
                                            </Label>
                                            <Input
                                                type="number"
                                                step="1"
                                                min="0"
                                                placeholder="0"
                                                value={shares[member.id] || ""}
                                                onChange={(e) => setShares(prev => ({
                                                    ...prev,
                                                    [member.id]: e.target.value,
                                                }))}
                                                disabled={isLoading}
                                                className="w-24"
                                            />
                                        </div>
                                    ))}
                                </div>
                                {amount && (
                                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                                        <div className="font-medium mb-1">Preview:</div>
                                        {(() => {
                                            const totalShares = Object.values(shares).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
                                            const amountPerShare = totalShares > 0 ? parseFloat(amount) / totalShares : 0
                                            return members.map((member) => {
                                                const memberShares = parseFloat(shares[member.id] || "0")
                                                const memberAmount = (amountPerShare * memberShares).toFixed(2)
                                                return memberShares > 0 ? (
                                                    <div key={member.id} className="flex justify-between">
                                                        <span>{member.user.name || member.user.email}:</span>
                                                        <span>${memberAmount} ({memberShares} {memberShares === 1 ? 'share' : 'shares'})</span>
                                                    </div>
                                                ) : null
                                            })
                                        })()}
                                    </div>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                                {error}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Expense"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
