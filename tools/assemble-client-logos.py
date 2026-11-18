# Choisit le meilleur fichier par marque, nettoie les SVG, copie dans le site et écrit src/data/clientLogos.json
import os, re, json, shutil, unicodedata, subprocess
SITE = os.path.expanduser('~/Desktop/BrunierObadia/04_Site_Web/01_Code-du-site/site')
OUT = f'{SITE}/public/logos/clients'
os.makedirs(OUT, exist_ok=True)
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode().lower()).strip('-')
key = lambda s: re.sub(r'[^A-Z0-9]', '', unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode().upper())
def find(folder, s):
    for f in os.listdir(folder):
        if os.path.splitext(f)[0] == s: return f'{folder}/{f}'
# source choisie après relecture de la planche : site officiel (site), Wikipédia (files) ou liste ciblée (cur)
PREF = {
 'site': ['SUEZ','NRJ','TÉLÉ 7 JOURS','ATD QUART MONDE','LE SAMU SOCIAL','VICHY','NEXIUM','TOURISME TUNISIEN','LA POSTE','INGENICO','E-ARTSUP','EPITECH','BARBARA BUI','ALTAREA COGEDIM','LAFARGE','CENTURY 21','ATLANTIC','SOPALIN','LE TRÈFLE','DANONE','ARCHISTORM','FRANCE TELEVISION','IONIS EDUCATION GROUP','AL THANI COLLECTION','MOËT & CHANDON','DOM PÉRIGNON','ALWAYS','COTY PARFUMS','NATURAL HISTORY MUSEUM','ALLIANZ'],
 'files': ['EDF','MAZARS','AXA','CNP','CRÉDIT AGRICOLE','ACQUA DI PARMA','HELENA RUBINSTEIN','VALENTINO','LE POINT','LES ORPHELINS APPRENTIS','OLYMPIQUE LYONNAIS','SANOFI','SANOFI PASTEUR','GILEAD','ROCHE','VSD','JANSSEN','ARMÉE DE TERRE'],
}
DARK = {'FRANCE TELEVISION','IONIS EDUCATION GROUP','AL THANI COLLECTION','MOËT & CHANDON','DOM PÉRIGNON','ALWAYS','NATURAL HISTORY MUSEUM','MAISON ULLENS'}
brands = open('miss.txt').read().strip().split('|')
def clean_svg(path, dest):
    s = open(path, encoding='utf-8', errors='ignore').read()
    s = re.sub(r'<script[\s\S]*?</script>', '', s, flags=re.I)
    s = re.sub(r'\son\w+="[^"]*"', '', s, flags=re.I)
    s = re.sub(r'<foreignObject[\s\S]*?</foreignObject>', '', s, flags=re.I)
    s = re.sub(r'(xlink:)?href="(?!#|data:image/(png|jpe?g))[^"]*"', '', s)
    if 'xmlns="http://www.w3.org/2000/svg"' not in s:
        s = s.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"', 1)
    open(dest, 'w', encoding='utf-8').write(s)
data = {}
placed, missing = [], []
for b in brands:
    s = slug(b)
    src = find('cur', s)
    if not src and b in ('DECLÉOR', 'DEFACTO', 'MILLEIS BANQUE'):
        src = find('site2', s)
    if not src:
        for folder in ('site', 'files'):
            if b in PREF[folder]:
                src = find(folder, s)
    if not src:
        missing.append(b); continue
    ext = os.path.splitext(src)[1].lower()
    dest = f'{OUT}/{s}{".svg" if ext == ".svg" else ext}'
    if ext == '.svg': clean_svg(src, dest)
    else: shutil.copy(src, dest)
    data[key(b)] = {'src': f'/logos/clients/{os.path.basename(dest)}', **({'dark': True} if b in DARK else {})}
    placed.append(b)
# les 26 logos déjà présents
wall = subprocess.run(['node', '-e', "import('./src/data/clientsWall.js').then(m=>console.log(JSON.stringify(m.iconicBrands.map(b=>[b.name,b.logo]))))"], cwd=SITE, capture_output=True, text=True).stdout
for name, logo in json.loads(wall):
    data[key(name)] = {'src': logo}
    data[key(name.replace(' Brand', ''))] = {'src': logo}
data['TOTALENERGIES'] = data.get('TOTALENERGIES', {'src': '/logos/total-energies.svg'})
# fichiers identiques (ex. Sanofi et Sanofi Pasteur) : une seule adresse, pour qu'ils fusionnent dans la grille
import hashlib
first = {}
for k, v in data.items():
    p = f"{SITE}/public{v['src']}"
    if os.path.exists(p):
        h = hashlib.md5(open(p, 'rb').read()).hexdigest()
        if h in first: v['src'] = first[h]
        else: first[h] = v['src']
json.dump(data, open(f'{SITE}/src/data/clientLogos.json', 'w'), ensure_ascii=False, indent=1)
print(len(placed), 'placés ;', len(missing), 'manquants :', missing)
