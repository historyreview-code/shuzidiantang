"""数学之美 | Procedural film. Python 3, numpy, Pillow, imageio-ffmpeg.
Run: python math_in_motion.py. Outputs a 720×1280, 36s MP4 and poster.
All geometry, animation, and music are generated here, without stock assets.
"""
from pathlib import Path
import math, subprocess, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio_ffmpeg

OUT = Path(__file__).resolve().parent
W,H,FPS,DURATION = 720,1280,30,36
N=1600
u=np.linspace(0,1,N)
theta=u*2*np.pi
cn='/System/Library/Fonts/Hiragino Sans GB.ttc'
en='/System/Library/Fonts/Avenir Next.ttc'
mono='/System/Library/Fonts/Menlo.ttc'
def font(size, face=cn): return ImageFont.truetype(face,size)
F={s:font(s) for s in [22,26,32,52,64]}
def smooth(x):
    x=np.clip(x,0,1)
    return x*x*x*(x*(x*6-15)+10)

def shape(k,t):
    if k==0:
        a=theta+t*.13
        r=np.full(N,240.0)
        return np.c_[r*np.cos(a),r*np.sin(a),np.sin(theta*3+t)*.25]
    if k==1:
        a=np.arange(N)*np.pi*(3-np.sqrt(5))+t*.055
        r=280*np.sqrt(u)
        return np.c_[r*np.cos(a),r*np.sin(a),u*.4]
    if k==2:
        row=np.arange(N)//80
        x=np.tile(np.linspace(-300,300,80),20)
        y=(row-9.5)*19+42*np.sin(x/95+t*.9+row*.21)+24*np.sin(x/47-t*.65)
        return np.c_[x,y,np.sin(x/95+row*.21+t)*.4]
    if k==3:
        a=theta*40+t*.18
        b=theta*7-t*.25
        x=(180+75*np.cos(b))*np.cos(a)
        z=(180+75*np.cos(b))*np.sin(a)
        y=75*np.sin(b)
        ang=.8+.2*np.sin(t*.2)
        yy=y*np.cos(ang)-z*np.sin(ang)
        zz=y*np.sin(ang)+z*np.cos(ang)
        return np.c_[x,yy,zz/320]
    if k==4:
        a=theta*2+t*.07
        r=275*np.cos(5*theta*2)
        return np.c_[r*np.cos(a),r*np.sin(a),.5*np.sin(theta*10+t*.2)]
    a=theta+t*.1
    r=235+9*np.sin(theta*8+t*.5)
    return np.c_[r*np.cos(a),r*np.sin(a),np.sin(theta)*.3]

chapters=[('从一个圆开始','A SINGLE IDEA','x² + y² = r²','让简单，长出无限。'),
          ('秩序，自然生长','THE GOLDEN ANGLE','α = π(3 − √5)','每一次转身，都恰到好处。'),
          ('万物，都在共振','SUPERPOSITION','y = sin(x) + sin(2x)','不同的节奏，相遇成为和声。'),
          ('空间，向内折叠','THE TORUS','(R + r cos v) · (cos u, sin u)','让想象，多一个维度。'),
          ('一条曲线，开成花','POLAR ROSE','r = a cos(5θ)','重复之中，藏着惊喜。'),
          ('数学，是看见美','BEAUTY IN MATHEMATICS','∞','也是看见世界的另一种方式。')]

yy,xx=np.mgrid[0:H,0:W]
halo=np.exp(-((xx-W*.5)**2/(W*.55)**2+(yy-H*.49)**2/(H*.34)**2)*2)
rng=np.random.default_rng(21)
grain=rng.normal(0,.55,(H,W))
bg=np.stack([6+halo*5+grain,11+halo*14+grain,23+halo*22+grain],axis=-1)
bg=Image.fromarray(np.uint8(np.clip(bg,0,255)))
stars=np.c_[rng.uniform(28,W-28,90),rng.uniform(310,1010,90),rng.uniform(.2,1,90)]

def centered(draw,y,txt,f,fill):
    box=draw.textbbox((0,0),txt,font=f)
    draw.text(((W-box[2]+box[0])/2,y),txt,font=f,fill=fill)

