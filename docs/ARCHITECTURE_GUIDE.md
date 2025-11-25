# AI Chat Architecture - Complete Guide

## 📚 Table of Contents
1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Components Breakdown](#components-breakdown)
4. [Message Flow](#message-flow)
5. [Setup & Running](#setup--running)
6. [How Each Component Works](#how-each-component-works)
7. [Extending the System](#extending-the-system)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This is a real-time AI chat system built with:
- **Frontend**: React + Material-UI chat widget
- **Real-time Communication**: Socket.io
- **AI Processing**: LangChain + NVIDIA AI models
- **Backend Integration**: Java REST API (for future training/data)

The system allows users to chat with an AI assistant that can:
- Answer questions using NVIDIA's language model
- Call Java backend APIs when needed (via LangChain tools)
- Provide real-time responses through WebSocket connections

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Chat Widget (chat-widget.tsx)                 │  │
│  │  - Material-UI components                             │  │
│  │  - Socket.io client connection                        │  │
│  │  - Message state management                           │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Socket.io (WebSocket)
                        │ Port: 4000
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              SOCKET.IO SERVER                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  socket-io-server/src/index.ts                        │  │
│  │  - Receives messages from frontend                    │  │
│  │  - Calls LangChain service                            │  │
│  │  - Broadcasts responses back                          │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP POST /agent
                        │ Port: 3001
                        ▼
┌─────────────────────────────────────────────────────────────┐
│            LANGCHAIN SERVICE                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  server.ts - Express API endpoint                      │  │
│  │    ↓                                                    │  │
│  │  agent.ts - LangChain agent orchestration              │  │
│  │    ↓                                                    │  │
│  │  nvidia-chat.ts - NVIDIA AI model wrapper             │  │
│  │    ↓                                                    │  │
│  │  tools.ts - Java API integration tool                 │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP POST /api/query (when needed)
                        │ Port: 8081
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              JAVA BACKEND API                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Spring Boot / Java REST API                          │  │
│  │  - Database queries                                   │  │
│  │  - Business logic                                     │  │
│  │  - Data retrieval                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧩 Components Breakdown

### 1. Frontend Chat Widget (`src/components/chat-widget/chat-widget.tsx`)

**Purpose**: User interface for chatting with AI

**Key Features**:
- Material-UI components for beautiful UI
- Real-time message display
- Socket.io client for WebSocket communication
- Message state management with React hooks

**Key Code Sections**:

```typescript
// Socket connection
const socket = useSocket("http://localhost:4000");

// Listen for incoming messages
useEffect(() => {
  const socketInstance = socket.current;
  if (!socketInstance) return;

  const handleNewMessage = (msg: Message) => {
    const formattedMessage: Message = {
      ...msg,
      timestamp: new Date(msg.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
    };
    setMessages((prev) => [...prev, formattedMessage]);
  };

  socketInstance.on("newMessage", handleNewMessage);
  return () => {
    socketInstance.off("newMessage", handleNewMessage);
  };
}, [socket]);

// Send message
const handleSendMessage = () => {
  if (!inputValue.trim()) return;
  if (!socket.current) return;
  
  socket.current.emit("sendMessage", inputValue);
  setInputValue('');
};
```

**What it does**:
1. Connects to Socket.io server on port 4000
2. Listens for `newMessage` events
3. Sends user messages via `sendMessage` event
4. Displays messages in a chat interface

---

### 2. Socket.io Server (`socket-io-server/src/index.ts`)

**Purpose**: Real-time communication bridge between frontend and AI service

**Key Features**:
- WebSocket server for real-time bidirectional communication
- Message routing between frontend and langchain service
- Error handling and message formatting

**Key Code Sections**:

```typescript
// Call langchain service
async function getAIResponse(userMessage: string): Promise<string> {
  const response = await fetch(`${LANGCHAIN_SERVICE_URL}/agent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage }),
  });
  const data = await response.json();
  return data.response;
}

