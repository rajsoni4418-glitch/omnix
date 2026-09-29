import fs from 'fs';

let code = fs.readFileSync('src/main.tsx', 'utf8');

const importStatement = "import DevPerformancePanel from './components/performance/DevPerformancePanel';\n";

if (!code.includes('DevPerformancePanel')) {
    code = code.replace("import App from './App.tsx';", "import App from './App.tsx';\n" + importStatement);
    
    code = code.replace(
        "<QueryClientProvider client={queryClient}>", 
        "<QueryClientProvider client={queryClient}>\n        <DevPerformancePanel />"
    );
    
    fs.writeFileSync('src/main.tsx', code);
}
