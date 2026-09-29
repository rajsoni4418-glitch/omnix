import fs from 'fs';

let code = fs.readFileSync('src/components/PostCard.tsx', 'utf8');

const importStatement = `import OptimizedImage from './performance/OptimizedImage';
import OptimizedVideo from './performance/OptimizedVideo';\n`;

if (!code.includes('OptimizedImage')) {
    code = code.replace("import React,", importStatement + "import React,");
    
    // Avatar image
    code = code.replace(
        /<img loading="lazy" src=\{profile\.avatar_url\}.*?className="w-full h-full object-cover" \/>/g, 
        `<OptimizedImage src={profile.avatar_url} alt={profile.username || 'user'} className="w-full h-full" objectFit="cover" />`
    );
    
    // Media image
    code = code.replace(
        /<img loading="lazy" src=\{mediaList\[currentMediaIndex\]\}.*?className="w-full max-h-\[600px\] object-contain select-none pointer-events-none" \/>/g, 
        `<OptimizedImage src={mediaList[currentMediaIndex]} alt="Post media" className="w-full max-h-[600px] select-none pointer-events-none" objectFit="contain" />`
    );
    
    // Video
    code = code.replace(
        /<video src=\{mediaList\[currentMediaIndex\]\} controls playsInline className="w-full max-h-\[600px\] object-contain" \/>/g, 
        `<OptimizedVideo src={mediaList[currentMediaIndex]} controls playsInline className="w-full h-full max-h-[600px]" />`
    );
    
    fs.writeFileSync('src/components/PostCard.tsx', code);
}
