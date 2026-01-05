import { prisma } from "../lib/prisma.js"


const categories = prisma.category.createMany({
    data: [
        { id: "001", name: "Food" },
        { id: "002", name: "Sport" },
        { id: "003", name: "Travel" },
        { id: "004", name: "Other" },
    ],
});

console.log("Seeding categories...");

await prisma.$transaction([categories]);

console.log("Seeding completed.");

await prisma.$disconnect();