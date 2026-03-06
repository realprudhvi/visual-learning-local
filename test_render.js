const texCode = `\\documentclass[preview,border=2mm]{standalone}\n\\usepackage{circuitikz}\n\\begin{document}\n\\begin{circuitikz}[american]\n\\draw (0,0) to[R] (2,0);\n\\end{circuitikz}\n\\end{document}`;

fetch('http://localhost:3000/api/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: texCode })
})
    .then(res => res.text().then(text => ({ status: res.status, text })))
    .then(({ status, text }) => {
        console.log("Status:", status);
        console.log("Response:", text.substring(0, 100) + "...");
    })
    .catch(console.error);
