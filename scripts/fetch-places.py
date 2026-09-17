from pathlib import Path
import urllib.request

OUT = Path("public/places")
OUT.mkdir(parents=True, exist_ok=True)

UA = "LoksmaranSIH/1.0 (educational prototype; contact: local-archives)"

# Documentary photographs (Wikimedia Commons thumbs), not generated art.
FILES = {
    "varanasi.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Ahilya_Ghat_by_the_Ganges%2C_Varanasi.jpg/1280px-Ahilya_Ghat_by_the_Ganges%2C_Varanasi.jpg",
    "jaipur.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Hawa_Mahal_2011.jpg/1280px-Hawa_Mahal_2011.jpg",
    "kochi.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Chinese_fishing_nets_at_Fort_Kochi.jpg/1280px-Chinese_fishing_nets_at_Fort_Kochi.jpg",
    "kutch.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Rann_of_Kutch.jpg/1280px-Rann_of_Kutch.jpg",
    "holi.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Festival_of_colours_Holi.jpg/1280px-Festival_of_colours_Holi.jpg",
    "mandawa.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Mandawa-Palace.jpg/1280px-Mandawa-Palace.jpg",
    "bhopal.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Bhopal_Upper_Lake.jpg/1280px-Bhopal_Upper_Lake.jpg",
    "bharatpur.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Keoladeo_National_Park.jpg/1280px-Keoladeo_National_Park.jpg",
    "khonoma.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Khonoma_Village.jpg/1280px-Khonoma_Village.jpg",
    "raghurajpur.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Pattachitra.jpg/1280px-Pattachitra.jpg",
    "pochampally.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Pochampally_saree.jpg/1280px-Pochampally_saree.jpg",
    "dholpur.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Chambal_River.jpg/1280px-Chambal_River.jpg",
    "udaipur.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Lake_Pichola%2C_Udaipur.jpg/1280px-Lake_Pichola%2C_Udaipur.jpg",
    "madurai.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Meenakshi_Amman_Temple_Madurai.jpg/1280px-Meenakshi_Amman_Temple_Madurai.jpg",
}

FALLBACK = {
    "varanasi.jpg": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1600&q=80",
    "jaipur.jpg": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=80",
    "kochi.jpg": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=80",
    "kutch.jpg": "https://images.unsplash.com/photo-1477587458883-47146b5c4e99?auto=format&fit=crop&w=1600&q=80",
    "holi.jpg": "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=1600&q=80",
    "mandawa.jpg": "https://images.unsplash.com/photo-1524492412937-b28074a5d7c5?auto=format&fit=crop&w=1600&q=80",
    "bhopal.jpg": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
    "bharatpur.jpg": "https://images.unsplash.com/photo-1552728089-300173c09031?auto=format&fit=crop&w=1600&q=80",
    "khonoma.jpg": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
    "raghurajpur.jpg": "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1600&q=80",
    "pochampally.jpg": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=80",
    "dholpur.jpg": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    "udaipur.jpg": "https://images.unsplash.com/photo-1617518128005-5f1f1c1c1c1c?auto=format&fit=crop&w=1600&q=80",
    "madurai.jpg": "https://images.unsplash.com/photo-1582510003544-4d00b7f74216?auto=format&fit=crop&w=1600&q=80",
}

def fetch(url: str, dest: Path) -> bool:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            data = r.read()
        if len(data) < 8000:
            return False
        dest.write_bytes(data)
        print("ok", dest.name, len(data))
        return True
    except Exception as e:
        print("fail", dest.name, url, e)
        return False

for name, url in FILES.items():
    dest = OUT / name
    if dest.exists() and dest.stat().st_size > 8000:
        print("have", name)
        continue
    if not fetch(url, dest):
        fb = FALLBACK.get(name)
        if fb:
            fetch(fb, dest)
