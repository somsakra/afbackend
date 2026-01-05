import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { ActivityStatus } from "../generated/prisma/client.js";
import { ActivityCreateRequest, ActivityPatchRequest } from "../interface/index.js";

const activityRouter = Router();

activityRouter.get("/", async (req: Request, res: Response) => {
    res.json({ message: "Activity route is working!" });
})

activityRouter.post("/", async (req: Request<{}, {}, ActivityCreateRequest>, res: Response) => {
    const userId = (req as any).user;
    //Extract activity details from request body
    const { title, description, location, date, requiredPeople, image, categoryId, status } = req.body;
    if (!title || !description || !location || !date || !requiredPeople || !categoryId || !status) {
        res.status(400).json({ message: "Missing required fields" });
        return
    }
    try {
        const newActivity = await prisma.activity.create({
            data: {
                title,
                description,
                location,
                date: new Date(1767497589378),
                requiredPeople,
                joinedPeople: 0,
                image,
                creatorId: userId,
                status: ActivityStatus[status],
                categoryId
            }
        })
        res.status(201).json({ message: "Activity created successfully", activity: newActivity });
    } catch (error) {
        console.log("Error creating activity:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

activityRouter.patch("/", async (req: Request<{}, {}, ActivityPatchRequest>, res: Response) => {
    const userId = (req as any).user;
    //Extract activity details from request body
    const { activityId, title, description, location, date, requiredPeople, image, categoryId, status } = req.body;
    //Check for required fields
    if (!activityId || !title || !description || !location || !date || !requiredPeople || !categoryId || !status) {
        res.status(400).json({ message: "Missing required fields" });
        return
    }
    try {
        //Check if activity exists
        const activityExists = await prisma.activity.findUnique({
            where: {
                id: activityId
            }
        })
        if (!activityExists) {
            res.status(404).json({ message: "Activity not found" });
            return;
        }
        //Check if the user is the creator of the activity
        if (activityExists.creatorId !== userId) {
            res.status(403).json({ message: "You are not authorized to update this activity" });
            return;
        }
        //Update activity in database
        const updateActivity = await prisma.activity.update({
            where: {
                id: activityId
            },
            data: {
                title,
                description,
                location,
                date: new Date(1767497589378),
                requiredPeople,
                joinedPeople: 0,
                image,
                status: ActivityStatus[status],
                categoryId
            }
        })
        res.status(201).json({ message: "Activity updated successfully", activity: updateActivity });
    } catch (error) {
        console.log("Error updating activity:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

activityRouter.post("/join/:activityId", async (req: Request<{ activityId: string }, {}, {}>, res: Response) => {
    const userId = (req as any).user;
    const { activityId } = req.params;
    try {
        //Check if activity exists
        const activityExists = await prisma.activity.findUnique({
            where: {
                id: activityId
            }
        })
        if (!activityExists) {
            res.status(404).json({ message: "Activity not found" });
            return;
        }
        //Check if user already joined the activity
        const userActivityExists = await prisma.userActivity.findFirst({
            where: {
                userId: userId,
                activityId: activityId,
            }
        })
        if (userActivityExists) {
            res.status(400).json({ message: "You have already joined this activity" });
            return;
        }
        //Check if activity is full
        if (activityExists.joinedPeople >= activityExists.requiredPeople) {
            res.status(400).json({ message: "Activity is full" });
            return;
        }
        //Create user activity entry
        const newUserActivity = await prisma.userActivity.create({
            data: {
                userId: userId,
                activityId: req.params.activityId,
            }
        })
        //Update joinedPeople count in activity
        await prisma.activity.update({
            where: {
                id: req.params.activityId
            },
            data: {
                joinedPeople: {
                    increment: 1
                }
            }
        })
        res.status(201).json({ message: "Activity join successfully", userActivity: newUserActivity });
    } catch (error) {
        console.log("Error creating activity:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

activityRouter.delete("/:activityId", async (req: Request<{ activityId: string }, {}, {}>, res: Response) => {
    const userId = (req as any).user;
    const { activityId } = req.params;
    try {
        //Check if activity exists
        const activityExists = await prisma.activity.findUnique({
            where: {
                id: activityId
            }
        })
        if (!activityExists) {
            res.status(404).json({ message: "Activity not found" });
            return;
        }
        //Check if the user is the creator of the activity
        if (activityExists.creatorId !== userId) {
            res.status(403).json({ message: "You are not authorized to delete this activity" });
            return;
        }
        //Delete activity from database
        const deletedActivity = await prisma.activity.delete({
            where: {
                id: activityId
            }
        })
        res.status(201).json({ message: "Activity deleted successfully", activity: deletedActivity });
    } catch (error) {
        console.log("Error deleting activity:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default activityRouter;