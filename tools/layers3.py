import numpy as np, cv2, json, sys
D='/tmp/claude-0/-home-claude/273c7b77-8ae0-5857-b859-7c6bfc7b30fe/scratchpad/'
# deslocamentos por peça em relação à v2 (template matching) : (dx,dy,scale)
CFG={'v1':dict(cut=522,cable=[(895,792),(905,900),(918,1010),(918,1120)]),'v2':dict(cut=522,cable=[(906,792),(912,880),(930,980),(936,1064)]),'v3':dict(cut=522,cable=[(912,800),(925,900),(935,1000),(935,1130)]),'v4':dict(cut=545,cable=[(905,840),(912,950),(925,1050),(930,1150)])}
OFF={'v2':dict(head=(0,0,1),x=(0,0),l=(0,0),panel=(0,0),bed=(0,0)),
     'v1':dict(head=(6,1,0.95),x=(-4,-8),l=(-2,-6),panel=(-5,-9),bed=(11,-9)),
     'v3':dict(head=(3,1,1.0),x=(12,-7),l=(-8,-6),panel=(-2,-7),bed=(-3,-1)),
     'v4':dict(head=(-3,35,1.05),x=(10,39),l=(3,39),panel=(-2,51),bed=(1,50))}
def run(n):
    o=OFF[n]
    im=cv2.imread(D+'prt3d/'+n+('_clean.png' if n!='v4' else '_clean.png')); H,W=im.shape[:2]
    def pm(pts): m=np.zeros((H,W),np.uint8); cv2.fillPoly(m,[np.array(pts,np.int32)],255); return m
    def sh(pts,d): return [(x+d[0],y+d[1]) for x,y in pts]
    hd=o['head']; hc=(551,700)
    def hp(pts): return [(hc[0]+(x-hc[0])*hd[2]+hd[0], hc[1]+(y-hc[1])*hd[2]+hd[1]) for x,y in pts]
    head=pm(hp([(472,622),(518,622),(518,598),(577,598),(577,622),(628,622),(632,640),(632,792),(620,803),(480,803),(470,792),(470,640)]))
    inlet=hp([(541,600),(549,600),(557,600)]); noz=hp([(547,803)])[0]
    scr=hp([(482,646),(554,738)])
    lb=pm(sh([(226,668),(328,668),(332,700),(330,762),(345,768),(345,800),(318,806),(240,806),(216,796),(214,770),(236,762),(226,755)],o['l']))
    L,X=o['l'],o['x']
    rail=pm([(300+L[0],679+L[1]),(792+X[0],697+X[1]),(792+X[0],772+X[1]),(300+L[0],748+L[1])])
    rb=pm(sh([(782,700),(800,686),(866,684),(866,670),(882,670),(882,684),(940,684),(950,700),(950,786),(938,800),(880,806),(805,800),(796,790),(782,765)],X))
    gantry=lb|rail|rb; gall=gantry|head
    hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV); Hh,S,V=[hsv[...,i].astype(int) for i in range(3)]
    b,g,r=[im[...,i].astype(int) for i in range(3)]
    # ---- tubos: cor saturada / azul claro entre o topo da armação e a entrada da cabeça
    top_y=int(max(p[1] for p in inlet)); y0=CFG[n]['cut']
    col=(((S>70)&(V>110))|((b-r>45)&(V>170))|((V>200)&(S<60))).astype(np.uint8)
    band=np.zeros_like(col); band[y0:top_y+6, 470:780]=1
    tm=col*band
    # remove a barra de cima (cinza claro larga) — só fica o que tem pouca largura por linha
    for y in range(y0,top_y+6):
        xs=np.where(tm[y])[0]
        if not len(xs): continue
        for rr in np.split(xs,np.where(np.diff(xs)>1)[0]+1):
            if len(rr)>26: tm[y,rr]=0
    tm[cv2.dilate(head,np.ones((3,3),np.uint8))>0]=0
    tm=cv2.dilate(tm,np.ones((5,5),np.uint8))
    row=tm[y0+2]; xs=np.where(row)[0]
    starts=[]; tcols=[]
    if len(xs):
        for rr in np.split(xs,np.where(np.diff(xs)>1)[0]+1):
            sx=int(rr.mean()); starts.append((sx,y0))
            pix=im[y0-3:y0,sx-1:sx+2].reshape(-1,3).astype(float)
            pix=pix[np.argsort(pix.sum(1))][len(pix)//3]
            tcols.append('#%02X%02X%02X'%(int(pix[2]),int(pix[1]),int(pix[0])))
    bg=im.astype(np.float32).copy()
    tmb=tm>0
    for y in range(H):
        xs=np.where(tmb[y])[0]
        if not len(xs): continue
        for rr in np.split(xs,np.where(np.diff(xs)>1)[0]+1):
            a,bb=rr[0]-1,rr[-1]+1; t=np.linspace(0,1,len(rr))[:,None]; bg[y,rr]=bg[y,a]*(1-t)+bg[y,bb]*t
    import json as _j
    PVs=_j.load(open(D+'prt3d/variants.json'))[n]['spools']
    spm=np.zeros((H,W),np.uint8)
    import base64 as _b, io as _io
    from PIL import Image as _I
    for sp in PVs:
        a_=np.array(_I.open(_io.BytesIO(_b.b64decode(sp['b64']))).convert('RGBA').resize((sp['w'],sp['h'])))[...,3]
        x0_,y0_=sp['x']+95,sp['y']+60
        spm[y0_:y0_+sp['h'],x0_:x0_+sp['w']]=np.maximum(spm[y0_:y0_+sp['h'],x0_:x0_+sp['w']],(a_>40).astype(np.uint8)*255)
    hsv2=cv2.cvtColor(bg.astype(np.uint8),cv2.COLOR_BGR2HSV)
    up=np.zeros((H,W),np.uint8); up[60:y0+2,330:960]=1
    tub=((hsv2[...,1]>45)&(hsv2[...,2]>90)).astype(np.uint8)*up
    tub[cv2.dilate(spm,np.ones((3,3),np.uint8))>0]=0
    gray=cv2.cvtColor(cv2.cvtColor(bg.astype(np.uint8),cv2.COLOR_BGR2GRAY),cv2.COLOR_GRAY2BGR).astype(np.float32)
    gray=np.minimum(255,gray*1.08+18)
    k=cv2.GaussianBlur(tub.astype(np.float32),(0,0),0.8)[...,None]
    bg=bg*(1-k)+gray*k
    gm=cv2.dilate(gall,np.ones((13,13),np.uint8))>0
    for x in range(W):
        ys=np.where(gm[:,x])[0]
        if not len(ys): continue
        for rr in np.split(ys,np.where(np.diff(ys)>1)[0]+1):
            a,bb=rr[0]-1,rr[-1]+1; ca,cb=bg[max(0,a-6):a+1,x].mean(0),bg[bb:bb+6,x].mean(0)
            t=np.linspace(0,1,len(rr)); t=np.clip((t-0.6)/0.4,0,1)[:,None]; t=t*t*(3-2*t)
            bg[rr,x]=ca*(1-t)+cb*t
    bg=bg.astype(np.uint8)
    # ---- cabo: pixels escuros à direita da coluna, abaixo do bloco X
    pts=CFG[n]['cable']
    cm=np.zeros((H,W),np.uint8)
    if len(pts)>3: cv2.polylines(cm,[np.array(pts,np.int32)],False,255,30)
    cm[cv2.dilate(rb,np.ones((3,3),np.uint8))>0]=0
    bg=cv2.inpaint(bg,cm,7,cv2.INPAINT_TELEA)
    B=o['bed']
    bed=pm(sh([(452,880),(792,903),(792,948),(602,1022),(602,1050),(214,1003),(212,972)],B))
    panel=pm(sh([(646,984),(806,999),(812,1010),(774,1114),(760,1118),(598,1100),(594,1088)],o['panel']))
    bg=cv2.inpaint(bg,cv2.dilate(bed,np.ones((5,5),np.uint8)),9,cv2.INPAINT_TELEA)
    cv2.imwrite(D+f'anim/{n}_bg.png',bg)
    # gantry sem cabeça
    gsrc=im.astype(np.float32).copy(); hm=cv2.dilate(head,np.ones((5,5),np.uint8))>0
    slope=((697+X[1])-(679+L[1]))/((792+X[0])-(300+L[0]))
    for y in range(600,900):
        xs=np.where(hm[y])[0]
        if not len(xs) or not gantry[y,max(0,xs.min()-3)] : continue
        a,bb=xs.min()-1,xs.max()+1
        ya=int(round(y-(xs.mean()-a)*slope)); yb=int(round(y+(bb-xs.mean())*slope))
        t=np.linspace(0,1,bb-a-1)[:,None]; gsrc[y,a+1:bb]=gsrc[ya,a]*(1-t)+gsrc[yb,bb]*t
    gsrc=gsrc.astype(np.uint8)
    def sprite(mask,src,name):
        a=cv2.GaussianBlur(mask.astype(np.float32)/255,(0,0),1.2); rgba=np.dstack([src,(a*255).astype(np.uint8)])
        ys,xs=np.where(a>0.01); x0,x1,y0_,y1=xs.min(),xs.max()+1,ys.min(),ys.max()+1
        cv2.imwrite(D+f'anim/{n}_{name}.png',rgba[y0_:y1,x0:x1]); return [int(x0),int(y0_),int(x1-x0),int(y1-y0_)]
    geo=dict(gantry=sprite(gantry,gsrc,'gantry'),head=sprite(head,im,'head'),bed=sprite(bed,im,'bed'),panel=sprite(panel,im,'panel'),
             inlet=[[round(x,1),round(y,1)] for x,y in inlet],noz=[round(noz[0],1),round(noz[1],1)],scr=[round(scr[0][0]),round(scr[0][1]),round(scr[1][0]-scr[0][0]),round(scr[1][1]-scr[0][1])],
             starts=starts,tcols=tcols,cable=pts,xbottom=[906+X[0],796+X[1]],bedbase=946+B[1]-(0 if n!='v4' else 0),cx=round(noz[0]))
    # debug
    dbg=bg.copy()
    for (sx,sy) in starts: cv2.circle(dbg,(sx,sy),6,(0,0,255),-1)
    for p in pts: cv2.circle(dbg,p,3,(0,255,255),-1)
    cv2.imwrite(D+f'anim/{n}_dbg.png',cv2.resize(dbg[60:1240,95:1040],(472,590)))
    print(n,'tubos',len(starts),tcols,'cabo',len(pts))
    return geo
G={n:run(n) for n in (sys.argv[1:] or ['v1','v2','v3','v4'])}
json.dump(G,open(D+'anim/geo_all.json','w'))
