if (typeof browser === "undefined") {
  var browser = chrome;
}

function forceOldTheaterMode() {
  if (document.getElementById("comments-secondary-wrapper")) {
    return;
  }

  const primary = document.querySelector("#primary");
  const secondary = document.querySelector("#secondary");
  const comments = document.querySelector("ytd-comments");

  // Add recommendations besides the comments
  if (primary && secondary && comments) {
    // Create a new wrapper div to beside yt-comments show recommendations
    const wrapper = document.createElement("div");
    wrapper.id = "comments-secondary-wrapper";
    wrapper.style.display = "grid";
    wrapper.style.gridTemplateColumns = "60% 40%";
    wrapper.style.gap = "16px";
    wrapper.style.marginTop = "16px";

    // Move comments and secondary into the new wrapper
    comments.parentNode.removeChild(comments);
    secondary.parentNode.removeChild(secondary);
    wrapper.appendChild(comments);
    wrapper.appendChild(secondary);
    primary.appendChild(wrapper);
  }

  if (primary) {
    primary.style.width = "100%";
    primary.style.maxWidth = "none";
  }

  applyOldTheaterModeStyles();
}

function toggleTheaterMode() {
  const theaterButton = document.querySelector(".ytp-size-button");
  if (theaterButton) {
    theaterButton.click();
    return true;
  }
  return false;
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
    ytd-watch-flexy[theater] ytd-watch-next-secondary-results-renderer {
      display: none !important;
    }

    /* Don't hide comments and secondary - they are now in a grid */
    /* ytd-watch-flexy[theater] ytd-comments {
      display: none !important;
    } */

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
    border-radius: 0 !important;
    }

    #ytd-player {
    border-radius: 0 !important;
    }

    /* Make the video player background black like old theater */
    ytd-watch-flexy[theater] .html5-video-container {
      background: #000 !important;
      border-radius: 0 !important;
    }

    /* Hide any "related videos" overlays */
    .ytp-cards-overlay,
    .ytp-cards-teaser {
      display: none !important;
    }

    /* Style the comments-secondary wrapper */
    #comments-secondary-wrapper {
      display: grid !important;
      grid-template-columns: 60% 40% !important;
      gap: 16px !important;
      margin-top: 16px !important;
    }
  `;
  document.head.appendChild(style);
  console.log("Applied old theater mode styles");
}

// Listen for messages from popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
    // Undo DOM changes
    const wrapper = document.getElementById("comments-secondary-wrapper");
    if (wrapper) {
      const comments = wrapper.querySelector("ytd-comments");
      const secondary = wrapper.querySelector("#secondary");
      if (comments) {
        primary.appendChild(comments);
      }
      if (secondary) {
        primary.parentNode.appendChild(secondary);
      }
      wrapper.remove();
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
