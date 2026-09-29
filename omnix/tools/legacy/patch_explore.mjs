import fs from 'fs';

let code = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

const importStatement = `import OptimizedImage from '../components/performance/OptimizedImage';
import OptimizedVideo from '../components/performance/OptimizedVideo';\n`;

if (!code.includes('OptimizedImage')) {
    code = code.replace("import { Link } from 'react-router-dom';", "import { Link } from 'react-router-dom';\n" + importStatement);
    
    // Replace Video
    code = code.replace(
        /<video\s+src=\{mediaUrl\}\s+className="w-full h-full object-cover"\s+muted\s+loop\s+playsInline\s+onMouseEnter=\{\(e\) => e\.currentTarget\.play\(\)\}\s+onMouseLeave=\{\(e\) => e\.currentTarget\.pause\(\)\}\s+\/>/m,
        `<OptimizedVideo src={mediaUrl} className="w-full h-full object-cover" muted loop playsInline onMouseEnter={(e) => e.currentTarget.play()} onMouseLeave={(e) => e.currentTarget.pause()} />`
    );
    
    // Replace Image
    code = code.replace(
        /<img loading="lazy"\s+src=\{mediaUrl\}\s+alt="Explore"\s+className="w-full h-auto object-cover"\s+\/>/m,
        `<OptimizedImage src={mediaUrl} alt="Explore" className="w-full h-auto" objectFit="cover" />`
    );

    fs.writeFileSync('src/pages/Explore.tsx', code);
}
