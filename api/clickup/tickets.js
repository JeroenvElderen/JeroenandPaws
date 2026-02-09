const parseBody = async (req) => {
  if (req.body) return req.body;

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : {};
};

const buildDescription = (payload) => {
  const fields = [
    ["Category", payload.ticketCategory],
    ["Email", payload.emailAddress],
    ["Submitted", payload.submissionDate],
    ["Priority", payload.priority],
    ["Status", payload.status],
    ["Assignee", payload.assigneeEmail],
    ["Resolution", payload.resolution],
    ["Ticket number", payload.ticketNumber],
    ["Due date", payload.dueDate],
    ["Attachments", Array.isArray(payload.attachments) ? payload.attachments.join(", ") : ""],
  ];

  const lines = fields
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `${label}: ${value}`);

  return [
    payload.detailedProblemDescription?.trim() || "",
    "",
    ...lines,
  ]
    .filter((line) => line !== "")
    .join("\n");
};

const resolveDateValue = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.getTime();
};

const buildCustomFields = (payload, fieldIds, overrides = {}) => {
  const fields = [
    {
      id: fieldIds.briefProblemDescription,
      value: payload.briefProblemDescription?.trim(),
    },
    {
      id: fieldIds.detailedProblemDescription,
      value: payload.detailedProblemDescription?.trim(),
    },
    { id: fieldIds.ticketCategory, value: payload.ticketCategory },
    { id: fieldIds.resolution, value: payload.resolution },
    {
      id: fieldIds.ticketNumber,
      value: overrides.ticketNumber ?? payload.ticketNumber,
    },
    {
      id: fieldIds.submissions,
      value: resolveDateValue(payload.submissionDate),
    },
    { id: fieldIds.emailAddress, value: payload.emailAddress },
    { id: fieldIds.assigneeEmail, value: payload.assigneeEmail },
  ];

  return fields.filter(
    ({ id, value }) => Boolean(id) && value !== undefined && value !== ""
  );
};

const resolveConfig = () => {
  const token = process.env.CLICKUP_API_TOKEN || process.env.CLICKUP_TOKEN;
  const listId = process.env.CLICKUP_LIST_ID;
  const assigneeId = process.env.CLICKUP_ASSIGNEE_ID;
const customFieldIds = {
    assigneeEmail: process.env.CLICKUP_FIELD_ASSIGNEE,
    briefProblemDescription: process.env.CLICKUP_FIELD_BRIEF_DESCRIPTION,
    detailedProblemDescription: process.env.CLICKUP_FIELD_DETAILED_DESCRIPTION,
    ticketCategory: process.env.CLICKUP_FIELD_TICKET_CATEGORY,
    resolution: process.env.CLICKUP_FIELD_RESOLUTION,
    ticketNumber: process.env.CLICKUP_FIELD_TICKET_NUMBER,
    submissions: process.env.CLICKUP_FIELD_SUBMISSIONS,
    emailAddress: process.env.CLICKUP_FIELD_EMAIL_ADDRESS,
  };

  if (!token) {
    throw new Error("Missing CLICKUP_API_TOKEN env var");
  }
  if (!listId) {
    throw new Error("Missing CLICKUP_LIST_ID env var");
  }

  return { token, listId, assigneeId, customFieldIds };
};

const resolveDueDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.getTime();
};

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end("Method Not Allowed");
    return;
  }

  try {
    const payload = await parseBody(req);
    const brief = payload.briefProblemDescription?.trim();
    const detailed = payload.detailedProblemDescription?.trim();

    if (!brief || !detailed) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          message: "briefProblemDescription and detailedProblemDescription are required.",
        })
      );
      return;
    }

    const { token, listId, assigneeId, customFieldIds } = resolveConfig();
    const description = buildDescription(payload);
    const dueDate = resolveDueDate(payload.dueDate);
    const customFields = buildCustomFields(payload, customFieldIds);

    const response = await fetch(
      `https://api.clickup.com/api/v2/list/${listId}/task`,
      {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: brief,
          description,
          priority: payload.priority?.toLowerCase() === "urgent" ? 1 : 3,
          status: payload.status || "open",
          ...(dueDate
            ? { due_date: dueDate, due_date_time: true }
            : {}),
          ...(assigneeId ? { assignees: [Number(assigneeId)] } : {}),
          ...(customFields.length ? { custom_fields: customFields } : {}),
        }),
      }
    );

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      res.statusCode = response.status || 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          message:
            data?.err || data?.message || "Failed to create ClickUp ticket.",
        })
      );
      return;
    }

    const clickupTask = data?.task || data;
    const clickupTaskUrl = clickupTask?.url || "";
    const clickupTaskId = clickupTask?.id || "";
    const clickupTaskCustomId = clickupTask?.custom_id || "";

    const ticketNumberValue = clickupTaskCustomId || clickupTaskId || "";
    const ticketNumberUpdate = buildCustomFields(
      payload,
      customFieldIds,
      { ticketNumber: ticketNumberValue }
    ).filter(({ id }) => id === customFieldIds.ticketNumber);

    if (ticketNumberUpdate.length && ticketNumberValue) {
      await fetch(`https://api.clickup.com/api/v2/task/${clickupTaskId}`, {
        method: "PUT",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ custom_fields: ticketNumberUpdate }),
      }).catch((updateError) => {
        console.warn("Failed to update ClickUp ticket number", updateError);
      });
    }
    
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        clickup_task_url: clickupTaskUrl,
        clickup_task_id: clickupTaskId,
        clickup_task_custom_id: clickupTaskCustomId,
      })
    );
  } catch (error) {
    console.error("ClickUp ticket error", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ message: "Failed to create ClickUp ticket." }));
  }
};