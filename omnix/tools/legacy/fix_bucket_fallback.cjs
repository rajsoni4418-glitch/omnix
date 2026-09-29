const fs = require('fs');
let code = fs.readFileSync('src/lib/storage.ts', 'utf8');

const target = `    } catch (createErr) {
      console.error("Failed to create bucket:", createErr);
      // Fallback for preview environments without storage set up
      console.warn("Falling back to a placeholder image due to missing storage bucket.");
      return 'https://via.placeholder.com/800x800/111111/FFFFFF?text=Placeholder+Image+(Storage+Bucket+Missing)';
    }`;

const replacement = `    } catch (createErr) {
      console.error("Failed to create bucket:", createErr);
      
      // Attempt fallback to 'posts' bucket if 'stories' fails
      if (bucket === 'stories') {
          console.warn("Falling back to 'posts' bucket...");
          let fbRes = await supabase.storage.from('posts').upload(path, file, { upsert: true });
          if (!fbRes.error) {
              return supabase.storage.from('posts').getPublicUrl(path).data.publicUrl;
          }
      }

      // Fallback for preview environments without storage set up
      console.warn("Falling back to a placeholder image due to missing storage bucket.");
      return 'https://via.placeholder.com/800x800/111111/FFFFFF?text=Placeholder+Image+(Storage+Bucket+Missing)';
    }`;

code = code.replace(target, replacement);
fs.writeFileSync('src/lib/storage.ts', code);