def frame(t):
    k=min(int(t//6),5)
    local=t-k*6
    p=shape(k,t)
    if k>0:
        blend=smooth(local/1.8)
        p=shape(k-1,t)*(1-blend)+p*blend
    image=bg.copy()
    d=ImageDraw.Draw(image)
    for sx,sy,s in stars:
        v=int(30+25*s*(.7+.3*np.sin(t*.5+sx)))
        d.ellipse((sx,sy,sx+1,sy+1),fill=(v,v+8,v+17))
    d.arc((70,350,650,930),0,360,fill=(22,40,57),width=1)
    for angle in np.linspace(0,2*np.pi,60,endpoint=False):
        r=300
        x,y=360+r*np.cos(angle),640+r*np.sin(angle)
        r2=r+(7 if round(angle/(2*np.pi)*60)%5==0 else 3)
        d.line((x,y,360+r2*np.cos(angle),640+r2*np.sin(angle)),fill=(37,61,76))
    particles=Image.new('RGB',(W,H))
    pd=ImageDraw.Draw(particles)
    color_mix=(np.sin(u*2*np.pi+t*.17)+1)*.5
    aqua=np.array([77,214,230]); gold=np.array([255,195,108])
    for j in np.argsort(p[:,2]):
        x,y,z=p[j]
        depth=.74+.26*(z+1)/2
        c=tuple(np.uint8((aqua*(1-color_mix[j])+gold*color_mix[j])*depth))
        radius=1.0+(z+1)*.55
        pd.ellipse((x+360-radius,y+640-radius,x+360+radius,y+640+radius),fill=c)
    glow=particles.resize((W//3,H//3)).filter(ImageFilter.GaussianBlur(3)).resize((W,H))
    arr=np.asarray(image,dtype=np.float32)+np.asarray(glow,dtype=np.float32)*1.7+np.asarray(particles,dtype=np.float32)
    image=Image.fromarray(np.uint8(np.clip(arr,0,255)))
    d=ImageDraw.Draw(image)
    d.text((48,48),'FORM / 形与数',font=font(21,en),fill=(150,176,190))
    d.text((600,50),f'{k+1:02d} / 06',font=font(18,mono),fill=(150,176,190))
    d.line((48,95,672,95),fill=(40,60,75))
    # Fade text independently during each continuous particle morph.
    fade=smooth(local/.9)*(1-smooth((local-5.25)/.75))
    layer=Image.new('RGBA',(W,H)); ld=ImageDraw.Draw(layer)
    title,label,equation,sub=chapters[k]
    centered(ld,150,label,font(19,en),(117,204,216,255))
    centered(ld,197,title,F[52],(235,238,231,255))
    centered(ld,1010,equation,font(24,mono),(226,192,137,255))
    centered(ld,1080,sub,F[26],(165,185,198,255))
    layer.putalpha(layer.getchannel('A').point(lambda a:int(a*fade)))
    image=Image.alpha_composite(image.convert('RGBA'),layer).convert('RGB')
    d=ImageDraw.Draw(image)
    d.line((48,1185,672,1185),fill=(36,54,68),width=2)
    d.line((48,1185,48+624*t/DURATION,1185),fill=(116,204,215),width=2)
    d.text((48,1210),'MATHEMATICS IN MOTION',font=font(16,en),fill=(108,136,154))
    d.text((603,1210),f'{int(t):02d}:00',font=font(16,mono),fill=(108,136,154))
    final_fade=smooth(t/1.1)*(1-smooth((t-35)/1))
    if final_fade<1: image=Image.fromarray((np.asarray(image)*final_fade).astype('uint8'))
    return image

def music():
    sr=44100
    time=np.arange(sr*DURATION)/sr
    stereo=np.zeros((len(time),2))
    chords=[[130.8128,195.9977,261.6256,329.6276],
            [110,164.8138,220,261.6256],
            [87.3071,130.8128,174.6141,220],
            [97.9989,146.8324,195.9977,293.6648],
            [130.8128,195.9977,261.6256,329.6276],
            [130.8128,195.9977,261.6256,391.9954]]
    for idx,chord in enumerate(chords):
        rel=time-idx*6
        env=np.clip(rel/1.8,0,1)*np.clip((8-rel)/2.5,0,1)
        for j,f in enumerate(chord):
            for channel in range(2):
                freq=f*(1+(.0008 if channel else -.0008))
                stereo[:,channel]+=.045*env*(np.sin(2*np.pi*freq*time)+.18*np.sin(2*np.pi*freq*2*time))
        for beat in range(8):
            start=idx*6+beat*.75
            r=time-start
            env2=np.where(r>=0,np.exp(-np.maximum(r,0)*2.2)*(1-np.exp(-np.maximum(r,0)*40)),0)
            f=chord[[0,2,1,3,2,1,3,2][beat]]*4
            note=.07*env2*(np.sin(2*np.pi*f*r)+.2*np.sin(2*np.pi*f*2*r))
            stereo[:,0]+=note*(.7+.25*np.sin(beat))
            stereo[:,1]+=note*(.7-.25*np.sin(beat))
    stereo*= (np.clip(time/2,0,1)*np.clip((DURATION-time)/3,0,1))[:,None]
    stereo=np.tanh(stereo)*.78
    path=OUT/'score.wav'
    with wave.open(str(path),'w') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((stereo*32767).astype('<i2').tobytes())
    return path

def main():
    ff=imageio_ffmpeg.get_ffmpeg_exe()
    audio=music()
    video=OUT/'数学之美.mp4'
    cmd=[ff,'-y','-f','rawvideo','-vcodec','rawvideo','-s',f'{W}x{H}',
         '-pix_fmt','rgb24','-r',str(FPS),'-i','-','-i',str(audio),
         '-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p',
         '-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',str(video)]
    proc=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.DEVNULL)
    for n in range(FPS*DURATION):
        im=frame(n/FPS)
        proc.stdin.write(im.tobytes())
        if n==8*FPS: im.save(OUT/'数学之美_封面.jpg',quality=95)
        if n%(FPS*6)==0: print(f'Rendered {n//FPS}/{DURATION}s',flush=True)
    proc.stdin.close()
    if proc.wait()!=0: raise RuntimeError('Video encoding failed')
    audio.unlink()
    print(video,flush=True)

if __name__=='__main__': main()
