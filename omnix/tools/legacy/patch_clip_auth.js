import fs from 'fs';
let code = fs.readFileSync('src/components/omniclips/Clip.tsx', 'utf8');

code = code.replace(
  "import OptimizedImage from '../performance/OptimizedImage';",
  "import OptimizedImage from '../performance/OptimizedImage';\nimport { useAuthStore } from '../../store/authStore';\nimport { supabase } from '../../lib/supabase';"
);

code = code.replace(
  "export default function Clip({ clip, isActive, isNext, onLike, onOpenComments, onShare }: ClipProps) {",
  "export default function Clip({ clip, isActive, isNext, onLike, onOpenComments, onShare }: ClipProps) {\n  const { user } = useAuthStore();"
);

code = code.replace(
  "const [isLiked, setIsLiked] = useState(false); // In a real app, this comes from db",
  "const [isLiked, setIsLiked] = useState(clip.has_liked || false);"
);

const handleLikeStr = `  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount(p => newLiked ? p + 1 : p - 1);
    onLike();
    
    try {
      if (newLiked) {
        await supabase.from('clip_likes').insert({ clip_id: clip.id, user_id: user.id });
      } else {
        await supabase.from('clip_likes').delete().eq('clip_id', clip.id).eq('user_id', user.id);
      }
    } catch(err) {
      console.error(err);
      setIsLiked(!newLiked);
      setLikesCount(p => newLiked ? p - 1 : p + 1);
    }
  };`;

code = code.replace(
  /const handleLike = \(e: React.MouseEvent\) => {[\s\S]*?onLike\(\);\n  };/,
  handleLikeStr
);

fs.writeFileSync('src/components/omniclips/Clip.tsx', code);
