const WebSocket = require("ws");
const { Client } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const wss = new WebSocket.Server({ port: 8080 });
// Database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL, // Your PostgreSQL URL
});

wss.on("connection", function connection(ws) {
  console.log("Client connected");

  async function startListener() {
    try {
      await client.connect();
      console.log(
        "Connected to PostgreSQL, listening for order status updates..."
      );

      // Listen for order status updates
      client.query("LISTEN order_status_channel");

      client.on("notification", async (msg) => {
        const eventData = JSON.parse(msg.payload);
        console.log("Order Status Updated:", eventData);

        // Handle the order status change (notify clients, etc.)
        // Example: Emit this update via WebSockets to connected clients
        notifyClients(eventData);
      });
    } catch (error) {
      console.error("Error listening for order updates:", error);
    }
  }

  // Simulated function to notify connected clients
  function notifyClients(orderUpdate) {
    console.log("Notifying clients about order update:", orderUpdate);
    // Send the updates to the client
    ws.send(JSON.stringify(orderUpdate));
  }

  // Start the PostgreSQL event listener
  startListener();

  // ws.on("message", function incoming(message) {
  //   console.log("Received: %s", message);

  //   ws.send("sjadjj");
  // });

  ws.on("close", function () {
    console.log("Client disconnected");
  });
});
