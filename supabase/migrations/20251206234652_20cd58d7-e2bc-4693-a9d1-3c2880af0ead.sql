
-- Insert sample albums
INSERT INTO albums (title, artist, artist_wallet, cover_path) VALUES
('Blockchain Beats', 'CryptoBeats', '0x1234567890abcdef1234567890abcdef12345678', 'demo/album-blockchain-beats.jpg'),
('Monad Sessions', 'The Monad Collective', '0x1234567890abcdef1234567890abcdef12345678', 'demo/album-monad-sessions.jpg'),
('Web3 Vibes', 'DJ Web3', '0x1234567890abcdef1234567890abcdef12345678', 'demo/album-web3-vibes.jpg');

-- Insert sample videos (10 videos, 2 are livestreams)
INSERT INTO videos (title, artist, description, price, is_livestream, artist_wallet, video_path, thumbnail_path) VALUES
('Neon Dreams', 'CryptoBeats', 'A visual journey through digital art', 0.002, false, '0x1234567890abcdef1234567890abcdef12345678', 'demo/neon-dreams.mp4', 'demo/neon-dreams-thumb.jpg'),
('Live from Lagos', 'Afro Nation', 'Live performance from the heart of Africa', 0.005, true, '0x1234567890abcdef1234567890abcdef12345678', 'demo/live-lagos.mp4', 'demo/live-lagos-thumb.jpg'),
('Blockchain Beats Vol. 1', 'DJ Web3', 'The future of music production', 0.001, false, '0x1234567890abcdef1234567890abcdef12345678', 'demo/blockchain-beats.mp4', 'demo/blockchain-beats-thumb.jpg'),
('Midnight Sessions', 'The Monad Collective', 'Late night vibes', 0.003, false, '0x1234567890abcdef1234567890abcdef12345678', 'demo/midnight.mp4', 'demo/midnight-thumb.jpg'),
('Web3 World Tour', 'Global Sounds', 'Documentary series', 0.004, false, '0x1234567890abcdef1234567890abcdef12345678', 'demo/world-tour.mp4', 'demo/world-tour-thumb.jpg'),
('Studio Freestyle', 'RapDAO', 'Behind the scenes freestyle session', 0.002, false, '0x1234567890abcdef1234567890abcdef12345678', 'demo/freestyle.mp4', 'demo/freestyle-thumb.jpg'),
('Electric Dreams Concert', 'SynthWave3', 'Full concert experience', 0.008, false, '0x1234567890abcdef1234567890abcdef12345678', 'demo/concert.mp4', 'demo/concert-thumb.jpg'),
('Making of Crypto Anthem', 'MetaMusic', 'Documentary', 0.001, false, '0x1234567890abcdef1234567890abcdef12345678', 'demo/making-of.mp4', 'demo/making-of-thumb.jpg'),
('Live DJ Set', 'Club Monad', 'Live stream party', 0.005, true, '0x1234567890abcdef1234567890abcdef12345678', 'demo/dj-set.mp4', 'demo/dj-set-thumb.jpg'),
('Acoustic Sessions', 'Indie Chain', 'Unplugged performance', 0.002, false, '0x1234567890abcdef1234567890abcdef12345678', 'demo/acoustic.mp4', 'demo/acoustic-thumb.jpg');

-- Insert sample tracks (12 tracks with varied pricing and crypto themes)
INSERT INTO tracks (title, artist, description, price, artist_wallet, audio_path, cover_path, duration) VALUES
('Crypto Love', 'CryptoBeats', 'A love song for the blockchain', 0.001, '0x1234567890abcdef1234567890abcdef12345678', 'demo/crypto-love.wav', 'demo/crypto-love-cover.jpg', 210),
('Decentralized', 'DJ Web3', 'Future bass anthem', 0.002, '0x1234567890abcdef1234567890abcdef12345678', 'demo/decentralized.wav', 'demo/decentralized-cover.jpg', 195),
('Monad Nights', 'The Monad Collective', 'Chill lo-fi vibes', 0.001, '0x1234567890abcdef1234567890abcdef12345678', 'demo/monad-nights.wav', 'demo/monad-nights-cover.jpg', 240),
('Gas Fee Blues', 'RapDAO', 'Hip-hop track about crypto life', 0.003, '0x1234567890abcdef1234567890abcdef12345678', 'demo/gas-fee.wav', 'demo/gas-fee-cover.jpg', 180),
('To The Moon', 'SynthWave3', 'Synthwave journey', 0.002, '0x1234567890abcdef1234567890abcdef12345678', 'demo/moon.wav', 'demo/moon-cover.jpg', 265),
('Diamond Hands', 'MetaMusic', 'Rock anthem', 0.001, '0x1234567890abcdef1234567890abcdef12345678', 'demo/diamond.wav', 'demo/diamond-cover.jpg', 225),
('NFT Dreams', 'Indie Chain', 'Indie pop', 0.001, '0x1234567890abcdef1234567890abcdef12345678', 'demo/nft-dreams.wav', 'demo/nft-dreams-cover.jpg', 200),
('Wallet Connect', 'Afro Nation', 'Afrobeats banger', 0.002, '0x1234567890abcdef1234567890abcdef12345678', 'demo/wallet-connect.wav', 'demo/wallet-connect-cover.jpg', 190),
('Smart Contract', 'Global Sounds', 'Electronic dance', 0.003, '0x1234567890abcdef1234567890abcdef12345678', 'demo/smart-contract.wav', 'demo/smart-contract-cover.jpg', 215),
('Hash Rate', 'Club Monad', 'Techno', 0.002, '0x1234567890abcdef1234567890abcdef12345678', 'demo/hash-rate.wav', 'demo/hash-rate-cover.jpg', 280),
('Genesis Block', 'CryptoBeats', 'Orchestral epic', 0.004, '0x1234567890abcdef1234567890abcdef12345678', 'demo/genesis.wav', 'demo/genesis-cover.jpg', 320),
('Proof of Work', 'DJ Web3', 'Drum and bass', 0.002, '0x1234567890abcdef1234567890abcdef12345678', 'demo/proof-of-work.wav', 'demo/proof-of-work-cover.jpg', 205);
