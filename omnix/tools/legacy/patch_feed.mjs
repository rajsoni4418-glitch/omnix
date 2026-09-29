import fs from 'fs';

let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

const importStatement = "import { Virtuoso } from 'react-virtuoso';\n";

if (!code.includes('Virtuoso')) {
    code = code.replace("import PostCard from './PostCard';", importStatement + "import PostCard from './PostCard';");
    
    // Replace the mapping logic with Virtuoso
    const target = `<div className="flex flex-col">
          {postsArray.map((post) => (
            <PostCard key={post.id} post={post} onDelete={() => refetch()} />
          ))}
          
          <div ref={ref} className="p-8 flex justify-center h-20">
            {isFetchingNextPage ? (
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            ) : hasNextPage ? (
              <div className="w-6 h-6 border-2 border-zinc-800 border-t-purple-500 rounded-full animate-spin" /> // Preload spinner
            ) : (
              <span className="text-zinc-500">You're all caught up!</span>
            )}
          </div>
        </div>`;
        
    const replacement = `<Virtuoso
          useWindowScroll
          data={postsArray}
          endReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          itemContent={(index, post) => (
            <PostCard key={post.id} post={post} onDelete={() => refetch()} />
          )}
          components={{
            Footer: () => (
              <div className="p-8 flex justify-center h-20">
                {isFetchingNextPage ? (
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                ) : hasNextPage ? (
                  <div className="w-6 h-6 border-2 border-zinc-800 border-t-purple-500 rounded-full animate-spin" />
                ) : (
                  <span className="text-zinc-500">You're all caught up!</span>
                )}
              </div>
            )
          }}
        />`;
        
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/Feed.tsx', code);
}
