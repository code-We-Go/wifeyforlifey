/**
 * Helper to sync/add contacts to Brevo (Sendinblue) email lists.
 */

export interface BrevoContactParams {
  email: string;
  listId: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export async function addContactToBrevo({
  email,
  listId,
  firstName,
  lastName,
  phone,
}: BrevoContactParams): Promise<{ success: boolean; error?: string }> {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    console.warn("[Brevo] BREVO_API_KEY is not configured — skipping Brevo contact sync");
    return { success: false, error: "BREVO_API_KEY not configured" };
  }

  const cleanEmail = (email || "").trim().toLowerCase();
  if (!cleanEmail) {
    console.warn("[Brevo] Skipping contact sync: email is missing or empty");
    return { success: false, error: "Email is missing" };
  }

  // Build attributes if provided
  const attributes: Record<string, string> = {};
  if (firstName && firstName.trim()) {
    attributes.FIRSTNAME = firstName.trim();
  }
  if (lastName && lastName.trim()) {
    attributes.LASTNAME = lastName.trim();
  }

  if (phone) {
    const digits = phone.replace(/\D/g, "");
    if (digits.length >= 7) {
      if (phone.startsWith("+")) {
        attributes.SMS = `+${digits}`;
      } else if (digits.startsWith("20") && digits.length === 12) {
        attributes.SMS = `+${digits}`;
      } else if (digits.startsWith("0")) {
        attributes.SMS = `+20${digits.slice(1)}`;
      } else {
        attributes.SMS = `+20${digits}`;
      }
    }
  }

  const payload: Record<string, any> = {
    email: cleanEmail,
    listIds: [listId],
    updateEnabled: true,
  };

  if (Object.keys(attributes).length > 0) {
    payload.attributes = attributes;
  }

  try {
    console.log(`[Brevo] Syncing contact ${cleanEmail} to list ${listId}...`);
    let res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify(payload),
    });

    // If initial request fails (e.g. invalid SMS format or attribute schema mismatch in Brevo),
    // fall back to minimal payload (email + listIds) so the user is ALWAYS added to the list.
    if (!res.ok && payload.attributes) {
      const initialError = await res.text();
      console.warn(
        `[Brevo] Contact sync with attributes failed for ${cleanEmail} (${res.status}): ${initialError}. Retrying with minimal payload...`
      );

      res = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "api-key": brevoApiKey,
        },
        body: JSON.stringify({
          email: cleanEmail,
          listIds: [listId],
          updateEnabled: true,
        }),
      });
    }

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(
        `[Brevo] Failed to sync contact ${cleanEmail} to list ${listId} (status ${res.status}):`,
        errorBody
      );
      return { success: false, error: `Brevo error ${res.status}: ${errorBody}` };
    }

    console.log(`[Brevo] Successfully synced contact ${cleanEmail} to list ${listId}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[Brevo] Network error syncing contact ${cleanEmail} to list ${listId}:`, err);
    return { success: false, error: err?.message || String(err) };
  }
}
