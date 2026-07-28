const str = "copyToClipboard(`${p.title}\\${p.desc}\\${p.details || ''}`)";
try {
    new Function(str);
    console.log("Success");
} catch(e) {
    console.log("Error:", e);
}
