import globalState from "../state";

export const createMessagesContainer = () => {
  return `
    <div id="messages-container">
      <div>Messages</div>
      <ul id="messages-list"></ul>
    </div>
  `;
};

export const setupMessagesContainer = () => {
  const messagesListElement = document.getElementById("messages-list");

  const updateView = () => {
    const messages = globalState.getMessages();
    if (messagesListElement) {
      messagesListElement.style.maxHeight = "400px";
      messagesListElement.style.overflowY = "auto";
      if (messagesListElement) messagesListElement.innerHTML = "";
      messages.forEach((message) => {
        const dateString = message.jsDate.toLocaleTimeString();
        const liElement = document.createElement("li");
        liElement.style.whiteSpace = "pre-wrap";
        liElement.innerHTML = `${dateString}: ${message.message}`;
        liElement.style.color = message.color ?? "black";
        messagesListElement.appendChild(liElement);
      });
    }
  };
  globalState.subscribe("messagesContainer", () => {
    updateView();
  });
  updateView();
};
