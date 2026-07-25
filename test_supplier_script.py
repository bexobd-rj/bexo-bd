with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's check where renderAdminAppSettings is defined and add our supplier code near it
idx = content.find('function renderAdminAppSettings(')
print(f"Found renderAdminAppSettings at index: {idx}")
