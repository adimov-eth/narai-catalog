# WebSocket Debugging Guide for Cloudflare Durable Objects

## Overview

This guide provides detailed steps to debug WebSocket connection issues in a Cloudflare Durable Objects application, specifically focusing on problems where connections are being closed right after initialization in the production environment.

## 1. Enhanced Logging for WebSocket Initialization

Modify the `fetch` method in your `ClickerState` class to include more detailed logging:

```typescript
async fetch(request: Request) {
  console.log("Fetch request received");
  // ... (user loading logic)

  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  console.log("WebSocket pair created");

  this.ctx.acceptWebSocket(server, ["clients"]);
  console.log("WebSocket accepted");

  this.ctx.setWebSocketAutoResponse(
    new WebSocketRequestResponsePair('{"evt":"ping"}', '{"evt":"pong"}'),
  );
  console.log("WebSocket auto-response set");

  server.addEventListener('open', () => {
    console.log("WebSocket opened");
    this.sendMessage(server, {
      evt: "hi",
      ver: PROTOCOL_VERSION,
      time: Date.now(),
      state: this.state.serialize(),
    });
    console.log("Initial 'hi' message sent");
  });

  server.addEventListener('error', (error) => {
    console.error("WebSocket error:", error);
  });

  server.addEventListener('close', (event) => {
    console.log("WebSocket closed:", event.code, event.reason);
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}
```

## 2. Improved State Initialization Logging

Enhance the `load` method in the `ClickerState` class:

```typescript
async load() {
  console.log('XUSER:load() started', [this.userId, this.userUsername, this.userFullName]);
  await this.loadUserIdFromStorage();
  if (!this.userId) {
    console.error("Can't load the state without a user ID.");
    throw new Error("Can't load the state without a user ID.");
  }
  await this.storeUserIdToStorage();

  try {
    const persistedData = await this.getPersistedData();
    console.log('Persisted data loaded:', persistedData);
    const referrals = await this.updateStoredReferrals();
    console.log('Referrals updated:', referrals);
    const referrer = await this.updateStoredReferrerData();
    console.log('Referrer data updated:', referrer);
    this.state.deserialize({ ...persistedData, referrer, referrals });
    console.log('State deserialized');
  } catch (error) {
    console.error('Error during load:', error);
    throw error;
  }
}
```

## 3. Rails API Interaction Logging

Modify the `syncFromRails` function to include more logging:

```typescript
export async function syncFromRails(tgid: string, env: Env): Promise<PersistedUserType | null> {
  const token = env.RAILS_API_TOKEN;
  const rails_api_url = env.RAILS_API_HOST;
  const url = `${rails_api_url}/users/${tgid}?token=${token}`;

  console.log('Syncing from Rails:', url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch from Rails API', await response.text());
      return null;
    }

    const data = await response.json() as RailsApiResponse;
    console.log('RAILS DATA:::', data);
    // ... (rest of the function)
  } catch (error) {
    console.error('Error syncing from Rails:', error);
    throw error;
  }
}
```

## 4. Durable Object Lifecycle Tracking

Add logging to track the Durable Object lifecycle:

```typescript
export class ClickerState extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.storage = ctx.storage;
    this.env = env;
    console.log('ClickerState constructor called');

    ctx.blockConcurrencyWhile(async () => {
      console.log('Initializing ClickerState');
      await this.loadUserIdFromStorage();
      console.log('User ID loaded:', this.userId);
    });
  }

  // ... (rest of the class)
}
```

## 5. Connection Management

Modify the connection management logic to allow multiple connections:

```typescript
async fetch(request: Request) {
  // ... (other code)

  const currentWebsockets = this.ctx.getWebSockets("clients");
  console.log(`Current WebSocket connections: ${currentWebsockets.length}`);

  if (currentWebsockets.length >= 5) {  // Allow up to 5 connections
    console.log('Too many connections, closing oldest');
    currentWebsockets[0].close();
  }

  // ... (rest of the method)
}
```

## 6. Improved Error Handling

Enhance error handling throughout the application:

```typescript
async handleAction(websocket: WebSocket | null, message: Extract<ChannelClientEvent, { evt: "action" }>) {
  try {
    // ... (existing code)
  } catch (error) {
    console.error('Error handling action:', error);
    if (websocket) {
      this.sendMessage(websocket, {
        evt: "error",
        message: "An error occurred while processing your action",
      });
    }
  }
}
```

## 7. Monitoring and Alerting

Implement custom metrics for better monitoring:

```typescript
export class ClickerState extends DurableObject<Env> {
  private metrics: any;

  constructor(ctx: DurableObjectState, env: Env) {
    // ... (existing code)
    this.metrics = ctx.metrics;
  }

  async fetch(request: Request) {
    this.metrics.increment("fetch_requests");
    // ... (rest of the method)
  }

  async handleAction(websocket: WebSocket | null, message: Extract<ChannelClientEvent, { evt: "action" }>) {
    this.metrics.increment("actions_processed");
    // ... (rest of the method)
  }
}
```

## 8. Deployment Strategy

Consider implementing a canary deployment strategy:
- Deploy changes to a small subset of users first
- Monitor closely for any issues
- Gradually roll out to all users if no issues are detected

## 9. Environment Comparison

Create a detailed comparison of staging and production environments, including:
- Cloudflare Worker versions
- Durable Object versions
- KV namespace configurations
- Environment variables
- External service endpoints (e.g., Rails API)

## 10. Client-Side Logging

Implement detailed client-side logging to capture any issues from the client's perspective. This can help identify if the problem is on the client or server side.

## Next Steps

1. Deploy these changes to your production environment.
2. Monitor the logs closely, especially during WebSocket initialization.
3. Compare logs between staging and production environments.
4. Look for discrepancies in timing, data consistency, or error messages.
5. If the issue persists, collect all relevant logs and metrics.
6. Consider reaching out to Cloudflare support with your detailed logs and metrics if you're unable to identify the root cause.

Remember, debugging distributed systems often requires patience and systematic investigation. These enhanced logging and monitoring techniques should provide valuable insights into the WebSocket connection issues you're experiencing.
