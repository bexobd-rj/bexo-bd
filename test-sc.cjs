const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const html = `
<!DOCTYPE html>
<html>
<head>
  <script type="module">
    setTimeout(() => {
      if (typeof userProfile !== 'undefined') {
          userProfile = "Changed by module!";
          console.log("Module:", userProfile);
      }
    }, 100);
  </script>
</head>
<body>
  <script>
    let userProfile = "Initial";
    setTimeout(() => {
        console.log("Normal:", userProfile);
    }, 200);
  </script>
</body>
</html>
`;
const dom = new JSDOM(html, { runScripts: "dangerously" });
