
      (function() {
        const urlAppGstatic = "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js";
        const urlAppCloudflare = "https://cdnjs.cloudflare.com/ajax/libs/firebase/10.12.0/firebase-app-compat.min.js";
        const urlFirestoreGstatic = "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js";
        const urlFirestoreCloudflare = "https://cdnjs.cloudflare.com/ajax/libs/firebase/10.12.0/firebase-firestore-compat.min.js";

        function injectScript(primarySrc, fallbackSrc, callback) {
          const script = document.createElement('script');
          script.src = primarySrc;
          script.crossOrigin = "anonymous";
          
          script.onload = function() {
            console.log("[Firebase Sequence Loader] Loaded successfully: " + primarySrc);
            if (callback) callback();
          };
          
          script.onerror = function() {
            console.warn("[Firebase Sequence Loader] Failed to load primary: " + primarySrc + ". Trying fallback...");
            const fallbackScript = document.createElement('script');
            fallbackScript.src = fallbackSrc;
            fallbackScript.crossOrigin = "anonymous";
            fallbackScript.onload = function() {
              console.log("[Firebase Sequence Loader] Fallback loaded successfully: " + fallbackSrc);
              if (callback) callback();
            };
            fallbackScript.onerror = function() {
              console.error("[Firebase Sequence Loader] CRITICAL: Fallback also failed: " + fallbackSrc);
              if (callback) callback();
            };
            document.head.appendChild(fallbackScript);
          };
          
          document.head.appendChild(script);
        }

        // Start sequential script loading
        injectScript(urlAppGstatic, urlAppCloudflare, function() {
          injectScript(urlFirestoreGstatic, urlFirestoreCloudflare, function() {
            console.log("[Firebase Sequence Loader] All Firebase SDK scripts loaded synchronously in correct order!");
            if (typeof window.initializeFirebaseIfReady === 'function') {
              window.initializeFirebaseIfReady();
            }
          });
        });
      })();
    