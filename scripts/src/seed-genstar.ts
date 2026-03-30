import { db } from "@workspace/db";
import { employeesTable, workflowsTable, tasksTable, auditLogsTable, meetingsTable } from "@workspace/db/schema";

async function seed() {
  console.log("Seeding GenStar database...");

  const employees = await db.insert(employeesTable).values([
    { name: "Alice Johnson", email: "alice@genstar.ai", role: "Senior Engineer", department: "Engineering", status: "active", productivityScore: 87, tasksCompleted: 34, tasksInProgress: 3, errorRate: 2.1, idleTime: 0.5, qualityScore: 94 },
    { name: "Bob Martinez", email: "bob@genstar.ai", role: "Product Manager", department: "Product", status: "active", productivityScore: 92, tasksCompleted: 42, tasksInProgress: 5, errorRate: 1.2, idleTime: 0.3, qualityScore: 96 },
    { name: "Carol Smith", email: "carol@genstar.ai", role: "Data Analyst", department: "Analytics", status: "active", productivityScore: 78, tasksCompleted: 28, tasksInProgress: 2, errorRate: 3.5, idleTime: 1.2, qualityScore: 88 },
    { name: "David Chen", email: "david@genstar.ai", role: "DevOps Lead", department: "Engineering", status: "active", productivityScore: 95, tasksCompleted: 51, tasksInProgress: 4, errorRate: 0.8, idleTime: 0.2, qualityScore: 98 },
    { name: "Emma Davis", email: "emma@genstar.ai", role: "UX Designer", department: "Design", status: "active", productivityScore: 83, tasksCompleted: 22, tasksInProgress: 3, errorRate: 1.8, idleTime: 0.7, qualityScore: 91 },
    { name: "Frank Wilson", email: "frank@genstar.ai", role: "Backend Engineer", department: "Engineering", status: "on_leave", productivityScore: 71, tasksCompleted: 18, tasksInProgress: 0, errorRate: 4.2, idleTime: 2.1, qualityScore: 82 },
    { name: "Grace Lee", email: "grace@genstar.ai", role: "Sales Manager", department: "Sales", status: "active", productivityScore: 88, tasksCompleted: 39, tasksInProgress: 6, errorRate: 1.5, idleTime: 0.4, qualityScore: 93 },
    { name: "Henry Brown", email: "henry@genstar.ai", role: "QA Engineer", department: "Engineering", status: "active", productivityScore: 76, tasksCompleted: 31, tasksInProgress: 2, errorRate: 2.9, idleTime: 0.9, qualityScore: 87 },
  ]).returning();

  console.log(`Created ${employees.length} employees`);

  const workflows = await db.insert(workflowsTable).values([
    { name: "Q1 Product Launch", description: "Full product launch pipeline for Q1 2026", status: "running", priority: "critical", riskScore: 72, bottlenecks: ["Design review pending", "API integration delayed"], taskCount: 8, completedTasks: 5, ownerId: employees[1].id },
    { name: "Infrastructure Migration", description: "Migrate production to Kubernetes", status: "active", priority: "high", riskScore: 45, bottlenecks: ["Staging environment setup"], taskCount: 12, completedTasks: 3, ownerId: employees[3].id },
    { name: "Sales Pipeline Automation", description: "Automate CRM and lead scoring", status: "active", priority: "medium", riskScore: 28, bottlenecks: [], taskCount: 6, completedTasks: 4, ownerId: employees[6].id },
    { name: "Security Compliance Audit", description: "SOC2 compliance preparation", status: "completed", priority: "critical", riskScore: 15, bottlenecks: [], taskCount: 10, completedTasks: 10, ownerId: employees[0].id },
    { name: "Employee Onboarding System", description: "Digital onboarding workflow automation", status: "draft", priority: "low", riskScore: 12, bottlenecks: [], taskCount: 5, completedTasks: 0 },
  ]).returning();

  console.log(`Created ${workflows.length} workflows`);

  await db.insert(tasksTable).values([
    { workflowId: workflows[0].id, title: "Design system review", description: "Review and approve updated design system", status: "completed", priority: "high", assigneeId: employees[4].id, agentType: "action", dependencies: [], riskScore: 25 },
    { workflowId: workflows[0].id, title: "API integration testing", description: "Test all third-party API integrations", status: "in_progress", priority: "critical", assigneeId: employees[0].id, agentType: "verification", dependencies: [], riskScore: 65 },
    { workflowId: workflows[0].id, title: "Performance benchmarking", description: "Run load tests and benchmark", status: "pending", priority: "high", assigneeId: employees[3].id, agentType: "data", dependencies: [], riskScore: 40 },
    { workflowId: workflows[0].id, title: "Marketing copy review", description: "Review landing page copy", status: "completed", priority: "medium", assigneeId: employees[1].id, agentType: "action", dependencies: [], riskScore: 10 },
    { workflowId: workflows[0].id, title: "Beta launch deployment", description: "Deploy to beta environment", status: "blocked", priority: "critical", assigneeId: employees[3].id, agentType: "action", dependencies: [], riskScore: 80 },
    { workflowId: workflows[1].id, title: "Kubernetes cluster setup", description: "Configure K8s cluster in production", status: "completed", priority: "critical", assigneeId: employees[3].id, agentType: "action", dependencies: [], riskScore: 55 },
    { workflowId: workflows[1].id, title: "Docker containerization", description: "Containerize all microservices", status: "in_progress", priority: "high", assigneeId: employees[0].id, agentType: "action", dependencies: [], riskScore: 35 },
    { workflowId: workflows[1].id, title: "CI/CD pipeline migration", description: "Update GitHub Actions for K8s deploy", status: "pending", priority: "high", assigneeId: employees[3].id, agentType: "action", dependencies: [], riskScore: 45 },
    { workflowId: workflows[2].id, title: "CRM API integration", description: "Connect Salesforce via API", status: "completed", priority: "high", assigneeId: employees[6].id, agentType: "data", dependencies: [], riskScore: 20 },
    { workflowId: workflows[2].id, title: "Lead scoring algorithm", description: "Implement ML-based lead scoring", status: "completed", priority: "high", assigneeId: employees[2].id, agentType: "action", dependencies: [], riskScore: 30 },
    { workflowId: workflows[2].id, title: "Email automation setup", description: "Configure automated email sequences", status: "in_progress", priority: "medium", assigneeId: employees[6].id, agentType: "action", dependencies: [], riskScore: 15 },
    { workflowId: workflows[3].id, title: "Access control audit", description: "Review all user access permissions", status: "completed", priority: "critical", assigneeId: employees[7].id, agentType: "verification", dependencies: [], riskScore: 5 },
    { workflowId: workflows[3].id, title: "Encryption review", description: "Audit data encryption standards", status: "completed", priority: "critical", assigneeId: employees[0].id, agentType: "verification", dependencies: [], riskScore: 5 },
  ]);

  console.log("Created tasks");

  await db.insert(auditLogsTable).values([
    { agentType: "orchestrator", action: "workflow_created", entityType: "workflow", entityId: workflows[0].id, details: { name: "Q1 Product Launch" }, reasoning: "User initiated workflow. Orchestrator decomposed into 8 parallel tasks.", status: "success" },
    { agentType: "decision", action: "priority_assigned", entityType: "workflow", entityId: workflows[0].id, details: { priority: "critical" }, reasoning: "Decision agent evaluated deadline proximity. SLA deadline in 14 days — escalating to critical.", status: "success" },
    { agentType: "data", action: "context_loaded", entityType: "workflow", entityId: workflows[0].id, details: { resourcesLoaded: 12 }, reasoning: "Data agent fetched employee profiles, past workflow patterns, and policy constraints.", status: "success" },
    { agentType: "action", action: "task_assigned", entityType: "task", entityId: 1, details: { assignee: "Alice Johnson" }, reasoning: "Action agent matched task requirements to employee skills and availability.", status: "success" },
    { agentType: "verification", action: "task_validated", entityType: "task", entityId: 1, details: { checks: ["output_valid", "sla_met"] }, reasoning: "Verification agent confirmed task output meets quality standards.", status: "success" },
    { agentType: "monitoring", action: "sla_alert", entityType: "workflow", entityId: workflows[0].id, details: { riskScore: 72 }, reasoning: "Monitoring agent detected high risk score. Bottleneck in API integration may impact SLA.", status: "warning" },
    { agentType: "audit", action: "system_health_check", entityType: "system", details: { agentsActive: 8, tasksProcessed: 47 }, reasoning: "Routine health check — all agents operational.", status: "success" },
    { agentType: "recovery", action: "retry_attempted", entityType: "task", entityId: 5, details: { attempt: 2, reason: "External API timeout" }, reasoning: "Recovery agent detected task failure. Applying exponential backoff retry strategy.", status: "warning" },
  ]);

  await db.insert(meetingsTable).values([
    {
      title: "Q1 Strategy Planning Meeting",
      transcript: "Team lead: We need to finalize the product launch by end of quarter.\nAlice: I will handle the API integration testing. Action item: complete API testing by next week.\nBob: Agreed. We decided to prioritize the beta launch.\nDavid: I need to set up the staging environment. Todo: staging setup urgent, high priority.\nMeeting resolved: Launch date set for March 31.",
      date: new Date("2026-03-15"),
      decisions: ["Launch date confirmed for March 31", "API integration prioritized", "Staging environment setup approved"],
      extractedTasks: [
        { title: "Complete API integration testing", owner: "Alice", deadline: "2026-03-22", priority: "high" },
        { title: "Set up staging environment", owner: "David", deadline: "2026-03-20", priority: "critical" },
        { title: "Finalize beta launch checklist", owner: "Bob", deadline: "2026-03-28", priority: "high" },
      ],
      workflowId: workflows[0].id,
      status: "processed",
    },
  ]);

  console.log("GenStar database seeded successfully!");
}

seed().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
