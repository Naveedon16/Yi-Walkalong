with open('apps-script/Code.js', 'r') as f:
    content = f.read()

content = content.replace("if (sheetEmail === email && sheetHash === hash) {", "if (sheetEmail === email && sheetHash.toLowerCase() === hash.toLowerCase()) {")

with open('apps-script/Code.js', 'w') as f:
    f.write(content)
