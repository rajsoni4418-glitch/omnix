import fs from 'fs';

let code = fs.readFileSync('src/components/Feed.tsx', 'utf8');

const importStatement = "import PostSkeleton from './performance/PostSkeleton';\n";

if (!code.includes('PostSkeleton')) {
    code = code.replace("import PostCard from './PostCard';", "import PostCard from './PostCard';\n" + importStatement);
    
    const targetFooter = `Footer: () => (
              <div className="p-8 flex justify-center h-20">
                {isFetchingNextPage ? (
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                ) : hasNextPage ? (
                  <div className="w-6 h-6 border-2 border-zinc-800 border-t-purple-500 rounded-full animate-spin" />
                ) : (
                  <span className="text-zinc-500">You're all caught up!</span>
                )}
              </div>
            )`;

    const replacementFooter = `Footer: () => {
              if (isFetchingNextPage) {
                return (
                  <div className="flex flex-col">
                    <PostSkeleton />
                  </div>
                );
              }
              if (!hasNextPage && postsArray.length > 0) {
                return (
                  <div className="p-8 flex justify-center">
                    <span className="text-zinc-500 font-medium">You're all caught up! ✨</span>
                  </div>
                );
              }
              return <div className="h-20" />;
            }`;

    code = code.replace(targetFooter, replacementFooter);
    
    // Initial loading state skeleton
    const targetPending = `) : status === 'pending' ? (
        <div className="p-8 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) :`;
      
    const replacementPending = `) : status === 'pending' ? (
        <div className="flex flex-col">
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) :`;

    code = code.replace(targetPending, replacementPending);

    fs.writeFileSync('src/components/Feed.tsx', code);
}
