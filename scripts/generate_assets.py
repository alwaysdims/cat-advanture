"""Original pixel assets. Optional regeneration: python -m pip install Pillow; python scripts/generate_assets.py."""
from PIL import Image, ImageDraw
from pathlib import Path
import random, math

OUT = Path(__file__).resolve().parents[1] / 'public' / 'assets'
OUT.mkdir(parents=True, exist_ok=True)
random.seed(1204)
INK = '#563a45'
CREAM = '#fff3da'

def canvas(w,h):
    im=Image.new('RGBA',(w,h)); return im,ImageDraw.Draw(im)
def save(im,name): im.save(OUT / (name+'.png'))
def poly(d,points,fill,outline=INK): d.polygon(points,fill=fill,outline=outline)
def rect(d,box,fill): d.rectangle(box,fill=fill)

# Fixed 48x48 cells: same silhouette and permanent red hat in every animation.
sheet,_=canvas(48*16,48)
for f in range(16):
    im,d=canvas(48,48)
    bob=1 if f in [1,2,5,7,9,14] else 0
    # Tail is distinct from body, with a cream tip.
    poly(d,[(14,31),(9,33),(5,29),(3,24),(1,25),(1,32),(6,37),(15,38)],'#f8a54d')
    rect(d,(2,25,4,29),CREAM)
    stride=2 if f in [4,7] else -2 if f in [5,8] else 0
    poly(d,[(14,27+bob),(30,26+bob),(34,34),(31,40),(16,40),(11,36)],'#f6a34f')
    poly(d,[(24,29),(32,29),(33,36),(28,39),(22,37)],CREAM)
    rect(d,(14,33,18,35),'#d97146'); rect(d,(13,29,16,31),'#d97146')
    poly(d,[(15,37),(21,37),(21+stride,43),(13+stride,43),(13+stride,41)],'#fff3da')
    poly(d,[(27,37),(32,37),(34-stride,42),(26-stride,42)],CREAM)
    # Ears and broad cheeks.
    poly(d,[(15,19+bob),(14,9+bob),(20,12+bob),(29,12+bob),(35,7+bob),(38,19+bob),(39,29+bob),(34,34+bob),(20,34+bob),(14,29+bob)],'#ffad52')
    poly(d,[(32,13+bob),(35,10+bob),(36,17+bob)],'#ed9a94',None)
    poly(d,[(17,24+bob),(23,23+bob),(25,26+bob),(29,23+bob),(36,23+bob),(38,28+bob),(34,32+bob),(22,32+bob),(17,29+bob)],CREAM,None)
    rect(d,(27,15+bob,29,19+bob),'#d66a42'); rect(d,(31,17+bob,33,20+bob),'#d66a42')
    if f in [2,12,14,15]:
        d.line([(21,24+bob),(23,22+bob),(25,24+bob)],fill=INK,width=1)
        d.line([(31,24+bob),(33,22+bob),(35,24+bob)],fill=INK,width=1)
    else:
        rect(d,(22,22+bob,24,25+bob),INK); rect(d,(32,22+bob,34,25+bob),INK)
        rect(d,(22,22+bob,22,22+bob),CREAM);rect(d,(32,22+bob,32,22+bob),CREAM)
    rect(d,(27,27+bob,29,28+bob),'#c94758');rect(d,(28,29+bob,28,30+bob),INK)
    d.line((17,28+bob,12,27+bob),fill=INK);d.line((36,28+bob,42,27+bob),fill=INK)
    rect(d,(19,27+bob,21,28+bob),'#f2a18e');rect(d,(34,27+bob,36,28+bob),'#f2a18e')
    # Red scarf, bell, and slanted red hat.
    poly(d,[(16,33+bob),(30,33+bob),(31,35+bob),(18,36+bob)],'#c94758')
    rect(d,(28,34+bob,31,37+bob),'#ffdc6a');rect(d,(29,36+bob,29,37+bob),INK)
    poly(d,[(10,16+bob),(16,13+bob),(18,6+bob),(22,3+bob),(30,5+bob),(33,10+bob),(38,10+bob),(38,13+bob),(14,21+bob),(10,20+bob)],'#c94758')
    poly(d,[(18,12+bob),(19,7+bob),(23,5+bob),(29,7+bob),(30,9+bob)],'#ef7c85',None)
    d.line([(14,16+bob),(34,10+bob)],fill='#773f59',width=2)
    d.line([(12,18+bob),(36,12+bob)],fill='#ffb4a0',width=1)
    if f==10:
        # Tucked paws for upward jump.
        rect(d,(13,40,23,44),(0,0,0,0));poly(d,[(15,37),(21,37),(21,40),(15,40)],CREAM)
    if f in [13,14,15]:
        poly(d,[(33,33),(38,30),(40,31),(39,35),(34,37)],CREAM)
    sheet.paste(im,(48*f,0))
