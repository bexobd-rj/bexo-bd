
      window.runVisualSearchAI = async (base64) => {
        try {
          const response = await fetch('/api/visual-search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64 }),
          });
          
          if (!response.ok) throw new Error('Search failed');
          
          const data = await response.json();
          return data.keywords;
        } catch (err) {
          console.error("AI Search Error:", err);
          return null;
        }
      };

      window.sortByNewestFirst = function(arr) {
        if (!Array.isArray(arr)) return [];
        return arr.slice().sort((a, b) => {
          // 1. Check timestamp
          const tA = Number(a.timestamp) || 0;
          const tB = Number(b.timestamp) || 0;
          if (tA && tB && tA !== tB) {
            return tB - tA;
          }

          // 2. Fallback to parsing dates/times
          const dateStrA = a.time || a.date || '';
          const dateStrB = b.time || b.date || '';
          if (dateStrA && dateStrB && dateStrA !== dateStrB) {
            let parsedA = Date.parse(dateStrA);
            let parsedB = Date.parse(dateStrB);

            if (isNaN(parsedA) && typeof dateStrA === 'string') {
              const match = dateStrA.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
              if (match) {
                const day = parseInt(match[1]);
                const month = parseInt(match[2]) - 1;
                const year = parseInt(match[3]);
                let hour = 0, min = 0, sec = 0;
                const timeMatch = dateStrA.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})/);
                if (timeMatch) {
                  hour = parseInt(timeMatch[1]);
                  min = parseInt(timeMatch[2]);
                  sec = parseInt(timeMatch[3]);
                }
                parsedA = new Date(year, month, day, hour, min, sec).getTime();
              }
            }
            if (isNaN(parsedB) && typeof dateStrB === 'string') {
              const match = dateStrB.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
              if (match) {
                const day = parseInt(match[1]);
                const month = parseInt(match[2]) - 1;
                const year = parseInt(match[3]);
                let hour = 0, min = 0, sec = 0;
                const timeMatch = dateStrB.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})/);
                if (timeMatch) {
                  hour = parseInt(timeMatch[1]);
                  min = parseInt(timeMatch[2]);
                  sec = parseInt(timeMatch[3]);
                }
                parsedB = new Date(year, month, day, hour, min, sec).getTime();
              }
            }

            if (!isNaN(parsedA) && !isNaN(parsedB) && parsedA !== parsedB) {
              return parsedB - parsedA;
            }
          }

          // 3. Fallback to sorting by string IDs containing numbers
          const idA = String(a.id || a.orderId || a.orderNo || '');
          const idB = String(b.id || b.orderId || b.orderNo || '');
          if (idA && idB) {
            const numA = parseFloat(idA.replace(/[^\d]/g, ''));
            const numB = parseFloat(idB.replace(/[^\d]/g, ''));
            if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
              return numB - numA;
            }
            return idB.localeCompare(idA);
          }

          return 0;
        });
      };
    