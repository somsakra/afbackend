import { ActivityStatus } from "../generated/prisma/client.js";

export interface ActivityCreateRequest {
    user: string
    title: string
    description: string
    location: string
    date: Date
    requiredPeople: number
    image?: string
    categoryId: string
    status: ActivityStatus
}