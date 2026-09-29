const fs = require('fs');
let code = fs.readFileSync('src/components/story/StoryViewer.tsx', 'utf8');
code = code.replace(
  "import { X, Volume2, VolumeX, MoreHorizontal, Send, Heart, MessageCircle, Share2, Eye, Flame, Smile, ShieldAlert, Sparkles, Pin } from 'lucide-react';",
  "import { X, Volume2, VolumeX, MoreHorizontal, Send, Heart, MessageCircle, Share2, Eye, Flame, Smile, ShieldAlert, Sparkles, Pin, Music } from 'lucide-react';"
);
fs.writeFileSync('src/components/story/StoryViewer.tsx', code);
