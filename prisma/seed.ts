import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
    url: "file:./dev.db",
});
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    console.log("Seeding started...");

    // 1. Create a Default Project
    const project = await prisma.project.upsert({
        where: { apiKey: "ch_test_key_12345" },
        update: {},
        create: {
            name: "Acme SaaS",
            apiKey: "ch_test_key_12345",
            ownerId: "user_2test",
        },
    });

    console.log(`Project created: ${project.name}`);

    // 2. Create sample customers
    const customerNames = ["Alice Smith", "Bob Jones", "Charlie Brown", "Diana Prince", "Ethan Hunt"];

    for (const name of customerNames) {
        const externalId = `cust_${name.toLowerCase().replace(" ", "_")}`;
        const customer = await prisma.customer.upsert({
            where: { externalId },
            update: {},
            create: {
                externalId,
                name,
                email: `${externalId}@example.com`,
                company: "Example Inc",
                projectId: project.id,
                healthScore: Math.floor(Math.random() * 100),
                riskLevel: "Medium",
            },
        });

        // 3. Create sample events for each customer
        const events = ["login", "page_view", "click_cta", "export_data", "update_settings"];
        for (let i = 0; i < 20; i++) {
            const randomDays = Math.floor(Math.random() * 30);
            const timestamp = new Date();
            timestamp.setDate(timestamp.getDate() - randomDays);

            await prisma.event.create({
                data: {
                    name: events[Math.floor(Math.random() * events.length)],
                    customerId: customer.id,
                    timestamp,
                },
            });
        }
        console.log(`Seeded 20 events for ${name}`);
    }

    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
