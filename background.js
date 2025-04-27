let API_KEY = null; // updated asynchronously

// fetch key ASAP
browser.storage.sync.get("openai_api_key").then(({ openai_api_key }) => {
  API_KEY = openai_api_key || null;
});

function ensureMenu() {
  try {
    browser.contextMenus.create({
      id: "milchick",
      title: "Too many big words",
      contexts: ["selection"]
    });
  } catch (e) {
    if (e?.message?.includes("ID conflict")) {
      console.debug("Menu already exists");
    } else {
      console.error("Context menu create failed", e);
    }
  }
}

ensureMenu();

browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.removeAll(ensureMenu);
});

browser.contextMenus.onClicked.addListener(handleClick);

async function handleClick(info, tab) {
  if (info.menuItemId !== "milchick" || !info.selectionText) return;

  // Ensure content script live in target tab
  try {
    await browser.tabs.sendMessage(tab.id, { type: "ping" });
  } catch {
    await browser.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
  }

  const key = API_KEY || (await browser.storage.sync.get("openai_api_key")).openai_api_key;
  if (!key) {
    await browser.tabs.sendMessage(tab.id, {
      type: "showExplanation",
      explanation: "✋ No OpenAI API key set. Add it in extension options."
    });
    return;
  }

  let explanation;
  try {
    explanation = await getExplanation(info.selectionText, key);
  } catch (e) {
    console.error("OpenAI request failed", e);
    explanation = `⛔ Error contacting OpenAI: ${e.message}`;
  }

  browser.tabs.sendMessage(tab.id, { type: "showExplanation", explanation });
}

async function getExplanation(text, key) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Explain this sentence in plain, simple language for non-experts. Keep it short and easy to understand, like you're talking to someone without a background in the subject: " },
        { role: "user", content: text }
      ],
      max_tokens: 300
    })
  });

  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "⚠️ Got unexpected API response..";
}