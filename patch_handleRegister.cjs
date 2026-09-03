const fs = require('fs');
let code = fs.readFileSync('public/app.js', 'utf8');

const target = `            // 3. Update bexo_users explicitly since trigger only fires on INSERT
            await sb.from('bexo_users').update({
                fullName: name,
                shopName: shop,
                phone: phone,
                address: addr,
                referredBy: referredBy
            }).eq('id', authUser.id);`;

const replacement = `            // 3. Upsert bexo_users explicitly to handle both new and existing users
            const { error: upsertErr } = await sb.from('bexo_users').upsert({
                id: authUser.id,
                profileId: profileUid,
                email: email,
                fullName: name,
                shopName: shop,
                phone: phone,
                address: addr,
                referredBy: referredBy,
                role: (email === 'bexobd@gmail.com') ? 'admin' : 'user'
            }, { onConflict: 'id' });
            if (upsertErr) console.warn("Upsert error in register:", upsertErr);`;

code = code.replace(target, replacement);

fs.writeFileSync('public/app.js', code);
