const fs = require('fs');
let code = fs.readFileSync('src/lib/utils.ts', 'utf8');

code = code.replace(/const handlePopState = \(e: PopStateEvent\) => \{\s*onCloseRef\.current\(\);\s*\};/g, 
`const handlePopState = (e: PopStateEvent) => {
      // Only close if we are actually popping this specific modal's state.
      // Wait, if the user presses back, the current state will be the PREVIOUS state, not stateId.
      // So if the current state is NOT stateId, it means our state was popped!
      // But wait, if another modal was pushed ON TOP of us, and then popped, the state might now be stateId again!
      // But we shouldn't close.
      // Actually, if popstate fires, and the new state is NOT our stateId, it means we went back past our state.
      // But if there are multiple modals, e.state might be the state underneath us.
      
      // Let's just unconditionally call onClose? NO! That caused the bug!
      // If history.back() is called manually by a child modal, it pops back to OUR stateId.
      // So if e.state?.modalId === stateId, it means the user went back to OUR modal! We should NOT close!
      if (e.state?.modalId !== stateId) {
          onCloseRef.current();
      }
    };`);

fs.writeFileSync('src/lib/utils.ts', code);
console.log("Fixed utils.ts");
