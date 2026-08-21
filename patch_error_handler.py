import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace handleFirestoreError with handleSupabaseError
content = content.replace('function handleFirestoreError(error, operationType, path)', 'function handleSupabaseError(error, operationType, path)')
content = content.replace('handleFirestoreError(', 'handleSupabaseError(')

# Change the console.error prefix
content = content.replace("console.error('Firestore Error: ', JSON.stringify(errInfo));", "console.error('Supabase Sync: ', JSON.stringify(errInfo));")

# Remove the throw new Error
content = re.sub(r'if \(isPermissionErr\) \{\s*throw new Error\(JSON\.stringify\(errInfo\)\);\s*\}', 'if (isPermissionErr) { /* ignore to prevent crash */ }', content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched error handler")
