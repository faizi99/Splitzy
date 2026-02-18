'use server'

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { signIn } from "@/auth"

export async function createGroup(formData: FormData) {
    const name = formData.get("name") as string || "Untitled Group"

    const group = await prisma.group.create({
        data: {
            name,
        },
    })

    redirect(`/group/${group.id}`)
}

export async function deleteMember(memberId: string, groupId: string) {
    // Check if member has any expenses paid
    const expensesPaid = await prisma.expense.count({
        where: { payerId: memberId },
    })

    if (expensesPaid > 0) {
        throw new Error("Cannot delete member who has paid expenses")
    }

    // Check if member has any splits
    const splits = await prisma.split.count({
        where: { memberId },
    })

    if (splits > 0) {
        throw new Error("Cannot delete member who has expense splits")
    }

    await prisma.member.delete({
        where: { id: memberId },
    })

    revalidatePath(`/group/${groupId}`)
}

export async function deleteGroup(groupId: string) {
    await prisma.group.delete({
        where: { id: groupId },
    })

    revalidatePath('/')
}

export async function registerUser(formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
        throw new Error("Email and password are required")
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    })

    if (existingUser) {
        throw new Error("User with this email already exists")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    })

    // Sign in the user
    await signIn("credentials", {
        email,
        password,
        redirect: false,
    })

    redirect("/")
}

export async function addMemberToGroupByUserId(groupId: string, userId: string) {
    // Check if user is already a member
    const existingMember = await prisma.member.findFirst({
        where: {
            groupId,
            userId,
        },
    })

    if (existingMember) {
        throw new Error("User is already a member of this group")
    }

    const member = await prisma.member.create({
        data: {
            groupId,
            userId,
        },
    })

    revalidatePath(`/group/${groupId}`)
    return member
}

export async function getAllUsers() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
        },
        orderBy: {
            name: 'asc',
        },
    })

    return users
}

// Expense Management Actions

type SplitInput = {
    memberId: string
    amount: number
}

export async function createExpense(
    groupId: string,
    payerId: string,
    amount: number,
    description: string,
    date: Date,
    splits: SplitInput[]
) {
    // Validate that splits sum to total amount
    const splitsSum = splits.reduce((sum: number, split: SplitInput) => sum + split.amount, 0)
    if (Math.abs(splitsSum - amount) > 0.01) { // Allow for floating point errors
        throw new Error(`Splits must sum to total amount. Got ${splitsSum}, expected ${amount}`)
    }

    // Validate that payer is in the group
    const payer = await prisma.member.findFirst({
        where: {
            id: payerId,
            groupId,
        },
    })

    if (!payer) {
        throw new Error("Payer must be a member of the group")
    }

    // Create expense with splits in a transaction
    const expense = await prisma.expense.create({
        data: {
            description,
            amount,
            date,
            groupId,
            payerId,
            splits: {
                create: splits.map((split: SplitInput) => ({
                    amount: split.amount,
                    memberId: split.memberId,
                })),
            },
        },
        include: {
            payer: {
                include: {
                    user: true,
                },
            },
            splits: {
                include: {
                    member: {
                        include: {
                            user: true,
                        },
                    },
                },
            },
        },
    })

    revalidatePath(`/group/${groupId}`)
    return expense
}

export async function deleteExpense(expenseId: string, groupId: string) {
    await prisma.expense.delete({
        where: { id: expenseId },
    })

    revalidatePath(`/group/${groupId}`)
}

export async function updateExpense(
    expenseId: string,
    groupId: string,
    data: {
        description?: string
        amount?: number
        date?: Date
        payerId?: string
        splits?: SplitInput[]
    }
) {
    // If amount or splits are being updated, validate
    if (data.amount !== undefined || data.splits !== undefined) {
        const expense = await prisma.expense.findUnique({
            where: { id: expenseId },
            include: { splits: true },
        })

        if (!expense) {
            throw new Error("Expense not found")
        }

        const newAmount = data.amount ?? expense.amount
        const newSplits = data.splits ?? expense.splits

        const splitsSum = newSplits.reduce((sum: number, split: SplitInput | { amount: number }) => {
            return sum + (split.amount || 0)
        }, 0)

        if (Math.abs(splitsSum - newAmount) > 0.01) {
            throw new Error(`Splits must sum to total amount. Got ${splitsSum}, expected ${newAmount}`)
        }
    }

    // If splits are being updated, delete old ones and create new ones
    if (data.splits) {
        await prisma.split.deleteMany({
            where: { expenseId },
        })

        await prisma.expense.update({
            where: { id: expenseId },
            data: {
                description: data.description,
                amount: data.amount,
                date: data.date,
                payerId: data.payerId,
                splits: {
                    create: data.splits.map((split: SplitInput) => ({
                        amount: split.amount,
                        memberId: split.memberId,
                    })),
                },
            },
        })
    } else {
        // Just update the expense fields
        await prisma.expense.update({
            where: { id: expenseId },
            data: {
                description: data.description,
                amount: data.amount,
                date: data.date,
                payerId: data.payerId,
            },
        })
    }

    revalidatePath(`/group/${groupId}`)
}

export async function recordSettlement(
    groupId: string,
    fromId: string,
    toId: string,
    amount: number,
    note?: string
) {
    await prisma.settlement.create({
        data: { groupId, fromId, toId, amount, note },
    })
    revalidatePath(`/group/${groupId}`)
}

export async function deleteSettlement(settlementId: string, groupId: string) {
    await prisma.settlement.delete({ where: { id: settlementId } })
    revalidatePath(`/group/${groupId}`)
}
