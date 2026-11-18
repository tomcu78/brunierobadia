# Génère BO Grotesk (textes) et BO Grotesk Wide (boutons, titres d'offres) à partir de Work Sans (OFL 1.1).
import sys, copy
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset

SRC, OUT = sys.argv[1], sys.argv[2]
WIDE = 1.08                      # élargissement horizontal de la version Wide
UNICODES = list(range(0x20, 0x7F)) + list(range(0xA0, 0x180)) + [0x152, 0x153, 0x178, 0x2C6, 0x2DA, 0x2DC] \
    + list(range(0x2010, 0x2028)) + list(range(0x2030, 0x203B)) + [0x202F, 0x20AC, 0x2122, 0x2190, 0x2191, 0x2192, 0x2193, 0x2197, 0x2212]

def rename(f, family, style, weight):
    full = f"{family} {style}".strip()
    ps = full.replace(' ', '-')
    name = f['name']
    for rec in list(name.names):
        if rec.nameID in (1, 2, 3, 4, 6, 16, 17, 21, 22, 25):
            name.removeNames(nameID=rec.nameID)
    for nid, val in ((1, full), (2, 'Regular'), (3, f"{ps};BrunierObadia"), (4, full), (6, ps), (16, family), (17, style)):
        name.setName(val, nid, 3, 1, 0x409)
    # mention de la modification, exigée par l'esprit de la licence
    name.setName('BO Grotesk is a modified version of Work Sans (SIL Open Font License 1.1).', 10, 3, 1, 0x409)
    f['OS/2'].usWeightClass = weight

def widen(f, k):
    glyf, hmtx = f['glyf'], f['hmtx']
    for g in f.getGlyphOrder():
        glyph = glyf[g]
        if glyph.isComposite():
            for c in glyph.components:
                c.x = round(c.x * k)
        elif glyph.numberOfContours > 0:
            coords = glyph.coordinates
            for i in range(len(coords)):
                x, y = coords[i]
                coords[i] = (round(x * k), y)
        adv, lsb = hmtx[g]
        hmtx[g] = (round(adv * k), round(lsb * k))
    # les approches de paires (crénage) suivent l'élargissement
    if 'GPOS' in f:
        for lookup in f['GPOS'].table.LookupList.Lookup:
            for st in lookup.SubTable:
                st = getattr(st, 'ExtSubTable', st)
                if getattr(st, 'Format', None) and lookup.LookupType in (2, 9):
                    if st.Format == 1:
                        for ps in st.PairSet:
                            for pvr in ps.PairValueRecord:
                                for vr in (pvr.Value1, pvr.Value2):
                                    if vr is not None and hasattr(vr, 'XAdvance'):
                                        vr.XAdvance = round(vr.XAdvance * k)
                    elif st.Format == 2:
                        for c1 in st.Class1Record:
                            for c2 in c1.Class2Record:
                                for vr in (c2.Value1, c2.Value2):
                                    if vr is not None and hasattr(vr, 'XAdvance'):
                                        vr.XAdvance = round(vr.XAdvance * k)

CAP = 71 / 66                     # capitales et chiffres plus hauts, minuscules inchangées

def raise_caps(f, k):
    cmap = f.getBestCmap()
    up = set()
    for cp, g in cmap.items():
        ch = chr(cp)
        if ch.isupper() or ch.isdigit():
            up.add(g)
    glyf = f['glyf']
    cap = f['OS/2'].sCapHeight
    def base_simple(g):
        return not glyf[g].isComposite()
    scaled = set()
    for g in up:
        gl = glyf[g]
        if gl.isComposite():
            continue
        if gl.numberOfContours > 0:
            co = gl.coordinates
            for i in range(len(co)):
                x, y = co[i]
                co[i] = (x, round(y * k))
        scaled.add(g)
    # capitales accentuées : la lettre de base grandit, l'accent monte d'autant
    lift = round((k - 1) * cap)
    for g in up:
        gl = glyf[g]
        if not gl.isComposite():
            continue
        for c in gl.components:
            if c.glyphName in scaled:
                continue
            if glyf[c.glyphName].isComposite():
                continue
            c.y += lift
    f['OS/2'].sCapHeight = round(cap * k)

def save(f, path):
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['kern', 'liga', 'calt', 'ccmp', 'locl', 'mark', 'mkmk', 'case']
    opts.name_IDs = ['*']
    opts.name_languages = ['*']
    opts.notdef_outline = True
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=UNICODES)
    sub.subset(f)
    f.flavor = 'woff2'
    f.save(path)

STYLES = {250: 'Thin', 300: 'Light', 400: 'Regular', 500: 'Medium', 700: 'Bold'}
B_WIDTH = {250: 1.10, 300: 1.065, 400: 1.039, 500: 1.05, 700: 1.064}
A_WIDTH = {300: 1.125, 400: 1.102, 500: 1.111}
# graisse réelle de Work Sans dont le noir (encre par chasse) égale celui de Styrene, mesuré style par style
AXIS = {('BO Grotesk', 250): 210, ('BO Grotesk', 300): 330, ('BO Grotesk', 400): 450, ('BO Grotesk', 500): 560, ('BO Grotesk', 700): 700,
        ('BO Grotesk Wide', 300): 330, ('BO Grotesk Wide', 400): 440, ('BO Grotesk Wide', 500): 570}
def build(family, fname, weight, k):
    f = TTFont(SRC)
    # l'élargissement épaissit les fûts verticaux : on part d'une graisse un peu plus maigre
    f = instancer.instantiateVariableFont(f, {'wght': AXIS[(family, weight)]}, updateFontNames=False)
    raise_caps(f, CAP)
    widen(f, k)
    # mêmes marges de ligne que la maquette (valeurs de Styrene) : les textes se placent pareil dans leurs blocs
    h, o = f['hhea'], f['OS/2']
    h.ascent, h.descent, h.lineGap = 1050, -240, 0
    o.sTypoAscender, o.sTypoDescender, o.sTypoLineGap = 1050, -240, 0
    o.usWinAscent, o.usWinDescent = 1230, 330
    rename(f, family, STYLES[weight], weight)
    save(f, f"{OUT}/{fname}-{STYLES[weight]}.woff2")
for w, k in B_WIDTH.items():
    build('BO Grotesk', 'BOGrotesk', w, k)
for w, k in A_WIDTH.items():
    build('BO Grotesk Wide', 'BOGroteskWide', w, k)
print('ok')
