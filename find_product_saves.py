with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print("--- Product save / create matches ---")
for i, line in enumerate(lines):
    if any(k in line for k in ['appPosts.unshift', 'bexo_posts', 'createPostFromAdmin']):
        print(f"Line {i+1}: {line.strip()[:140]}")
