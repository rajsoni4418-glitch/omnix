import fs from 'fs';

let code = fs.readFileSync('src/main.tsx', 'utf8');

const importStatement = "import BackgroundSync from './components/performance/BackgroundSync';\n";

if (!code.includes('BackgroundSync')) {
    code = code.replace("import App from './App.tsx';", "import App from './App.tsx';\n" + importStatement);
    
    code = code.replace(
        "<QueryClientProvider client={queryClient}>", 
        "<QueryClientProvider client={queryClient}>\n        <BackgroundSync />"
    );
    
    fs.writeFileSync('src/main.tsx', code);
}
