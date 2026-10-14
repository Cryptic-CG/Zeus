import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Self-service account deletion.
//
// Deleting the auth.users row cascades almost everything (profiles, threads,
// messages, BYOK keys, memories, skills, project contexts, workspace data and
// the feedback tables all use ON DELETE CASCADE). Two tables were created
// WITHOUT a foreign key to auth.users — achievements and saved_snippets — so
// they must be cleared explicitly or they'd linger as orphaned rows.
//
// Storage objects are not governed by Postgres cascades either, so the
// feedback attachment bucket (files live under `${userId}/…`) is cleaned up
// best-effort. A storage hiccup must never leave the account half-deleted, so
// it is wrapped in try/catch.
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Tables with no FK to auth.users.
    for (const table of ["achievements", "saved_snippets"] as const) {
      const { error } = await supabaseAdmin.from(table).delete().eq("user_id", userId);
      if (error) throw new Error(`Couldn't delete your ${table}: ${error.message}`);
    }

    // 2. Best-effort storage cleanup (feedback attachments under the user's
    //    folder). List the top-level folder, then each feedback subfolder.
    try {
      const bucket = supabaseAdmin.storage.from("feedback-attachments");
      const { data: top } = await bucket.list(userId);
      const paths: string[] = [];
      for (const entry of top ?? []) {
        // Supabase returns folders with a null id.
        if (entry.id === null) {
          const { data: files } = await bucket.list(`${userId}/${entry.name}`);
          for (const file of files ?? []) {
            if (file.id !== null) paths.push(`${userId}/${entry.name}/${file.name}`);
          }
        } else {
          paths.push(`${userId}/${entry.name}`);
        }
      }
      if (paths.length > 0) await bucket.remove(paths);
    } catch (err) {
      console.error("[account] storage cleanup failed", err);
    }

    // 3. Delete the auth user — cascades everything else.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error(error.message);

    return { ok: true };
  });
