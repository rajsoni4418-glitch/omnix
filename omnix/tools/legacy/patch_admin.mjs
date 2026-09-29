import fs from 'fs';
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

// Add Security to navItems
code = code.replace("{ id: 'bans', label: 'Global Ban List', icon: Ban },", "{ id: 'bans', label: 'Global Ban List', icon: Ban },\n      { id: 'security', label: 'Security Center', icon: ShieldAlert },");

// Import ShieldAlert
code = code.replace("import { ", "import { ShieldAlert, ");

// Import AdminSecurity
code = code.replace("import AdminUsers from '../components/admin/AdminUsers';", "import AdminUsers from '../components/admin/AdminUsers';\nimport AdminSecurity from '../components/admin/AdminSecurity';");

// Add case in renderContent
code = code.replace("case 'users': return <AdminUsers />;", "case 'users': return <AdminUsers />;\n      case 'security': return <AdminSecurity />;");

fs.writeFileSync('src/pages/Admin.tsx', code);
