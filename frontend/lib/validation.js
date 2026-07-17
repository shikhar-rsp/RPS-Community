import { z } from "zod";

// Only http(s) links are allowed. This blocks stored-XSS vectors like
// `javascript:...` or `data:...` URLs that would otherwise become clickable.
const safeUrl = z
  .string()
  .trim()
  .min(1, "A link is required.")
  .max(2048, "That link is too long.")
  .refine((v) => {
    try {
      const u = new URL(v);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a valid http(s) link.");

// Assignment submission — the only fields the client is trusted to send.
// Owner identity (user_id/email/name) and status are set server-side, never
// accepted from the browser.
export const submissionSchema = z.object({
  link: safeUrl,
  note: z.string().trim().max(2000, "Note is too long.").optional().default(""),
});

export const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(72, "Password is too long."); // bcrypt hard limit

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email.");
