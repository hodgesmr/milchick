const input = document.getElementById("apiKey");

browser.storage.sync.get("openai_api_key").then(({ openai_api_key }) => {
  if (openai_api_key) input.value = openai_api_key;
});

input.addEventListener("input", () => {
  browser.storage.sync.set({ openai_api_key: input.value.trim() });
});