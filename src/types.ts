import z from "zod";
import {  userContactSchema , deleteUserContactSchema} from "./schema";

export type  userContactType = z.infer<typeof userContactSchema>;


export type deleteUserContactType = z.infer<typeof deleteUserContactSchema>;