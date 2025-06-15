module.exports = {
  // Template untuk VMESS
  vmess: (data) => `
<b>━━━━━━ 𝙑𝙈𝙀𝙎𝙎 𝙋𝙍𝙀𝙈𝙄𝙐𝙈 ━━━━━</b>
<b>👤 𝙐𝙨𝙚𝙧 𝘿𝙚𝙩𝙖𝙞𝙡𝙨</b>
┣ <b>Username</b>   : <code>${data.username}</code>
┣ <b>UUID</b>       : <code>${data.uuid}</code>
┣ <b>Quota</b>      : <code>${data.quota_gb || '-'} GB</code>
┣ <b>Status</b>     : <code>Aktif ${data.days || '-'} hari</code>
┣ <b>Dibuat</b>     : <code>${data.created || '-'}</code>
┗ <b>Expired</b>    : <code>${data.expired || '-'}</code>
<b>🌎 𝙎𝙚𝙧𝙫𝙚𝙧 𝙄𝙣𝙛𝙤</b>
┣ <b>Domain</b>     : <code>${data.domain}</code>
┣ <b>IP</b>         : <code>${data.ip || '-'}</code>
┣ <b>Location</b>   : <code>${data.location || 'Saya Gatau'}</code>
┗ <b>ISP</b>        : <code>${data.isp || 'Saya Gatau'}</code>
<b>🔗 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙞𝙤𝙣</b>
┣ <b>TLS Port</b>        : <code>400-900</code>
┣ <b>Non-TLS Port</b>    : <code>80, 8080, 8081-9999</code>
┣ <b>Network</b>         : <code>ws, grpc</code>
┣ <b>Path</b>            : <code>/vmess</code>
┣ <b>gRPC Service</b>    : <code>vmess-grpc</code>
┣ <b>Security</b>        : <code>auto</code>
┗ <b>alterId</b>         : <code>0</code>
<b>━━━━━ 𝙑𝙈𝙀𝙎𝙎 𝙋𝙧𝙚𝙢𝙞𝙪𝙢 𝙇𝙞𝙣𝙠𝙨 ━━━━━</b>
<b>📍 𝙒𝙎 𝙏𝙇𝙎</b>
<pre>${data.ws_tls || '-'}</pre>
<b>📍 𝙒𝙎 𝙉𝙤𝙣-𝙏𝙇𝙎</b>
<pre>${data.ws_ntls || '-'}</pre>
<b>📍 𝙜𝙍𝙋𝘾</b>
<pre>${data.grpc || '-'}</pre>
<b>📥 𝘾𝙤𝙣𝙛𝙞𝙜 𝙁𝙞𝙡𝙚 (Clash/OpenClash):</b>
✎ https://${data.domain}:81/vmess-${data.username}.txt
<b>✨ 𝙏𝙤𝙤𝙡𝙨 & 𝙍𝙚𝙨𝙤𝙪𝙧𝙘𝙚𝙨</b>
┣ https://vpntech.my.id/converteryaml
┗ https://vpntech.my.id/auto-configuration
<b>❓ 𝘽𝙪𝙩𝙪𝙝 𝘽𝙖𝙣𝙩𝙪𝙖𝙣?</b>
✎ https://wa.me/6285727035336
<b>━━━━━━━━━ 𝙏𝙝𝙖𝙣𝙠 𝙔𝙤𝙪 ━━━━━━━━</b>
`,

  // Template untuk VLESS
  vless: (data) => `
<b>━━━━━━ 𝙑𝙇𝙀𝙎𝙎 𝙋𝙍𝙀𝙈𝙄𝙐𝙈 ━━━━━━</b>
<b>👤 𝙐𝙨𝙚𝙧 𝘿𝙚𝙩𝙖𝙞𝙡𝙨</b>
┣ <b>Username</b>   : <code>${data.username}</code>
┣ <b>UUID</b>       : <code>${data.uuid}</code>
┣ <b>Quota</b>      : <code>${data.quota_gb || '-'} GB</code>
┣ <b>Status</b>     : <code>Aktif ${data.days || '-'} hari</code>
┣ <b>Dibuat</b>     : <code>${data.created || '-'}</code>
┗ <b>Expired</b>    : <code>${data.expired || '-'}</code>
<b>🌎 𝙎𝙚𝙧𝙫𝙚𝙧 𝙄𝙣𝙛𝙤</b>
┣ <b>Domain</b>     : <code>${data.domain}</code>
┣ <b>IP</b>         : <code>${data.ip || '-'}</code>
┣ <b>Location</b>   : <code>${data.location || 'Saya Gatau'}</code>
┗ <b>ISP</b>        : <code>${data.isp || 'Saya Gatau'}</code>
<b>🔗 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙞𝙤𝙣</b>
┣ <b>TLS Port</b>        : <code>400-900</code>
┣ <b>Non-TLS Port</b>    : <code>80, 8080, 8081-9999</code>
┣ <b>Network</b>         : <code>ws, grpc</code>
┣ <b>Path</b>            : <code>/vless</code>
┣ <b>gRPC Service</b>    : <code>vless-grpc</code>
┗ <b>Encryption</b>      : <code>none</code>
<b>━━━━━ 𝙑𝙇𝙀𝙎𝙎 𝙋𝙧𝙚𝙢𝙞𝙪𝙢 𝙇𝙞𝙣𝙠𝙨 ━━━━━</b>
<b>📍 𝙒𝙎 𝙏𝙇𝙎</b>
<pre>${data.ws_tls || '-'}</pre>
<b>📍 𝙒𝙎 𝙉𝙤𝙣-𝙏𝙇𝙎</b>
<pre>${data.ws_ntls || '-'}</pre>
<b>📍 𝙜𝙍𝙋𝘾</b>
<pre>${data.grpc || '-'}</pre>
<b>📥 𝘾𝙤𝙣𝙛𝙞𝙜 𝙁𝙞𝙡𝙚 (Clash/OpenClash):</b>
✎ https://${data.domain}:81/vless-${data.username}.txt
<b>✨ 𝙏𝙤𝙤𝙡𝙨 & 𝙍𝙚𝙨𝙤𝙪𝙧𝙘𝙚𝙨</b>
┣ https://vpntech.my.id/converteryaml
┗ https://vpntech.my.id/auto-configuration
<b>❓ 𝘽𝙪𝙩𝙪𝙝 𝘽𝙖𝙣𝙩𝙪𝙖𝙣?</b>
✎ https://wa.me/6285727035336
<b>━━━━━━━━━ 𝙏𝙝𝙖𝙣𝙠 𝙔𝙤𝙪 ━━━━━━━━</b>
`,

  // Template untuk Trojan
  trojan: (data) => `
<b>━━━ 𝙄𝙉𝙄 𝘿𝙀𝙏𝘼𝙄𝙇 𝘼𝙆𝙐𝙉 𝙏𝙍𝙊𝙅𝘼𝙉 ━━━</b>
<b>👤 𝙐𝙨𝙚𝙧 𝘿𝙚𝙩𝙖𝙞𝙡𝙨</b>
┣ <b>Username</b>   : <code>${data.username}</code>
┣ <b>Uuid</b>       : <code>${data.uuid || '-'}</code>
┣ <b>Quota</b>      : <code>${data.quota_gb || '-'} GB</code>
┣ <b>Status</b>     : <code>Aktif ${data.days || '-'} hari</code>
┣ <b>Dibuat</b>     : <code>${data.created || '-'}</code>
┗ <b>Expired</b>    : <code>${data.expired || '-'}</code>
<b>🌎 𝙎𝙚𝙧𝙫𝙚𝙧 𝙄𝙣𝙛𝙤</b>
┣ <b>Domain</b>     : <code>${data.domain}</code>
┣ <b>IP</b>         : <code>${data.ip || '-'}</code>
┣ <b>Location</b>   : <code>${data.location || 'Saya Gatau'}</code>
┗ <b>ISP</b>        : <code>${data.isp || 'Saya Gatau'}</code>
<b>🔗 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙞𝙤𝙣</b>
┣ <b>TLS Port</b>        : <code>400-900</code>
┣ <b>Network</b>         : <code>ws, grpc</code>
┣ <b>Path</b>            : <code>/trojan-ws</code>
┗ <b>gRPC Service</b>    : <code>trojan-grpc</code>
<b>━━━━━ 𝙏𝙍𝙊𝙅𝘼𝙉 𝙋𝙧𝙚𝙢𝙞𝙪𝙢 𝙇𝙞𝙣𝙠𝙨 ━━━━━</b>
<b>📍 𝙒𝙎 𝙏𝙇𝙎</b>
<pre>${data.ws_tls || '-'}</pre>
<b>📍 𝙜𝙍𝙋𝘾</b>
<pre>${data.grpc || '-'}</pre>
<b>📥 𝘾𝙤𝙣𝙛𝙞𝙜 𝙁𝙞𝙡𝙚 (Clash/OpenClash):</b>
✎ https://${data.domain}:81/trojan-${data.username}.txt
<b>✨ 𝙏𝙤𝙤𝙡𝙨 & 𝙍𝙚𝙨𝙤𝙪𝙧𝙘𝙚𝙨</b>
┣ https://vpntech.my.id/converteryaml
┗ https://vpntech.my.id/auto-configuration
<b>❓ 𝘽𝙪𝙩𝙪𝙝 𝘽𝙖𝙣𝙩𝙪𝙖𝙣?</b>
✎ https://wa.me/6285727035336
<b>━━━━━━━━━ 𝙏𝙝𝙖𝙣𝙠 𝙔𝙤𝙪 ━━━━━━━━</b>
`,

  // Template untuk SSH
  ssh: (data) => `
<b>━━━━━ 𝙎𝙎𝙃/𝙊𝙑𝙋𝙉 𝙋𝙍𝙀𝙈𝙄𝙐𝙈 ━━━━━</b>
<b>👤 𝙐𝙨𝙚𝙧 𝘿𝙚𝙩𝙖𝙞𝙡𝙨</b>
┣ <b>Username</b>   : <code>${data.username}</code>
┣ <b>Password</b>   : <code>${data.password}</code>
┣ <b>Login</b>      : <code>${data.domain}:80@${data.username}:${data.password}</code>
┣ <b>Quota</b>      : <code>${data.quota_gb || '-'} GB</code>
┣ <b>Status</b>     : <code>Aktif ${data.days || '-'} hari</code>
┣ <b>Dibuat</b>     : <code>${data.created || '-'}</code>
┗ <b>Expired</b>    : <code>${data.expired || '-'}</code>
<b>🌎 𝙎𝙚𝙧𝙫𝙚𝙧 𝙄𝙣𝙛𝙤</b>
┣ <b>Domain</b>     : <code>${data.domain}</code>
┣ <b>IP</b>         : <code>${data.ip || '-'}</code>
┣ <b>Location</b>   : <code>${data.location || 'Saya Gatau'}</code>
┗ <b>ISP</b>        : <code>${data.isp || 'Saya Gatau'}</code>
<b>🔌 𝘾𝙤𝙣𝙣𝙚𝙘𝙩𝙞𝙤𝙣</b>
┣ <b>Port OpenSSH</b>     : <code>443, 80, 22</code>
┣ <b>Port Dropbear</b>    : <code>443, 109</code>
┣ <b>Port SSH WS</b>      : <code>80,8080,8081-9999</code>
┣ <b>Port SSH SSL WS</b>  : <code>443</code>
┣ <b>Port SSH UDP</b>     : <code>1-65535</code>
┣ <b>Port SSL/TLS</b>     : <code>400-900</code>
┣ <b>Port OVPN WS SSL</b> : <code>443</code>
┣ <b>Port OVPN TCP</b>    : <code>1194</code>
┣ <b>Port OVPN UDP</b>    : <code>2200</code>
┗ <b>BadVPN UDP</b>       : <code>7100,7300,7300</code>
<b>⚡ 𝙥𝙖𝙮𝙡𝙤𝙖𝙙 𝙒𝙎</b>
<code>GET / HTTP/1.1[crlf]Host: [host][crlf]Connection: Upgrade[crlf]User-Agent: [ua][crlf]Upgrade: websocket[crlf][crlf]</code>
<b>⚡ 𝙋𝙖𝙮𝙡𝙤𝙖𝙙 𝙒𝙎𝙎</b>
<code>GET wss://BUG.COM/ HTTP/1.1[crlf]Host: ${data.domain}[crlf]Upgrade: websocket[crlf][crlf]</code>
<b>📥 𝙊𝙑𝙋𝙉 𝘿𝙤𝙬𝙣𝙡𝙤𝙖𝙙</b>
✎ https://${data.domain}:81/
<b>📝 𝙎𝙖𝙫𝙚 𝙇𝙞𝙣𝙠 𝘼𝙠𝙪𝙣</b>
✎ https://${data.domain}:81/ssh-${data.username}.txt
<b>❓ 𝘽𝙪𝙩𝙪𝙝 𝘽𝙖𝙣𝙩𝙪𝙖𝙣?</b>
✎ https://wa.me/6285727035336
<b>━━━━━━━━━ 𝙏𝙝𝙖𝙣𝙠 𝙔𝙤𝙪 ━━━━━━━━</b>
`,
  renew: (jenis, username, exp) => `<b>✅ Akun ${jenis.toUpperCase()} <code>${username}</code> berhasil diperpanjang sampai <code>${exp}</code></b>`,
  delete: (jenis, username) => `<b>✅ Akun ${jenis.toUpperCase()} <code>${username}</code> berhasil dihapus!</b>`,
  saldo: (jumlah) => `<b>Saldo Anda:</b> <code>Rp${jumlah}</code>`,
  orderfail: (alasan) => `<b>❌ Gagal memproses pesanan:</b> <i>${alasan}</i>`,
  error: (msg) => `<b>❌ Error:</b> <i>${msg}</i>`,
  adminonly: () => `<b>⚠️ Fitur ini hanya untuk admin/owner!</b>`,

  // ==== TEMPLATE ADMIN ====
  admin_page: (menuTitle = 'Admin Menu', desc = '') => `
<b>⚙️ ${menuTitle}</b>
${desc ? desc + '\n' : ''}
Silakan pilih menu admin di bawah ini.
`,

  admin_katalog_page: (desc = '') => `
<b>📋 Admin Katalog</b>
${desc ? desc + '\n' : ''}
Pilih katalog untuk edit atau hapus.
`,

  admin_user_page: (desc = '') => `
<b>👤 Admin User/Role</b>
${desc ? desc + '\n' : ''}
Kelola user atau role di bawah ini.
`,

  admin_server_page: (desc = '') => `
<b>🖥️ Admin Server</b>
${desc ? desc + '\n' : ''}
Kelola daftar server VPN di sini.
`
};

