# churnova-ai

Churnova AI is an **intelligent platform** designed to help SaaS businesses
*prevent customer churn*. It does this by **securely collecting customer usage
data**, using *machine learning* to predict which customers are at risk, and
then providing **actionable insights and automated alerts** through a user-friendly
dashboard to inform retention strategies.


## Visual Overview

```mermaid
flowchart TD
    A0["ML Churn Intelligence Pipeline
"]
    A1["Customer Data Model & ORM
"]
    A2["Data Ingestion API
"]
    A3["Global State Management (Zustand Store)
"]
    A4["Alerting & Notification System
"]
    A5["Dashboard & Analytics Views
"]
    A6["Project & API Key Management
"]
    A0 -- "Updates Customer Data" --> A1
    A0 -- "Triggers Alerts" --> A4
    A0 -- "Provides Insights to" --> A5
    A1 -- "Feeds Data to ML" --> A0
    A1 -- "Stores Ingested Data" --> A2
    A1 -- "Populates UI State" --> A3
    A1 -- "Provides Alert Context" --> A4
    A1 -- "Source for Views" --> A5
    A1 -- "Structures Project Data" --> A6
    A2 -- "Writes Customer Data" --> A1
    A2 -- "Triggers Health Calc" --> A0
    A2 -- "Authenticates with" --> A6
    A3 -- "Manages UI State" --> A5
    A3 -- "Initiates ML Retrain" --> A0
    A3 -- "Stores Active Project" --> A6
    A4 -- "Displays Notifications" --> A5
    A4 -- "Uses Project Settings" --> A6
    A5 -- "Updates UI State" --> A3
    A5 -- "Manages Project Config" --> A6
    A6 -- "Persists Project Data" --> A1
    A6 -- "Issues API Keys" --> A2
    A6 -- "Defines Alert Channels" --> A4
```


## Chapters

1. [Project & API Key Management](#Chapter-1-Project--API-Key-Management)
2. [Prisma Data Model](#Chapter-2-Prisma-Data-Model)
3. [Telemetry Ingestion API](#Chapter-3-Telemetry-Ingestion-API)
4. [Customer Health Scoring Logic](#Chapter-4-Customer-Health-Scoring-Logic)
5. [ML Churn Prediction Pipeline](#Chapter-5-ML-Churn-Prediction-Pipeline)
6. [AI Insights Engine](#Chapter-6-AI-Insights-Engine)
7. [Automated Alerting System](#Chapter-7-Automated-Alerting-System)
8. [Dashboard Analytics & Reporting](#Chapter-8-Dashboard-Analytics--Reporting)

---

# Chapter 1: Project & API Key Management

Welcome to Churnova AI! This first chapter introduces you to the foundational concept of managing your projects and their access keys. Think of it as setting up your workspace before you start building.

### The Problem: Keeping Your SaaS Apps Separate and Secure

Imagine you run two different Software-as-a-Service (SaaS) applications: "Acme Analytics" and "Beta Marketing". Both have their own users, data, and churn patterns. You want to use Churnova AI to predict churn for *both* of them, but you absolutely need to keep their data and settings completely separate. You also need a secure way for each app to send its data to Churnova AI without mixing things up or allowing unauthorized access.

This is exactly where **Project & API Key Management** comes in!

### What are Projects and API Keys?

Let's break down this concept into two simple ideas:

1.  **Projects**:
    Think of a **Project** in Churnova AI like a separate, secure folder or a dedicated workspace for each of your SaaS applications. If you have "Acme Analytics" and "Beta Marketing," you'd create one "Acme Analytics Project" and another "Beta Marketing Project."

    Each project is:
    *   **Isolated**: Data from "Acme Analytics" stays only in its project; it never mixes with "Beta Marketing" data.
    *   **Configurable**: You can set unique alert preferences (like who gets churn emails) or integrate with specific tools (like Slack) for each project.
    *   **Manageable**: You can add, update, or delete projects as your business evolves.

2.  **API Keys**:
    An **API Key** is like a unique, secret password or a digital fingerprint for your project. When your "Acme Analytics" application needs to send user activity data to Churnova AI, it uses its specific API Key.

    This key serves two main purposes:
    *   **Identification**: It tells Churnova AI, "Hey, this data is coming from the 'Acme Analytics' project."
    *   **Authentication**: It proves that the request is legitimate and authorized by you. No API Key, no data accepted!

### How to Use Projects & API Keys: A Simple Scenario

Let's walk through our "Acme Analytics" example. To start tracking churn for "Acme Analytics" with Churnova AI, you would:

1.  **Create a New Project**: You'd name it "Acme Analytics".
2.  **Receive an API Key**: Churnova AI automatically gives you a special API key for "Acme Analytics".
3.  **Use the API Key**: You'll then include this API Key in all data you send from "Acme Analytics" to Churnova AI. This is how Churnova knows where the data belongs! (You'll learn more about sending data in [Telemetry Ingestion API](#Chapter-3-Telemetry-Ingestion-API)).

Later, if you also wanted to track "Beta Marketing," you'd simply repeat these steps, creating a new project and getting a new, separate API key for it.

### Creating Your First Project (UI Example)

When you first sign up for Churnova AI, you'll be guided to create your first project. Here's a simplified look at what happens in the user interface (UI):

```typescript
// src/app/onboarding/page.tsx - Simplified UI code for project creation
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // For showing notifications

export default function OnboardingPage() {
    const [name, setName] = useState(""); // Stores the project name
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return; // Project name is required!

        setLoading(true);
        try {
            // Send the project name to our backend to create a project
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            });

            if (!res.ok) throw new Error("Failed to create project");

            const project = await res.json(); // Get the new project details
            toast.success("Project created successfully!");
            router.push(`/dashboard?projectId=${project.id}`); // Go to dashboard
        } catch (error) {
            toast.error("Error creating project. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleCreate}>
            <input
                placeholder="e.g. Acme SaaS"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <button type="submit" disabled={loading || !name}>
                {loading ? "Creating..." : "Generate API Key"}
            </button>
        </form>
    );
}
```
**Explanation**: This code snippet shows the core logic for how the Churnova AI onboarding page handles creating a new project. You type a name into an input field, click a button, and the `handleCreate` function sends that name to the Churnova AI server. If successful, it receives the new project's details, including its ID, and navigates you to your dashboard.

### Managing Your API Keys (UI Example)

Once your project is created, you can always manage its API keys in the settings. You might want to generate new keys for different environments (e.g., one for your development server, another for your live production app) or revoke a key if it's been exposed.

```typescript
// src/app/dashboard/settings/page.tsx - Simplified UI code for API key management
import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { activeProjectId } = useAppStore(); // Get current project ID
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);

  // ... (other setup and UI parts)

  const handleCreateApiKey = async () => {
    if (!activeProjectId || !newKeyName) return;
    setCreatingKey(true);
    try {
      // Send a request to create a new API key for the active project
      const res = await fetch(`/api/projects/${activeProjectId}/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName })
      });
      if (res.ok) {
        toast.success("API Key generated successfully");
        setNewKeyName(""); // Clear input
        // Refresh the list of API keys
        // (Simplified: In real app, it calls another fetchApiKeys function)
      } else {
        toast.error("Failed to generate API Key");
      }
    } catch (err) {
      toast.error("Error connecting to server");
    } finally {
      setCreatingKey(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!activeProjectId) return;
    try {
      // Send a request to delete a specific API key from the active project
      const res = await fetch(`/api/projects/${activeProjectId}/keys`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId })
      });
      if (res.ok) {
        toast.success("API Key revoked");
        // Refresh the list of API keys
      } else {
        toast.error("Failed to revoke API Key");
      }
    } catch (err) {
      toast.error("Error revoking API Key");
    }
  };

  return (
    <div>
        {/* ... UI to display existing keys ... */}
        <input
            placeholder="e.g. Production Backend"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
        />
        <button onClick={handleCreateApiKey} disabled={creatingKey || !newKeyName}>
            Generate New Key
        </button>
        {/* ... UI to revoke keys ... */}
    </div>
  );
}
```

**Explanation**: This snippet shows how you'd interact with the API key management features. You can provide a name for a new key, and `handleCreateApiKey` sends this request to the server. Similarly, `handleRevokeKey` sends a request to remove an existing key. These actions update the list of keys displayed for your project.

### Under the Hood: How Project Creation Works

When you click "Generate API Key" on the onboarding screen for "Acme Analytics," here's a simplified step-by-step look at what happens in the Churnova AI system:

1.  **You (the User)** click the button with your project name.
2.  **Churnova UI** sends your project name to the Churnova Backend.
3.  **Churnova Backend** checks who you are (using your login details).
4.  **Churnova Backend** creates a new Project record in the Database, linking it to your user account.
5.  **Churnova Backend** automatically generates a unique, secret API Key and creates an API Key record in the Database, linking it to your new Project.
6.  **Churnova Backend** sends back the details of your new Project (including its ID and the generated API Key) to the Churnova UI.
7.  **Churnova UI** shows you a success message and guides you to your new project's dashboard.

Here's a simple diagram to visualize this flow:

```mermaid
sequenceDiagram
    participant User
    participant Churnova UI
    participant Churnova Backend
    participant Database

    User->>Churnova UI: Provides project name "Acme Analytics"
    Churnova UI->>Churnova Backend: POST /api/projects with name="Acme Analytics"
    Note over Churnova Backend: Verifies user login
    Churnova Backend->>Database: Create Project (name, ownerId)
    Database-->>Churnova Backend: Returns new Project ID
    Note over Churnova Backend: Generates a new API Key "chr_..."
    Churnova Backend->>Database: Create API Key (name="Default", key, projectId)
    Database-->>Churnova Backend: Returns new API Key details
    Churnova Backend-->>Churnova UI: Returns Project ID and API Key details
    Churnova UI->>User: Shows success, redirects to dashboard
```

### Diving Deeper into the Code (Backend)

Let's look at the server-side code responsible for these actions:

#### 1. Creating a Project and its Default API Key

The `POST` request to `/api/projects` handles creating a new project.

```typescript
// src/app/api/projects/route.ts - Simplified POST for creating a project
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; // For user authentication
import { prisma } from "@/lib/prisma"; // Our database client
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs

