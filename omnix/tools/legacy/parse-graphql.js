import fs from 'fs';

const types = JSON.parse(fs.readFileSync('graphql.json', 'utf8'));

types.forEach(t => {
  // Look for Object types that aren't mutations or queries
  if (t.kind === 'OBJECT' && !t.name.startsWith('__') && !['Query', 'Mutation'].includes(t.name)) {
    if (t.fields && t.fields.some(f => f.name === 'nodeId' || f.name === 'id')) {
      if (t.name.endsWith('Connection') || t.name.endsWith('Edge') || t.name === 'PageInfo') return;
      console.log(`Table: ${t.name}`);
      t.fields.forEach(f => {
        let isRequired = f.type.kind === 'NON_NULL';
        let typeName = f.type.name || (f.type.ofType && f.type.ofType.name);
        console.log(`  ${f.name}: ${typeName}${isRequired ? ' (REQUIRED)' : ''}`);
      });
      console.log('');
    }
  }
});
