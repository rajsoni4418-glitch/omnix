import fs from 'fs';
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace("import AdminUsers from './admin/AdminUsers';", "import AdminUsers from './admin/AdminUsers';\nimport AdminSecurity from '../components/admin/AdminSecurity';");
code = code.replace("import { ShieldAlert, useNavigate } from 'react-router-dom';", "import { useNavigate } from 'react-router-dom';");

fs.writeFileSync('src/pages/Admin.tsx', code);
