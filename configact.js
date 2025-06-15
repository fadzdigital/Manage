// manage/configact.js
const { Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');
const PRESET_PATH = path.join(__dirname, '../data/configpresets.json');

// Helper
function loadPresets() {
  try {
    if (!fs.existsSync(PRESET_PATH)) return [];
    return JSON.parse(fs.readFileSync(PRESET_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function savePresets(data) {
  try {
    const dir = path.dirname(PRESET_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(PRESET_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving presets:', error);
    return false;
  }
}

// === MENU PROVIDER ===
async function showProviderAdminMenu(ctx, page = 1) {
  const all = loadPresets();
  const perPage = 5;
  const total = all.length;
  const totalPages = Math.ceil(total / perPage) || 1;
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  const items = all.slice((page - 1) * perPage, page * perPage);

  let text = `🔧 <b>Manajemen Provider Preset</b>\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `📊 Total provider: <b>${total}</b>\n`;
  text += `📄 Halaman <b>${page}</b> dari <b>${totalPages}</b>\n\n`;
  
  if (items.length === 0) {
    text += '📭 <i>Belum ada provider preset yang tersedia.</i>\n';
  } else {
    text += `📋 <b>Daftar Provider:</b>\n`;
    items.forEach((p, i) => {
      const no = (page - 1) * perPage + i + 1;
      text += `${no}. 🏢 <b>${p.provider}</b> - <i>${p.presets.length} preset</i>\n`;
    });
  }

  const buttons = [];
  const navRow = [];
  if (page > 1) navRow.push(Markup.button.callback('⬅️ Sebelumnya', `adm_cfgprov_page_${page-1}`));
  if (page < totalPages) navRow.push(Markup.button.callback('Selanjutnya ➡️', `adm_cfgprov_page_${page+1}`));
  if (navRow.length > 0) buttons.push(navRow);
  
  buttons.push([Markup.button.callback('➕ Tambah Provider Baru', 'adm_cfgprov_add')]);
  if (items.length > 0) buttons.push([Markup.button.callback('🛠️ Kelola Preset', 'adm_cfgprov_manage')]);
  buttons.push([Markup.button.callback('🏠 Kembali ke Menu Utama', 'admin_menu_0')]);

  await ctx.editMessageText(text, {
    parse_mode: 'HTML',
    reply_markup: Markup.inlineKeyboard(buttons).reply_markup
  }).catch(() => {
    ctx.replyWithHTML(text, Markup.inlineKeyboard(buttons));
  });
}

// === MENU PRESET PER PROVIDER ===
async function showConfigPresetAdminMenu(ctx, provider, page = 1) {
  const all = loadPresets();
  const prov = all.find(p => p.provider === provider);
  if (!prov) return ctx.reply('❌ <b>Provider tidak ditemukan!</b>', { parse_mode: 'HTML' });
  
  const perPage = 5;
  const total = prov.presets.length;
  const totalPages = Math.ceil(total / perPage) || 1;
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  const items = prov.presets.slice((page - 1) * perPage, page * perPage);

  let text = `🔧 <b>Preset Provider: ${provider}</b>\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  text += `📊 Total preset: <b>${total}</b>\n`;
  text += `📄 Halaman <b>${page}</b> dari <b>${totalPages}</b>\n\n`;
  
  if (items.length === 0) {
    text += '📭 <i>Belum ada preset di provider ini.</i>\n';
  } else {
    text += `📋 <b>Daftar Preset:</b>\n`;
    items.forEach((p, i) => {
      const no = (page - 1) * perPage + i + 1;
      text += `${no}. 🏷️ <b>${p.label}</b> <code>${p.value}</code>\n`;
      text += `   🖥️ Server: <code>${(p.server?.type === 'ubah') ? p.server.value : (p.server?.type === 'menambah' ? '[+]' + p.server.value : 'Tetap')}</code>\n`;
      text += `   🌐 Servername: <code>${p.servername?.type === 'ubah' ? p.servername.value : p.servername?.type === 'menambah' ? '[+]' + p.servername.value : 'Tetap'}</code>\n`;
      text += `   🔗 Host: <code>${p.host?.type === 'ubah' ? p.host.value : p.host?.type === 'menambah' ? '[+]' + p.host.value : 'Tetap'}</code>\n\n`;
    });
  }

  const buttons = [];
  const navRow = [];
  if (page > 1) navRow.push(Markup.button.callback('⬅️ Sebelumnya', `adm_cfg_page_${provider}_${page-1}`));
  if (page < totalPages) navRow.push(Markup.button.callback('Selanjutnya ➡️', `adm_cfg_page_${provider}_${page+1}`));
  if (navRow.length > 0) buttons.push(navRow);
  
  buttons.push([Markup.button.callback('➕ Tambah Preset Baru', `adm_cfg_add_${provider}`)]);
  if (items.length > 0) {
    buttons.push([
      Markup.button.callback('✏️ Edit Preset', `adm_cfg_editmenu_${provider}_${page}`),
      Markup.button.callback('🗑️ Hapus Preset', `adm_cfg_delmenu_${provider}_${page}`)
    ]);
  }
  buttons.push([
    Markup.button.callback('⬅️ Kembali ke Provider', 'adm_cfgprov_manage'),
    Markup.button.callback('🏠 Menu Utama', 'admin_menu_0')
  ]);

  await ctx.editMessageText(text, {
    parse_mode: 'HTML',
    reply_markup: Markup.inlineKeyboard(buttons).reply_markup
  }).catch(() => {
    ctx.replyWithHTML(text, Markup.inlineKeyboard(buttons));
  });
}

// --- Handler semua aksi admin (EDIT/DELETE) ---
async function handleAdminAction(ctx) {
  try {
    const data = ctx.callbackQuery.data;
    ctx.session.configact = ctx.session.configact || {};
    let s = ctx.session.configact;

    // Pagination Provider
    if (data.startsWith('adm_cfgprov_page_')) {
      const page = parseInt(data.replace('adm_cfgprov_page_', ''));
      ctx.session.configact = null;
      return showProviderAdminMenu(ctx, page);
    }
    
    // Add Provider
    if (data === 'adm_cfgprov_add') {
      ctx.session.configact = { step: 'provider_add' };
      return ctx.replyWithHTML(
        `🆕 <b>Tambah Provider Baru</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📝 Masukkan nama provider yang ingin ditambahkan\n\n` +
        `💡 <i>Contoh: XL, Axis, Telkomsel, Indosat, Smartfren</i>`
      );
    }
    
    // Manage Preset (pilih provider)
    if (data === 'adm_cfgprov_manage') {
      const all = loadPresets();
      if (all.length === 0) {
        return ctx.reply('📭 <b>Belum ada provider yang tersedia.</b>\n\n💡 <i>Tambahkan provider terlebih dahulu!</i>', { parse_mode: 'HTML' });
      }
      const buttons = all.map(p => [Markup.button.callback(`🏢 ${p.provider} (${p.presets.length} preset)`, `adm_cfgprov_select_${p.provider}`)]);
      buttons.push([Markup.button.callback('❌ Batal', 'adm_cfgprov_cancel')]);
      return ctx.replyWithHTML(
        `🔧 <b>Pilih Provider untuk Dikelola</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📋 Pilih provider yang ingin Anda kelola preset-nya:`, 
        Markup.inlineKeyboard(buttons)
      );
    }
    
    // Pilih provider (masuk preset menu)
    if (data.startsWith('adm_cfgprov_select_')) {
      const provider = data.replace('adm_cfgprov_select_', '');
      ctx.session.configact = { step: 'preset_menu', provider };
      return showConfigPresetAdminMenu(ctx, provider, 1);
    }
    
    // Cancel
    if (data === 'adm_cfgprov_cancel' || data === 'adm_cfg_cancel') {
      ctx.session.configact = null;
      return ctx.reply('❌ <b>Operasi dibatalkan</b>\n\n💡 <i>Anda dapat memulai kembali kapan saja.</i>', { parse_mode: 'HTML' });
    }
    
    // Pagination Preset
    if (data.startsWith('adm_cfg_page_')) {
      const [provider, page] = data.replace('adm_cfg_page_', '').split('_', 2);
      return showConfigPresetAdminMenu(ctx, provider, Number(page));
    }
    
    // Tambah preset
    if (data.startsWith('adm_cfg_add_')) {
      const provider = data.replace('adm_cfg_add_', '');
      ctx.session.configact = { step: 'label', provider, preset: {} };
      return ctx.replyWithHTML(
        `➕ <b>Tambah Preset Baru</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🏢 Provider: <b>${provider}</b>\n\n` +
        `📝 Masukkan nama label untuk preset ini:\n\n` +
        `💡 <i>Contoh: Gaming, Streaming, Work, dll.</i>`
      );
    }
    
    // EDIT/DELETE MENU PILIHAN PRESET
    if (data.startsWith('adm_cfg_editmenu_')) {
      const [provider, page] = data.replace('adm_cfg_editmenu_', '').split('_', 2);
      const all = loadPresets();
      const prov = all.find(p => p.provider === provider);
      if (!prov) return ctx.reply('❌ <b>Provider tidak ditemukan!</b>', { parse_mode: 'HTML' });
      
      const perPage = 5;
      const items = prov.presets.slice((page-1)*perPage, page*perPage);
      if (!items.length) return ctx.reply('📭 <b>Tidak ada preset di halaman ini!</b>', { parse_mode: 'HTML' });
      
      const buttons = items.map(pr =>
        [Markup.button.callback(`✏️ ${pr.label}`, `adm_cfg_edit_${provider}_${pr.value}`)]
      );
      buttons.push([Markup.button.callback('❌ Batal', `adm_cfg_page_${provider}_${page}`)]);
      return ctx.replyWithHTML(
        `✏️ <b>Pilih Preset untuk Diedit</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📋 Pilih preset yang ingin Anda edit:`, 
        Markup.inlineKeyboard(buttons)
      );
    }
    
    if (data.startsWith('adm_cfg_edit_')) {
      const [provider, val] = data.replace('adm_cfg_edit_', '').split('_', 2);
      const all = loadPresets();
      const prov = all.find(p => p.provider === provider);
      if (!prov) return ctx.reply('❌ <b>Provider tidak ditemukan.</b>', { parse_mode: 'HTML' });
      
      const preset = prov.presets.find(pr => pr.value === val);
      if (!preset) return ctx.reply('❌ <b>Preset tidak ditemukan.</b>', { parse_mode: 'HTML' });
      
      ctx.session.configact = { step: 'label', provider, preset: { ...preset }, editMode: true, oldValue: val };
      return ctx.replyWithHTML(
        `✏️ <b>Edit Preset</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🏢 Provider: <b>${provider}</b>\n` +
        `🏷️ Preset saat ini: <b>${preset.label}</b>\n\n` +
        `📝 Masukkan label baru untuk preset ini:`
      );
    }
    
    if (data.startsWith('adm_cfg_delmenu_')) {
      const [provider, page] = data.replace('adm_cfg_delmenu_', '').split('_', 2);
      const all = loadPresets();
      const prov = all.find(p => p.provider === provider);
      if (!prov) return ctx.reply('❌ <b>Provider tidak ditemukan!</b>', { parse_mode: 'HTML' });
      
      const perPage = 5;
      const items = prov.presets.slice((page-1)*perPage, page*perPage);
      if (!items.length) return ctx.reply('📭 <b>Tidak ada preset di halaman ini!</b>', { parse_mode: 'HTML' });
      
      const buttons = items.map(pr =>
        [Markup.button.callback(`🗑️ ${pr.label}`, `adm_cfg_delete_${provider}_${pr.value}`)]
      );
      buttons.push([Markup.button.callback('❌ Batal', `adm_cfg_page_${provider}_${page}`)]);
      return ctx.replyWithHTML(
        `🗑️ <b>Pilih Preset untuk Dihapus</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `⚠️ <i>Hati-hati! Penghapusan tidak dapat dibatalkan.</i>\n\n` +
        `📋 Pilih preset yang ingin dihapus:`, 
        Markup.inlineKeyboard(buttons)
      );
    }
    
    // Konfirmasi delete
    if (data.startsWith('adm_cfg_delete_') && !data.includes('_yes_')) {
      const parts = data.replace('adm_cfg_delete_', '').split('_');
      const provider = parts[0];
      const val = parts.slice(1).join('_');
      
      const all = loadPresets();
      const prov = all.find(p => p.provider === provider);
      if (!prov) return ctx.reply('❌ <b>Provider tidak ditemukan!</b>', { parse_mode: 'HTML' });
      
      const preset = prov.presets.find(p => p.value === val);
      if (!preset) return ctx.reply('❌ <b>Preset tidak ditemukan!</b>', { parse_mode: 'HTML' });
      
      ctx.session.configact = { step: 'delete_confirm', provider, delValue: val };
      return ctx.replyWithHTML(
        `⚠️ <b>Konfirmasi Penghapusan</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🏢 Provider: <b>${provider}</b>\n` +
        `🏷️ Preset: <b>${preset.label}</b>\n` +
        `🔧 Value: <code>${val}</code>\n\n` +
        `⚠️ <b>Apakah Anda yakin ingin menghapus preset ini?</b>\n` +
        `<i>Tindakan ini tidak dapat dibatalkan!</i>`,
        Markup.inlineKeyboard([
          [Markup.button.callback('✅ Ya, Hapus!', `adm_cfg_delete_confirm_${provider}_${val}`)],
          [Markup.button.callback('❌ Batal', `adm_cfg_page_${provider}_1`)]
        ])
      );
    }
    
    // Proses delete
    if (data.startsWith('adm_cfg_delete_confirm_')) {
      const parts = data.replace('adm_cfg_delete_confirm_', '').split('_');
      const provider = parts[0];
      const val = parts.slice(1).join('_');
      
      let all = loadPresets();
      const idx = all.findIndex(p => p.provider === provider);
      if (idx === -1) return ctx.reply('❌ <b>Provider tidak ditemukan!</b>', { parse_mode: 'HTML' });
      
      const before = all[idx].presets.length;
      all[idx].presets = all[idx].presets.filter(p => p.value !== val);
      
      if (all[idx].presets.length === before) {
        return ctx.reply('❌ <b>Preset tidak ditemukan!</b>', { parse_mode: 'HTML' });
      }
      
      if (!savePresets(all)) {
        return ctx.reply('❌ <b>Gagal menyimpan perubahan!</b>\n\n💡 <i>Silakan coba lagi.</i>', { parse_mode: 'HTML' });
      }
      
      ctx.session.configact = null;
      await ctx.reply(
        `🗑️ <b>Preset Berhasil Dihapus!</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `✅ Preset dengan value <code>${val}</code> telah dihapus dari provider <b>${provider}</b>`,
        { parse_mode: 'HTML' }
      );
      return showConfigPresetAdminMenu(ctx, provider, 1);
    }
    
    // ===== WIZARD STEP-BY-STEP =====
    if (data === 'adm_cfg_server_tetap') {
      s.preset.server = { type: 'tetap', value: '' };
      s.step = 'servername_option';
      ctx.session.configact = s;
      return ctx.replyWithHTML(
        `🌐 <b>Konfigurasi Servername</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🔧 Pilih opsi untuk servername:\n\n` +
        `• <b>Tetap</b> - Menggunakan servername dari user\n` +
        `• <b>Ubah</b> - Mengganti dengan servername baru\n` +
        `• <b>Menambah</b> - Menambahkan prefix di depan servername user`,
        Markup.inlineKeyboard([
          [Markup.button.callback('📌 Tetap', 'adm_cfg_servername_tetap')],
          [Markup.button.callback('🔄 Ubah', 'adm_cfg_servername_ubah')],
          [Markup.button.callback('➕ Menambah', 'adm_cfg_servername_menambah')],
        ])
      );
    }
    
    if (data === 'adm_cfg_server_ubah') {
      s.step = 'server_ubah';
      ctx.session.configact = s;
      return ctx.replyWithHTML(
        `🖥️ <b>Server Baru</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📝 Masukkan alamat server baru (domain atau IP):\n\n` +
        `💡 <i>Contoh: server.example.com atau 192.168.1.1</i>`
      );
    }
    
    if (data === 'adm_cfg_servername_tetap') {
      s.preset.servername = { type: 'tetap', value: '' };
      s.step = 'host_option';
      ctx.session.configact = s;
      return ctx.replyWithHTML(
        `🔗 <b>Konfigurasi Host</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🔧 Pilih opsi untuk host:\n\n` +
        `• <b>Tetap</b> - Menggunakan host dari user\n` +
        `• <b>Ubah</b> - Mengganti dengan host baru\n` +
        `• <b>Menambah</b> - Menambahkan prefix di depan host user`,
        Markup.inlineKeyboard([
          [Markup.button.callback('📌 Tetap', 'adm_cfg_host_tetap')],
          [Markup.button.callback('🔄 Ubah', 'adm_cfg_host_ubah')],
          [Markup.button.callback('➕ Menambah', 'adm_cfg_host_menambah')],
        ])
      );
    }
    
    if (data === 'adm_cfg_servername_ubah') {
      s.step = 'servername_ubah';
      ctx.session.configact = s;
      return ctx.replyWithHTML(
        `🌐 <b>Servername Baru</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📝 Masukkan servername baru (domain atau IP):\n\n` +
        `💡 <i>Contoh: sni.example.com atau 192.168.1.100</i>`
      );
    }
    
    if (data === 'adm_cfg_servername_menambah') {
      s.step = 'servername_menambah';
      ctx.session.configact = s;
      return ctx.replyWithHTML(
        `➕ <b>Tambahan Servername</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📝 Masukkan prefix yang akan ditambahkan di depan servername user:\n\n` +
        `💡 <i>Contoh: cdn. atau proxy.</i>`
      );
    }
    
    if (data === 'adm_cfg_host_tetap') {
      s.preset.host = { type: 'tetap', value: '' };
      ctx.session.configact = s;
      await finishWizard(ctx);
      return;
    }
    
    if (data === 'adm_cfg_host_ubah') {
      s.step = 'host_ubah';
      ctx.session.configact = s;
      return ctx.replyWithHTML(
        `🔗 <b>Host Baru</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📝 Masukkan host baru (domain atau IP):\n\n` +
        `💡 <i>Contoh: host.example.com atau 203.0.113.1</i>`
      );
    }
    
    if (data === 'adm_cfg_host_menambah') {
      s.step = 'host_menambah';
      ctx.session.configact = s;
      return ctx.replyWithHTML(
        `➕ <b>Tambahan Host</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📝 Masukkan prefix yang akan ditambahkan di depan host user:\n\n` +
        `💡 <i>Contoh: edge. atau api.</i>`
      );
    }
    
  } catch (e) {
    console.error('Error in handleAdminAction:', e);
    await ctx.reply(
      `❌ <b>Terjadi Kesalahan</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `🔧 Detail error: <code>${e.message}</code>\n\n` +
      `💡 <i>Silakan coba lagi atau hubungi administrator.</i>`, 
      { parse_mode: 'HTML' }
    );
  }
}

// --- Wizard input step-by-step
async function handleAdminTextInput(ctx) {
  try {
    const s = ctx.session.configact;
    if (!s) return;
    const input = ctx.message.text.trim();

    if (s.step === 'provider_add') {
      if (input.length < 2) {
        return ctx.reply(
          `❌ <b>Nama Terlalu Pendek</b>\n\n` +
          `📏 Nama provider minimal 2 karakter!\n\n` +
          `💡 <i>Silakan masukkan nama yang lebih panjang.</i>`, 
          { parse_mode: 'HTML' }
        );
      }
      
      let all = loadPresets();
      if (all.find(p => p.provider.toLowerCase() === input.toLowerCase())) {
        return ctx.reply(
          `❌ <b>Provider Sudah Ada</b>\n\n` +
          `🔄 Provider <b>${input}</b> sudah terdaftar!\n\n` +
          `💡 <i>Gunakan nama yang berbeda atau kelola provider yang sudah ada.</i>`, 
          { parse_mode: 'HTML' }
        );
      }
      
      all.push({ provider: input, presets: [] });
      if (!savePresets(all)) {
        return ctx.reply(
          `❌ <b>Gagal Menyimpan</b>\n\n` +
          `💾 Tidak dapat menyimpan provider baru!\n\n` +
          `💡 <i>Periksa izin file dan coba lagi.</i>`, 
          { parse_mode: 'HTML' }
        );
      }
      
      ctx.session.configact = null;
      await ctx.reply(
        `✅ <b>Provider Berhasil Ditambahkan!</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🏢 Provider: <b>${input}</b>\n` +
        `📊 Status: Siap digunakan\n\n` +
        `💡 <i>Sekarang Anda dapat menambahkan preset untuk provider ini.</i>`, 
        { parse_mode: 'HTML' }
      );
      return showProviderAdminMenu(ctx, 1);
    }

    if (s.step === 'label') {
      if (!input.length) {
        return ctx.reply(
          `❌ <b>Label Kosong</b>\n\n` +
          `📝 Label preset tidak boleh kosong!\n\n` +
          `💡 <i>Masukkan nama yang mudah diingat untuk preset ini.</i>`, 
          { parse_mode: 'HTML' }
        );
      }
      s.preset.label = input;
      s.step = 'value';
      ctx.session.configact = s;
      return ctx.replyWithHTML(
        `🔧 <b>Value Preset</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📝 Masukkan value preset (kode unik):\n\n` +
        `📋 <b>Aturan:</b>\n` +
        `• Hanya huruf, angka, underscore (_), dan dash (-)\n` +
        `• Tidak boleh mengandung spasi\n` +
        `• Harus unik dalam provider ini\n\n` +
        `💡 <i>Contoh: gaming_mode, streaming_hd, work_vpn</i>`
      );
    }
    
    if (s.step === 'value') {
      if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
        return ctx.reply(
          `❌ <b>Format Value Salah</b>\n\n` +
          `📋 Value preset hanya boleh menggunakan:\n` +
          `• Huruf (a-z, A-Z)\n` +
          `• Angka (0-9)\n` +
          `• Underscore (_)\n` +
          `• Dash (-)\n\n` +
          `🚫 Tidak boleh ada spasi atau karakter khusus lainnya!\n\n` +
          `💡 <i>Contoh yang benar: gaming_xl, streaming_4k</i>`, 
          { parse_mode: 'HTML' }
        );
      }
      
      // Check if value
      const all = loadPresets();
      const prov = all.find(p => p.provider === s.provider);
      if (prov && prov.presets.find(p => p.value === input && (!s.editMode || p.value !== s.oldValue))) {
        return ctx.reply(
          `❌ <b>Value Sudah Ada</b>\n\n` +
          `🔄 Value <code>${input}</code> sudah digunakan di provider <b>${s.provider}</b>!\n\n` +
          `💡 <i>Gunakan value yang berbeda dan unik.</i>`, 
          { parse_mode: 'HTML' }
        );
      }
      
      s.preset.value = input;
      s.step = 'server_option';
      ctx.session.configact = s;
      return ctx.replyWithHTML(
        `🖥️ <b>Konfigurasi Server</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🔧 Pilih opsi untuk server:\n\n` +
        `• <b>Tetap</b> - Menggunakan server dari user\n` +
        `• <b>Ubah</b> - Mengganti dengan server tertentu\n\n` +
        `💡 <i>Kebanyakan preset menggunakan opsi "Tetap"</i>`,
        Markup.inlineKeyboard([
          [Markup.button.callback('📌 Tetap', 'adm_cfg_server_tetap')],
          [Markup.button.callback('🔄 Ubah', 'adm_cfg_server_ubah')],
        ])
      );
    }
    
    if (s.step === 'server_ubah') {
      if (!input.length) {
        return ctx.reply(
          `❌ <b>Server Kosong</b>\n\n` +
          `📝 Server baru tidak boleh kosong!\n\n` +
          `💡 <i>Masukkan alamat server yang valid.</i>`, 
          { parse_mode: 'HTML' }
        );
      }
      s.preset.server = { type: 'ubah', value: input };
      s.step = 'servername_option';
      ctx.session.configact = s;
      return ctx.replyWithHTML(
        `🌐 <b>Konfigurasi Servername</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🔧 Pilih opsi untuk servername:\n\n` +
        `• <b>Tetap</b> - Menggunakan servername dari user\n` +
        `• <b>Ubah</b> - Mengganti dengan servername baru\n` +
        `• <b>Menambah</b> - Menambahkan prefix di depan servername user`,
        Markup.inlineKeyboard([
          [Markup.button.callback('📌 Tetap', 'adm_cfg_servername_tetap')],
          [Markup.button.callback('🔄 Ubah', 'adm_cfg_servername_ubah')],
          [Markup.button.callback('➕ Menambah', 'adm_cfg_servername_menambah')],
        ])
      );
    }
    
    if (s.step === 'servername_ubah') {
      if (!input.length) {
        return ctx.reply(
          `❌ <b>Servername Kosong</b>\n\n` +
          `📝 Servername baru tidak boleh kosong!\n\n` +
          `💡 <i>Masukkan servername yang valid.</i>`, 
          { parse_mode: 'HTML' }
        );
      }
      s.preset.servername = { type: 'ubah', value: input };
      s.step = 'host_option';
      ctx.session.configact = s;
      return ctx.replyWithHTML(
        `🔗 <b>Konfigurasi Host</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🔧 Pilih opsi untuk host:\n\n` +
        `• <b>Tetap</b> - Menggunakan host dari user\n` +
        `• <b>Ubah</b> - Mengganti dengan host baru\n` +
        `• <b>Menambah</b> - Menambahkan prefix di depan host user`,
        Markup.inlineKeyboard([
          [Markup.button.callback('📌 Tetap', 'adm_cfg_host_tetap')],
          [Markup.button.callback('🔄 Ubah', 'adm_cfg_host_ubah')],
          [Markup.button.callback('➕ Menambah', 'adm_cfg_host_menambah')],
        ])
      );
    }
    
    if (s.step === 'servername_menambah') {
      if (!input.length) {
        return ctx.reply(
          `❌ <b>Prefix Kosong</b>\n\n` +
          `📝 Prefix servername tidak boleh kosong!\n\n` +
          `💡 <i>Masukkan prefix yang akan ditambahkan.</i>`, 
          { parse_mode: 'HTML' }
        );
      }
      s.preset.servername = { type: 'menambah', value: input };
      s.step = 'host_option';
      ctx.session.configact = s;
      return ctx.replyWithHTML(
        `🔗 <b>Konfigurasi Host</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🔧 Pilih opsi untuk host:\n\n` +
        `• <b>Tetap</b> - Menggunakan host dari user\n` +
        `• <b>Ubah</b> - Mengganti dengan host baru\n` +
        `• <b>Menambah</b> - Menambahkan prefix di depan host user`,
        Markup.inlineKeyboard([
          [Markup.button.callback('📌 Tetap', 'adm_cfg_host_tetap')],
          [Markup.button.callback('🔄 Ubah', 'adm_cfg_host_ubah')],
          [Markup.button.callback('➕ Menambah', 'adm_cfg_host_menambah')],
        ])
      );
    }
    
    if (s.step === 'host_ubah') {
      if (!input.length) {
        return ctx.reply(
          `❌ <b>Host Kosong</b>\n\n` +
          `📝 Host baru tidak boleh kosong!\n\n` +
          `💡 <i>Masukkan host yang valid.</i>`, 
          { parse_mode: 'HTML' }
        );
      }
      s.preset.host = { type: 'ubah', value: input };
      ctx.session.configact = s;
      await finishWizard(ctx);
      return;
    }
    
    if (s.step === 'host_menambah') {
      if (!input.length) {
        return ctx.reply(
          `❌ <b>Prefix Kosong</b>\n\n` +
          `📝 Prefix host tidak boleh kosong!\n\n` +
          `💡 <i>Masukkan prefix yang akan ditambahkan.</i>`, 
          { parse_mode: 'HTML' }
        );
      }
      s.preset.host = { type: 'menambah', value: input };
      ctx.session.configact = s;
      await finishWizard(ctx);
      return;
    }
    
  } catch (e) {
    console.error('Error in handleAdminTextInput:', e);
    await ctx.reply(
      `❌ <b>Terjadi Kesalahan Input</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `🔧 Detail error: <code>${e.message}</code>\n\n` +
      `💡 <i>Silakan coba lagi atau hubungi administrator.</i>`, 
      { parse_mode: 'HTML' }
    );
  }
}

// --- Selesai Wizard
async function finishWizard(ctx) {
  try {
    const s = ctx.session.configact;
    if (!s) return;
    
    let all = loadPresets();
    const provIdx = all.findIndex(p => p.provider === s.provider);
    
    if (provIdx === -1) {
      ctx.session.configact = null;
      await ctx.reply(
        `❌ <b>Provider Tidak Ditemukan</b>\n\n` +
        `🔍 Provider <b>${s.provider}</b> tidak ditemukan!\n\n` +
        `💡 <i>Mungkin telah dihapus oleh admin lain.</i>`, 
        { parse_mode: 'HTML' }
      );
      return showProviderAdminMenu(ctx, 1);
    }
    
    const newPreset = {
      label: s.preset.label || 'Unknown',
      value: s.preset.value || 'default',
      server: s.preset.server || { type: 'tetap', value: '' },
      servername: s.preset.servername || { type: 'tetap', value: '' },
      host: s.preset.host || { type: 'tetap', value: '' },
    };
    
    // Edit mode: remove old preset
    if (s.editMode && s.oldValue) {
      all[provIdx].presets = all[provIdx].presets.filter(p => p.value !== s.oldValue);
    }
    
    // Add new/updated preset
    all[provIdx].presets.push(newPreset);
    
    if (!savePresets(all)) {
      ctx.session.configact = null;
      return ctx.reply(
        `❌ <b>Gagal Menyimpan Preset</b>\n\n` +
        `💾 Tidak dapat menyimpan preset!\n\n` +
        `💡 <i>Periksa izin file dan ruang disk.</i>`, 
        { parse_mode: 'HTML' }
      );
    }
    
    ctx.session.configact = null;
    
    const successMsg = s.editMode 
      ? `✅ <b>Preset Berhasil Diperbarui!</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🏢 Provider: <b>${s.provider}</b>\n` +
        `🏷️ Label: <b>${newPreset.label}</b>\n` +
        `🔧 Value: <code>${newPreset.value}</code>\n\n` +
        `📝 <i>Perubahan telah disimpan dan siap digunakan.</i>`
      : `✅ <b>Preset Berhasil Ditambahkan!</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🏢 Provider: <b>${s.provider}</b>\n` +
        `🏷️ Label: <b>${newPreset.label}</b>\n` +
        `🔧 Value: <code>${newPreset.value}</code>\n\n` +
        `🎉 <i>Preset baru siap digunakan oleh user!</i>`;
    
    await ctx.reply(successMsg, { parse_mode: 'HTML' });
    
    // Show updated preset menu
    await showConfigPresetAdminMenu(ctx, s.provider, 1);
    
  } catch (e) {
    console.error('Error in finishWizard:', e);
    ctx.session.configact = null;
    await ctx.reply(
      `❌ <b>Gagal Menyelesaikan Wizard</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
      `🔧 Detail error: <code>${e.message}</code>\n\n` +
      `💡 <i>Silakan mulai ulang proses pembuatan preset.</i>`, 
      { parse_mode: 'HTML' }
    );
  }
}

module.exports = {
  showProviderAdminMenu,
  showConfigPresetAdminMenu,
  handleAdminAction,
  handleAdminTextInput
};
