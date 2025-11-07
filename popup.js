if (typeof browser === "undefined") {
  var browser = chrome;
}

document.addEventListener("DOMContentLoaded", function () {
  const toggleOldStyleBtn = document.getElementById("toggleOldStyle");
  const reloaderBtn = document.getElementById("reloader");
  const statusDiv = document.getElementById("status");
  const defaultSettingCheckbox = document.getElementById("defaultSetting");

  // Load default setting
  browser.storage.local.get(["oldTheaterModeDefault"], (result) => {
    defaultSettingCheckbox.checked = result.oldTheaterModeDefault || false;
  });

  // Save default setting when changed
  defaultSettingCheckbox.addEventListener("change", () => {
    browser.storage.local.set({
      oldTheaterModeDefault: defaultSettingCheckbox.checked,
    });
    statusDiv.textContent = defaultSettingCheckbox.checked
      ? "Default enabled"
      : "Default disabled";
    setTimeout(() => {
      statusDiv.textContent = "Ready";
    }, 2000);
  });

  toggleOldStyleBtn.addEventListener("click", async () => {
    try {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab.url && tab.url.includes("youtube.com/watch")) {
        try {
          await browser.tabs.sendMessage(tab.id, { action: "ping" });
        } catch (e) {
          statusDiv.textContent =
            "Extension not loaded on this page. Please refresh and try again.";
          return;
        }

        const response = await browser.tabs.sendMessage(tab.id, {
          action: "applyOldStyle",
        });
        statusDiv.textContent = response.success
          ? "Old theater style applied!"
          : "Failed to apply old style";
      } else {
        statusDiv.textContent = "Please navigate to a YouTube video page";
      }
    } catch (error) {
      if (error.message.includes("Receiving end does not exist")) {
        statusDiv.textContent =
          "Extension not loaded. Please refresh the YouTube page.";
      } else {
        statusDiv.textContent = "Error: " + error.message;
      }
    }
  });

  reloaderBtn.addEventListener("click", async () => {
    try {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab.url && tab.url.includes("youtube.com/watch")) {
        try {
          await browser.tabs.sendMessage(tab.id, { action: "ping" });
        } catch (e) {
          statusDiv.textContent =
            "Extension not loaded on this page. Please refresh and try again.";
          return;
        }

        const response = await browser.tabs.sendMessage(tab.id, {
          action: "revertToDefault",
        });
        statusDiv.textContent = response.success
          ? "Reverted to default YouTube layout!"
          : "Failed to revert";
      } else {
        statusDiv.textContent = "Please navigate to a YouTube video page";
      }
    } catch (error) {
      if (error.message.includes("Receiving end does not exist")) {
        statusDiv.textContent =
          "Extension not loaded. Please refresh the YouTube page.";
      } else {
        statusDiv.textContent = "Error: " + error.message;
      }
    }
  });

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    if (!currentTab.url || !currentTab.url.includes("youtube.com")) {
      statusDiv.textContent = "Navigate to YouTube to use this extension";
      toggleOldStyleBtn.disabled = true;
      reloaderBtn.disabled = true;
    }
  });
});
