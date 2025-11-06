function forceOldTheaterMode() {
  // Hide sidebar
  const related = document.querySelector(
    "#related, #secondary, ytd-watch-next-secondary-results-renderer"
  );
  if (related) {
    related.style.display = "none";
  }

  const primary = document.querySelector("#primary");
  if (primary) {
    primary.style.width = "100%";
    primary.style.maxWidth = "none";
  }

  applyOldTheaterModeStyles();
}

function applyOldTheaterModeStyles() {
  const existingStyle = document.getElementById("old-theater-styles");
  if (existingStyle) {
    existingStyle.remove();
  }

  // Inject CSS
  const style = document.createElement("style");
  style.id = "old-theater-styles";
  style.textContent = `
    /* Old theater mode styles - hide recommendations and make it like classic theater */

    /* Hide the related videos/recommendations that appear in new theater mode */
    ytd-watch-flexy[theater] #related,
    ytd-watch-flexy[theater] #secondary,
    ytd-watch-flexy[theater] ytd-watch-next-secondary-results-renderer {
      display: none !important;
    }

    /* Hide the comments section in theater mode */
    ytd-watch-flexy[theater] ytd-comments {
      display: none !important;
    }

    /* Make sure the primary content (video) takes full width */
    ytd-watch-flexy[theater] #primary {
      width: 100% !important;
      max-width: none !important;
    }

    /* Ensure the player container is properly sized */
    ytd-watch-flexy[theater] #player-container-inner {
      max-width: none !important;
      width: 100% !important;
    }

    /* Hide any overlay elements that might show recommendations */
    ytd-watch-flexy[theater] .ytp-endscreen-overlay,
    ytd-watch-flexy[theater] .ytp-overlay {
      display: none !important;
    }

    /* Prevent scrolling to show recommendations */
    ytd-watch-flexy[theater] #page-manager {
      overflow: hidden !important;
    }

    /* Ensure theater mode doesn't have the new overlay behavior */
    ytd-watch-flexy[theater] #player-theater-container {
      position: static !important;
      height: auto !important;
    }

    #player {
    background-color: rgb(10 10 10) !important;
    }

    /* Make the video player background black like old theater */
    ytd-watch-flexy[theater] .html5-video-container {
      background: #000 !important;
    }

    /* Hide any "related videos" overlays */
    .ytp-cards-overlay,
    .ytp-cards-teaser {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
  console.log("Applied old theater mode styles");
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);

  if (request.action === "ping") {
    sendResponse({ success: true });
  } else if (request.action === "toggleTheater") {
    const success = toggleTheaterMode();
    sendResponse({ success: success });
  } else if (request.action === "applyOldStyle") {
    forceOldTheaterMode();
    sendResponse({ success: true });
  } else if (request.action === "revertToDefault") {
    const existingStyle = document.getElementById("old-theater-styles");
    if (existingStyle) {
      existingStyle.remove();
    }
    // Reset the primary width back to default
    const primary = document.querySelector("#primary");
    if (primary) {
      primary.style.width = "";
      primary.style.maxWidth = "";
    }
    // Show the sidebar again
    const related = document.querySelector(
      "#related, #secondary, ytd-watch-next-secondary-results-renderer"
    );
    if (related) {
      related.style.display = "";
    }
    sendResponse({ success: true });
  } else {
    sendResponse({ success: false, error: "Unknown action" });
  }

  return true;
});