// Handle incoming messages
socket.on("sendMessage", async (text) => {
  // 1. Emit user message immediately
  const userMessage: Message = {
    id: crypto.randomUUID(),
    text,
    sender: "user",
    timestamp: new Date().toISOString(),
  };
  socket.emit("newMessage", userMessage);

  // 2. Get AI response
  const aiResponseText = await getAIResponse(text);
  
  // 3. Emit AI response
  const aiMessage: Message = {
    id: crypto.randomUUID(),
    text: aiResponseText,
    sender: "system",
    timestamp: new Date().toISOString(),
  };
  socket.emit("newMessage", aiMessage);
});
```

**What it does**:
1. Listens for `sendMessage` events from frontend
2. Immediately echoes user message back (for instant UI feedback)
3. Calls LangChain service HTTP API
4. Sends AI response back to frontend via `newMessage` event

**Why Socket.io?**
- Real-time bidirectional communication
- Better than polling HTTP requests
- Handles reconnection automatically
- Lower latency for chat applications

---

### 3. LangChain Service (`langchain-service/`)

**Purpose**: AI processing and orchestration

#### 3.1 Server (`src/server.ts`)

**Purpose**: Express API endpoint that receives messages

```typescript
app.post("/agent", async (req, res) => {
  const { message } = req.body;
  
  // Validate
  if (!message || typeof message !== "string") {
    return res.status(400).json({
      error: "Invalid request. 'message' field is required."
    });
  }

  // Process through agent
  const response = await handleUserInput(message);
  
  // Return response
  res.json({ response });
});
```

**What it does**:
- Receives HTTP POST requests with user messages
- Validates input
- Calls agent to process message
- Returns AI response

---

#### 3.2 Agent (`src/agent.ts`)

**Purpose**: Orchestrates AI model and tools

```typescript
export async function handleUserInput(userText: string): Promise<string> {
  // 1. Initialize NVIDIA AI model
  const model = new ChatNvidia({
    model: "meta/llama-4-maverick-17b-128e-instruct",
    apiKey: process.env.NVIDIA_API_KEY,
    temperature: 0.7,
    maxTokens: 512,
  });

  // 2. Create agent with model and tools
  const agent = createAgent({
    model,
    tools: [callJavaAPI], // Tool for calling Java backend
  });

  // 3. Invoke agent with user message
  const response = await agent.invoke({
    messages: [{ role: "user", content: userText }],
  });

  // 4. Extract and return response text
  if (response?.messages && Array.isArray(response.messages)) {
    const lastMessage = response.messages[response.messages.length - 1];
    return String(lastMessage.content);
  }
  
  return JSON.stringify(response);
}
```

**What it does**:
1. Creates NVIDIA AI model instance
2. Creates LangChain agent with model + tools
3. Processes user message through agent
4. Returns formatted response

**Key Concepts**:
- **Agent**: An AI system that can use tools (like calling APIs)
- **Tools**: Functions the AI can call when needed
- **Model**: The actual AI language model (NVIDIA in this case)

---

#### 3.3 NVIDIA Chat Model (`src/models/nvidia-chat.ts`)

**Purpose**: Wrapper for NVIDIA AI API

```typescript
async _generate(messages: BaseMessage[]): Promise<ChatResult> {
  // 1. Convert LangChain messages to NVIDIA format
  const nvidiaMessages = this._convertMessages(messages);

  // 2. Prepare payload
  const payload = {
    model: this.model,
    messages: nvidiaMessages,
    max_tokens: this.maxTokens,
    temperature: this.temperature,
  };

  // 3. Call NVIDIA API
  const response = await fetch(this.invokeUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  // 4. Parse and return response
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  
  return {
    generations: [{ message: new AIMessage({ content }), text: content }],
  };
}
```

**What it does**:
1. Converts LangChain message format to NVIDIA API format
2. Makes HTTP request to NVIDIA API
3. Parses response and converts back to LangChain format
4. Handles errors and timeouts

**Why a wrapper?**
- LangChain expects a specific interface
- NVIDIA API has its own format
- The wrapper translates between them

---

#### 3.4 Tools (`src/tools.ts`)

**Purpose**: Allow AI to call Java backend APIs

```typescript
export const callJavaAPI = tool(
  async (input: unknown) => {
    // 1. Validate input
    const validatedInput = callJavaAPISchema.parse(input);
    
    // 2. Call Java backend
    const res = await fetch("http://localhost:8081/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: validatedInput.query }),
    });

    // 3. Return result
    const data = await res.json();
    return JSON.stringify(data);
  },
  {
    name: "call_java_api",
    description: "Queries the Java backend REST API for data or to perform actions.",
    schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The user's query to send to the Java backend API",
        },
      },
      required: ["query"],
    },
  }
);
```

**What it does**:
1. Defines a tool the AI can use
2. When AI decides it needs backend data, it calls this tool
3. Tool makes HTTP request to Java backend
4. Returns data to AI for processing

**How AI uses tools**:
- AI analyzes user message
- If it needs data (e.g., "get user profile"), it calls `callJavaAPI`
- Tool executes and returns data
- AI uses that data to form final response

**Example Flow**:
```
User: "What's my account balance?"
  ↓
AI: "I need to check the backend" → calls callJavaAPI("get account balance")
  ↓
