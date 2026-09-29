import fs from 'fs';

let code = fs.readFileSync('src/main.tsx', 'utf8');

const importStatement = "import OfflineIndicator from './components/performance/OfflineIndicator';\n";

if (!code.includes('OfflineIndicator')) {
    code = code.replace("import App from './App.tsx';", "import App from './App.tsx';\n" + importStatement);
    
    code = code.replace(
        "<QueryClientProvider client={queryClient}>", 
        "<QueryClientProvider client={queryClient}>\n        <OfflineIndicator />"
    );
    
    fs.writeFileSync('src/main.tsx', code);
}
