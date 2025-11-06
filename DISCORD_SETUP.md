# Setup Discord Rich Presence

## Cara Menampilkan Status Discord di Portfolio

### 1. Join Discord Server Lanyard (WAJIB)
Kunjungi dan join server ini: https://discord.gg/lanyard

Setelah join, Lanyard akan otomatis tracking Discord presence kamu.

### 2. Verifikasi Setup
Test apakah Lanyard sudah mendeteksi User ID kamu:
```bash
curl https://api.lanyard.rest/v1/users/494169184175915019
```

Jika berhasil, kamu akan melihat data Discord presence kamu.

### 3. Status yang Ditampilkan

Portfolio akan menampilkan:

#### ✅ Status Indicator (Dot warna di avatar)
- 🟢 **Hijau** = Online
- 🟡 **Kuning** = Idle/Away
- 🔴 **Merah** = Do Not Disturb
- ⚪ **Abu-abu** = Offline

#### ✅ Custom Status
Jika kamu set custom status di Discord (contoh: "Law and Justice"), akan muncul card:
```
💬 status:
Law and Justice
```

#### ✅ Game Activity
Jika kamu main game yang support Discord Rich Presence, akan muncul:
```
🎮 playing:
Game Name
Details...
State...
```

#### ✅ Spotify
Jika kamu dengar musik di Spotify, akan muncul:
```
🎵 listening to:
Song Name
by Artist Name
```

### 4. Cara Menampilkan VSCode Activity

VSCode **TIDAK** otomatis muncul di Discord. Untuk menampilkan VSCode:

1. Install extension **Discord Presence** di VSCode
2. Link: https://marketplace.visualstudio.com/items?itemName=icrawl.discord-vscode

Setelah install, Discord akan menampilkan:
- File yang sedang dibuka
- Workspace name
- Language yang digunakan

### 5. Game yang Support Discord Rich Presence

Game-game ini otomatis terdeteksi:
- ✅ Steam games (kebanyakan)
- ✅ Epic Games
- ✅ League of Legends
- ✅ Valorant
- ✅ Minecraft (dengan mod)
- ✅ Roblox
- ✅ Dan banyak lagi...

### 6. Troubleshooting

#### Error: "Failed to fetch Discord status"
- Pastikan sudah join server Lanyard
- Tunggu beberapa detik setelah join
- Restart Discord
- Restart dev server (Ctrl+C lalu `bun dev`)

#### Status tidak muncul
- Cek apakah Discord kamu online
- Pastikan Activity Status tidak di-disable di Discord Settings
- User Settings → Activity Privacy → "Display current activity as a status message" harus ON

#### Game tidak terdeteksi
- Buka Discord Settings
- Game Activity → Add it!
- Pilih game dari list atau manual add

### 7. Update Frequency

Status Discord di-refresh setiap **30 detik** secara otomatis.

---

## Environment Variables

File `.env.local` sudah berisi:
```
DISCORD_USER_ID=494169184175915019
DISCORD_TOKEN=your_bot_token_here
```

`DISCORD_USER_ID` digunakan untuk Lanyard API (untuk status tracking).
`DISCORD_TOKEN` digunakan untuk fetch avatar via Discord Bot API.