Tool: Calls Java API → Returns balance: $1,234
  ↓
AI: "Your account balance is $1,234"
```

---

## 🔄 Message Flow

### Complete Flow Example

**User types: "Hello, what can you do?"**

1. **Frontend** (`chat-widget.tsx`)
   ```typescript
   socket.current.emit("sendMessage", "Hello, what can you do?");
   ```

2. **Socket.io Server** (`socket-io-server/src/index.ts`)
   ```typescript
   // Receives message
   socket.on("sendMessage", async (text) => {
     // Emit user message immediately
     socket.emit("newMessage", userMessage);
     
     // Call langchain service
     const aiResponse = await getAIResponse(text);
     
     // Emit AI response
     socket.emit("newMessage", aiMessage);
   });
   ```

3. **LangChain Service** (`langchain-service/src/server.ts`)
   ```typescript
   // Receives HTTP POST
   app.post("/agent", async (req, res) => {
     const response = await handleUserInput(req.body.message);
     res.json({ response });
   });
   ```

4. **Agent** (`langchain-service/src/agent.ts`)
   ```typescript
   // Creates agent and processes message
   const agent = createAgent({ model, tools: [callJavaAPI] });
   const response = await agent.invoke({ messages: [...] });
   ```

5. **NVIDIA Model** (`langchain-service/src/models/nvidia-chat.ts`)
   ```typescript
   // Calls NVIDIA API
   const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
     method: "POST",
     body: JSON.stringify({ model, messages, ... }),
   });
   ```

6. **Response flows back**:
   - NVIDIA API → NVIDIA Model → Agent → Server → Socket.io → Frontend

7. **Frontend displays**:
   ```typescript
   // Receives newMessage event
   socketInstance.on("newMessage", (msg) => {
     setMessages((prev) => [...prev, msg]);
   });
   ```

**Total time**: ~1-3 seconds depending on AI response time

---

## 🚀 Setup & Running

### Prerequisites
- Node.js 18+
- Yarn or npm
- NVIDIA API key (for AI model)
- Java backend running (optional, for tool usage)

### Step 1: Install Dependencies

```bash
# Frontend
yarn install

# LangChain Service
cd langchain-service
yarn install

# Socket.io Server
cd ../socket-io-server
yarn install
```

### Step 2: Environment Variables

**langchain-service/.env**:
```env
NVIDIA_API_KEY=your_nvidia_api_key_here
```

**socket-io-server/.env** (optional):
```env
LANGCHAIN_SERVICE_URL=http://localhost:3001
```

### Step 3: Start Services

**Terminal 1 - LangChain Service**:
```bash
cd langchain-service
yarn dev
# Should see: "LangChain service running on http://localhost:3001"
```

**Terminal 2 - Socket.io Server**:
```bash
cd socket-io-server
yarn dev
# Should see: "Socket.IO server running on http://localhost:4000"
```

**Terminal 3 - Frontend**:
```bash
yarn dev
# Should see: "Local: http://localhost:8081"
```

### Step 4: Test

1. Open browser to `http://localhost:8081`
2. Click chat widget button
3. Type a message
4. See AI response appear!

---

## 🔧 How Each Component Works

### Frontend (React)

**State Management**:
```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [inputValue, setInputValue] = useState('');
```

**Socket Connection**:
```typescript
const socket = useSocket("http://localhost:4000");
// Returns a ref with socket.io client instance
```

**Message Handling**:
- User types → `handleSendMessage()` → `socket.emit("sendMessage", text)`
- Server responds → `socket.on("newMessage")` → `setMessages([...prev, msg])`

### Socket.io Server

**Connection Handling**:
```typescript
io.on("connection", (socket) => {
  // Each client gets a unique socket.id
  console.log("Client connected:", socket.id);
});
```

**Message Processing**:
1. Receives `sendMessage` event
2. Immediately echoes user message (for instant feedback)
3. Calls LangChain service asynchronously
4. Sends AI response when ready

**Why async?**
- AI processing takes time (1-3 seconds)
- We don't want to block the socket connection
- User sees their message immediately, then AI response later

### LangChain Agent

**What is an Agent?**
An agent is an AI system that can:
- Understand natural language
- Decide when to use tools
- Process information
- Generate responses

**Agent Decision Process**:
```
User: "Get my account balance"
  ↓
Agent thinks: "This requires backend data"
  ↓
Agent calls: callJavaAPI("get account balance")
  ↓
Tool returns: { balance: 1234 }
  ↓
Agent formats: "Your account balance is $1,234"
```

**Without tools**: Agent can only use its training data
**With tools**: Agent can access live data from your backend

