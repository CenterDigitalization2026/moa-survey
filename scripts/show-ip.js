const os = require("os");

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const [name, netInterface] of Object.entries(interfaces)) {
    if (!netInterface) continue;
    for (const net of netInterface) {
      // Check for IPv4 and non-internal
      const isIPv4 = net.family === "IPv4" || net.family === 4;
      if (isIPv4 && !net.internal) {
        addresses.push({
          interface: name,
          address: net.address
        });
      }
    }
  }

  return addresses;
}

function main() {
  const ips = getLocalIpAddresses();
  const port = process.env.PORT || 3000;
  const hostname = os.hostname();

  console.log("\n==================================================");
  console.log("  ПОСТОЯННЫЕ ССЫЛКИ ДЛЯ ПОДКЛЮЧЕНИЯ КОЛЛЕГ В СЕТИ:");
  console.log("==================================================");
  console.log("  1) Постоянная ссылка по имени компьютера (Hostname):");
  console.log(`     👉 http://${hostname}:${port}`);
  console.log(`     👉 http://${hostname.toLowerCase()}.local:${port} (для смартфонов/mDNS)`);
  console.log("     (Не зависит от смены IP-адреса роутером)");
  console.log("--------------------------------------------------");
  console.log("  2) Ссылка по прямому локальному IP-адресу:");

  if (ips.length === 0) {
    console.log(`     http://localhost:${port}`);
    console.log("     (Внимание: адаптеры локальной сети не найдены)");
  } else {
    for (const item of ips) {
      console.log(`     👉 http://${item.address}:${port}   [${item.interface}]`);
    }
  }

  console.log("==================================================");
  console.log(`  Локально на этом компьютере: http://localhost:${port}`);
  console.log("==================================================\n");
}

main();
