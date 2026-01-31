

# Generate BAYC-Themed Seed Data for Read, Listen, Watch Pages

## Overview

This plan creates comprehensive seed data themed around **Bored Ape Yacht Club (BAYC)**, **ApeChain**, **Otherside**, and the broader BAYC ecosystem. The data will populate all three content pages (Read, Listen, Watch) with realistic, cohesive content.

---

## Current State

| Table | Current Records | Purpose |
|-------|-----------------|---------|
| `music_tracks` | 0 | Audio tracks for Listen page |
| `music_videos` | 0 | Videos for Watch page |
| `music_albums` | 0 | Album groupings |
| `articles` | 0 | Articles for Read page |
| `mog_posts` | 8 | Vertical feed content (already BAYC themed) |

The pages currently show empty states because there's no data in the core tables.

---

## Content Strategy

### Theme: Bored Ape Yacht Club Ecosystem
- **Artists**: BAYC-inspired artist names (ApeFest DJ, Mutant Soundz, Otherside Orchestra)
- **Content**: Topics around ApeCoin, ApeChain, Yuga Labs, Otherside metaverse, NFT culture
- **Visual**: Using IPFS/external BAYC-themed placeholder images

---

## Implementation Plan

### 1. Create SQL Migration for Seed Data

A single migration file that inserts:

#### A. Music Albums (5 albums)
```sql
INSERT INTO music_albums (title, artist, cover_path, description, release_date)
VALUES
('Yacht Club Vibes', 'Bored Ape DJ Collective', 'https://picsum.photos/seed/bayc-album1/400/400', 'The official soundtrack of the Bored Ape Yacht Club', '2025-01-15'),
('Mutant Sessions Vol. 1', 'Mutant Ape Soundz', 'https://picsum.photos/seed/mayc-album/400/400', 'Experimental beats from the Mutant Ape community', '2025-01-10'),
...
```

#### B. Music Tracks (15 tracks)
Themed track names:
- "ApeCoin Anthem"
- "Swamp Club (Mutant Mix)"
- "Otherside Dreams"
- "10K Strong"
- "Diamond Hands Forever"
- "Serum Saga"
- "Koda's Lullaby"
- "Gas Fees Blues"
- "Yacht Party All Night"
- "BAYC Genesis"
- "Degen Summer"
- "Floor Price Feelings"
- "The Swap Shop"
- "Ape Together Strong"
- "Moonwalk on Otherside"

Each with:
- BAYC-themed artist names
- Realistic pricing ($0.001 - $0.005)
- Duration (180-300 seconds)
- External cover images via picsum.photos with BAYC-themed seeds

#### C. Music Videos (12 videos)
Video content types:
- **Music Videos**: "ApeFest 2025 Recap", "Mutant Ape Transformation"
- **Documentaries**: "The Story of BAYC", "Building ApeChain"
- **Live Performances**: "Live from ApeFest Las Vegas"
- **Behind the Scenes**: "Inside Yuga Labs"
- **Livestreams**: "ApeDAO Weekly Town Hall", "Otherside Land Sale Live"

Each with:
- Reuse existing video files (`/videos/unitrailer.mov`, etc.)
- External thumbnail images
- Pricing ($0.002 - $0.008)
- 2 marked as livestreams

#### D. Articles (10 articles)
Article topics for the Read page:
1. "The Rise of BAYC: From 0.08 ETH to Cultural Phenomenon"
2. "ApeChain Explained: The Entertainment Layer of Web3"
3. "ApeCoin Utility: Beyond Just a Token"
4. "Otherside Metaverse: The Next Digital Frontier"
5. "BAYC x BMW: When Web3 Meets Automotive"
6. "The Mutant Ape Serum: Mechanics and Rarity"
7. "Yuga Labs: Building the Future of Digital Ownership"
8. "ApeFest Through the Years: A Visual Journey"
9. "Koda NFTs: The Mysterious Creatures of Otherside"
10. "How BAYC Changed NFT Community Building Forever"

---

## Database Schema Mapping

### music_tracks
| Field | Sample Value |
|-------|--------------|
| title | "ApeCoin Anthem" |
| artist | "Bored Ape DJ Collective" |
| cover_path | "https://picsum.photos/seed/bayc-track1/400/400" |
| audio_path | NULL (demo/placeholder) |
| price | 0.002 |
| artist_wallet | "0x..." |
| description | "The official ApeCoin community anthem" |
| duration | 245 |
| album_id | (reference) |

### music_videos
| Field | Sample Value |
|-------|--------------|
| title | "ApeFest 2025 Las Vegas Recap" |
| artist | "ApeFest Official" |
| thumbnail_path | "https://picsum.photos/seed/apefest-vid/800/450" |
| video_path | "/videos/unitrailer.mov" |
| price | 0.005 |
| is_livestream | false |
| duration | 420 |

### articles
| Field | Sample Value |
|-------|--------------|
| title | "The Rise of BAYC: From 0.08 ETH to Cultural Phenomenon" |
| author | "CryptoJournalist" |
| excerpt | "How 10,000 cartoon apes became..." |
| image_url | "https://picsum.photos/seed/bayc-article1/800/600" |
| tags | ['BAYC', 'NFT', 'Web3'] |
| topics | ['NFT History', 'Digital Art'] |

---

## File Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/[timestamp]_bayc_seed_data.sql` | Create | SQL migration with all BAYC-themed seed data |

---

## Technical Notes

### Image Strategy
Using `picsum.photos` with themed seeds for consistent, cacheable placeholder images:
- Album covers: `https://picsum.photos/seed/bayc-album1/400/400`
- Track covers: `https://picsum.photos/seed/bayc-track1/400/400`
- Video thumbnails: `https://picsum.photos/seed/apefest-vid/800/450`
- Article images: `https://picsum.photos/seed/bayc-article1/800/600`

### Video Strategy
Reusing the 3 existing video files in rotation:
- `/videos/unitrailer.mov`
- `/videos/live-from-lagos.mov`
- `/videos/escape-from-planet-universal.mov`

### Wallet Addresses
Using placeholder Ethereum addresses in the format: `0x...` (42 characters each)

---

## Sample Seed Data Preview

### Tracks Preview
| Title | Artist | Price |
|-------|--------|-------|
| ApeCoin Anthem | Bored Ape DJ Collective | $0.002 |
| Swamp Club (Mutant Mix) | Mutant Ape Soundz | $0.003 |
| Otherside Dreams | Koda Orchestra | $0.001 |
| 10K Strong | BAYC All-Stars | $0.002 |
| Diamond Hands Forever | HODLers United | $0.002 |

### Videos Preview
| Title | Artist | Type |
|-------|--------|------|
| ApeFest 2025 Las Vegas Recap | ApeFest Official | Music Video |
| The Story of BAYC | Yuga Labs | Documentary |
| Live from ComplexCon | Bored Ape DJ | Live (Stream) |

### Articles Preview
| Title | Author |
|-------|--------|
| The Rise of BAYC | CryptoVision |
| ApeChain Explained | BlockchainToday |
| Inside Otherside | MetaverseNews |

