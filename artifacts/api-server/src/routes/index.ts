import { Router, type IRouter } from "express";
import healthRouter from "./health";
import employeesRouter from "./employees";
import workflowsRouter from "./workflows";
import tasksRouter from "./tasks";
import meetingsRouter from "./meetings";
import analyticsRouter from "./analytics";
import agentsRouter from "./agents";
import auditRouter from "./audit";
import chatbotRouter from "./chatbot";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/employees", employeesRouter);
router.use("/workflows", workflowsRouter);
router.use("/tasks", tasksRouter);
router.use("/meetings", meetingsRouter);
router.use("/analytics", analyticsRouter);
router.use("/agents", agentsRouter);
router.use("/audit", auditRouter);
router.use("/chatbot", chatbotRouter);

export default router;
