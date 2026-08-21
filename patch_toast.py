import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r'function showToast\(msg, type = \'success\'\) \{\s*const toast = document\.createElement\(\'div\'\);\s*toast\.className = `fixed bottom-8 left-1/2 -translate-x-1/2 z-\[100000\] px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl animate-bounce-in flex items-center gap-3 \$\{type === \'success\' \? \'bg-slate-900 text-white\' : \'bg-rose-600 text-white\'\}`;\s*toast\.innerHTML = `\s*<i class="fas \$\{type === \'success\' \? \'fa-check-circle text-orange-500\' : \'fa-exclamation-circle text-white\'\}"></i>\s*\$\{msg\}\s*`;\s*document\.body\.appendChild\(toast\);\s*setTimeout\(\(\) => \{\s*toast\.classList\.add\(\'animate-fade-out\'\);\s*setTimeout\(\(\) => toast\.remove\(\), 500\);\s*\}, 3000\);\s*\}',
    r'''function showToast(msg, type = 'success', duration = 3000) {
                  const toast = document.createElement('div');
                  toast.className = `fixed bottom-8 left-1/2 -translate-x-1/2 z-[100000] px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-2xl animate-bounce-in flex items-center gap-3 ${type === 'success' ? 'bg-slate-900 text-white' : 'bg-rose-600 text-white'}`;
                  toast.innerHTML = `
                      <i class="fas ${type === 'success' ? 'fa-check-circle text-orange-500' : 'fa-exclamation-circle text-white'}"></i>
                      ${msg}
                  `;
                  document.body.appendChild(toast);
                  setTimeout(() => {
                      toast.classList.add('animate-fade-out');
                      setTimeout(() => toast.remove(), 500);
                  }, duration);
              }''',
    content
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched toast")
