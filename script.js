document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const chatMessages = document.getElementById("chatMessages");
  const sendButton = document.getElementById("sendButton");

  // Auto resize input
  userInput.addEventListener("input", () => {
    userInput.style.height = "auto";
    userInput.style.height = userInput.scrollHeight + "px";
  });

  // Form submit
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    userInput.value = "";
    userInput.style.height = "auto";
    sendButton.disabled = true;

    const typingIndicator = showTypingIndicator();

    try {
      const response = await generateResponse(message);
      typingIndicator.remove();
      addMessage(response, false);
    } catch (error) {
      typingIndicator.remove();
      addErrorMessage(error.message);
    } finally {
      sendButton.disabled = false;
    }
  });

  // Generate response
  async function generateResponse(prompt) {
    const apiKey =" Enter Your Api key here";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are an intelligent assistant.

You can answer:
- General Knowledge (GK)
- Mathematics problems
- Logical reasoning
- Short definitions

Rules:
- Give short and accurate answers
- Maths → only final answer (no steps unless asked)
- GK → exact fact only
- Logic → direct result
- Max 10 lines

Question: ${prompt}
                  `,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate response");
    }

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI"
    );
  }

  // Add message 
  function addMessage(text, isUser) {
    const message = document.createElement("div");
    message.className = `message ${isUser ? "user-message" : ""}`;

    message.innerHTML = `
      <div class="avatar ${isUser ? "user-avatar" : ""}">
        ${isUser ? "U" : "AI"}
      </div>
      <div class="message-content">${text}</div>
    `;

    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Typing indicator 
  function showTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "message";

    indicator.innerHTML = `
      <div class="avatar">AI</div>
      <div class="typing-indicator">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    `;

    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return indicator;
  }

  // Error message
  function addErrorMessage(text) {
    const message = document.createElement("div");
    message.className = "message";

    message.innerHTML = `
      <div class="avatar">AI</div>
      <div class="message-content" style="color:red">
        Error: ${text}
      </div>
    `;

    chatMessages.appendChild(message);
  }
});