save(sheet,'mochi'); save(sheet.crop((0,0,48,48)),'mochi-idle')

im,d=canvas(24,20)
poly(d,[(2,7),(7,9),(11,4),(18,4),(22,8),(22,12),(18,15),(10,15),(7,12),(2,15)],'#579cdb')
poly(d,[(8,9),(12,6),(18,6),(20,8),(12,9),(10,12),(8,12)],'#bceeff',None)
rect(d,(17,8,18,9),INK);rect(d,(17,8,17,8),CREAM);rect(d,(12,13,17,13),'#7dc8eb');save(im,'fish')
im,d=canvas(20,20)
poly(d,[(6,1),(13,1),(18,6),(18,13),(13,18),(6,18),(1,13),(1,6)],'#eda84d')
poly(d,[(6,3),(13,3),(16,6),(16,13),(13,16),(6,16),(3,13),(3,6)],'#ffdc78',None)
for x,y in [(6,7),(10,5),(14,7)]: rect(d,(x-1,y-1,x,y+1),'#a65b42')
poly(d,[(7,11),(10,9),(13,11),(13,14),(7,14)],'#a65b42',None);save(im,'coin')
im,d=canvas(20,18)
poly(d,[(2,2),(7,1),(10,4),(13,1),(18,2),(19,8),(10,17),(1,8)],INK)
poly(d,[(3,3),(7,3),(10,6),(13,3),(16,3),(17,8),(10,14),(3,8)],'#e65e76',None)
rect(d,(4,4,6,6),'#ffc8b7');rect(d,(9,12,11,13),'#a73d58');save(im,'heart')

for kind in ['hedgehog','bat','crow']:
    sheet,_=canvas(32*4,32)
    for f in range(4):
        im,d=canvas(32,32)
        if kind=='hedgehog':
            poly(d,[(9,22),(7,15),(12,16),(12,10),(16,13),(18,7),(21,12),(25,9),(26,14),(30,13),(29,20),(31,23),(27,27),(11,27)],'#9c6675')
            for x,y in [(15,16),(22,15),(26,20),(18,22)]: rect(d,(x,y,x+2,y+1),'#d49a8d')
            poly(d,[(3,23),(6,17),(12,17),(17,22),(16,27),(5,27)],'#f6d4a2')
            rect(d,(7,20,8,22),INK);rect(d,(2,23,4,24),INK)
            rect(d,(8+(f%2),28,12+(f%2),29),INK);rect(d,(23-(f%2),27,27-(f%2),29),INK)
        else:
            wing=4 if f%2==0 else 15
            color='#865b9f' if kind=='bat' else '#605370'
            poly(d,[(13,15),(7,wing),(2,wing+3),(0,wing+10),(5,wing+8),(9,wing+12),(14,21)],color)
            poly(d,[(19,15),(25,wing),(30,wing+3),(31,wing+10),(26,wing+8),(22,wing+12),(18,21)],color)
            poly(d,[(11,12),(12,8),(15,12),(19,12),(21,8),(22,16),(22,23),(17,27),(11,22)],color)
            rect(d,(13,17,14,18),'#ffd270');rect(d,(19,17,20,18),'#ffd270')
            poly(d,[(14,22),(20,22),(17,25)],'#d89076',None)
            if kind=='crow': poly(d,[(11,17),(6,19),(11,21)],'#ffcf65')
        sheet.paste(im,(32*f,0))
    save(sheet,kind)

for theme,top,dirt in [('forest','#efc861','#b57671'),('mushroom','#e99aaa','#82617d'),('sunset','#ffc668','#97607c')]:
    im,d=canvas(32,32);rect(d,(0,0,31,31),dirt)
    for i in range(15):
        x=random.randrange(1,30);y=random.randrange(8,30)
        rect(d,(x,y,x+2,y+2),random.choice(['#80566b','#d99a80','#ce9a76']))
    rect(d,(0,0,31,3),top);rect(d,(0,4,31,6),'#e99e55' if theme!='mushroom' else '#bc788e')
    for x in range(0,32,6): rect(d,(x,4,x+2,random.randint(7,10)),top)
    for x in range(1,32,7): rect(d,(x,0,x+2,1),CREAM)
    save(im,'ground-'+theme)

im,d=canvas(96,16)
poly(d,[(0,2),(95,2),(95,11),(0,11)],'#bc765d');rect(d,(2,3,93,5),'#ffd488')
for x in range(8,96,16): rect(d,(x,7,x+1,8),INK)
for x in [17,73]: poly(d,[(x-4,12),(x+4,12),(x+2,15),(x-2,15)],'#8c7c8a')
save(im,'moving')
im,d=canvas(32,16)
for x in [0,16]:
    poly(d,[(x,15),(x+7,0),(x+15,15)],'#b4a6c2');poly(d,[(x+3,13),(x+7,4),(x+8,13)],'#fff3da',None)
