
      window.addEventListener('unhandledrejection', function(event) {
        if (event.reason) {
          const reasonStr = String(event.reason.message || event.reason);
          if (reasonStr.includes('WebSocket') || reasonStr.includes('websocket')) {
            console.debug("[Silenced Benign Error]", reasonStr);
            event.preventDefault();
            event.stopPropagation();
          }
        }
      });
      window.addEventListener('error', function(event) {
        if (event.message) {
          const msgStr = String(event.message);
          if (msgStr.includes('WebSocket') || msgStr.includes('websocket')) {
            console.debug("[Silenced Benign Error]", msgStr);
            event.preventDefault();
            event.stopPropagation();
          }
        }
      }, true);
    