browser.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "ping") {
    sendResponse("pong");
    return;
  }
  if (msg.type === "showExplanation") {
    showModal(`Basically this says: ${msg.explanation}`);
  }
});

function showModal(text) {
  let modal = document.getElementById("milchick-modal");
  let content;
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "milchick-modal";
    Object.assign(modal.style, {
      position: "fixed",
      top: "20%",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#fff",
      color: "#000",
      padding: "16px",
      maxWidth: "420px",
      border: "1px solid #333",
      boxShadow: "0 4px 10px rgba(0,0,0,.4)",
      zIndex: 99999,
      fontFamily: "sans-serif",
      borderRadius: "8px",
      display: "flex",
      alignItems: "flex-start",
      gap: "8px"
    });

    // icon
    const icon = document.createElement("img");
    icon.src = browser.runtime.getURL("waffle-party.png");
    Object.assign(icon.style, { width: "24px", height: "24px" });
    modal.appendChild(icon);

    // close button
    const close = document.createElement("button");
    close.textContent = "✕";
    Object.assign(close.style, {
      position: "absolute",
      top: "4px",
      right: "6px",
      border: "none",
      background: "none",
      fontSize: "16px",
      cursor: "pointer"
    });
    close.onclick = () => modal.remove();
    modal.appendChild(close);

    // content area
    content = document.createElement("pre");
    content.id = "milchick-content";
    content.style.whiteSpace = "pre-wrap";
    content.style.margin = "0";
    content.style.flex = "1";
    modal.appendChild(content);

    document.body.appendChild(modal);
  } else {
    content = document.getElementById("milchick-content");
  }
  content.textContent = text;
}