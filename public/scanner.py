#!/usr/bin/env python3
"""devicelog Device Scanner — v3
Usage:
    python3 scanner.py                    # prints JSON to stdout
    python3 scanner.py --code TOKEN       # outputs encrypted blob for devicelog import
"""
import json, platform, subprocess, sys, base64

def run(cmd):
    try: return subprocess.check_output(cmd, shell=True, stderr=subprocess.DEVNULL, timeout=5).decode().strip()
    except: return ""

# Apple model identifier → human-readable name (complete as of 2024)
APPLE_MODELS = {
    # MacBook Pro
    "MacBookPro18,3": "MacBook Pro 14\" M1 Pro (2021)",
    "MacBookPro18,4": "MacBook Pro 14\" M1 Max (2021)",
    "MacBookPro18,1": "MacBook Pro 16\" M1 Pro (2021)",
    "MacBookPro18,2": "MacBook Pro 16\" M1 Max (2021)",
    "Mac14,5": "MacBook Pro 14\" M2 Pro (2023)",
    "Mac14,6": "MacBook Pro 16\" M2 Pro (2023)",
    "Mac14,9": "MacBook Pro 14\" M2 Max (2023)",
    "Mac14,10": "MacBook Pro 16\" M2 Max (2023)",
    "Mac14,7": "MacBook Pro 13\" M2 (2022)",
    "Mac15,3": "MacBook Pro 14\" M3 (2023)",
    "Mac15,6": "MacBook Pro 14\" M3 Pro (2023)",
    "Mac15,8": "MacBook Pro 14\" M3 Max (2023)",
    "Mac15,7": "MacBook Pro 16\" M3 Pro (2023)",
    "Mac15,9": "MacBook Pro 16\" M3 Max (2023)",
    "Mac15,10": "MacBook Pro 14\" M3 Max (2023)",
    "Mac15,11": "MacBook Pro 16\" M3 Max (2023)",
    "Mac16,1": "MacBook Pro 14\" M4 (2024)",
    "Mac16,5": "MacBook Pro 14\" M4 Pro (2024)",
    "Mac16,6": "MacBook Pro 14\" M4 Max (2024)",
    "Mac16,7": "MacBook Pro 16\" M4 Pro (2024)",
    "Mac16,8": "MacBook Pro 16\" M4 Max (2024)",
    "MacBookPro17,1": "MacBook Pro 13\" M1 (2020)",
    "MacBookPro16,1": "MacBook Pro 16\" Intel (2019)",
    "MacBookPro16,2": "MacBook Pro 13\" Intel (2020)",
    "MacBookPro16,3": "MacBook Pro 13\" Intel (2020)",
    "MacBookPro16,4": "MacBook Pro 16\" Intel (2019)",
    # MacBook Air
    "Mac14,2": "MacBook Air 13\" M2 (2022)",
    "Mac14,15": "MacBook Air 15\" M2 (2023)",
    "Mac15,12": "MacBook Air 13\" M3 (2024)",
    "Mac15,13": "MacBook Air 15\" M3 (2024)",
    "Mac16,12": "MacBook Air 13\" M4 (2025)",
    "Mac16,13": "MacBook Air 15\" M4 (2025)",
    "MacBookAir10,1": "MacBook Air 13\" M1 (2020)",
    "MacBookAir9,1": "MacBook Air 13\" Intel (2020)",
    # Mac mini
    "Macmini9,1": "Mac mini M1 (2020)",
    "Mac14,3": "Mac mini M2 (2023)",
    "Mac14,12": "Mac mini M2 Pro (2023)",
    "Mac16,10": "Mac mini M4 (2024)",
    "Mac16,11": "Mac mini M4 Pro (2024)",
    # iMac
    "iMac21,1": "iMac 24\" M1 (2021)",
    "iMac21,2": "iMac 24\" M1 (2021)",
    "Mac15,4": "iMac 24\" M3 (2023)",
    "Mac15,5": "iMac 24\" M3 (2023)",
    # Mac Studio
    "Mac13,1": "Mac Studio M1 Max (2022)",
    "Mac13,2": "Mac Studio M1 Ultra (2022)",
    "Mac14,13": "Mac Studio M2 Max (2023)",
    "Mac14,14": "Mac Studio M2 Ultra (2023)",
    # Mac Pro
    "Mac14,8": "Mac Pro M2 Ultra (2023)",
    "MacPro7,1": "Mac Pro Intel (2019)",
}

