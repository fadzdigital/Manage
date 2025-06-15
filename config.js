// manage/config.js

const { Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const presetsList = require('../utils/presets.json');
const { buildOpenClashConfig } = require('../utils/textconfiguration');

const TMP_DIR = path.join(__dirname, '../tmp');
const PER_PAGE = 6;

// === PARSER AKUN VPN ===
function parseLink(link) {
  if (link.startsWith('vmess://')) {
    try {
      const obj = JSON.parse(Buffer.from(link.slice(8), 'base64').toString());
      return {
        name: obj.ps || 'vmess',
        type: 'vmess',
        server: obj.add,
        port: Number(obj.port),
        uuid: obj.id,
        alterId: Number(obj.aid || 0),
        cipher: 'auto',
        tls: obj.tls === 'tls',
        'skip-cert-verify': true,
        network: obj.net,
        servername: obj.sni || obj.host || '',
        udp: true,
        'ws-opts': obj.net === 'ws'
          ? { path: obj.path || '', headers: { Host: obj.host || '' } }
          : undefined
      };
    } catch {
      return { error: 'VMESS parse error' };
    }
  }
  if (link.startsWith('vless://')) {
    try {
      const [head, rem] = link.slice(8).split('@');
      const [hp, paramsRaw] = rem.split('/?');
      const [host, port] = hp.split(':');
      const [paramsStr, tag] = (paramsRaw||'').split('#');
      const params = new URLSearchParams(paramsStr||'');
      const net = params.get('type') || 'ws';
      return {
        name: decodeURIComponent(tag||'vless'),
        type: 'vless',
        server: host,
        port: Number(port),
        uuid: head,
        cipher: 'auto',
        tls: params.get('security') === 'tls',
        'skip-cert-verify': true,
        network: net,
        servername: params.get('sni')||params.get('host')||'',
        udp: true,
        'ws-opts': net==='ws'
          ? { path: params.get('path')||'', headers: { Host: params.get('host')||'' } }
          : undefined
      };
    } catch {
      return { error: 'VLESS parse error' };
    }
  }
  if (link.startsWith('trojan://')) {
    try {
      const [pw, rem] = link.slice(9).split('@');
      const [hp, paramsRaw] = rem.split('/?');
      const [host, port] = hp.split(':');
      const [paramsStr, tag] = (paramsRaw||'').split('#');
      const params = new URLSearchParams(paramsStr||'');
      const net = params.get('type') || 'ws';
      const conf = {
        name: decodeURIComponent(tag||'trojan'),
        type: 'trojan',
        server: host,
        port: Number(port),
        password: pw,
        'skip-cert-verify': true,
        network: net,
        udp: true
      };
      if (net==='ws') {
        conf['ws-opts'] = { path: params.get('path')||'', headers:{ Host: params.get('host')||'' } };
      }
      return conf;
    } catch {
      return { error: 'Trojan parse error' };
    }
  }
  return { error: 'Unsupported format' };
}

// === HELPERS MENU ===
function getProviders() {
  return presetsList.map(p => p.provider);
}
function getPresets(provider) {
  const p = presetsList.find(x => x.provider === provider);
  return p ? p.presets : [];
}
function renderProviderMenu() {
  return Markup.inlineKeyboard([
    ...getProviders().map(prv => Markup.button.callback(prv, `presetprov_${prv}`)),
    [Markup.button.callback('🏠 Menu', 'menu_page_1')]
  ]);
}
function renderPresetMenu(provider, page=1) {
  const arr = getPresets(provider);
  const total = arr.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  page = Math.min(Math.max(page,1), pages);
  const slice = arr.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const rows = slice.map((pr,i)=>[
    Markup.button.callback(pr.name, `setpreset_${provider}_${(page-1)*PER_PAGE+i}`)
  ]);
  const nav = [];
  if(page>1) nav.push(Markup.button.callback('⬅️ Prev', `presetprov_${provider}_page_${page-1}`));
  if(page<pages) nav.push(Markup.button.callback('➡️ Next', `presetprov_${provider}_page_${page+1}`));
  if(nav.length) rows.push(nav);
  rows.push([Markup.button.callback('🏠 Menu','menu_page_1')]);
  return Markup.inlineKeyboard(rows);
}

// === EXPORT ===
module.exports = bot => {
  // Show providers
  bot.action('user_configuration', async ctx=>{
    await ctx.answerCbQuery();
    ctx.session.config={};
    await ctx.replyWithHTML(
      `<b>🔧 Auto Config VPN</b>\nPilih provider:`,
      renderProviderMenu()
    );
  });

  // Provider select & pagination
  bot.action(/presetprov_(\w+)(_page_(\d+))?/, async ctx=>{
    await ctx.answerCbQuery();
    const prov = ctx.match[1], pg = ctx.match[3]?+ctx.match[3]:1;
    ctx.session.config={provider:prov};
    await ctx.editMessageText(
      `<b>🔧 Config ${prov}</b>\nPilih preset:`,
      {parse_mode:'HTML', ...renderPresetMenu(prov,pg)}
    );
  });

  // Preset select
  bot.action(/setpreset_(\w+)_(\d+)/, async ctx=>{
    await ctx.answerCbQuery();
    const prov=ctx.match[1], idx=+ctx.match[2];
    const arr=getPresets(prov), preset=arr[idx];
    if(!preset) return ctx.reply('❌ Preset not found');
    ctx.session.config.preset=preset;
    await ctx.replyWithHTML(
      `<b>📝 Paste akun VMESS/VLESS/TROJAN</b>\nPreset: <b>${preset.name}</b>`,
      Markup.inlineKeyboard([
        [Markup.button.callback('⬅️ Back',`presetprov_${prov}`)],
        [Markup.button.callback('🏠 Menu','menu_page_1')]
      ])
    );
    ctx.session.config.await=true;
  });

  // Handle link paste
  bot.on('text', async(ctx,next)=>{
    const cfg=ctx.session.config;
    if(!cfg?.await) return next();
    const link=ctx.message.text.trim();
    const preset=cfg.preset;
    const proxy=parseLink(link);
    if(proxy.error) return ctx.reply(`❌ ${proxy.error}`);

    // Apply preset
    if(preset.change_server&&preset.server) proxy.server=preset.server;
    if(preset.change_servername){
      if(preset.set_servername) proxy.servername=preset.set_servername;
      else if(preset.prepend_servername) proxy.servername=preset.prepend_servername+(proxy.servername||'');
    }
    if(preset.change_host&&proxy['ws-opts']?.headers){
      if(preset.set_host) proxy['ws-opts'].headers.Host=preset.set_host;
      else if(preset.prepend_host) proxy['ws-opts'].headers.Host=preset.prepend_host+proxy['ws-opts'].headers.Host;
    }
    if(preset.port) proxy.port=+preset.port;

    // Detail
    let txt=`✅ <b>Configured!</b>\n\n`;
    txt+=`<b>Preset:</b> ${preset.name}\n`;
    txt+=`<b>Server:</b> <code>${proxy.server}</code>\n`;
    if(proxy.servername) txt+=`<b>ServerName:</b> <code>${proxy.servername}</code>\n`;
    if(proxy['ws-opts']?.headers?.Host) txt+=`<b>Host:</b> <code>${proxy['ws-opts'].headers.Host}</code>\n`;

    // YAML preview
    const yaml=buildOpenClashConfig([proxy]);
    txt+=`\n<b>YAML Preview:</b>\n<pre>${yaml}</pre>`;

    await ctx.replyWithHTML(
      txt,
      Markup.inlineKeyboard([
        [Markup.button.callback('⬇️ Download YAML','dl_yaml')],
        [Markup.button.callback('🏠 Menu','menu_page_1')]
      ])
    );
    cfg.proxy=proxy;
    cfg.await=false;
  });

  // Download yaml
  bot.action('dl_yaml',async ctx=>{
    await ctx.answerCbQuery();
    const pr=ctx.session.config.proxy;
    if(!pr) return ctx.reply('❌ No data');
    const yaml=buildOpenClashConfig([pr]);
    const f=path.join(TMP_DIR,`cfg_${ctx.from.id}.yaml`);
    if(!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);
    fs.writeFileSync(f,yaml,'utf8');
    await ctx.replyWithDocument({source:f,filename:'config.yaml'});
    fs.unlinkSync(f);
  });
};

