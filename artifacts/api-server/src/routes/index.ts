import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mindflowRouter from "./mindflow";

const router: IRouter = Router();

router.use(healthRouter);
router.use(mindflowRouter);

export default router;
