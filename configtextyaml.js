// manage/configtextyaml.js

const YAML = require('yaml');

function buildOpenClashYaml(proxy) {
  const doc = {
    port: 7890,
    'socks-port': 7891,
    'redir-port': 7892,
    'mixed-port': 7893,
    mode: 'rule',
    'log-level': 'silent',
    'allow-lan': true,
    'external-controller': '0.0.0.0:9090',
    'secret': '',
    'bind-address': '*',
    'unified-delay': true,
    'profile': { 'store-selected': true },
    dns: {
      enable: true,
      'enhanced-mode': 'redir-host',
      listen: '0.0.0.0:7874',
      nameserver: ['8.8.8.8', '1.0.0.1', 'https://dns.google/dns-query'],
      fallback: ['1.1.1.1', '8.8.4.4', 'https://cloudflare-dns.com/dns-query'],
      'default-nameserver': ['8.8.8.8', '1.1.1.1']
    },
    proxies: [proxy],
    'proxy-groups': [
      {
        name: 'Auto',
        type: 'select',
        proxies: [proxy.name, 'DIRECT']
      }
    ],
    rules: ['MATCH,Auto']
  };
  return YAML.stringify(doc);
}

module.exports = { buildOpenClashYaml };

