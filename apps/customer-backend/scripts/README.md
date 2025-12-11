# Customer Backend Scripts

## Available Scripts

### 1. Create Novu Workflow

Automatically create the `delivery-thread-message` workflow in Novu Dashboard.

**Usage**:

```bash
cd apps/customer-backend
node scripts/create-novu-workflow.js
```

**Requirements**:

- `NOVU_API_KEY` must be set in `.env` file
- Node.js 18+ with ES modules support

**What it does**:

1. Connects to Novu API using your API key
2. Creates a new workflow with identifier `delivery-thread-message`
3. Configures in-app notification template
4. Sets up payload variables
5. Activates the workflow

**Output**:

```
✅ Workflow created successfully!

📋 Workflow Details:
   ID: 64abc123...
   Identifier: delivery-thread-message
   Name: Delivery Thread Message
   Active: true

🎯 Next steps:
   1. Update novu.service.ts to use the new workflow identifier
   2. Restart the server
   3. Test by sending a message in delivery thread
```

**Troubleshooting**:

If workflow already exists:

```
❌ Failed to create workflow: Workflow already exists
```

Solution: Delete existing workflow from Novu Dashboard or use it as-is.

If API key is invalid:

```
❌ NOVU_API_KEY not found in .env file
```

Solution: Add `NOVU_API_KEY=your_key_here` to `.env` file.

### 2. Manual Setup (Alternative)

If the script fails, follow manual setup instructions in:
`apps/customer-backend/DELIVERY_THREAD_NOTIFICATIONS.md`

## Environment Variables

Required in `.env`:

```bash
NOVU_API_KEY=your_novu_api_key_here
```

Optional:

```bash
NOVU_NOTIFICATION_GROUP_ID=your_group_id  # Default: 'default'
```

## Notes

- Scripts use ES modules (`.js` with `import` statements)
- Make sure `package.json` has `"type": "module"`
- Scripts are safe to run multiple times (will skip if workflow exists)