save(im,'spikes')
for active in [False,True]:
    im,d=canvas(32,56);rect(d,(6,4,8,53),INK);rect(d,(7,4,7,53),'#e8bb91')
    poly(d,[(9,5),(29,5),(24,13),(29,20),(9,20)],'#f0a06e' if active else '#b58b9b')
    if active:
        rect(d,(14,10,16,12),CREAM);rect(d,(19,10,21,12),CREAM);rect(d,(16,14,19,16),CREAM)
    rect(d,(2,53,13,55),INK);save(im,'flag-on' if active else 'flag')
im,d=canvas(48,44);rect(d,(20,16,25,43),'#8c5d5d')
poly(d,[(2,5),(34,5),(45,15),(34,25),(2,25)],'#e8b47b');d.line((5,8,32,8),fill=CREAM)
poly(d,[(25,10),(34,15),(25,20),(25,17),(18,17),(18,13),(25,13)],INK,None);save(im,'sign')
im,d=canvas(64,80)
rect(d,(9,8,15,79),INK);rect(d,(49,8,55,79),INK);rect(d,(12,10,14,79),'#ce9b77');rect(d,(50,10,52,79),'#ce9b77')
poly(d,[(3,7),(31,0),(61,7),(61,22),(3,22)],'#e3ad79')
for x in [19,29,39]: rect(d,(x,10,x+3,15),'#c94758')
poly(d,[(22,40),(38,40),(38,35),(49,45),(38,55),(38,50),(22,50)],'#f4d598');save(im,'gate')

im,d=canvas(144,128)
rect(d,(26,57,118,119),INK);rect(d,(30,57,114,116),'#f2c490')
for y in range(65,115,8): d.line((31,y,114,y),fill='#db9e7e')
rect(d,(99,17,110,46),INK);rect(d,(101,19,108,43),'#bd7b86')
poly(d,[(10,62),(66,9),(130,62),(123,69),(65,23),(18,69)],'#773f59')
poly(d,[(14,60),(66,13),(126,60),(120,60),(66,21),(20,64)],'#c94758')
for y in range(29,58,8): d.line((70+(y-29),y,81+(y-29),y),fill='#f08b7f',width=2)
poly(d,[(22,63),(65,25),(112,63)],'#f9d29a')
rect(d,(62,28,66,60),INK);rect(d,(31,65,35,117),INK);rect(d,(108,65,112,117),INK)
rect(d,(78,76,101,99),INK);rect(d,(81,79,98,96),'#ffe998');rect(d,(88,79,90,96),'#bc7564');rect(d,(81,87,98,89),'#bc7564')
rect(d,(45,78,68,118),INK);rect(d,(48,81,65,115),'#ba7766');rect(d,(51,84,62,98),'#ffde89');rect(d,(61,104,63,106),'#ffe9a6')
rect(d,(41,117,73,121),'#a77c7a');rect(d,(37,122,77,125),'#d8aba0')
for x in [13,121]:
    rect(d,(x,109,x+12,120),'#b26a70');d.ellipse((x-4,100,x+17,113),fill='#a5b478')
save(im,'home')
im,d=canvas(24,72);rect(d,(4,0,6,71),INK);d.line((6,2,17,2),fill=INK,width=2);rect(d,(16,2,17,12),INK)
poly(d,[(11,14),(22,14),(21,29),(12,29)],'#e69565');rect(d,(14,16,19,26),'#ffe7a3');rect(d,(10,12,23,14),INK);save(im,'lantern')
im,d=canvas(8,8);poly(d,[(0,3),(3,2),(4,0),(6,2),(7,5),(4,7),(1,6)],'#e88a65',None);rect(d,(3,3,4,5),'#ffd27a');save(im,'leaf')
im,d=canvas(4,4);rect(d,(1,0,2,3),CREAM);rect(d,(0,1,3,2),CREAM);save(im,'spark')

