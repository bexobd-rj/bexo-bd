with open('index.html', 'r') as f:
    lines = f.readlines()

for i in range(len(lines)):
    if 'copyToClipboard(`${p.title}${p.desc}${p.details || \'\'}`)' in lines[i]:
        # I need to escape the inner things so that they are literally backslash-dollar-brace in the HTML string!
        lines[i] = lines[i].replace(
            'copyToClipboard(`${p.title}${p.desc}${p.details || \'\'}`)',
            'copyToClipboard(`\\${p.title}\\n\\${p.desc}\\n\\${p.details || \'\'}`)'
        )

with open('index.html', 'w') as f:
    f.writelines(lines)
