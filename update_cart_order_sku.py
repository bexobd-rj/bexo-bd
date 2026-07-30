with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Update addToCart to pass p.sku in newItem
old_cart_newitem = """                      productId: p.id,
                      title: p.title,
                      image: img,
                      size: variantString || 'N/A', 
                      selectedVariants: selectedVariants,
                      qty: qty,
                      sellingPrice: sellingPrice,
                      basePrice: parseInt(p.price)
                  };"""

new_cart_newitem = """                      productId: p.id,
                      productTitle: p.title,
                      title: p.title,
                      sku: p.sku || '',
                      image: img,
                      size: variantString || 'N/A', 
                      selectedVariants: selectedVariants,
                      qty: qty,
                      sellingPrice: sellingPrice,
                      basePrice: parseInt(p.price)
                  };"""

if old_cart_newitem in content:
    content = content.replace(old_cart_newitem, new_cart_newitem, 1)
    print("Updated addToCart with sku & productTitle.")

# Update confirmOrderSubmit
old_confirm_submit_items = """                      items: [{
                          productId: currentProduct.id,
                          title: currentProduct.title,
                          image: currentProduct.img,
                          size: currentProduct.size,
                          qty: currentProduct.qty || 1,
                          sellingPrice: currentProduct.sellingPrice,
                          basePrice: currentProduct.base
                      }],"""

new_confirm_submit_items = """                      items: [{
                          productId: currentProduct.id,
                          productTitle: currentProduct.title,
                          title: currentProduct.title,
                          sku: currentProduct.sku || (typeof appPosts !== 'undefined' ? (appPosts.find(p => String(p.id) === String(currentProduct.id))?.sku || '') : ''),
                          image: currentProduct.img,
                          size: currentProduct.size,
                          qty: currentProduct.qty || 1,
                          sellingPrice: currentProduct.sellingPrice,
                          basePrice: currentProduct.base
                      }],"""

if old_confirm_submit_items in content:
    content = content.replace(old_confirm_submit_items, new_confirm_submit_items, 1)
    print("Updated confirmOrderSubmit with sku & productTitle.")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