def leaf_cluster(d,cx,cy,r,palette,rng):
    # Stepped silhouette built from pixel rectangles; nested clusters add shade.
    for i in range(38):
        angle=rng.random()*math.tau;dist=rng.random()*r
        x=int(cx+math.cos(angle)*dist)//2*2;y=int(cy+math.sin(angle)*dist*.62)//2*2
        w=rng.randrange(5,13)*2;h=rng.randrange(3,8)*2
        color=palette[min(len(palette)-1, max(0,int((y-cy+r*.65)/(r*1.3)*len(palette))))]
        rect(d,(x-w//2,y-h//2,x+w//2,y+h//2),color)
    for i in range(24):
        x=int(cx+rng.uniform(-r*.7,r*.7));y=int(cy+rng.uniform(-r*.35,r*.35))
        rect(d,(x,y,x+2,y+1),palette[0])

palettes={
 'forest': ['#ffe7a1','#ffc671','#f29a72','#dd7b86','#b76586'],
 'mushroom': ['#f5bdc1','#d990b4','#b774aa','#965d96','#784d84'],
 'sunset': ['#ffd188','#ffa676','#eb7e82','#cb6688','#a15380'],
}
for theme,palette in palettes.items():
    rng=random.Random(12)
    im,d=canvas(144,208)
    poly(d,[(62,207),(67,91),(50,69),(54,61),(73,81),(87,39),(94,41),(83,96),(86,207)],'#805568')
    poly(d,[(67,207),(72,92),(78,78),(78,207)],'#c78e8c',None)
    d.line((78,119,114,83),fill='#805568',width=7);d.line((70,151,37,117),fill='#805568',width=6)
    for y in range(107,208,15): rect(d,(72,y,77,y+2),'#996b78')
    for cx,cy,r in [(72,48,38),(37,73,28),(106,75,29),(65,86,36),(115,108,19),(29,128,21)]: leaf_cluster(d,cx,cy,r,palette,rng)
    save(im,'tree-'+theme)
    im,d=canvas(80,40);leaf_cluster(d,40,28,32,palette,rng);save(im,'bush-'+theme)
    im,d=canvas(96,104)
    poly(d,[(40,32),(57,32),(61,97),(35,97)],'#f3c6a2');rect(d,(41,39,46,93),'#ffe8c0')
    poly(d,[(4,41),(8,25),(20,13),(36,6),(61,6),(78,16),(89,30),(93,42),(83,49),(14,49)],'#b86488')
    poly(d,[(7,36),(13,23),(28,12),(57,9),(76,19),(86,35)],'#ed91a6',None)
    rect(d,(11,42,86,45),'#ffe1b5')
    for x,y,w in [(23,22,8),(48,16,10),(67,29,9),(37,32,7)]:
        rect(d,(x,y,x+w,y+5),'#fff3da');rect(d,(x+2,y-2,x+w-2,y+7),'#fff3da')
    save(im,'mushroom-'+theme)
    # Transparent parallax scenery; each depth moves independently in Phaser.
    sky,d=canvas(640,360)
    colors={'forest':('#dcebb4','#fff1cd'),'mushroom':('#6d658e','#c59fbc'),'sunset':('#dc8297','#ffd29e')}[theme]
    def rgb(s): return tuple(int(s[i:i+2],16) for i in (1,3,5))
    a,b=rgb(colors[0]),rgb(colors[1])
    for y in range(0,360,4):
        t=y/360;rect(d,(0,y,639,y+3),tuple(int(a[i]*(1-t)+b[i]*t) for i in range(3)))
    d.ellipse((450,40,522,112),fill='#fff0b7' if theme!='mushroom' else '#e4d6dc')
    for x,y in [(30,50),(190,23),(340,80),(550,45)]:
        for dx,dy,w,h in [(0,10,70,9),(10,2,36,18),(23,-4,24,18)]:rect(d,(x+dx,y+dy,x+dx+w,y+dy+h), '#fff3da' if theme=='forest' else '#edb7c1' if theme=='sunset' else '#9c88ac')
    save(sky,'sky-'+theme)
    for layer in ['far','near']:
        im,d=canvas(640,360)
        color=('#b4ca9a' if layer=='far' else '#bf8f9e') if theme=='forest' else ('#9386ad' if layer=='far' else '#806b9b') if theme=='mushroom' else ('#c58a9f' if layer=='far' else '#9c7097')
        rng=random.Random(52 if layer=='far' else 81)
        if layer=='far':
            for x in range(-20,680,48):
                top=rng.randrange(38,110);rect(d,(x,top,x+11,360),color)
                d.line((x+5,top+70,x-25,top+38),fill=color,width=5)
                d.line((x+5,top+90,x+30,top+50),fill=color,width=5)
                leaf_cluster(d,x+4,top+10,36,[color]*5,rng)
        else:
            for x in range(-20,680,50):
                y=rng.randrange(168,215)
                poly(d,[(x-40,360),(x-40,y+28),(x-25,y+28),(x-25,y+12),(x-12,y+12),(x-12,y),(x+12,y),(x+12,y+12),(x+25,y+12),(x+25,y+28),(x+40,y+28),(x+40,360)],color,None)
                for i in range(18):
                    px=x+rng.randrange(-25,26);py=y+rng.randrange(30,135)
                    rect(d,(px,py,px+3,py+2),'#ce9da5' if theme=='forest' else '#a77caa')
        save(im,layer+'-'+theme)
print(f'Generated {len(list(OUT.glob("*.png")))} original PNG assets at {OUT}')
