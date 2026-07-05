const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<iframe class="w-full h-full" src="https:\/\/www\.youtube\.com\/embed\/\$\{p\.videoUrl\}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen><\/iframe>/;

const replacement = `<iframe 
                                                class="w-full h-full" 
                                                width="560" 
                                                height="315" 
                                                src="https://www.youtube.com/embed/\${p.videoUrl}" 
                                                title="YouTube video player" 
                                                frameborder="0" 
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                                referrerpolicy="strict-origin-when-cross-origin" 
                                                allowfullscreen>
                                              </iframe>`;

html = html.replace(regex, replacement);
fs.writeFileSync('index.html', html);
