import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `    try {
      const { q } = req.query;
      const query = (q) || "trending music";
      
      const itunesUrl = \`https://itunes.apple.com/search?term=\${encodeURIComponent(query)}&entity=song&limit=15\`;
      
      const searchResponse = await fetch(itunesUrl);
      const searchData = await searchResponse.json();
      
      const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return \`\${minutes}:\${remainingSeconds.toString().padStart(2, '0')}\`;
      };

      if (!searchResponse.ok) {
        throw new Error("iTunes API error");
      }
      
      if (!searchData.results || searchData.results.length === 0) {
        return res.json([]);
      }
            
      const tracks = searchData.results.map((item) => ({
        id: item.trackId.toString(),
        title: item.trackName,
        artist: item.artistName,
        duration: formatDuration((item.trackTimeMillis || 30000) / 1000),
        coverUrl: item.artworkUrl100,
        previewUrl: item.previewUrl,
        provider: 'itunes',
        isLicensed: false`;

const regex = /try\s*{\s*const { q } = req.query;[\s\S]*?isLicensed: false/m;
code = code.replace(regex, replacement);

fs.writeFileSync('server.ts', code);