### Tools System

**Tool Definition**:
```typescript
tool(
  async (input) => { /* tool implementation */ },
  {
    name: "tool_name",
    description: "What the tool does - AI reads this!",
    schema: { /* input validation */ }
  }
)
```

**Important**: The `description` is crucial! The AI reads this to decide when to use the tool.

**Example**:
```typescript
description: "Queries the Java backend REST API for data or to perform actions."
```
When user asks about data, AI sees this description and knows to use the tool.

---

## 🎓 Extending the System

### Adding a New Tool

**Step 1**: Create tool in `langchain-service/src/tools.ts`

```typescript
export const getWeather = tool(
  async (input: unknown) => {
    const { location } = weatherSchema.parse(input);
    const res = await fetch(`https://api.weather.com/${location}`);
    const data = await res.json();
    return JSON.stringify(data);
  },
  {
    name: "get_weather",
    description: "Gets current weather for a location",
    schema: {
      type: "object",
      properties: {
        location: { type: "string" }
      },
      required: ["location"]
    }
  }
);
```

**Step 2**: Register tool in `agent.ts`

```typescript
const agent = createAgent({
  model,
  tools: [callJavaAPI, getWeather], // Add new tool
});
```

**Step 3**: AI will automatically use it when relevant!

### Connecting to Java Backend

**Current Setup**:
- Tool already exists: `callJavaAPI`
- Calls: `http://localhost:8081/api/query`
- Sends: `{ query: "user's question" }`

**To customize**:

1. **Change endpoint** in `tools.ts`:
```typescript
const res = await fetch("http://localhost:8081/api/custom-endpoint", {
  // ...
});
```

2. **Change payload format**:
```typescript
body: JSON.stringify({
  action: "query",
  params: validatedInput.query,
  userId: "123" // Add context
}),
```

3. **Add authentication**:
```typescript
headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${process.env.JAVA_API_TOKEN}`
},
```

### Training the Model on Java Data

**Option 1: Fine-tuning** (Advanced)
- Export Java data to training format
- Fine-tune NVIDIA model with your data
- Deploy custom model

**Option 2: RAG (Retrieval Augmented Generation)** (Recommended)
- Store Java data in vector database
- When user asks question, retrieve relevant data
- Pass data to AI as context
- AI generates answer using your data

**Option 3: Tool-based** (Current approach)
- AI calls Java API when it needs data
- Java API returns current data
- AI uses data in response
- Always up-to-date!

---

## 🐛 Troubleshooting

### "Cannot connect to socket.io server"
- Check socket.io server is running on port 4000
- Check CORS settings in socket.io server
- Check browser console for errors

### "AI responses not appearing"
- Check langchain service is running on port 3001
- Check NVIDIA_API_KEY is set
- Check socket.io server logs for errors
- Check langchain service logs

### "Unbound breakpoint" in debugger
- Use "Attach to Server" method instead of Launch
- Set breakpoints only in synchronous code
- Use console.log() for async debugging

### "Fetch hangs when debugger attached"
- This is a known Node.js debugging limitation
- Use console.log() for network debugging
- Or set breakpoints before/after fetch, not during

### "Tool not being called"
- Check tool description is clear
- Check tool is registered in agent
- Check tool schema matches what AI sends
- Add console.log() in tool to see if it's called

---

## 📖 Key Concepts Summary

### WebSocket vs HTTP
- **HTTP**: Request → Response (one-way, stateless)
- **WebSocket**: Bidirectional, persistent connection
- **Why Socket.io**: Real-time chat needs bidirectional communication

### Agent vs Model
- **Model**: Just generates text (like ChatGPT)
- **Agent**: Model + Tools (can do actions, not just talk)

### Tools
- Functions AI can call
- Defined with name, description, schema
- AI decides when to use them based on description

### LangChain
- Framework for building AI applications
- Provides agent system, tool system, model wrappers
- Makes it easy to combine AI with external systems

---

## 🎯 Next Steps

1. **Add more tools**: Database queries, external APIs, etc.
2. **Improve UI**: Typing indicators, message status, etc.
3. **Add authentication**: User sessions, API keys
4. **Add RAG**: Vector database for better context
5. **Monitor**: Add logging, analytics, error tracking
6. **Scale**: Add load balancing, multiple instances

---

## 📚 Resources

- [LangChain Documentation](https://js.langchain.com/)
- [Socket.io Documentation](https://socket.io/docs/)
- [NVIDIA AI API](https://build.nvidia.com/)
- [React Hooks](https://react.dev/reference/react)

---

**Happy Coding! 🚀**