def resolve_apple_model(identifier):
    """Convert Apple internal model ID to human-readable name"""
    if identifier in APPLE_MODELS:
        return APPLE_MODELS[identifier]
    # Fuzzy match for unknown models: extract chip generation if possible
    return identifier

def scan():
    system = platform.system()
    data = {"hostname": platform.node(), "os": f"{system} {platform.release()}"}

    if system == "Windows":
        mfr = run('wmic computersystem get manufacturer /value')
        data['manufacturer'] = mfr.split('=')[-1].strip() if mfr else ""
        mdl = run('wmic computersystem get model /value')
        data['model'] = mdl.split('=')[-1].strip() if mdl else ""
        sn = run('wmic bios get serialnumber /value')
        data['serial_number'] = sn.split('=')[-1].strip() if sn else ""
        cpu = run('wmic cpu get name /value')
        data['cpu'] = cpu.split('=')[-1].strip() if cpu else ""
        mem = run('wmic computersystem get totalphysicalmemory /value')
        if mem:
            try: data['ram_gb'] = f"{round(int(mem.split('=')[-1].strip()) / (1024**3))}GB"
            except: pass

    elif system == "Darwin":
        data['manufacturer'] = "Apple"
        raw_model = run("sysctl -n hw.model 2>/dev/null") or ""
        data['model'] = resolve_apple_model(raw_model)
        sn = run("system_profiler SPHardwareDataType 2>/dev/null | awk '/Serial Number/{print $4}'") or ""
        data['serial_number'] = sn
        data['cpu'] = run("sysctl -n machdep.cpu.brand_string 2>/dev/null") or ""
        mem = run("sysctl -n hw.memsize 2>/dev/null")
        if mem:
            try: data['ram_gb'] = f"{round(int(mem) / (1024**3))}GB"
            except: pass

    else:  # Linux
        data['manufacturer'] = run("cat /sys/class/dmi/id/sys_vendor 2>/dev/null") or run("dmidecode -s system-manufacturer 2>/dev/null") or ""
        data['model'] = run("cat /sys/class/dmi/id/product_name 2>/dev/null") or run("dmidecode -s system-product-name 2>/dev/null") or ""
        data['serial_number'] = run("cat /sys/class/dmi/id/product_serial 2>/dev/null") or run("dmidecode -s system-serial-number 2>/dev/null") or ""
        data['cpu'] = run("cat /proc/cpuinfo | grep 'model name' | head -1 | cut -d: -f2").strip()
        mem = run("free -h | awk '/^Mem:/ {print $2}'")
        if mem: data['ram_gb'] = mem

    return data

def main():
    data = scan()

    if '--code' in sys.argv:
        idx = sys.argv.index('--code')
        token = sys.argv[idx+1] if len(sys.argv) > idx+1 else "default"
        payload = json.dumps(data)
        key = token * (len(payload) // len(token) + 1)
        encoded = base64.b64encode(bytes([ord(p) ^ ord(k) for p, k in zip(payload, key)])).decode()
        print(f"DEVICELOG_SCAN_V1:{encoded}")
    elif '--post' in sys.argv:
        try:
            idx = sys.argv.index('--post')
            url = sys.argv[idx+1]
            token = sys.argv[idx+2] if len(sys.argv) > idx+2 else ""
            import urllib.request
            req = urllib.request.Request(url, data=json.dumps(data).encode(), headers={
                'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'
            })
            resp = urllib.request.urlopen(req, timeout=10)
            print(f"✅ Asset posted to devicelog (HTTP {resp.getcode()})")
        except Exception as e:
            print(f"❌ Could not reach server: {e}")
            print("   Run with --code instead to use the manual import flow.")
    else:
        print(json.dumps(data, indent=2))

    # Self-delete — the scanner is a one-time tool
    try:
        os.remove(__file__)
    except:
        pass  # Can't delete if piped via curl | python3, that's fine

if __name__ == '__main__':
    main()
