import { z } from "zod";

export const VibeValidator = z;

export type VibeInfer<T extends z.ZodType> = z.infer<T>;

export default VibeValidator;
