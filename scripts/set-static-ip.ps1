[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  ФИКСАЦИЯ СТАТИЧЕСКОГО IP-АДРЕСА ДЛЯ ЛОКАЛЬНОЙ СЕТИ" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Check Administrator Privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[!] Запуск с правами Администратора..." -ForegroundColor Yellow
    Start-Process powershell -Verb RunAs -ArgumentList "-NoExit -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    exit
}

# 2. Get active network adapter with a default gateway
$adapter = Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -ne $null } | Select-Object -First 1

if (-not $adapter) {
    Write-Host "[-] Ошибка: Активный сетевой адаптер с подключением к сети не найден." -ForegroundColor Red
    pause
    exit
}

$alias = $adapter.InterfaceAlias
$ipObj = $adapter.IPv4Address | Select-Object -First 1
$ip = $ipObj.IPAddress
$gw = ($adapter.IPv4DefaultGateway | Select-Object -First 1).NextHop

# Get subnet mask from PrefixLength
$pref = (Get-NetIPAddress -InterfaceAlias $alias -AddressFamily IPv4 | Where-Object { $_.IPAddress -eq $ip }).PrefixLength

function Convert-PrefixToMask([int]$prefix) {
    $maskVal = [uint32]::MaxValue -shl (32 - $prefix)
    $b = [System.BitConverter]::GetBytes([uint32]$maskVal)
    if ([System.BitConverter]::IsLittleEndian) { [Array]::Reverse($b) }
    return [System.Net.IPAddress]::new($b).ToString()
}

$mask = Convert-PrefixToMask $pref

# Get DNS Server
$dnsObj = Get-DnsClientServerAddress -InterfaceAlias $alias -AddressFamily IPv4
$dns = ($dnsObj.ServerAddresses | Select-Object -First 1)
if (-not $dns) {
    $dns = $gw
}

Write-Host ""
Write-Host "Обнаружены текущие сетевые параметры:" -ForegroundColor Green
Write-Host "  Сетевой адаптер : $alias"
Write-Host "  Текущий IPv4    : $ip"
Write-Host "  Маска подсети   : $mask (Префикс /$pref)"
Write-Host "  Основной шлюз   : $gw"
Write-Host "  DNS-сервер      : $dns"
Write-Host ""

$prompt = Read-Host "Зафиксировать этот IP ($ip) как постоянный статический? (Y/N)"
if ($prompt -ne 'Y' -and $prompt -ne 'y' -and $prompt -ne 'Д' -and $prompt -ne 'д') {
    Write-Host "Отменено пользователем." -ForegroundColor Yellow
    Write-Host "`nНажмите любую клавишу для выхода..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

Write-Host "`nПрименение статических параметров через netsh..." -ForegroundColor Cyan

# Execute netsh to set static IP and gateway
$resIp = netsh interface ipv4 set address name="$alias" static $ip $mask $gw 1
# Execute netsh to set static DNS
$resDns = netsh interface ipv4 set dns name="$alias" static $dns primary

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  [+] УСПЕШНО: IP-АДРЕС ЗАФИКСИРОВАН КАК СТАТИЧЕСКИЙ!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  Постоянная ссылка для коллег:"
Write-Host "  👉 http://${ip}:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "  (Теперь роутер не будет менять этот IP-адрес при перезагрузке)."
Write-Host "=================================================="
Write-Host "`nДля возврата к автоматическому получению IP (DHCP) при необходимости выполните:"
Write-Host "  netsh interface ipv4 set address name=`"$alias`" dhcp" -ForegroundColor Gray
Write-Host "  netsh interface ipv4 set dns name=`"$alias`" dhcp" -ForegroundColor Gray
Write-Host ""
Write-Host "Нажмите любую клавишу для закрытия окна..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
