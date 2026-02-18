import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const caseSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    case_number: z.string().min(3, "Case number is required"),
    client_id: z.string().uuid("Invalid client ID"),
    attorney_id: z.string().uuid("Invalid attorney ID").optional().or(z.literal("")),
    description: z.string().optional(),
    status: z.enum(["open", "discovery", "litigation", "closed"]),
});

export const appointmentSchema = z.object({
    attorney_id: z.string().uuid("Invalid attorney selection"),
    start_time: z.string().datetime(),
    end_time: z.string().datetime(),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export const documentUploadSchema = z.object({
    case_id: z.string().uuid("Invalid case selection"),
    file_name: z.string().min(1, "File name is required"),
});