export async function POST(req: Request) {
    try {
        const { userId } = await auth(); // Get logged-in user's ID
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { name } = await req.json(); // Get project name from request
        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        // Generate a unique API key string
        const apiKey = `chr_${uuidv4().replace(/-/g, "")}`;

        const project = await prisma.project.create({
            data: {
                name,
                ownerId: userId, // Link project to the user
                apiKeys: {
                    create: { // Automatically create a default API key
                        name: "Default API Key",
                        key: apiKey
                    }
                }
            },
        });

        return NextResponse.json(project);
    } catch (error: any) {
        console.error("Project Creation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
```

**Explanation**:
*   First, we check if a user is logged in (`auth()`). If not, they are "Unauthorized."
*   Then, we get the `name` for the new project from the request.
*   We generate a unique `apiKey` using `uuidv4()` and prefix it with `chr_`.
*   Finally, `prisma.project.create` is called. This is a powerful command that not only creates the `project` record but also, thanks to `apiKeys: { create: ... }`, automatically creates a `default API key` that is linked to this new project. This ensures every new project has an immediate way to send data to Churnova AI.

#### 2. Managing API Keys for an Existing Project

The `POST`, `GET`, and `DELETE` requests to `/api/projects/[id]/keys` handle the API key operations.

**Getting API Keys:**

```typescript
// src/app/api/projects/[id]/keys/route.ts - Simplified GET for fetching keys
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: projectId } = await params; // Get project ID from URL

        // Verify the user owns this project for security
        const project = await prisma.project.findUnique({ where: { id: projectId }, select: { ownerId: true } });
        if (!project || project.ownerId !== userId) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        const apiKeys = await prisma.apiKey.findMany({
            where: { projectId }, // Fetch keys belonging to this project
            orderBy: { createdAt: 'desc' }
        });

        // (Code for auto-generating fallback key omitted for brevity)

        return NextResponse.json({ apiKeys });
    } catch (error: any) {
        console.error("API Key Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
```
**Explanation**: This code fetches all API keys associated with a specific project ID. Crucially, it first checks if the currently logged-in user (`userId`) is indeed the `ownerId` of the project. This ensures that users can only view API keys for their *own* projects, maintaining security and isolation.

**Creating a New API Key (beyond the default):**

```typescript
// src/app/api/projects/[id]/keys/route.ts - Simplified POST for creating a key
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto"; // For generating secure random keys

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: projectId } = await params;
        const { name } = await req.json(); // Name for the new key (e.g., "Dev Key")

        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        // Again, verify project ownership for security
        const project = await prisma.project.findUnique({ where: { id: projectId }, select: { ownerId: true } });
        if (!project || project.ownerId !== userId) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        const rawKey = crypto.randomBytes(32).toString("hex"); // Generate a random string
        const apiKeyString = `chr_${rawKey}`; // Prefix it

        const newKey = await prisma.apiKey.create({
            data: {
                name,
                key: apiKeyString,
                projectId: projectId, // Link to the project
            }
        });

        return NextResponse.json(newKey);
    } catch (error: any) {
        console.error("API Key Creation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
```
**Explanation**: Similar to project creation, this function first verifies the user's authorization and project ownership. It then generates a truly random, secure `apiKeyString` using `crypto.randomBytes` (much safer than `uuidv4` for security keys!) and stores it in the database with the provided `name` and linked to the `projectId`.

**Deleting an API Key:**

```typescript
// src/app/api/projects/[id]/keys/route.ts - Simplified DELETE for revoking keys
import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: projectId } = await params;
        const { keyId } = await req.json(); // ID of the specific key to delete

        // Always verify project ownership
        const project = await prisma.project.findUnique({ where: { id: projectId }, select: { ownerId: true } });
        if (!project || project.ownerId !== userId) {
            return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
        }

        await prisma.apiKey.delete({
            where: { id: keyId, projectId: projectId }, // Delete key only if it belongs to this project
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API Key Deletion Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
```
**Explanation**: This function handles revoking an API key. After verifying the user and project ownership, it deletes the specified `keyId` from the database. The `projectId` check in the `where` clause is crucial: it ensures a user can only delete keys that actually belong to their project, preventing accidental or malicious deletions of other users' keys.

### Conclusion

In this chapter, you learned that Churnova AI uses **Projects** to create isolated workspaces for each of your SaaS applications and **API Keys** as secure passwords for those projects to send data. This structure ensures your data is organized, secure, and manageable. You saw how easy it is to create a project and manage its API keys both through the UI and in the backend code.

Next, we'll dive into how Churnova AI actually stores all this information, including your projects and API keys, using something called a "Prisma Data Model".


---

# Chapter 2: Prisma Data Model

Welcome back! In [Chapter 1: Project & API Key Management](#Chapter-1-Project--API-Key-Management), we learned how Churnova AI organizes your different SaaS applications into "Projects" and secures them with "API Keys." You saw how we create a project and its API key, and how the Churnova AI backend code (`src/app/api/projects/route.ts`) interacts with `prisma.project.create` and `prisma.apiKey.create` to make this happen.

But wait, where do these "projects," "API keys," and all their details actually *live*? How does Churnova AI *remember* them? That's where the **Prisma Data Model** comes in!

### The Problem: How to Organize and Store Your Data

Imagine you have many projects like "Acme Analytics" and "Beta Marketing," each with hundreds or thousands of customers. Each customer performs various actions (events), and Churnova AI constantly calculates their health scores.

Churnova AI needs a clear, structured way to:
1.  **Store** all this information (project names, API keys, customer emails, event details, health scores).
2.  **Understand** how different pieces of information are connected (e.g., which customer belongs to which project, or which events belong to which customer).
3.  **Ensure consistency** so that, for example, a customer always belongs to an existing project, and an event always links to a valid customer.

This is exactly the problem the **Prisma Data Model** solves.

### What is the Prisma Data Model? A Blueprint for Your Data

Think of the Prisma Data Model as the **master blueprint** or **recipe book** for all the information Churnova AI stores in its database.

Just like a blueprint shows every room, wall, and connection in a house, our data model describes:
*   All the different "things" (like `Projects`, `Customers`, `Events`). We call these **Models**.
*   What details each "thing" has (like a `Project` having a `name` and an `ownerId`). These are called **Fields**.
*   How these different "things" are connected (e.g., a `Project` can have many `Customers`). These are called **Relations**.

This blueprint ensures that Churnova AI always knows exactly how its data is structured.

In Churnova AI, this blueprint lives in a special file: `prisma/schema.prisma`.

### Core Entities of the Churnova AI Data Model

Let's look at the main "things" (models) that Churnova AI tracks, and how they relate to each other. We'll show simplified snippets from our `prisma/schema.prisma` file.

#### 1. `Project` Model: Your Application's Workspace

You know about `Projects` from Chapter 1. This model defines what a project looks like in our database.

```prisma
// prisma/schema.prisma - Simplified Project model
model Project {
  id        String     @id @default(cuid()) // Unique ID for each project (like "pro_abcdef123")
  name      String                       // The name you give your project, e.g., "Acme Analytics"
  ownerId   String                       // The ID of the user who owns this project
  // ... many other fields for settings, billing, etc. ...
  customers Customer[]                 // A Project can have many Customers
  apiKeys   ApiKey[]                   // A Project can have many ApiKeys
}
```

*   **`id`**: A unique identifier for each project. `@id` means it's the main way to find a project, and `@default(cuid())` means Prisma will automatically generate a unique ID for us when a new project is created.
*   **`name`**: The human-readable name of your project.
*   **`ownerId`**: The ID of the user who created and owns this project (from Clerk authentication, as seen in Chapter 1).
*   **`customers Customer[]`**: This line tells us that one `Project` can be associated with *many* `Customers`.
*   **`apiKeys ApiKey[]`**: This tells us that one `Project` can also have *many* `ApiKey`s (remember, you can generate multiple API keys for a single project!).

#### 2. `ApiKey` Model: The Digital Fingerprint

In Chapter 1, we saw that `API Keys` are crucial for identifying and authenticating data. Here's how they're defined in our data model:

```prisma
// prisma/schema.prisma - ApiKey model
model ApiKey {
  id        String   @id @default(cuid()) // Unique ID for the API key record
  name      String                     // A name for the key, e.g., "Production Key"
  key       String   @unique             // The actual secret key string, like "chr_..."
  projectId String                     // The ID of the Project this key belongs to
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  
  @@index([projectId]) // Makes searching by projectId faster
}
```

*   **`key String @unique`**: This is the actual API key string. `@unique` means no two API keys can have the exact same string, which is important for security.
*   **`projectId String`**: This field stores the `id` of the `Project` that this API key belongs to. This is how we link an `ApiKey` back to its `Project`.
*   **`project Project @relation(...)`**: This tells Prisma that the `projectId` field is a "foreign key" that connects to the `id` field of the `Project` model. `onDelete: Cascade` means if a project is deleted, all its associated API keys will also be automatically deleted.

#### 3. `Customer` Model: Who You're Tracking

This model defines the users or accounts within *your* SaaS application that Churnova AI will monitor.

```prisma
// prisma/schema.prisma - Simplified Customer model
model Customer {
  id          String    @id @default(cuid()) // Unique ID for this customer in Churnova AI
  externalId  String                         // YOUR app's ID for this customer (e.g., "user_123")
  email       String?                        // Customer's email
  name        String?                        // Customer's name
  healthScore Int?      @default(100)        // Their current health score
  riskLevel   String?   @default("Low")      // Their current churn risk level
  projectId   String                         // The ID of the Project this customer belongs to
  // ... many other fields for subscriptions, ML scores, etc. ...
  project     Project   @relation(fields: [projectId], references: [id])
  events      Event[]                      // A Customer can have many Events
  healthHistory HealthScore[]              // A Customer can have many HealthScores over time

  @@index([projectId])                      // Speeds up searching customers by project
  @@unique([projectId, externalId])         // Ensures each project has unique external customer IDs
}
```

*   **`externalId`**: This is *your* application's unique ID for your customer. It's important because Churnova AI needs to know how to refer to *your* customers.
*   **`projectId String` / `project Project @relation(...)`**: Just like with `ApiKey`, this links each `Customer` to a specific `Project`.
*   **`events Event[]`**: A `Customer` can perform *many* `Event`s.
*   **`healthHistory HealthScore[]`**: A `Customer` can have *many* `HealthScore` records, allowing us to track their health over time.
*   **`@@unique([projectId, externalId])`**: This is a powerful rule! It means that within a *single* `Project`, you cannot have two customers with the same `externalId`. This helps keep your data clean and prevents duplicates.

#### 4. `Event` Model: What Your Customers Do

This model tracks all the actions your customers take within your SaaS application. This is the raw telemetry data that Churnova AI processes.

```prisma
// prisma/schema.prisma - Event model
model Event {
  id         String   @id @default(cuid()) // Unique ID for this event
  name       String                     // Name of the event, e.g., "Login", "Subscription_Created"
  properties String?                    // Additional JSON data about the event (e.g., plan name)
  timestamp  DateTime @default(now())    // When the event happened
  customerId String                     // The ID of the Customer who performed this event
  customer   Customer @relation(fields: [customerId], references: [id])

  @@index([customerId]) // Speeds up searching events by customer
}
```

*   **`name`**: A short name describing the action (e.g., "User Signed Up", "Feature X Used").
*   **`properties`**: This field stores extra details about the event, often as a JSON string (like a mini-document).
*   **`customerId String` / `customer Customer @relation(...)`**: This links each `Event` to the `Customer` who performed it.

#### 5. `HealthScore` Model: Tracking Customer Wellness Over Time

Churnova AI calculates a health score for each customer. This model stores a history of these scores.

```prisma
// prisma/schema.prisma - HealthScore model
model HealthScore {
  id         String   @id @default(cuid()) // Unique ID for this health score record
  score      Int                        // The actual health score (e.g., 85)
  timestamp  DateTime @default(now())    // When this score was recorded
  customerId String                     // The ID of the Customer this score belongs to
  customer   Customer @relation(fields: [customerId], references: [id])

  @@index([customerId]) // Speeds up searching health scores by customer
}
```

*   **`score`**: The numerical health score (e.g., 1 to 100).
*   **`customerId String` / `customer Customer @relation(...)`**: This links each `HealthScore` record to a specific `Customer`.

### How Prisma Uses the Data Model (Under the Hood)

The `prisma/schema.prisma` file is just text. How does Churnova AI actually *use* it to talk to a real database?

Here's a simplified overview:

1.  **Prisma Client Generation**: When you run `prisma generate`, Prisma reads your `schema.prisma` file and automatically creates a special piece of code called the **Prisma Client** (located in `src/lib/prisma.ts`). This client understands all your models and their relations.
2.  **Database Interaction**: When your application code wants to do something with the database (like creating a new project or finding a customer), it uses this `Prisma Client`. The client then translates your simple commands into the specific language your database understands (like SQL).
3.  **Migrations**: When you change your `schema.prisma` (e.g., add a new field to a model), Prisma can generate "migration" files (like the ones you saw in `prisma/migrations/`). These files contain instructions to update your actual database structure to match your new blueprint.

Here's a visual flow of how your application talks to the database using Prisma:

```mermaid
sequenceDiagram
    participant Churnova AI App
    participant Prisma Client
    participant Prisma Data Model
    participant Database

    Churnova AI App->>Prisma Client: "Create Project named 'Acme Analytics'" (e.g., prisma.project.create)
    Prisma Client->>Prisma Data Model: "Consult Project blueprint"
    Prisma Data Model-->>Prisma Client: "Project has name, ownerId, and generates ID"
    Prisma Client->>Database: "INSERT into Project (id, name, ownerId) VALUES (...)" (SQL query)
    Database-->>Prisma Client: "Project created, here's its ID"
    Prisma Client-->>Churnova AI App: Returns the new Project object
```

### Prisma in Action: Connecting to Chapter 1

In [Chapter 1: Project & API Key Management](#Chapter-1-Project--API-Key-Management), we saw this code snippet in our backend when creating a new project:

```typescript
// From src/app/api/projects/route.ts (simplified)
// ...
const project = await prisma.project.create({
    data: {
        name,
        ownerId: userId,
        apiKeys: {
            create: { // Automatically create a default API key
                name: "Default API Key",
                key: apiKey
            }
        }
    },
});
// ...
```

*   **`prisma.project.create`**: Here, we're using the `Prisma Client` (our `prisma` object) and telling it to create a new record in the `Project` model.
*   **`data: { name, ownerId, ... }`**: The fields we provide (`name`, `ownerId`) directly match the fields defined in our `Project` model in `prisma/schema.prisma`.
*   **`apiKeys: { create: ... }`**: This is a powerful feature! Because our `Project` model has an `apiKeys ApiKey[]` relation, Prisma understands that when we create a project, we can *also* create linked `ApiKey` records at the same time. The fields provided (`name`, `key`) again match the `ApiKey` model's definition.

This shows how our application code is directly shaped and guided by the **Prisma Data Model**.

### Conclusion

The Prisma Data Model is the foundational blueprint that structures all data within Churnova AI. It defines what a `Project`, `ApiKey`, `Customer`, `Event`, and `HealthScore` look like, and how they all connect. This clear map ensures that our application's data is organized, consistent, and easy for developers to work with.

In the next chapter, we'll see how this structured data is filled! We'll explore the **Telemetry Ingestion API**, which is responsible for taking all those customer events from your application and saving them into our carefully designed data model.


---

# Chapter 3: Telemetry Ingestion API

Welcome back! In [Chapter 1: Project & API Key Management](#Chapter-1-Project--API-Key-Management), you learned how Churnova AI organizes your different applications into "Projects" and secures them with "API Keys." Then, in [Chapter 2: Prisma Data Model](#Chapter-2-Prisma-Data-Model), we explored the blueprint for how Churnova AI stores all its data, including `Projects`, `ApiKeys`, `Customers`, and `Events`.

Now, it's time to connect the dots! How does data from *your* application actually *get into* Churnova AI, filling up those `Customer` and `Event` models we talked about? This is where the **Telemetry Ingestion API** comes in.

### The Problem: Getting Your Customer Data to Churnova AI

Imagine your SaaS application, "Acme Analytics," is humming along. Users are signing up, logging in, using features, and sometimes updating their profile information. To predict churn for "Acme Analytics," Churnova AI needs to know about all these activities and changes!

But how do you securely and efficiently send all that real-time customer usage data (also called "telemetry") from your app to Churnova AI?

You can't just send it any old way. You need:
*   A dedicated "doorway" for this data.
*   A way to ensure only *your* "Acme Analytics" data goes into its designated Churnova AI Project.
*   A clear format for sending different types of information.

This is exactly the problem the **Telemetry Ingestion API** solves. It's the primary way for your external applications to feed customer usage data directly into Churnova AI.

### What is the Telemetry Ingestion API? Your Data Collection Funnel

Think of the Telemetry Ingestion API as the special "mailbox" or "funnel" where your applications securely send all their customer activity. It's designed specifically to collect raw behavioral events and customer profile updates.

This API is crucial because it's the first step in populating Churnova AI with the fresh, real-time data that then fuels the entire churn prediction and analytics system.

It handles two main types of incoming data:

1.  **`track`**: This is for recording specific actions or events a customer performs in your application.
    *   **Example**: "User logged in," "Subscription created," "Used Feature X."
    *   These events will primarily populate the `Event` model in our [Prisma Data Model](#Chapter-2-Prisma-Data-Model).
2.  **`identify`**: This is for updating a customer's profile information or confirming their identity.
    *   **Example**: "John Doe's email is `john@example.com`," "Company name is 'Acme Corp'."
    *   These updates will modify existing records or create new ones in the `Customer` model.

### How to Use the API: Sending Your Data

To use the Telemetry Ingestion API, your application makes a simple HTTP `POST` request to specific Churnova AI endpoints. Remember that **API Key** from [Chapter 1](#Chapter-1-Project--API-Key-Management)? You'll include that to identify your project!

Let's look at examples for `track` and `identify`.

#### 1. Sending a `track` Event

To tell Churnova AI that a customer performed an action, you'll send data to the `/api/track` endpoint.

**Example Use Case**: A customer, let's say with your internal ID `user-123`, just logged into "Acme Analytics."

```bash
curl -X POST \
  http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer chr_your_project_api_key_here" \
  -d '{
        "externalId": "user-123",
        "email": "john.doe@example.com",
        "name": "John Doe",
        "loginFrequency": 5,
        "avgSessionDuration": 120,
        "featureUsageRate": 0.8
      }'
```
**Explanation**:
*   `curl -X POST`: We're sending data to the API.
*   `http://localhost:3000/api/track`: This is the address of the `track` endpoint (replace `localhost:3000` with your Churnova AI deployment URL).
*   `-H "Authorization: Bearer ..."`: This is where you put your project's unique `API Key` (the `chr_...` string from [Chapter 1](#Chapter-1-Project--API-Key-Management)). This tells Churnova AI *which project* this data belongs to.
*   `-d '{ ... }'`: This is the data you're sending:
    *   `"externalId"`: Your application's unique ID for the customer. **This is super important!**
    *   `"email"`, `"name"`: Optional profile details.
    *   `"loginFrequency"`, `"avgSessionDuration"`, `"featureUsageRate"`: These are examples of numeric data points directly related to the customer's usage, which the API can directly update on the `Customer` record.

**What happens next?**
Churnova AI will receive this data. It will either create a new `Customer` record for `user-123` (if it's the first time it sees them) or update the existing `Customer` record with the new `name`, `email`, and usage statistics. It also records a generic "api_ping" event associated with this customer.

#### 2. Sending an `identify` Update

To update a customer's profile information, you'll send data to the `/api/identify` endpoint.

**Example Use Case**: Customer `user-123` (John Doe) just updated his email address to `john.d@newdomain.com`.

```bash
curl -X POST \
  http://localhost:3000/api/identify \
  -H "Content-Type: application/json" \
  -d '{
        "apiKey": "chr_your_project_api_key_here",
        "customerId": "user-123",
        "email": "john.d@newdomain.com",
        "company": "Acme Inc."
      }'
```
**Explanation**:
*   `http://localhost:3000/api/identify`: The address for the `identify` endpoint.
*   `"apiKey"`: This time, the API key is sent directly in the body (or can be in the `Authorization` header, depending on implementation).
*   `"customerId"`: Your application's unique ID for the customer.
*   `"email"`, `"company"`: The specific profile fields you want to update.

**What happens next?**
Churnova AI will find the `Customer` record for `user-123` within your project and update its `email` and `company` fields.

#### 3. Sending a Batch of Events (`/api/track/batch`)

Sometimes, you have a lot of events to send at once, perhaps from a daily export or a bulk import. The `/api/track/batch` endpoint is optimized for this.

**Example Use Case**: You have a list of user activities from overnight, and you want to send them all efficiently.

```bash
curl -X POST \
  http://localhost:3000/api/track/batch \
  -H "Content-Type: application/json" \
  -H "x-api-key: chr_your_project_api_key_here" \
  -d '{
        "events": [
          {
            "userId": "user-124",
            "properties": { "event_name": "Login", "plan_type": "pro" }
          },
          {
            "userId": "user-125",
            "properties": { "event_name": "Subscription_Created", "plan_type": "enterprise" }
          }
        ]
      }'
```
**Explanation**:
*   `http://localhost:3000/api/track/batch`: The endpoint for batch ingestion.
*   `x-api-key`: The API key is sent in a custom header for the batch endpoint.
*   `"events"`: This is an array (list) of individual event objects. Each object should have a `"userId"` and optional `"properties"` with more details.

**What happens next?**
Churnova AI processes each event in the `events` array. For each `userId`, it will either create or update a `Customer` record and then record a generic "batch_upload" event associated with that customer. This is very efficient for large datasets.

### Under the Hood: How Data Gets Ingested

When your application sends data to the Telemetry Ingestion API, here's a simplified step-by-step look at what happens inside Churnova AI:

```mermaid
sequenceDiagram
    participant Your App
    participant Churnova AI API
    participant Prisma Client
    participant Database

    Your App->>Churnova AI API: POST /api/track (API Key, customerId, data)
    Note over Churnova AI API: 1. Authenticate API Key
    Churnova AI API->>Prisma Client: Look up Project by API Key
    Prisma Client->>Database: SELECT * FROM ApiKey WHERE key = ...
    Database-->>Prisma Client: Returns ApiKey and Project
    Prisma Client-->>Churnova AI API: Project found!
    Note over Churnova AI API: 2. Find or Create Customer
    Churnova AI API->>Prisma Client: upsert Customer (externalId, projectId, data)
    Prisma Client->>Database: INSERT/UPDATE Customer table
    Database-->>Prisma Client: Returns Customer details
    Prisma Client-->>Churnova AI API: Customer handled!
    Note over Churnova AI API: 3. Record Event (if 'track')
    Churnova AI API->>Prisma Client: create Event (name, customerId, properties)
    Prisma Client->>Database: INSERT into Event table
    Database-->>Prisma Client: Event created!
    Churnova AI API-->>Your App: Success Response
```

Let's dive a bit into the actual code to see how `track` and `identify` are implemented using our [Prisma Data Model](#Chapter-2-Prisma-Data-Model) and the `Prisma Client`.

#### 1. The `/api/track` Endpoint

This route in `src/app/api/track/route.ts` is responsible for receiving customer activity.

```typescript
// src/app/api/track/route.ts - Simplified POST handler
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Our database client

export async function POST(req: Request) {
    // 1. Validate API Key from Authorization header
    const authHeader = req.headers.get("Authorization");
    const apiKey = authHeader?.split(" ")[1]; // Get the 'chr_...' key

    const apiKeyRecord = await prisma.apiKey.findFirst({
        where: { key: apiKey },
        include: { project: true } // Fetch the related project
    });
    if (!apiKeyRecord) {
        return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
    }
    const project = apiKeyRecord.project; // We found the project!

    const body = await req.json();
    const { externalId, email, name, company, ...otherData } = body;

    if (!externalId) {
        return NextResponse.json({ error: "Missing externalId" }, { status: 400 });
    }

    // 2. Find or Create (Upsert) the Customer
    const customer = await prisma.customer.upsert({
        where: {
            projectId_externalId: { projectId: project.id, externalId: externalId }
        },
        update: { name, email, company, lastSeen: new Date(), ...otherData },
        create: {
            externalId, projectId: project.id, name: name || "Unknown User",
            email, company, lastSeen: new Date(), healthScore: 100, // New user defaults
            riskLevel: "Low", anomalyScore: 0, churnProbability: 0,
            aiInsight: "New user integrated via Tracking API. Awaiting ML analysis.",
            ...otherData
        }
    });

    // 3. Record a generic 'api_ping' Event
    await prisma.event.create({
        data: { name: "api_ping", customerId: customer.id, properties: JSON.stringify(body) }
    });

    return NextResponse.json({ success: true, customer: customer.id });
}
```
**Explanation**:
*   **API Key Validation**: The code first extracts the API key from the `Authorization` header. It then uses `prisma.apiKey.findFirst` (with `include: { project: true }`) to find the API key record and its associated `Project`. If the key isn't valid, it sends an `Unauthorized` error.
*   **`externalId` Check**: It ensures the `externalId` (your app's customer ID) is provided, as this is essential for identifying the customer.
*   **`prisma.customer.upsert`**: This is a powerful Prisma command!
    *   `where`: It tries to find a `Customer` using the combination of `projectId` and `externalId`. Remember from [Chapter 2](#Chapter-2-Prisma-Data-Model) that we made this combination `@@unique` in our `Customer` model, so it's a reliable way to find a specific customer.
    *   `update`: If a matching customer is *found*, these fields are updated (e.g., `name`, `email`, `lastSeen`).
    *   `create`: If no matching customer is *found*, a new `Customer` record is created with these initial values.
*   **`prisma.event.create`**: Finally, a new `Event` record is created, linking it to the `customer.id` that was just found or created. This marks that data was ingested for this customer.

#### 2. The `/api/identify` Endpoint

This route in `src/app/api/identify/route.ts` is designed for updating customer profiles.

```typescript
// src/app/api/identify/route.ts - Simplified POST handler
import { NextResponse } from "next/server";
import { churnova } from "@/lib/churnova-sdk"; // Our internal SDK

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { apiKey, customerId, ...traits } = body; // Get API Key and Customer ID

        if (!apiKey || !customerId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Use our internal Churnova SDK to perform the identification logic
        const customer = await churnova.identify(apiKey, customerId, traits);

        return NextResponse.json({ success: true, customerId: customer.id });
    } catch (error: any) {
        console.error("Identify Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
```
**Explanation**:
*   **Simplified Proxy**: This API route is quite simple because it delegates most of its work to an internal helper, `churnova.identify`, found in `src/lib/churnova-sdk.ts`. This keeps the API route clean and reusable.

Let's look at the `churnova.identify` helper:

```typescript
// src/lib/churnova-sdk.ts - Simplified churnova.identify method
import { prisma } from "./prisma"; // Our database client

export const churnova = {
    async identify(apiKey: string, customerId: string, data: any) {
        // 1. Validate API Key and fetch Project
        const projectKey = await prisma.apiKey.findUnique({
            where: { key: apiKey },
            include: { project: true }
        });
        const project = projectKey?.project;
        if (!project) throw new Error("Invalid API Key");

        // 2. Find or Create (Upsert) the Customer
        const customer = await prisma.customer.upsert({
            where: {
                projectId_externalId: { projectId: project.id, externalId: customerId }
            },
            update: { ...data, lastSeen: new Date() }, // Update all provided data
            create: {
                ...data, externalId: customerId, projectId: project.id,
                name: data.name || `User ${customerId}`, lastSeen: new Date()
            },
        });
        return customer;
    },
    // ... other methods like track, applyHealthDecay
};
```
**Explanation**:
*   The `identify` method in `churnova-sdk.ts` performs very similar logic to the `track` endpoint's customer handling:
    *   It validates the `apiKey` to ensure the data belongs to a valid project.
    *   It uses `prisma.customer.upsert` to either update an existing `Customer` record (using the `externalId` and `projectId`) with the new `data` (like `email`, `name`, `company`), or create a new `Customer` if one doesn't exist. This efficiently keeps customer profiles up-to-date.

### Conclusion

The Telemetry Ingestion API is the lifeblood of Churnova AI. It provides the secure, structured, and real-time mechanism for your applications to send crucial customer usage data and profile updates. By using `track` for events and `identify` for profile changes, and authenticating with an `API Key`, your data flows into Churnova AI's [Prisma Data Model](#Chapter-2-Prisma-Data-Model), specifically populating the `Customer` and `Event` records. This continuous stream of fresh data is what makes churn prediction and analytics possible.

Next, with all this rich customer and event data flowing in, we'll see how Churnova AI starts making sense of it by calculating **Customer Health Scores**.


---

# Chapter 4: Customer Health Scoring Logic

Welcome back! In [Chapter 1: Project & API Key Management](#Chapter-1-Project--API-Key-Management), we set up our secure workspaces, and in [Chapter 2: Prisma Data Model](#Chapter-2-Prisma-Data-Model), we learned how Churnova AI blueprints its data. Then, in [Chapter 3: Telemetry Ingestion API](#Chapter-3-Telemetry-Ingestion-API), you saw how customer activity and profile updates (`Events` and `Customers`) flow into Churnova AI.

Now that we have all this raw data about what your customers are doing, how do we quickly understand if a customer is happy and engaged, or if they're starting to "drift away"? This is where the **Customer Health Scoring Logic** comes in!

### The Problem: Getting a Quick Pulse Check on Customer Well-being

Imagine you have hundreds, or even thousands, of customers in your SaaS application. Each day, they perform countless actions: logins, feature uses, support tickets, and more. While the raw `Event` data is incredibly useful, you can't manually scroll through every customer's activity log to figure out their current state.

You need a simple, immediate way to know:
1.  **How engaged is a customer right now?** Are they active, or have they been silent?
2.  **Are they at risk?** Should I pay attention to them?

This is like needing a "thermometer" for each customer's well-being. You want a quick glance to see if they're "healthy" (high score) or "feverish" (low score and high risk). This quick pulse check allows you to intervene early.

This is exactly the problem the **Customer Health Scoring Logic** solves. It provides an immediate, actionable snapshot of a customer's engagement, separate from the deeper, long-term predictions you'll see later.

### What is Customer Health Scoring Logic? Your Customer's Thermometer

The Customer Health Scoring Logic is a system within Churnova AI that automatically calculates a simple, easy-to-understand **health score** for each customer.

Here's how it works:

*   **Score (0-100)**: Every customer gets a numerical score from 0 (very unhealthy) to 100 (very healthy). A higher score means more recent and frequent activity.
*   **Risk Level (Low, Medium, High)**: Based on their score, each customer is also assigned a clear risk level:
    *   **Low**: Healthy score, good engagement.
    *   **Medium**: Score is dropping, potential concern.
    *   **High**: Very low score, immediate attention needed.
*   **Activity-Based**: This score is primarily driven by recent customer activity patterns, using simple, understandable rules.

It acts like a **simple thermometer for customer well-being**, giving you quick, actionable indicators of engagement and potential decay.

### How it Works: Scoring Your Customers

Churnova AI calculates customer health scores in two main ways:

1.  **On-Demand (When an Event Happens)**: Every time a customer performs an action (an `Event` is `track`ed via the [Telemetry Ingestion API](#Chapter-3-Telemetry-Ingestion-API)), Churnova AI immediately recalculates their health score. This means the score is always fresh and reflects the latest activity.
2.  **Scheduled (Daily Decay)**: Customers can become inactive over time. To reflect this, Churnova AI runs a daily process that automatically reduces the health score of customers who haven't been active recently. This is called "health decay."

Let's look at an example to understand this:

**Scenario: Sarah's Health Score**

*   **Day 1**: Sarah signs up and logs in. An `Event` is `track`ed. Churnova AI calculates her health score, perhaps starting at `100` (Low Risk).
*   **Day 3**: Sarah uses a key feature. Another `Event` is `track`ed. Her score is recalculated, staying high.
*   **Day 10**: Sarah hasn't logged in for a week. No new events. When the daily health decay runs, her score might drop to `80` (still Low Risk, but lower).
*   **Day 15**: Still no activity from Sarah. Another decay happens. Her score drops further, maybe to `55` (now Medium Risk). This flags her for potential intervention!

### Under the Hood: The Health Scoring Engine

Let's dive into how Churnova AI actually calculates these scores and applies decay.

#### 1. Real-time Health Calculation (Triggered by Events)

When your application sends a `track` event, Churnova AI does more than just save the event; it also updates the customer's health score.

**Step-by-Step Flow:**

```mermaid
sequenceDiagram
    participant Your App
    participant Churnova AI API
    participant Churnova SDK
    participant Intelligence Module
    participant Database

    Your App->>Churnova AI API: POST /api/track (API Key, customerId, event data)
    Note over Churnova AI API: 1. Validate API Key and Project
    Churnova AI API->>Churnova SDK: churnova.track(apiKey, customerId, event data)
    Note over Churnova SDK: 2. Find or Create Customer
    Churnova SDK->>Database: upsert Customer
    Database-->>Churnova SDK: Customer record
    Note over Churnova SDK: 3. Create Event
    Churnova SDK->>Database: create Event
    Database-->>Churnova SDK: Event record
    Note over Churnova SDK: 4. Recalculate Health Immediately!
    Churnova SDK->>Intelligence Module: calculateCustomerHealth(customerId)
    Intelligence Module->>Database: Fetch Customer and recent Events (last 30 days)
    Database-->>Intelligence Module: Customer and Event data
    Intelligence Module->>Intelligence Module: Calculate Recency, Frequency, Volume scores
    Intelligence Module->>Intelligence Module: Combine into total Health Score
    Intelligence Module->>Database: Update Customer (new score, risk level)
    Intelligence Module->>Database: Create HealthScore history record
    Database-->>Intelligence Module: Score updated
    Intelligence Module-->>Churnova SDK: New health score
    Churnova SDK-->>Churnova AI API: Success
    Churnova AI API-->>Your App: Success Response
```

Let's look at the key parts of the code:

First, how `churnova.track` (from `src/lib/churnova-sdk.ts`) automatically triggers the health calculation after an event is recorded:

```typescript
// src/lib/churnova-sdk.ts (simplified)
import { prisma } from "./prisma";
import { calculateCustomerHealth } from "./intelligence"; // Our health calculator

export const churnova = {
    async track(apiKey: string, customerId: string, event: string, properties: any = {}) {
        // ... (API Key and Customer upsert logic - see Chapter 3) ...
        const customer = /* ... customer record found or created ... */;

        // Create the actual event in the database
        const newEvent = await prisma.event.create({
            data: {
                name: event,
                properties: JSON.stringify(properties),
                customerId: customer.id,
            },
        });

        // ⭐ Automatically trigger health calculation right after an event! ⭐
        await calculateCustomerHealth(customer.id);

        return newEvent;
    },
    // ... other methods ...
};
```
**Explanation**: After a customer and their event are safely stored in the database, the `calculateCustomerHealth` function is immediately called for that customer. This ensures their health score is always up-to-date with their latest actions.

Next, let's see how `calculateCustomerHealth` (from `src/lib/intelligence.ts`) determines the score. It looks at three main factors:

*   **Recency**: How recently did the customer perform an action? (More recent = higher score)
*   **Frequency**: How often do they perform actions? (More frequent = higher score)
*   **Volume**: How many actions do they perform in total? (More actions = higher score)

```typescript
// src/lib/intelligence.ts (simplified)
import { prisma } from "./prisma";

export async function calculateCustomerHealth(customerId: string) {
    const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
            events: {
                where: {
                    timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
                },
                orderBy: { timestamp: "desc" }, // Get most recent event first
            },
        },
    });

    if (!customer || customer.events.length === 0) return 0; // No recent activity means 0 health

    const events = customer.events;

    // 1. Recency Score (Weight: 30%)
    const lastEventTime = events[0].timestamp.getTime();
    const daysSinceLastActive = (Date.now() - lastEventTime) / (24 * 60 * 60 * 1000);
    const recencyScore = Math.max(0, 100 - (daysSinceLastActive * 10)); // Drops 10 points per day inactive

    // 2. Frequency Score (Weight: 40%)
    const activeDays = new Set(events.map(e => e.timestamp.toISOString().split("T")[0])).size;
    const frequencyScore = Math.min(100, (activeDays / 30) * 300); // e.g., 10 active days in 30 = (10/30)*300 = 100

    // 3. Volume Score (Weight: 30%)
    const volumeScore = Math.min(100, (events.length / 100) * 100); // e.g., 100 events in 30 days = 100 score

    // Combine into a total weighted score
    const totalScore = Math.round(
        (recencyScore * 0.3) + (frequencyScore * 0.4) + (volumeScore * 0.3)
    );
    const finalScore = Math.min(100, Math.max(0, totalScore)); // Ensure 0-100

    // Update the customer's record in the database (from Chapter 2: Prisma Data Model)
    await prisma.customer.update({
        where: { id: customer.id },
        data: {
            healthScore: finalScore,
            riskLevel: finalScore < 30 ? "High" : finalScore < 70 ? "Medium" : "Low",
        },
    });

    // Also save this score to their historical record (HealthScore model)
    await prisma.healthScore.create({
        data: { score: finalScore, customerId: customer.id },
    });

    return finalScore;
}
```
**Explanation**:
*   The function fetches the customer and their `events` from the last 30 days using `prisma.customer.findUnique`.
*   It then calculates `recencyScore`, `frequencyScore`, and `volumeScore` based on these events.
*   These individual scores are combined using specific weights (30% recency, 40% frequency, 30% volume) to get a `totalScore`.
*   Finally, the customer's `healthScore` and `riskLevel` are updated in the `Customer` model, and a new entry is added to the `HealthScore` history model for tracking over time.

#### 2. Scheduled Health Decay (For Inactive Customers)

To properly reflect inactivity, Churnova AI also runs a scheduled job (often called a "cron job") that reduces the health score of customers who haven't been active recently.

**Step-by-Step Flow:**

```mermaid
sequenceDiagram
    participant Cron Scheduler
    participant Health Decay Cron
    participant Churnova SDK
    participant Database

    Cron Scheduler->>Health Decay Cron: Daily trigger (e.g., via /api/cron/health-decay)
    Health Decay Cron->>Churnova SDK: churnova.applyHealthDecay()
    Churnova SDK->>Database: Find Customers with lastSeen before yesterday AND healthScore > 0
    Database-->>Churnova SDK: List of inactive customers
    loop For each inactive customer
        Churnova SDK->>Churnova SDK: Calculate decay amount based on inactivity
        Churnova SDK->>Database: Update Customer (new score, risk level)
        Churnova SDK->>Database: Create HealthScore history record
    end
    Churnova SDK-->>Health Decay Cron: Decay results
    Health Decay Cron-->>Cron Scheduler: Success
```

Let's look at the `applyHealthDecay` function (from `src/lib/churnova-sdk.ts`):

```typescript
// src/lib/churnova-sdk.ts (simplified)
import { prisma } from "./prisma";

export const churnova = {
    // ... track and identify methods ...

    async applyHealthDecay() {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

        // Find customers inactive for more than a day who still have health
        const inactiveCustomers = await prisma.customer.findMany({
            where: {
                lastSeen: { lt: yesterday }, // Last seen before yesterday
                healthScore: { gt: 0 }      // Has some health to lose
            }
        });

        const updates = inactiveCustomers.map(async (customer) => {
            const lastSeen = customer.lastSeen || customer.createdAt;
            // Calculate how many full days they've been inactive
            const daysInactive = Math.floor((now.getTime() - lastSeen.getTime()) / (24 * 60 * 60 * 1000));

            // Decay score by 5 points for each day of inactivity
            const decayAmount = daysInactive * 5;
            const newScore = Math.max(0, (customer.healthScore || 100) - decayAmount);

            // Update customer's health score and risk level
            await prisma.customer.update({
                where: { id: customer.id },
                data: {
                    healthScore: newScore,
                    riskLevel: newScore < 30 ? "High" : newScore < 70 ? "Medium" : "Low",
                    healthHistory: {
                        create: { score: newScore } // Record the decay
                    }
                }
            });
        });

        await Promise.all(updates); // Process all updates at once
        return { processed: inactiveCustomers.length };
    }
};
```
**Explanation**:
*   The function first finds all `Customer` records that haven't been `lastSeen` in the last 24 hours and still have a `healthScore` greater than 0.
*   For each inactive customer, it calculates `daysInactive` and applies a fixed decay (e.g., 5 points per day).
*   The `Customer` record is updated with the `newScore` and corresponding `riskLevel`, and a history entry is created.

This `applyHealthDecay` function is typically called by a cron job, which is a scheduled task that runs automatically. In Churnova AI, this is exposed as an API route:

```typescript
// src/app/api/cron/health-decay/route.ts (simplified)
import { NextResponse } from "next/server";
import { churnova } from "@/lib/churnova-sdk"; // Our internal SDK

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    // Simple security check for cron job
    if (secret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting Health Decay Cron Job...");
    const result = await churnova.applyHealthDecay(); // Call the decay logic
    console.log(`Health Decay Completed: ${result.processed} customers updated.`);

    return NextResponse.json({ success: true, ...result });
}
```
**Explanation**: This API route is designed to be called by an external cron service (like Vercel Cron Jobs or a similar scheduler). It checks for a `secret` to ensure only authorized calls trigger the health decay. Then, it simply calls `churnova.applyHealthDecay` to do the actual work.

### Conclusion

The Customer Health Scoring Logic provides Churnova AI with an immediate, rule-based "thermometer" for customer well-being. By calculating a score (0-100) and assigning a risk level (Low, Medium, High) based on recent activity (Recency, Frequency, Volume) and applying a daily decay, it gives you quick, actionable insights into customer engagement. This system helps you identify customers who might need attention *now*, complementing the deeper, predictive analytics we'll explore next.


---

# Chapter 5: ML Churn Prediction Pipeline

Welcome back! In [Chapter 4: Customer Health Scoring Logic](#Chapter-4-Customer-Health-Scoring-Logic), we learned how Churnova AI gives you a quick "thermometer reading" of customer well-being through health scores and simple risk levels (Low, Medium, High). These scores are great for spotting immediate engagement changes.

But what if you want to go deeper? What if you want to know not just that a customer is "medium risk," but *why* they're at risk, *what exact percentage* chance they have of churning, and if there's truly something *unusual* about their behavior that simple rules can't catch?

This is where the **ML Churn Prediction Pipeline** comes in!

### The Problem: Beyond Simple Rules – Predicting Complex Churn

Imagine you run an online learning platform. A customer, Sarah, has a "Medium" health score. This is useful, but it doesn't tell you the whole story. You need answers to questions like:
*   Is Sarah's "Medium" risk just a temporary dip, or is it a serious sign of future churn?
*   What *specific activities* or *lack of activities* are most contributing to her churn risk?
*   Is her usage pattern completely normal, or is there something *odd* that suggests she might be exploring alternatives?
*   What is the *exact probability* (e.g., 65%) that Sarah will churn next month?

Simple rules can only take you so far. Human behavior is complex, and many factors, subtle patterns, and hidden relationships contribute to churn. To uncover these, Churnova AI needs to use more powerful tools: **Machine Learning (ML)**.

This is exactly what the **ML Churn Prediction Pipeline** solves. It's the core brain of Churnova AI, designed to process all the customer behavioral data ([Events](#Chapter-2-Prisma-Data-Model) ingested via [Telemetry Ingestion API](#Chapter-3-Telemetry-Ingestion-API)) and turn it into highly accurate, predictive insights.

### What is the ML Churn Prediction Pipeline? Your Sophisticated Oracle

Think of the ML Churn Prediction Pipeline as a super-smart oracle for your customer data. It takes raw usage information and transforms it into predictions and insights about churn. Instead of just "low" or "high" based on simple rules, it digs much deeper.

The pipeline uses several sophisticated Machine Learning models, working together like a specialized team:

1.  **Isolation Forest (The Anomaly Detector)**:
    *   **Role**: This model is like a detective looking for "odd one out" customers. It identifies customers whose usage patterns are significantly different from the majority.
    *   **Why it's important**: Sometimes, churn isn't about *less* activity, but *unusual* activity (e.g., logging in at weird hours, accessing features they never used before). This model flags those unique cases.
    *   **Output**: An "anomaly score" (either "normal" or "anomaly detected").

2.  **Gradient Boosting Classifier (The Risk Level Sorter)**:
    *   **Role**: This model classifies customers into distinct churn risk categories (Low, Medium, High). It learns from past data to sort customers more accurately than simple rules.
    *   **Why it's important**: While we had risk levels from health scores, this classifier uses advanced patterns to give a more nuanced and accurate risk classification.
    *   **Output**: An ML-driven "risk level" (Low, Medium, High).

3.  **Gradient Boosting Regressor (The Churn Probability Calculator)**:
    *   **Role**: This is the most precise part. It calculates a specific percentage (e.g., 0% to 100%) that a customer will churn in a given period.
    *   **Why it's important**: A percentage is much more actionable than a general category. A 65% chance of churn is different from a 40% chance, even if both are "Medium Risk." This helps you prioritize actions.
    *   **Output**: A precise "churn probability" percentage.

4.  **Feature Importance & Dynamic Insights**:
    *   **Role**: After making predictions, the pipeline also tells you *why* a prediction was made. It identifies which customer behaviors (features) were most important for the model's decision.
    *   **Why it's important**: This explains the "oracle's" reasoning, helping you understand the underlying drivers of churn for a specific customer.
    *   **Output**: A human-readable "AI Insight" message for each customer.

This entire pipeline takes raw `loginFrequency`, `avgSessionDuration`, and `featureUsageRate` (which are aggregated from the [Events](#Chapter-2-Prisma-Data-Model) you send) and transforms them into predictive insights.

### How to Use It: Triggering Predictions

The ML Churn Prediction Pipeline runs periodically to keep your predictions fresh. As an admin, you can often trigger a manual retraining and prediction directly from the Churnova AI dashboard.

Imagine you're on the Churnova AI dashboard and see a button like "Retrain ML Models & Predict Now." When you click it, here's what happens:

```bash
# This is what happens behind the scenes when you click 'Retrain ML Models'
# Your browser (UI) sends a POST request to the Churnova AI backend:
curl -X POST \
  http://localhost:3000/api/dashboard/ml/retrain \
  -H "Content-Type: application/json" \
  # Your authentication token would also be here, not shown for simplicity
```

**What happens next?**
Churnova AI's backend receives this request. It then triggers the specialized Python scripts that run the entire ML pipeline: first, training the models with the latest data, and then using those trained models to generate fresh predictions for *all* your customers. The results (anomaly scores, risk levels, churn probabilities, and AI insights) are then saved back into your database, updating each customer's record.

### Under the Hood: The Prediction Process Explained

When you trigger the ML pipeline, a series of steps unfold. The core of this pipeline is built using Python, which is a popular language for Machine Learning.

Here's a simplified sequence of events:

```mermaid
sequenceDiagram
    participant User
    participant Churnova UI
    participant Churnova Backend (API)
    participant Python ML Scripts
    participant Database

    User->>Churnova UI: Clicks "Retrain ML Models"
    Churnova UI->>Churnova Backend (API): POST /api/dashboard/ml/retrain
    Note over Churnova Backend (API): 1. Authenticate User
    Churnova Backend (API)->>Python ML Scripts: Executes 'ml/train.py'
    Note over Python ML Scripts: 2. 'train.py' loads ALL customer data
    Python ML Scripts->>Database: SELECT Customer (features, labels)
    Database-->>Python ML Scripts: Raw Customer data
    Note over Python ML Scripts: 3. Scales data, trains Isolation Forest, GBC, GBR models. Saves them.
    Python ML Scripts->>Database: (no direct DB write from train.py)
    Python ML Scripts-->>Churnova Backend (API): Training complete!
    Churnova Backend (API)->>Python ML Scripts: Executes 'ml/predict.py'
    Note over Python ML Scripts: 4. 'predict.py' loads ALL current customer data
    Python ML Scripts->>Database: SELECT Customer (features)
    Database-->>Python ML Scripts: Current Customer data
    Note over Python ML Scripts: 5. Loads saved models. Predicts for each customer.
    Python ML Scripts->>Database: UPDATE Customer (anomalyScore, riskLevel, churnProbability, aiInsight, healthScore)
    Database-->>Python ML Scripts: Customers updated!
    Python ML Scripts-->>Churnova Backend (API): Prediction complete!
    Churnova Backend (API)-->>Churnova UI: Success, sends updated ML metrics
    Churnova UI->>User: Shows latest predictions and insights
```

Let's look at the key Python scripts responsible for this intelligence: `ml/train.py` (for teaching the models) and `ml/predict.py` (for using the models to make predictions).

#### 1. Preparing the Data

Both training and prediction start by getting customer data from the database. The ML models need specific numbers, called "features," to learn from and make predictions. In Churnova AI, these are:
*   `loginFrequency`: How often the customer logs in.
*   `avgSessionDuration`: How long their average session is.
*   `featureUsageRate`: How much they use your app's features.

These features are calculated from the [Events](#Chapter-2-Prisma-Data-Model) you send via the [Telemetry Ingestion API](#Chapter-3-Telemetry-Ingestion-API).

```python
# ml/train.py (simplified) & ml/predict.py (similar start)
import sqlite3
import pandas as pd
from sklearn.preprocessing import StandardScaler # To make numbers comparable

DB_PATH = "dev.db" # Our database file

def load_and_prepare_data():
    conn = sqlite3.connect(DB_PATH) # Connect to the database
    query = """
    SELECT id, loginFrequency, avgSessionDuration, featureUsageRate, 
           riskLevel, churnProbability
    FROM Customer
    """
    df = pd.read_sql_query(query, conn) # Load data into a table-like structure
    conn.close()

    feature_names = ['loginFrequency', 'avgSessionDuration', 'featureUsageRate']
    X = df[feature_names].fillna(0) # Our input features for the ML models
    
    # Scale Data: Makes numbers like '1000' and '5' comparable
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X) # `fit_transform` for training
                                       # `transform` for prediction

    return df, X_scaled, scaler, feature_names

# ... (rest of the train.py and predict.py)
```
**Explanation**:
*   The code connects to the `dev.db` database (the same one Prisma uses!).
*   It fetches customer IDs and the three important features (`loginFrequency`, `avgSessionDuration`, `featureUsageRate`). It also fetches `riskLevel` and `churnProbability` if `train.py` needs to learn from past predictions (for initial model training).
*   `fillna(0)` handles any missing data by replacing it with zeros.
*   `StandardScaler` is crucial: it adjusts all feature values so they are on a similar scale (e.g., converting values to have a mean of 0 and a standard deviation of 1). This prevents features with larger numbers (like `avgSessionDuration` in seconds) from unfairly dominating the learning process over features with smaller numbers (like `loginFrequency`).

#### 2. Anomaly Detection (The "Red Flag" Detector)

Using the `IsolationForest` model, the pipeline identifies customers behaving unusually.

```python
# ml/predict.py (simplified)
# ... after loading X_scaled and iso_forest model ...

# 1. Anomaly Prediction (-1 is anomaly, 1 is normal)
df['anomaly_pred'] = iso_forest.predict(X_scaled)
df['anomalyScore'] = df['anomaly_pred'].apply(lambda x: 1.0 if x == -1 else 0.0)

# ... rest of predict.py
```
**Explanation**:
*   `iso_forest.predict(X_scaled)` uses the trained Isolation Forest model to examine each customer's scaled features.
*   It assigns a prediction: `-1` if the customer's behavior is *anomalous* (a red flag), and `1` if it's *normal*.
*   This is then converted into a clear `anomalyScore` (1.0 for anomaly, 0.0 for normal) to be saved in the database.

#### 3. Risk Level Classification (The "Risk Sorter")

Next, the `GradientBoostingClassifier` categorizes customers into Low, Medium, or High churn risk, based on learned patterns.

```python
# ml/predict.py (simplified)
# ... after anomaly prediction and loading gb_classifier model ...

# 2. Risk Level Prediction
df['risk_pred'] = gb_classifier.predict(X_scaled)

# ... rest of predict.py
```
**Explanation**:
*   `gb_classifier.predict(X_scaled)` uses the trained Classifier model to predict a risk category for each customer.
*   The output (`risk_pred`) will be one of the labels the model was trained on (e.g., "Low", "Medium", "High").
*   This ML-driven `riskLevel` is then ready to update the `Customer` record, providing a more intelligent classification than the basic health score rules.

#### 4. Churn Probability Regression (The "Percentage Calculator")

The `GradientBoostingRegressor` provides the most granular insight: a precise percentage chance of churn.

```python
# ml/predict.py (simplified)
# ... after risk classification and loading gb_regressor model ...

# 3. Churn Probability Prediction
df['prob_pred'] = gb_regressor.predict(X_scaled)
df['prob_pred'] = df['prob_pred'].clip(0, 100) # Ensures it's between 0 and 100

# ... rest of predict.py
```
**Explanation**:
*   `gb_regressor.predict(X_scaled)` calculates a numerical churn probability for each customer.
*   `.clip(0, 100)` is important to ensure that the predicted percentage always stays within a sensible range of 0% to 100%.

#### 5. Generating AI Insights (The "Explanation Generator")

To make these numbers actionable, the pipeline also generates a human-readable `aiInsight` message for each customer. This message considers the churn probability, anomaly detection, and the overall "feature importance" (which features the model found most influential for churn).

```python
# ml/predict.py (simplified)
# ... within the loop that updates each customer ...

def get_insight_message(anomaly_pred, risk_pred, prob_pred, feature_importances, current_features):
    # ... logic to determine the most important feature and craft a message ...
    # Example logic:
    if anomaly_pred == -1:
        return f"Anomalous behavior detected! {prob_pred:.1f}% risk."
    if prob_pred < 30:
        return "Healthy engagement pattern."
    
    top_feature = max(feature_importances, key=feature_importances.get)
    insight = f"Elevated Risk ({prob_pred:.1f}%). "
    if top_feature == 'featureUsageRate' and current_features[top_feature] < 30:
        insight += "Critically low feature adoption is the primary driver."
    # ... more specific messages based on other features ...
    return insight

# ...
    # In the main loop:
    insight = get_insight_message(
        row['anomaly_pred'], row['risk_pred'], row['prob_pred'], 
        feature_importances, current_features
    )
# ...
```
**Explanation**:
*   The `get_insight_message` function takes all the predictions and the `feature_importances` (learned during training) for a specific customer.
*   It dynamically creates a message, highlighting whether an anomaly was detected, the overall risk, and which specific customer behavior (like `featureUsageRate` or `loginFrequency`) is the biggest contributor to that risk. This makes the predictions much easier to understand and act upon.

#### 6. Updating the Database

Finally, all these predictions are written back to the `Customer` model in the database, specifically updating these fields (as defined in our [Prisma Data Model](#Chapter-2-Prisma-Data-Model)):

*   `anomalyScore`
*   `riskLevel` (this is the ML-driven one)
*   `churnProbability`
*   `aiInsight`
*   `healthScore` (the ML pipeline *also updates the health score*, setting it as `100 - churnProbability`. This ensures the health score always reflects the most intelligent, predictive view of customer well-being, overriding the simpler rule-based one from Chapter 4).

```python
# ml/predict.py (simplified)
# ... after all predictions are made for each customer ...

    cursor = conn.cursor()
    update_query = """
    UPDATE Customer 
    SET anomalyScore = ?, 
        riskLevel = ?, 
        churnProbability = ?,
        aiInsight = ?,
        healthScore = ?
    WHERE id = ?
    """

    updates = []
    for idx, row in df.iterrows():
        health_score = max(0, min(100, int(100 - row['prob_pred']))) # Derive health from churn prob
        # ... (logic to get current_features for insight message) ...
        insight = get_insight_message(...)

        updates.append((
            float(row['anomalyScore']),
            row['risk_pred'], # ML-driven risk level
            float(row['prob_pred']),
            insight,
            health_score,
            row['id']
        ))

    cursor.executemany(update_query, updates) # Perform bulk updates
    conn.commit()
    conn.close()
```
**Explanation**:
*   The code iterates through each customer in the `df` (DataFrame) after all predictions are made.
*   For each customer, it constructs an update query with the new `anomalyScore`, `riskLevel` (from the classifier), `churnProbability` (from the regressor), `aiInsight`, and an updated `healthScore` derived directly from the churn probability.
*   `cursor.executemany` efficiently sends all these updates to the database in one go, updating your `Customer` records with the latest intelligence!

#### Admin UI & Metrics

The Churnova AI backend also provides ways to check on the ML pipeline's performance.

*   `src/app/api/dashboard/ml/retrain/route.ts`: This is the API endpoint that triggers the `train.py` and `predict.py` Python scripts, as shown earlier.
*   `src/app/api/dashboard/ml/metrics/route.ts`: This endpoint (`GET /api/dashboard/ml/metrics`) allows the UI to fetch the performance metrics (like accuracy for the classifier, or mean absolute error for the regressor) that `ml/train.py` saves after training. This helps you understand how well the models are performing.

### Conclusion

The ML Churn Prediction Pipeline is the advanced intelligence hub of Churnova AI. By combining **Anomaly Detection** (Isolation Forest), **Risk Classification** (Gradient Boosting Classifier), and **Churn Probability Regression** (Gradient Boosting Regressor), it transforms raw customer data into precise, actionable predictions. Crucially, it also generates **explainable AI Insights** and updates the overall `healthScore`, giving you a deep understanding of *why* a customer might churn, far beyond simple rules. This detailed intelligence is what empowers proactive churn prevention.

Next, we'll explore how these powerful predictions and insights are gathered and processed to provide a clear, summarized view of your customers, in the **AI Insights Engine**.


---

# Chapter 6: AI Insights Engine

Welcome back! In [Chapter 5: ML Churn Prediction Pipeline](#Chapter-5-ML-Churn-Prediction-Pipeline), you learned how Churnova AI uses sophisticated Machine Learning (ML) models to calculate precise churn probabilities, identify anomalous behavior, and classify customers into detailed risk levels. You saw that these models produce numbers – percentages, 0s and 1s, and risk categories.

But imagine you're a product manager. You see a customer with a "78% churn probability" and an "anomaly score of 1.0." What does that *really* mean for your daily work? What *action* should you take? Just seeing numbers isn't enough; you need to understand the *story* behind those numbers.

This is exactly where the **AI Insights Engine** comes in!

### The Problem: Translating Numbers into Actionable Language

Our ML models are powerful, but their raw outputs are numerical. A product manager, a sales team, or even a customer success representative isn't going to be an ML expert. They need clear, concise answers to questions like:
*   "Why is John Doe at 78% churn risk?"
*   "What specific actions led to this high risk?"
*   "What should *we* do right now to prevent him from churning?"
*   "Are there common reasons why *many* high-risk customers are about to churn?"

If Churnova AI just gave you numbers, you'd spend hours trying to interpret them, making the system less useful. You need an expert interpreter that can read the ML outputs and tell you, in plain language, what's happening and what to do about it.

This is exactly the problem the **AI Insights Engine** solves. It's the "voice" of our AI, translating complex data into human-understandable explanations and practical recommendations.

### What is the AI Insights Engine? Your Expert Interpreter

Think of the AI Insights Engine as Churnova AI's **smart communication layer**. It takes the sophisticated numerical predictions from the [ML Churn Prediction Pipeline](#Chapter-5-ML-Churn-Prediction-Pipeline) and converts them into:

1.  **Human-Readable Explanations**: Specific sentences that tell you *why* a customer is at risk. For example, instead of just "78% churn," it might say, "Critical Churn Risk (78.1%). The primary driver is critically low feature adoption. The user is struggling to find value."
2.  **Actionable Recommendations (Playbooks)**: Suggests concrete steps your team can take to intervene. For example, "Trigger an in-app tutorial series" or "Send an automated 'We miss you' email."
3.  **Aggregated Churn Drivers**: Summarizes the top reasons why multiple customers are at risk, helping you spot broader trends.

It acts as an expert interpreter, leveraging the "feature importance" (which characteristics like `loginFrequency` or `featureUsageRate` were most influential for the prediction, as discussed in [Chapter 5](#Chapter-5-ML-Churn-Prediction-Pipeline)) to explain the "why."

### How to Use It: Getting Actionable Intelligence

The AI Insights Engine isn't something you call directly with an API. Instead, its outputs are a core part of the Churnova AI platform, visible on individual customer profiles and aggregated dashboards.

Let's look at how you'd benefit from it in the Churnova AI User Interface (UI).

#### 1. Individual Customer Insights (Customer Profile Page)

When you view a specific customer's profile (e.g., John Doe), you won't just see a churn probability percentage. You'll see a dedicated "Churnova Insight" box with a clear explanation and a recommended action.

**Example Use Case**: A customer success manager is reviewing John Doe's profile because he's shown as "High Risk."

**What you'd see in the UI (from `src/app/dashboard/users/[id]/page.tsx`):**

```html
<!-- Simplified view from a customer profile page -->
<div class="glass-card ... p-6">
    <div class="flex items-center gap-2 mb-4">
        <Brain class="w-5 h-5 text-indigo-400" />
        <h3 class="font-semibold text-indigo-400">Churnova Insight</h3>
    </div>
    <p class="text-sm text-muted-foreground leading-relaxed">
        Critical health drop detected. User engagement has fallen significantly below baseline.
        High risk of churn within the next 14 days without intervention.
    </p>
    <div class="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <p class="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Recommended Action</p>
        <p class="text-sm font-medium">Trigger "Retention Playbook V2"</p>
    </div>
</div>
```
**Explanation**: This snippet shows how Churnova AI presents the "Churnova Insight" on a customer's profile. Instead of just numbers, it provides a summary of the situation and a concrete suggestion for action, guiding the user on how to respond.

#### 2. Aggregated Churn Drivers & Playbooks (Intelligence Dashboard)

For a broader view, the Churnova AI "Intelligence" dashboard summarizes the **Top Churn Drivers** across all high-risk customers and suggests **Retention Playbooks** based on those aggregated reasons.

**Example Use Case**: A product team wants to understand the most common reasons for churn across their entire user base this month, to decide where to focus their development efforts.

**What you'd see in the UI (from `src/app/dashboard/intelligence/page.tsx`):**

```html
<!-- Simplified view from the Intelligence dashboard -->
<div class="glass-card ... p-6">
    <h2 class="text-lg font-semibold flex items-center gap-2">
        <AlertCircle class="w-5 h-5 text-red-500" />
        Top Churn Drivers
    </h2>
    <p class="text-xs text-muted-foreground">Identified from high-risk accounts this month</p>
    <!-- ...list of reasons with percentages... -->
    <div class="space-y-6 flex-1">
        <div class="relative">
            <div class="flex justify-between items-end mb-2">
                <span class="font-medium text-sm">Declining Feature Adoption</span>
                <span class="text-xs font-bold text-muted-foreground">45%</span>
            </div>
            <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full" style="width: 45%;"></div>
            </div>
        </div>
        <!-- ...other reasons... -->
    </div>
</div>

<div class="glass-card ... p-6">
    <h2 class="text-lg font-semibold flex items-center gap-2">
        <CheckCircle2 class="w-5 h-5 text-green-500" />
        Retention Playbooks
    </h2>
    <p class="text-xs text-muted-foreground">Actionable steps based on detected problems</p>
    <!-- ...list of playbooks... -->
    <div class="space-y-6 flex-1">
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div class="flex items-center gap-2 mb-3">
                <Badge class="bg-red-50 text-red-700 border-red-100 text-[10px]">
                    <TrendingDown class="w-3 h-3 mr-1" />
                    Detected: Declining Feature Adoption
                </Badge>
            </div>
            <ul class="space-y-2">
                <li class="text-sm flex items-start gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                    <span class="text-muted-foreground">Trigger an in-app tutorial series to guide them to 'Aha!' moments.</span>
                </li>
                <li class="text-sm flex items-start gap-2">
                    <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                    <span class="text-muted-foreground">Highlight underused features with contextual tooltips or an adoption checklist.</span>
                </li>
            </ul>
        </div>
    </div>
</div>
```
**Explanation**: This UI view shows a summary of common churn drivers, like "Declining Feature Adoption," with their percentages. Below that, it offers specific "Retention Playbooks" tailored to address each identified problem. This moves beyond individual customer issues to give strategic, company-wide insights and actions.

### Under the Hood: How Insights are Generated

The AI Insights Engine works in two main stages:

1.  **Individual Insight Generation**: During the ML prediction process (specifically in `ml/predict.py` from [Chapter 5](#Chapter-5-ML-Churn-Prediction-Pipeline)), a unique human-readable message is crafted for *each customer*. This message is saved directly into the customer's record in the database (`aiInsight` field in the `Customer` model from [Chapter 2](#Chapter-2-Prisma-Data-Model)).
2.  **Aggregated Insight Analysis**: When a dashboard or report needs to show "Top Churn Drivers," Churnova AI's backend analyzes these individual `aiInsight` messages across many high-risk customers, groups them into common categories, and provides associated recommendations.

Let's look at the underlying code.

#### 1. Generating Individual Customer Insights (`ml/predict.py`)

As we saw briefly in [Chapter 5](#Chapter-5-ML-Churn-Prediction-Pipeline), the `ml/predict.py` script has a crucial function called `get_insight_message`. This is where the magic of translating numbers to words happens for each customer. It uses the churn probability, anomaly score, and importantly, the "feature importances" (which features like `loginFrequency` had the biggest impact on the prediction) to craft a message.

```python
# ml/predict.py (simplified - see full code in Chapter 5 context)
def get_insight_message(anomaly_pred, risk_pred, prob_pred, feature_importances, current_features):
    """
    Generates a highly specific AI insight by checking the predictions
    against the global feature importance weights.
    """
    if anomaly_pred == -1: # If an anomaly was detected
        return f"Anomalous behavior detected! Usage patterns deviate significantly. Machine learning models indicate a {prob_pred:.1f}% risk of churn."

    if prob_pred < 30: # If churn probability is low
        return "Healthy engagement pattern. No significant churn vectors detected by the model."
    
    # Identify the top driving feature from the ML model's perspective
    top_feature = max(feature_importances, key=feature_importances.get)
    feature_val = current_features[top_feature] # Get the customer's value for this feature
    
    insight = ""
    if prob_pred > 70: insight = f"Critical Churn Risk ({prob_pred:.1f}%). "
    elif prob_pred > 40: insight = f"Elevated Risk ({prob_pred:.1f}%). "
    else: insight = f"Moderate Risk ({prob_pred:.1f}%). "

    # Dynamically craft explanation based on the top feature
    if top_feature == 'featureUsageRate' and feature_val < 30:
        insight += "The primary driver is critically low feature adoption. The user is struggling to find value."
    elif top_feature == 'loginFrequency' and feature_val < 2:
        insight += "The user's login cadence has dropped to concerning levels compared to healthy accounts."
    # ... more specific messages for other features and conditions ...
    
    return insight

# In the main predict.py loop, this insight is generated and saved:
# insight = get_insight_message(row['anomaly_pred'], ..., feature_importances, current_features)
# ...
# UPDATE Customer SET aiInsight = ? WHERE id = ?
```
**Explanation**:
*   The `get_insight_message` function first checks for `anomaly_pred` and low `prob_pred` for general messages.
*   For higher risks, it identifies the `top_feature` that contributed most to the churn prediction (using `feature_importances` passed from the ML model).
*   It then constructs a dynamic message based on this `top_feature` and the customer's `current_features` value for that specific feature. This makes the insight highly relevant and personalized to the customer's actual behavior.
*   This generated `insight` message is then stored in the `aiInsight` field of the `Customer` record in the database.

#### 2. Aggregating Churn Reasons (`/api/analytics/reasons/route.ts`)

When the Intelligence Dashboard (UI) needs to show "Top Churn Drivers," it makes a call to the `/api/analytics/reasons` endpoint. This backend route then fetches all the `aiInsight` messages from high-risk customers and groups similar explanations together.

**Sequence Diagram: Fetching Aggregated Insights**

```mermaid
sequenceDiagram
    participant Churnova UI
    participant Churnova Backend (Analytics API)
    participant Database

    Churnova UI->>Churnova Backend (Analytics API): GET /api/analytics/reasons (for projectId X)
    Note over Churnova Backend (Analytics API): 1. Fetch all high-risk customer insights
    Churnova Backend (Analytics API)->>Database: SELECT aiInsight FROM Customer WHERE projectId=X AND riskLevel='High'
    Database-->>Churnova Backend (Analytics API): Returns a list of individual aiInsight messages
    Note over Churnova Backend (Analytics API): 2. Categorize and count similar insights
    Churnova Backend (Analytics API)->>Churnova Backend (Analytics API): Process insights into categories (e.g., "Declining Feature Adoption")
    Churnova Backend (Analytics API)-->>Churnova UI: Returns aggregated reasons and percentages
    Churnova UI->>Churnova UI: Displays Top Churn Drivers and uses to generate Playbooks
```

Let's look at the simplified code for `GET /api/analytics/reasons`:

```typescript
// src/app/api/analytics/reasons/route.ts (simplified)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    // Fetch AI insights directly from High Risk customers
    const highRiskCustomers = await prisma.customer.findMany({
        where: {
            projectId,
            riskLevel: "High", // Focus on customers at high risk
            aiInsight: { not: null } // Only if an insight exists
        },
        select: { aiInsight: true } // Only retrieve the insight message
    });

    const reasonCounts: Record<string, number> = {};
    let totalCount = 0;

    highRiskCustomers.forEach(customer => {
        if (customer.aiInsight) {
            const text = customer.aiInsight;
            let category = "Unknown Context";

            // Simple keyword-based categorization of insight messages
            if (text.includes("feature adoption") || text.includes("Feature usage is declining")) {
                category = "Declining Feature Adoption";
            } else if (text.includes("login cadence has dropped") || text.includes("Irregular login patterns")) {
                category = "Irregular Login Cadence";
            } else if (text.includes("sessions are extremely short") || text.includes("Session lengths are trending downward")) {
                category = "Decreasing Session Duration";
            } else if (text.includes("Anomalous behavior")) {
                category = "Anomalous Usage Pattern";
            }
            reasonCounts[category] = (reasonCounts[category] || 0) + 1;
            totalCount++;
        }
    });

    // Calculate percentages and sort
    const topReasons = Object.entries(reasonCounts)
        .map(([reason, count]) => ({
            reason,
            percentage: Math.round((count / totalCount) * 100)
        }))
        .sort((a, b) => b.percentage - a.percentage); // Sort by highest percentage

    return NextResponse.json({ reasons: topReasons });
}
```
**Explanation**:
*   The code queries the `Customer` table using `prisma.customer.findMany` to get all `aiInsight` messages from customers marked as "High" `riskLevel` within the given `projectId`.
*   It then loops through these individual `aiInsight` strings.
*   Using simple keyword matching (e.g., `text.includes("feature adoption")`), it categorizes each insight into broader `reasonCounts` like "Declining Feature Adoption" or "Irregular Login Cadence."
*   Finally, it calculates the percentage for each category and sorts them to present the "Top Churn Drivers."

#### 3. Mapping to Retention Playbooks (`src/app/dashboard/intelligence/page.tsx`)

Once the UI has the aggregated `reasons`, it uses a helper function (`getPlaybook`) to suggest specific actions for each.

```typescript
// src/app/dashboard/intelligence/page.tsx (simplified)
// ...
const getPlaybook = (reason: string) => {
    if (reason.includes("Feature Adoption")) return [
        "Trigger an in-app tutorial series to guide them to 'Aha!' moments.",
        "Highlight underused features with contextual tooltips or an adoption checklist.",
        "Send a personalized email: 'Here's what 80% of teams like yours use every day.'"
    ];
    if (reason.includes("Login") || reason.includes("Session")) return [
        "Send an automated 'We miss you' re-engagement email sequence.",
        "Offer a 1:1 check-in call with a Customer Success Manager.",
        "Trigger a win-back campaign with a limited-time discount or extension."
    ];
    if (reason.includes("Anomalous")) return [
        "Alert account manager immediately for a manual review.",
        "Investigate if recent product updates caused friction."
    ];
    return [
        "Review user session recordings to find friction points.",
        "Send a customized outreach email from the founder."
    ];
};
// ... later in the component where playbooks are rendered ...
// {reasons.map((r, idx) => (
//   <div key={idx}>
//     {getPlaybook(r.reason).map((step, stepIdx) => (
//       <li key={stepIdx}>{step}</li>
//     ))}
//   </div>
// ))}
```
**Explanation**:
*   The `getPlaybook` function takes a `reason` (like "Declining Feature Adoption") as input.
*   Based on simple `if` conditions, it returns a list of pre-defined, actionable steps.
*   This allows Churnova AI to not only tell you *what* the problem is but also *how to fix it*, directly within the dashboard.

### Conclusion

The AI Insights Engine is the crucial bridge between complex Machine Learning predictions and actionable human understanding. By translating numerical outputs into personalized "Churnova Insights" for individual customers and aggregating them into "Top Churn Drivers" with associated "Retention Playbooks" for strategic overview, it empowers product teams, customer success managers, and other stakeholders to understand *why* churn is happening and *what to do about it*. This transformation from raw data to practical intelligence is what makes Churnova AI truly valuable.

Next, we'll explore how these insights and predictions are used to trigger immediate responses, in the **Automated Alerting System**.


---

# Chapter 7: Automated Alerting System

Welcome back! In [Chapter 6: AI Insights Engine](#Chapter-6-AI-Insights-Engine), you learned how Churnova AI not only predicts churn but also translates complex Machine Learning outputs into understandable explanations and actionable recommendations. You now know *why* a customer is at risk.

But what good are these powerful insights if they sit hidden in a dashboard, waiting for someone to log in and check? What if a critical churn risk appears in the middle of the night, or when your team is busy with other tasks? You need to know *immediately* so you can act before it's too late!

This is exactly where the **Automated Alerting System** comes in!

### The Problem: Acting Instantly on Critical Churn Risks

Imagine your SaaS application has a high-value customer, "Acme Corp." The [ML Churn Prediction Pipeline](#Chapter-5-ML-Churn-Prediction-Pipeline) flags Acme Corp's account as "High Risk" with a 75% churn probability because their `featureUsageRate` suddenly plummeted. This is a critical insight from the [AI Insights Engine](#Chapter-6-AI-Insights-Engine).

If no one sees this alert promptly, "Acme Corp" might churn, leading to significant lost revenue. You need a system that:
1.  **Monitors** for these critical changes in customer health or risk.
2.  **Immediately notifies** the right people (e.g., a customer success manager, sales team) without manual checks.
3.  **Delivers alerts** through channels they already use, like Slack or email.

This is like a smoke detector for your customer base – it doesn't just know there's a fire; it screams for attention! This instant notification allows your team to intervene proactively, potentially saving the customer.

This is exactly what the **Automated Alerting System** solves. It's Churnova AI's early warning system, ensuring no critical churn risk goes unnoticed.

### What is the Automated Alerting System? Your Customer Smoke Detector

The Automated Alerting System is a core part of Churnova AI that acts as an **early warning system**. It constantly watches over your customers' health scores and churn risk levels. When a predefined threshold is crossed – for example, a customer's health score drops below a critical point, or their churn probability spikes – it automatically sends a notification to the relevant people.

Here's how it works:

*   **Proactive**: It doesn't wait for you to look; it pushes information to you.
*   **Customizable**: You decide *what* triggers an alert and *where* it gets sent.
*   **Channels**: It primarily uses two popular communication channels:
    *   **Slack Webhooks**: Sends messages directly into your team's Slack channels.
    *   **Email**: Sends detailed notifications to specified email addresses.
*   **Goal**: To enable your team to intervene promptly, minimizing churn by catching at-risk customers early.

### How to Use It: Setting Up Your Alerts (UI)

Setting up alerts in Churnova AI is straightforward and done through your project's settings page. This allows you to define who gets alerted and through which channels for each of your [Projects](#Chapter-1-Project--API-Key-Management).

**Example Use Case**: You want your customer success team to get a Slack notification when any customer in your "Acme Analytics" project enters a "High Risk" churn state, and also send a summary email to your Head of Customer Success.

Here's how you would configure this in the Churnova AI dashboard, referencing `src/app/dashboard/settings/page.tsx`:

```html
<!-- Simplified view from the Alerts tab in SettingsPage -->
<div class="glass-card ... p-5">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h3 class="font-semibold text-sm">Smart Alerts</h3>
      <p class="text-xs text-muted-foreground">Master toggle for all outbound notifications</p>
    </div>
    <Switch
      checked={settings.alertsEnabled}
      onCheckedChange={(checked) => setSettings({ ...settings, alertsEnabled: checked })}
    />
  </div>

  <div class="space-y-6">
    <div class="space-y-3">
      <h4 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Slack Integration</h4>
      <div class="flex gap-2">
        <Input
          placeholder="https://hooks.slack.com/services/..."
          value={settings.slackWebhookUrl}
          onChange={(e) => setSettings({ ...settings, slackWebhookUrl: e.target.value })}
          class="h-10 text-sm bg-muted/50 flex-1"
        />
        <Button onClick={handleTestSlack}>Test Alert</Button>
      </div>
      <p class="text-[10px] text-muted-foreground">
        Create an Incoming Webhook in your Slack Workspace to receive real-time churn alerts.
      </p>
    </div>

    <div class="space-y-3">
      <h4 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Notifications</h4>
      <Input
        placeholder="alerts@yourcompany.com"
        value={settings.alertEmail}
        onChange={(e) => setSettings({ ...settings, alertEmail: e.target.value })}
        class="h-10 text-sm bg-muted/50 px-3"
      />
      <p class="text-[10px] text-muted-foreground">
        A digest will be sent when customers cross the risk threshold (Health {"<"} 30).
      </p>
    </div>
  </div>
</div>
```

**Explanation**:
*   **Master Toggle**: The `Switch` allows you to turn all alerts for this project on or off.
*   **Slack Webhook URL**: You'd paste your unique Slack Incoming Webhook URL here. This is the special address Slack provides for sending messages to a channel.
*   **Test Alert Button**: Clicking `handleTestSlack` will send a sample message to your configured Slack channel, letting you verify the integration works.
*   **Alert Recipient Email**: You'd enter the email address (or a comma-separated list of addresses) where you want to receive alert emails.
*   These settings are saved to your `Project` in the database, as defined in the [Prisma Data Model](#Chapter-2-Prisma-Data-Model).

#### Testing Your Slack Integration

When you click the "Test Alert" button in the UI, here's what happens:

```typescript
// src/app/dashboard/settings/page.tsx - handleTestSlack function (simplified)
const handleTestSlack = async () => {
    // ... (validation for activeProjectId and slackWebhookUrl) ...
    const loadingToast = toast.loading("Sending test alert...");
    try {
        // Sends a request to Churnova AI's own API endpoint for Slack alerts
        const res = await fetch("/api/alerts/slack", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                projectId: activeProjectId,
                message: "🚨 *Test Alert from Churnova AI*\nThis is a test notification..."
            }),
        });
        if (res.ok) {
            toast.success("Test alert sent successfully!", { id: loadingToast });
        } else {
            throw new Error("Failed to send");
        }
    } catch (e) {
        toast.error("Failed to send test alert. Check your webhook URL.", { id: loadingToast });
    }
};
```
**Explanation**: This UI code sends a `POST` request to Churnova AI's `/api/alerts/slack` endpoint. This endpoint then takes the message and projectId and makes the actual call to the Slack webhook URL you provided.

### Under the Hood: How Alerts Are Sent

The Automated Alerting System springs into action whenever a customer's `healthScore` or `churnProbability` changes significantly. This usually happens after the [Customer Health Scoring Logic](#Chapter-4-Customer-Health-Scoring-Logic) runs or after the [ML Churn Prediction Pipeline](#Chapter-5-ML-Churn-Prediction-Pipeline) updates a customer's record.

Here's a simplified step-by-step look at how a critical alert is processed:

```mermaid
sequenceDiagram
    participant Churnova AI Internal Logic
    participant Database
    participant Churnova AI Alerts Module
    participant Slack API
    participant Email Service

    Churnova AI Internal Logic->>Churnova AI Alerts Module: Check for alerts (customer ID, old score, new score)
    Note over Churnova AI Alerts Module: 1. Evaluate if alert is needed (e.g., score drop)
    Churnova AI Alerts Module->>Database: Fetch Project settings (Slack URL, alert email, alerts enabled)
    Database-->>Churnova AI Alerts Module: Project settings for this customer's project
    alt If alerts enabled AND Slack webhook is configured
        Churnova AI Alerts Module->>Slack API: Send alert message (POST to webhook URL)
        Slack API-->>Churnova AI Alerts Module: Success/Failure response
    end
    alt If alerts enabled AND alert email is configured
        Churnova AI Alerts Module->>Email Service: Send alert email (via Email API)
        Email Service-->>Churnova AI Alerts Module: Success/Failure response
    end
    Churnova AI Alerts Module-->>Churnova AI Internal Logic: Alert check complete
```

Let's dive into the core code that makes this possible.

#### 1. Triggering `notifyRiskChange`

After a customer's `healthScore` (from [Chapter 4](#Chapter-4-Customer-Health-Scoring-Logic)) or `churnProbability` (from [Chapter 5](#Chapter-5-ML-Churn-Prediction-Pipeline)) is updated, Churnova AI's internal logic will call the `notifyRiskChange` function (from `src/lib/alerts.ts`).

```typescript
// src/lib/alerts.ts - notifyRiskChange (simplified)
import { prisma } from './prisma'; // Database client

export const alerts = {
    async notifyRiskChange(projectId: string, customerId: string, oldScore: number, newScore: number) {
        // Define when an alert should be triggered
        const crossedThreshold = oldScore >= 30 && newScore < 30; // Dropped to High Risk
        const significantDrop = (oldScore - newScore) >= 20;     // Score dropped by 20+ points

        if (!crossedThreshold && !significantDrop) return; // No alert needed

        const project = await prisma.project.findUnique({ // Fetch project settings
            where: { id: projectId },
        });

        if (!project || !project.alertsEnabled) return; // Alerts disabled for this project

        const customer = await prisma.customer.findUnique({ // Fetch customer details
            where: { id: customerId },
        });

        if (!customer) return;

        // Construct the alert message for Slack and Email
        const alertMessage = { /* ... detailed Slack message payload ... */ };
        const emailHtml = `<!-- ... detailed HTML email content ... -->`;

        // Send Slack Alert if configured
        if (project.slackWebhookUrl) {
            await this.sendSlackAlert(project.slackWebhookUrl, alertMessage);
        }

        // Send Email Alert if configured
        if (project.alertEmail) {
            await this.sendEmailAlert(
                project.alertEmail,
                `🚨 Churnova Alert: Risk change for ${customer.externalId}`,
                emailHtml
            );
        }
    },
    // ... sendSlackAlert and sendEmailAlert methods ...
};
```
**Explanation**:
*   The `notifyRiskChange` function receives the `projectId`, `customerId`, and the old and new health scores.
*   It first checks if the change in score `crossedThreshold` (e.g., dropped below 30) or if there was a `significantDrop`. If not, it stops, meaning no alert is needed.
*   It then fetches the `project` and `customer` details from the database (using `prisma`). This includes the `slackWebhookUrl` and `alertEmail` stored on the `Project` model (from [Chapter 2: Prisma Data Model](#Chapter-2-Prisma-Data-Model)).
*   If `alertsEnabled` is true and a Slack URL is present, it calls `sendSlackAlert`.
*   If `alertsEnabled` is true and an `alertEmail` is present, it calls `sendEmailAlert`.

#### 2. Sending Slack Alerts

The `sendSlackAlert` function (also in `src/lib/alerts.ts`) is responsible for actually sending the message to Slack.

```typescript
// src/lib/alerts.ts - sendSlackAlert (simplified)
export const alerts = {
    async sendSlackAlert(webhookUrl: string, payload: any) {
        try {
            const response = await fetch(webhookUrl, { // Send HTTP POST request to Slack
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload), // The formatted Slack message
            });
            if (!response.ok) throw new Error(`Slack error: ${response.statusText}`);
            return true;
        } catch (err) {
            console.error('Slack Alert Failed:', err);
            return false;
        }
    },
    // ... other alert methods ...
};
```
**Explanation**:
*   This function simply takes the `webhookUrl` (from the project settings) and the `payload` (the structured message) and makes an HTTP `POST` request to Slack.
*   If Slack returns an error, it logs it, ensuring that we know if an alert failed.

**Note**: The `/api/alerts/slack/route.ts` file in the context is an API *endpoint* used by the UI for *testing* the Slack integration. The actual internal system directly uses the `sendSlackAlert` helper, which calls the Slack webhook URL.

#### 3. Sending Email Alerts

Similarly, the `sendEmailAlert` function (in `src/lib/alerts.ts`) handles sending email notifications.

```typescript
// src/lib/alerts.ts - sendEmailAlert (simplified)
import { Resend } from 'resend'; // Email sending service

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export const alerts = {
    // ... sendSlackAlert and notifyRiskChange ...
    async sendEmailAlert(to: string, subject: string, html: string) {
        try {
            if (!process.env.RESEND_API_KEY) {
                console.warn('RESEND_API_KEY missing, skipping email alert.');
                return false;
            }
            await resend.emails.send({ // Send email via Resend API
                from: 'Churnova AI <alerts@churnova.ai>',
                to,
                subject,
                html, // The HTML content for a rich email
            });
            return true;
        } catch (err) {
            console.error('Email Alert Failed:', err);
            return false;
        }
    },
};
```
**Explanation**:
*   This function uses the `Resend` service (an email API) to send an email.
*   It takes the recipient `to` address (from project settings), `subject`, and `html` content for the email body.
*   A `RESEND_API_KEY` environment variable is required for this to work.

**Important Distinction**: While `src/app/api/email/send/route.ts` and `src/app/api/email/schedule/route.ts` also deal with email, they are specifically designed for sending *scheduled reports* (like weekly digests) which contain aggregated analytics. The `sendEmailAlert` in `src/lib/alerts.ts` is used for *immediate, critical alerts* about individual customer risk changes.

### Conclusion

The Automated Alerting System is your proactive defense against customer churn. By continuously monitoring customer health and churn risk (powered by the [Customer Health Scoring Logic](#Chapter-4-Customer-Health-Scoring-Logic) and [ML Churn Prediction Pipeline](#Chapter-5-ML-Churn-Prediction-Pipeline)), it ensures that critical changes are immediately communicated to your team via customizable Slack and email notifications. This "smoke detector" for customer health empowers your team to intervene swiftly and effectively, minimizing churn.

With all this intelligent data and instant alerts, the final piece is to visualize and report on everything. Next, we'll explore how Churnova AI brings all these insights together in user-friendly dashboards and reports, in **Dashboard Analytics & Reporting**.


---

# Chapter 8: Dashboard Analytics & Reporting

Welcome to the final chapter! In [Chapter 7: Automated Alerting System](#Chapter-7-Automated-Alerting-System), you learned how Churnova AI proactively notifies you about critical churn risks, ensuring your team can react swiftly. Before that, we covered everything from ingesting raw customer data ([Telemetry Ingestion API](#Chapter-3-Telemetry-Ingestion-API)) and storing it ([Prisma Data Model](#Chapter-2-Prisma-Data-Model)) to calculating health scores ([Customer Health Scoring Logic](04_customer_health_scoring_logic_.md)), predicting churn with Machine Learning ([ML Churn Prediction Pipeline](#Chapter-5-ML-Churn-Prediction-Pipeline)), and generating actionable explanations ([AI Insights Engine](#Chapter-6-AI-Insights-Engine)).

Now, with all this rich data and intelligence being generated, how do you get a complete, understandable picture of your entire customer base? How do you monitor trends, identify widespread issues, and make strategic decisions without drowning in raw numbers or reacting only to individual alerts?

This is where **Dashboard Analytics & Reporting** comes in!

### The Problem: Seeing the Big Picture and Making Strategic Decisions

Imagine you are the CEO or a product manager for your SaaS application. While individual alerts about "Acme Corp" being at high risk are crucial, you also need answers to bigger questions:
*   What is the *overall health* of my platform right now?
*   Are more customers becoming "High Risk" this month compared to last?
*   Which features are showing declining engagement across *all* users?
*   What are the *top reasons* why customers are at risk of churning, across my entire user base?
*   Can I download a summary report for our weekly executive meeting?

Simply reacting to individual alerts isn't enough for strategic planning. You need a centralized "mission control" where all the intelligence gathered by Churnova AI is visually presented, aggregated, and easily digestible.

This is exactly what **Dashboard Analytics & Reporting** solves. It's the user-facing interface that brings all the data and ML-generated insights together into clear, interactive visualizations, enabling data-driven monitoring and decision-making for your entire team.

### What is Dashboard Analytics & Reporting? Your Mission Control Center

Think of Churnova AI's Dashboard Analytics & Reporting as your **mission control center**. It's where you get a comprehensive, visual overview of everything happening in your connected SaaS applications. It takes the complex raw data and sophisticated ML outputs and presents them in a way that's easy to understand at a glance.

This "mission control" offers several key areas:

*   **Overview Dashboard**: Your main landing page, showing key performance indicators (KPIs) like total users, active users, high-risk users, and average health score. It's designed for a quick "pulse check" of your entire platform.
*   **Engagement Trends**: Visualizations of how users are interacting with your product over time. This includes daily event volume, session duration trends, and feature adoption rates.
*   **Risk Analysis**: A deeper dive into churn risk, showing the distribution of customers across different risk levels, the breakdown of revenue at risk, and even interactive charts to visualize anomalous behavior.
*   **Customer & Anomaly Lists**: Detailed tables and lists of individual customers, making it easy to filter, sort, and investigate specific profiles.
*   **Reports**: Pre-configured, downloadable reports (e.g., weekly risk summaries, engagement health reports, churn forecasts) that can be shared or scheduled for regular delivery.

Together, these components empower you to move beyond reactive problem-solving to proactive, strategic decision-making.

### How to Use It: Exploring Your Data in the UI

You interact with Dashboard Analytics & Reporting directly through the Churnova AI user interface (UI). It's all about navigating different pages to get the insights you need.

Let's look at some examples of what you would see on different dashboard pages:

#### 1. The Overview Dashboard (`/dashboard`)

This is often the first page you see when you log in. It provides a high-level summary.

**Example Use Case**: A business owner wants a quick daily check on their product's overall health and critical alerts.

**What you'd see (from `src/app/dashboard/page.tsx`):**

```html
<!-- Simplified view from the main Overview Dashboard -->
<div class="header-section">
    <h1 class="text-2xl font-bold">Acme Analytics Overview</h1>
    <p class="text-sm text-muted-foreground">Real-time churn intelligence dashboard</p>
    <!-- Buttons for Refresh, Export CSV -->
</div>

<div class="kpi-cards-grid">
    <!-- Example KPI Card -->
    <div class="kpi-card">
        <p>Total Users</p>
        <p class="text-[28px] font-bold">12,500</p>
    </div>
    <!-- Another KPI Card -->
    <div class="kpi-card">
        <p>High Risk Users</p>
        <p class="text-[28px] font-bold">250</p>
        <p class="text-xs text-red-400">🚨 Urgent</p>
    </div>
    <!-- ... more KPI cards for Active Users, MRR @ Risk, Health Score ... -->
</div>

<div class="engagement-chart">
    <h3>Engagement Over Time</h3>
    <p>30-day rolling average</p>
    <!-- An area chart showing Avg Health Score trend -->
</div>

<div class="risk-distribution-pie-chart">
    <h3>Risk Distribution</h3>
    <p>User segmentation by risk level</p>
    <!-- A pie chart showing breakdown of High, Medium, Low Risk users -->
</div>

<div class="high-risk-alert-banner">
    <p>🚨 250 high-risk users require immediate attention</p>
    <button>Review Risk</button>
</div>
```
**Explanation**: This dashboard immediately shows key metrics. You can see your `Total Users`, how many are `High Risk Users`, and an `Engagement Over Time` chart based on the [Customer Health Scoring Logic](#Chapter-4-Customer-Health-Scoring-Logic). The `Risk Distribution` pie chart visually segments your users by risk level. If there are high-risk users, a prominent banner encourages you to dive deeper.

#### 2. Risk Analysis Page (`/dashboard/risk`)

This page provides a more detailed breakdown of your churn risk.

**Example Use Case**: A customer success manager wants to understand the factors driving churn risk and prioritize high-value at-risk accounts.

**What you'd see (from `src/app/dashboard/risk/page.tsx`):**

```html
<!-- Simplified view from the Risk Analysis Page -->
<div class="header-section">
    <h1 class="text-2xl font-bold">Risk Analysis</h1>
    <p class="text-sm text-muted-foreground">Deep-dive risk segmentation and revenue impact</p>
    <button>Download PDF Report</button>
</div>

<div class="risk-score-explainer">
    <h3>How is the Risk Score calculated?</h3>
    <div class="grid md:grid-cols-3 gap-4">
        <!-- Explanations for Unusual Behavior, Engagement Trend, Recent Activity -->
        <div>
            <p class="font-bold">Unusual Behavior (50%)</p>
            <p class="text-xs">How different a user's behavior is from normal.</p>
        </div>
        <!-- ... more factors ... -->
    </div>
</div>

<div class="charts-row">
    <div class="risk-distribution-histogram">
        <h3>Risk Score Distribution</h3>
        <!-- A bar chart showing how many users fall into each score bucket -->
    </div>
    <div class="radar-chart">
        <h3>Healthy vs At-Risk Profile</h3>
        <!-- A radar chart comparing engagement factors for healthy vs. at-risk users -->
    </div>
</div>

<div class="revenue-at-risk-section">
    <h3>Revenue at Risk by Plan</h3>
    <p class="text-xs">MRR exposure from high-risk users</p>
    <span class="badge-high">$15,000 total</span>
    <!-- Grid of cards showing MRR at risk for different plans (Free, Basic, Pro) -->
</div>

<div class="high-risk-users-table">
    <h3>Top 10 High-Risk Users</h3>
    <!-- A table listing individual high-risk users, their risk scores, MRR, and a call-to-action -->
</div>
```
**Explanation**: This page goes into detail about the [ML Churn Prediction Pipeline](#Chapter-5-ML-Churn-Prediction-Pipeline). It explains how the risk score is calculated using factors like "Unusual Behavior" (anomaly detection), "Engagement Trend," and "Recent Activity." You can see the `Risk Score Distribution` in a histogram, compare `Healthy vs At-Risk` profiles on a radar chart, and view `Revenue at Risk` by plan. A table of `Top 10 High-Risk Users` allows for targeted interventions.

#### 3. Reports Page (`/dashboard/reports`)

This section allows you to generate and manage various downloadable reports.

**Example Use Case**: An executive needs a weekly summary of churn risk to be emailed to them every Monday.

**What you'd see (from `src/app/dashboard/reports/page.tsx`):**

```html
<!-- Simplified view from the Reports Page -->
<div class="header-section">
    <h1 class="text-2xl font-bold">Reports</h1>
    <p class="text-sm text-muted-foreground">View, download, and schedule data-driven analytics reports</p>
    <button>Schedule Report</button>
</div>

<div class="reports-grid">
    <!-- Example Report Card -->
    <div class="report-card">
        <h3>Weekly Risk Summary</h3>
        <p class="text-xs">Risk score changes, new high-risk users, and revenue impact</p>
        <span class="badge-automated">Automated</span>
        <button>Preview</button>
        <button>Download CSV</button>
    </div>
    <!-- Another Report Card -->
    <div class="report-card">
        <h3>30-Day Churn Forecast</h3>
        <p class="text-xs">ML-generated churn predictions for the next 30-day window</p>
        <span class="badge-on-demand">On-Demand</span>
        <button>Preview</button>
        <button>Download CSV</button>
    </div>
    <!-- ... other reports like Engagement Health, Cohort Retention, AI Insights Summary ... -->
</div>

<div class="email-digest-preview">
    <h3>Email Digest Preview</h3>
    <p class="text-xs">Automated weekly churn risk email — live data</p>
    <!-- A visual preview of what the automated email digest looks like -->
    <button>Send Preview</button>
</div>

<!-- Schedule Dialog (when "Schedule Report" is clicked) -->
<div class="schedule-dialog">
    <h3>Schedule Automated Reports</h3>
    <input placeholder="team@yourcompany.com" />
    <select>
        <option>Weekly</option>
        <option>Daily</option>
    </select>
    <button>Save Schedule</button>
</div>
```
**Explanation**: This page lists all available reports, such as the `Weekly Risk Summary` (leveraging data from [Chapter 6: AI Insights Engine](#Chapter-6-AI-Insights-Engine) for top churn drivers). You can `Preview` any report, `Download CSV` versions, and importantly, `Schedule Report` for automated email delivery, directly linking to the features discussed in [Chapter 7: Automated Alerting System](#Chapter-7-Automated-Alerting-System).

### Under the Hood: How the Dashboards Get Their Data

When you navigate through the Churnova AI dashboards, the UI isn't directly looking at the database. Instead, it makes requests to specialized backend API endpoints. These endpoints are designed to:
1.  **Fetch** raw data from the database (using `Prisma` to access our [Prisma Data Model](#Chapter-2-Prisma-Data-Model)).
2.  **Process and Aggregate** that data into digestible summaries (e.g., counting high-risk users, calculating average health scores, grouping events by date).
3.  **Return** the processed data to the UI in a format that's easy to visualize (e.g., JSON).

Here's a simplified flow of how the Overview Dashboard gets its information:

```mermaid
sequenceDiagram
    participant User
    participant Churnova UI
    participant Churnova Backend (API)
    participant Database

    User->>Churnova UI: Navigates to Overview Dashboard
    Churnova UI->>Churnova Backend (API): GET /api/analytics/summary (with projectId)
    Note over Churnova Backend (API): 1. Authenticate user, check project ownership
    Churnova Backend (API)->>Database: SELECT Customers, HealthHistory for projectId
    Database-->>Churnova Backend (API): Raw customer and health score data
    Note over Churnova Backend (API): 2. Calculate totalUsers, highRiskUsers, avgHealth, daily trends
    Churnova Backend (API)-->>Churnova UI: Returns JSON with summary stats and chart data
    Churnova UI->>User: Displays dashboard with charts, KPIs, and user lists
```

Let's dive into some simplified code examples for how the backend prepares this data.

#### 1. Analytics Summary Endpoint (`/api/analytics/summary`)

This endpoint, located at `src/app/api/analytics/summary/route.ts`, is responsible for providing the main summary statistics and overall trends for the Overview Dashboard.

```typescript
// src/app/api/analytics/summary/route.ts (simplified)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId"); // Get active project ID

    // ... (authentication and project ownership check - similar to Chapter 1) ...

    // 1. Fetch all customers for the project
    const customers = await prisma.customer.findMany({
        where: { projectId },
        include: { healthHistory: { orderBy: { timestamp: "desc" }, take: 1 } },
    });

    // 2. Calculate summary statistics
    const totalUsers = customers.length;
    const highRiskUsers = customers.filter(c => c.riskLevel === "High").length;
    const avgHealth = totalUsers > 0
        ? Math.round(customers.reduce((sum, c) => sum + (c.healthScore || 0), 0) / totalUsers)
        : 0;

    // 3. Fetch historical health scores for trend charts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const healthTrend = await prisma.healthScore.findMany({
        where: { customer: { projectId }, timestamp: { gte: thirtyDaysAgo } },
        orderBy: { timestamp: "asc" }
    });

    // 4. Group daily health data for the chart
    const dailyHealthMap: Record<string, { total: number; count: number }> = {};
    healthTrend.forEach(h => {
        const date = h.timestamp.toISOString().split("T")[0];
        if (!dailyHealthMap[date]) dailyHealthMap[date] = { total: 0, count: 0 };
        dailyHealthMap[date].total += h.score;
        dailyHealthMap[date].count += 1;
    });

    const charts = Object.entries(dailyHealthMap).map(([date, data]) => ({
        date,
        engagement: Math.round(data.total / data.count) // Average daily health
    }));

    return NextResponse.json({
        totalUsers,
        highRiskUsers,
        healthScore: avgHealth,
        // ... other stats like riskDistribution ...
        charts // Data for the "Engagement Over Time" chart
    });
}
```
**Explanation**:
*   The code first ensures the user is authorized and owns the `projectId`.
*   It then uses `prisma.customer.findMany` to retrieve all customers associated with that project.
*   It performs simple `filter` and `reduce` operations to calculate `totalUsers`, `highRiskUsers`, and `avgHealth` (using the `healthScore` from [Chapter 4: Customer Health Scoring Logic](#Chapter-4-Customer-Health-Scoring-Logic)).
*   To create the "Engagement Over Time" chart, it fetches `healthHistory` records (from [Chapter 2: Prisma Data Model](#Chapter-2-Prisma-Data-Model)) for the last 30 days using `prisma.healthScore.findMany`.
*   Finally, it processes these historical records to calculate an average `engagement` score for each day, preparing the data for the chart in the UI.

#### 2. Charts Data Endpoint (`/api/dashboard/charts`)

This endpoint, found at `src/app/api/dashboard/charts/route.ts`, is specifically for generating additional chart data, such as daily event counts.

```typescript
// src/app/api/dashboard/charts/route.ts (simplified)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) return NextResponse.json({ error: "Missing Project ID" }, { status: 400 });

    // 1. Fetch all events for the project in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const events = await prisma.event.findMany({
        where: { customer: { projectId }, timestamp: { gte: thirtyDaysAgo } },
        select: { timestamp: true }, // Only need the timestamp
    });

    // 2. Group events by date to count daily engagement
    const dailyEvents: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) { // Initialize all 30 days
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailyEvents[d.toLocaleDateString("en-US", { month: "short", day: "numeric" })] = 0;
    }
    events.forEach(event => { // Populate counts
        const key = event.timestamp.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (dailyEvents[key] !== undefined) dailyEvents[key]++;
    });

    const chartData = Object.entries(dailyEvents).map(([date, count]) => ({
        date,
        engagement: Math.min(100, Math.round((count / 10))), // Simple way to scale count
        sessions: Math.round(count / 2), // Simplified sessions
        newUsers: Math.floor(count / 20), // Simplified new user count
    }));

    return NextResponse.json(chartData);
}
```
**Explanation**:
*   This code fetches `Event` records (the telemetry data from [Chapter 3: Telemetry Ingestion API](#Chapter-3-Telemetry-Ingestion-API)) for the given `projectId` over the last 30 days.
*   It then iterates through these events and counts how many happened on each day.
*   The `dailyEvents` map is transformed into `chartData` with `engagement`, `sessions`, and `newUsers` (simplified metrics based on event counts), which is then sent to the UI for visualization.

Other dashboard pages like `/dashboard/engagement`, `/dashboard/risk`, `/dashboard/anomalies`, and `/dashboard/reports` follow similar patterns: they query specific backend endpoints that aggregate customer data (including `anomalyScore`, `riskLevel`, `churnProbability`, and `aiInsight` from [Chapter 5: ML Churn Prediction Pipeline](#Chapter-5-ML-Churn-Prediction-Pipeline) and [Chapter 6: AI Insights Engine](#Chapter-6-AI-Insights-Engine)) and present it through interactive charts and tables.

### Conclusion

Dashboard Analytics & Reporting is the culmination of all the intelligence gathered by Churnova AI. By providing a user-friendly "mission control center" with dynamic charts, tables, and summaries, it transforms raw data and complex ML predictions into clear, actionable insights. Whether you need a quick overview of platform health, a deep dive into churn drivers, or a scheduled report for your team, this system empowers you to monitor, understand, and make strategic decisions to effectively combat customer churn.

This marks the end of our journey through the Churnova AI tutorial. We hope you now have a solid understanding of how Churnova AI works, from managing projects and ingesting data to predicting churn and visualizing insights.

---
