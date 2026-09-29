(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x3) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x3, {
    get: (a, b2) => (typeof require !== "undefined" ? require : a)[b2]
  }) : x3)(function(x3) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x3 + '" is not supported');
  });
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // src/pages/Home.tsx
  var import_react_router_dom5 = __require("react-router-dom");
  var import_lucide_react16 = __require("lucide-react");

  // src/components/StoriesBar.tsx
  var import_react9 = __require("react");
  var import_react_query = __require("@tanstack/react-query");

  // src/lib/supabase.ts
  var import_supabase_js = __require("@supabase/supabase-js");
  var import_meta = {};
  var rawUrl = import_meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
  var supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "");
  var supabaseAnonKey = import_meta.env.VITE_SUPABASE_ANON_KEY || "placeholder";
  var supabase = (0, import_supabase_js.createClient)(supabaseUrl, supabaseAnonKey);
  var originalGetUser = supabase.auth.getUser.bind(supabase.auth);
  var cachedUser = null;
  var cachedPromise = null;
  var lastFetchTime = 0;
  var CACHE_DURATION = 1e3 * 60 * 5;
  supabase.auth.getUser = async function(jwt) {
    if (jwt) {
      return originalGetUser(jwt);
    }
    const now = Date.now();
    if (cachedUser && now - lastFetchTime < CACHE_DURATION) {
      return { data: { user: cachedUser }, error: null };
    }
    if (cachedPromise) {
      return cachedPromise;
    }
    cachedPromise = (async () => {
      try {
        const response = await originalGetUser();
        if (response.error) {
          cachedPromise = null;
          return response;
        }
        cachedUser = response.data.user;
        lastFetchTime = Date.now();
        cachedPromise = null;
        return response;
      } catch (err) {
        cachedPromise = null;
        throw err;
      }
    })();
    return cachedPromise;
  };
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT" || !session) {
      cachedUser = null;
      lastFetchTime = 0;
    } else if (session?.user) {
      cachedUser = session.user;
      lastFetchTime = Date.now();
    }
  });

  // node_modules/zustand/esm/vanilla.mjs
  var createStoreImpl = (createState2) => {
    let state;
    const listeners = /* @__PURE__ */ new Set();
    const setState = (partial, replace) => {
      const nextState = typeof partial === "function" ? partial(state) : partial;
      if (!Object.is(nextState, state)) {
        const previousState = state;
        state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
        listeners.forEach((listener) => listener(state, previousState));
      }
    };
    const getState2 = () => state;
    const getInitialState = () => initialState2;
    const subscribe = (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    };
    const api = { setState, getState: getState2, getInitialState, subscribe };
    const initialState2 = state = createState2(setState, getState2, api);
    return api;
  };
  var createStore = ((createState2) => createState2 ? createStoreImpl(createState2) : createStoreImpl);

  // node_modules/zustand/esm/react.mjs
  var import_react = __toESM(__require("react"), 1);
  var identity = (arg) => arg;
  function useStore(api, selector = identity) {
    const slice = import_react.default.useSyncExternalStore(
      api.subscribe,
      import_react.default.useCallback(() => selector(api.getState()), [api, selector]),
      import_react.default.useCallback(() => selector(api.getInitialState()), [api, selector])
    );
    import_react.default.useDebugValue(slice);
    return slice;
  }
  var createImpl = (createState2) => {
    const api = createStore(createState2);
    const useBoundStore = (selector) => useStore(api, selector);
    Object.assign(useBoundStore, api);
    return useBoundStore;
  };
  var create = ((createState2) => createState2 ? createImpl(createState2) : createImpl);

  // src/store/authStore.ts
  var useAuthStore = create((set) => ({
    user: null,
    profile: null,
    dbUser: null,
    session: null,
    isLoading: true,
    _initialized: false,
    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setDbUser: (dbUser) => set({ dbUser }),
    setSession: (session) => set({ session }),
    signOut: async () => {
      await supabase.auth.signOut();
      set({ user: null, profile: null, dbUser: null, session: null });
    },
    initialize: async () => {
      if (useAuthStore.getState()._initialized) return;
      try {
        set({ _initialized: true });
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        set({ session, user: session?.user ?? null, isLoading: false });
        const handleUserSession = async (currentSession) => {
          if (!currentSession?.user) {
            set({ profile: null, dbUser: null });
            return;
          }
          let { data: profile } = await supabase.from("profiles").select("*").eq("id", currentSession.user.id).single();
          if (!profile && currentSession.user.email) {
            let username = currentSession.user.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
            if (!username) username = "user";
            username = username.slice(0, 24) + "_" + Date.now().toString().slice(-4);
            profile = { id: currentSession.user.id, username, display_name: username, role: "user", is_verified: false };
          }
          if (profile) {
            set({ profile, dbUser: profile });
          }
        };
        if (session) {
          handleUserSession(session);
        }
        supabase.auth.onAuthStateChange((_event, session2) => {
          set({ session: session2, user: session2?.user ?? null });
          handleUserSession(session2);
        });
      } catch (error) {
        console.error("Failed to initialize auth", error);
        set({ isLoading: false });
      }
    }
  }));

  // src/components/StoriesBar.tsx
  var import_lucide_react5 = __require("lucide-react");

  // src/components/story/StoryCreator.tsx
  var import_react5 = __require("react");
  var import_lucide_react3 = __require("lucide-react");
  var import_browser_image_compression = __toESM(__require("browser-image-compression"), 1);
  var import_react6 = __require("motion/react");

  // src/components/story/MusicPicker.tsx
  var import_react2 = __require("react");
  var import_lucide_react = __require("lucide-react");
  var import_react3 = __require("motion/react");
  var import_jsx_runtime = __require("react/jsx-runtime");
  var CATEGORIES = [
    { id: "trending", name: "Trending", icon: import_lucide_react.TrendingUp },
    { id: "recent", name: "Recent", icon: import_lucide_react.Clock },
    { id: "favorites", name: "Favorites", icon: import_lucide_react.Heart },
    { id: "pop", name: "Pop", icon: import_lucide_react.Flame },
    { id: "hiphop", name: "Hip-Hop", icon: import_lucide_react.Music2 },
    { id: "gaming", name: "Gaming", icon: import_lucide_react.Gamepad2 },
    { id: "chill", name: "Chill", icon: import_lucide_react.Coffee }
  ];
  function MusicPicker({ onSelect, onClose, initialTrack }) {
    const [searchQuery, setSearchQuery] = (0, import_react2.useState)("");
    const [debouncedQuery, setDebouncedQuery] = (0, import_react2.useState)("");
    const [activeCategory, setActiveCategory] = (0, import_react2.useState)("trending");
    const [tracks, setTracks] = (0, import_react2.useState)([]);
    const [isLoading, setIsLoading] = (0, import_react2.useState)(false);
    const [trimmingTrack, setTrimmingTrack] = (0, import_react2.useState)(null);
    const [error, setError] = (0, import_react2.useState)(null);
    const [favorites, setFavorites] = (0, import_react2.useState)([]);
    (0, import_react2.useEffect)(() => {
      if (initialTrack) {
        setTrimmingTrack(initialTrack);
        if (initialTrack.startTime !== void 0) {
          setTrimStart(initialTrack.startTime);
        }
        if (initialTrack.trimDuration !== void 0) {
          setTrimDuration(initialTrack.trimDuration);
        }
        if (initialTrack.volume !== void 0) {
          setTrimVolume(initialTrack.volume);
        }
      }
    }, [initialTrack]);
    (0, import_react2.useEffect)(() => {
      const favs = JSON.parse(localStorage.getItem("omnix_fav_music") || "[]");
      setFavorites(favs.map((t) => t.id));
    }, []);
    const audioRef = (0, import_react2.useRef)(null);
    const [isPlaying, setIsPlaying] = (0, import_react2.useState)(false);
    const [isAudioLoading, setIsAudioLoading] = (0, import_react2.useState)(false);
    const [isAudioError, setIsAudioError] = (0, import_react2.useState)(false);
    const [audioProgress, setAudioProgress] = (0, import_react2.useState)(0);
    const [trimStart, setTrimStart] = (0, import_react2.useState)(0);
    const [trimDuration, setTrimDuration] = (0, import_react2.useState)(15);
    const [trimVolume, setTrimVolume] = (0, import_react2.useState)(1);
    const [duration, setDuration] = (0, import_react2.useState)(30);
    const [showDurationOptions, setShowDurationOptions] = (0, import_react2.useState)(false);
    (0, import_react2.useEffect)(() => {
      const timer = setTimeout(() => {
        setDebouncedQuery(searchQuery);
      }, 500);
      return () => clearTimeout(timer);
    }, [searchQuery]);
    (0, import_react2.useEffect)(() => {
      async function fetchMusic() {
        if (trimmingTrack) return;
        setIsLoading(true);
        setError(null);
        try {
          if (activeCategory === "recent" && !debouncedQuery) {
            const recent = JSON.parse(localStorage.getItem("omnix_recent_music") || "[]");
            setTracks(recent);
            setIsLoading(false);
            return;
          }
          if (activeCategory === "favorites" && !debouncedQuery) {
            const favs = JSON.parse(localStorage.getItem("omnix_fav_music") || "[]");
            setTracks(favs);
            setIsLoading(false);
            return;
          }
          const query = debouncedQuery || `${activeCategory} music`;
          const cacheKey = `music_${query}`;
          const cached = sessionStorage.getItem(cacheKey);
          if (cached) {
            setTracks(JSON.parse(cached));
            setIsLoading(false);
            return;
          }
          const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to fetch music");
          sessionStorage.setItem(cacheKey, JSON.stringify(data));
          setTracks(data);
        } catch (err) {
          setError(err.message || "Failed to load music. Please try again.");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
      fetchMusic();
    }, [debouncedQuery, activeCategory, trimmingTrack]);
    const toggleFavorite = (e, track) => {
      e.stopPropagation();
      const favs = JSON.parse(localStorage.getItem("omnix_fav_music") || "[]");
      const isFav = favs.some((t) => t.id === track.id);
      let newFavs;
      if (isFav) {
        newFavs = favs.filter((t) => t.id !== track.id);
      } else {
        newFavs = [track, ...favs];
      }
      localStorage.setItem("omnix_fav_music", JSON.stringify(newFavs));
      setFavorites(newFavs.map((t) => t.id));
      if (activeCategory === "favorites") {
        setTracks(newFavs);
      }
    };
    const handleSelectTrack = (track) => {
      setTrimmingTrack(track);
      const recent = JSON.parse(localStorage.getItem("omnix_recent_music") || "[]");
      const filtered = recent.filter((t) => t.id !== track.id);
      localStorage.setItem("omnix_recent_music", JSON.stringify([track, ...filtered].slice(0, 20)));
    };
    (0, import_react2.useEffect)(() => {
      if (trimmingTrack && trimmingTrack.previewUrl) {
        const audio = new Audio(trimmingTrack.previewUrl);
        audio.crossOrigin = "anonymous";
        const handleCanPlay = () => {
          setIsAudioLoading(false);
          const dur = audio.duration || 30;
          setDuration(dur);
          if (trimmingTrack.startTime !== void 0 && trimStart === 0 && !initialTrack) {
            setTrimStart(trimmingTrack.startTime);
            audio.currentTime = trimmingTrack.startTime;
          } else if (initialTrack && trimStart === 0) {
            setTrimStart(initialTrack.startTime || 0);
            audio.currentTime = initialTrack.startTime || 0;
          }
          audio.volume = trimVolume;
        };
        const handleTimeUpdate = () => {
          if (audio.duration) {
            setAudioProgress(audio.currentTime);
            const trimEndSec = Math.min(trimStart + trimDuration, audio.duration);
            if (audio.currentTime >= trimEndSec) {
              audio.pause();
              setIsPlaying(false);
              audio.currentTime = trimStart;
            }
          }
        };
        const handleEnded = () => setIsPlaying(false);
        const handleError = () => {
          console.error("Audio playback error");
          setIsAudioLoading(false);
          setIsAudioError(true);
        };
        const handleWaiting = () => setIsAudioLoading(true);
        const handlePlaying = () => setIsAudioLoading(false);
        audio.addEventListener("canplay", handleCanPlay);
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("error", handleError);
        audio.addEventListener("waiting", handleWaiting);
        audio.addEventListener("playing", handlePlaying);
        audioRef.current = audio;
        setIsAudioLoading(true);
        setIsAudioError(false);
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn("Autoplay prevented", err);
          setIsAudioLoading(false);
        });
        return () => {
          audio.pause();
          audio.removeEventListener("canplay", handleCanPlay);
          audio.removeEventListener("timeupdate", handleTimeUpdate);
          audio.removeEventListener("ended", handleEnded);
          audio.removeEventListener("error", handleError);
          audio.removeEventListener("waiting", handleWaiting);
          audio.removeEventListener("playing", handlePlaying);
          audioRef.current = null;
        };
      }
    }, [trimmingTrack, trimStart, trimDuration, initialTrack]);
    const togglePlayback = () => {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          const audio = audioRef.current;
          if (audio.currentTime >= trimStart + trimDuration) {
            audio.currentTime = trimStart;
          } else if (audio.currentTime < trimStart) {
            audio.currentTime = trimStart;
          }
          audio.play().then(() => setIsPlaying(true)).catch((e) => console.error(e));
        }
      }
    };
    const handleVolumeChange = (e) => {
      const vol = parseFloat(e.target.value);
      setTrimVolume(vol);
      if (audioRef.current) audioRef.current.volume = vol;
    };
    const handleTrimStartChange = (val) => {
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
      const newStart = Math.min(Math.max(0, val), duration - trimDuration);
      setTrimStart(newStart);
      if (audioRef.current) {
        audioRef.current.currentTime = newStart;
        setAudioProgress(newStart);
        if (!isPlaying) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch((e) => console.error(e));
        }
      }
    };
    const handleDone = () => {
      if (trimmingTrack) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        onSelect({
          ...trimmingTrack,
          startTime: trimStart,
          trimDuration,
          volume: trimVolume
        });
      }
    };
    if (trimmingTrack) {
      const trimEndSec = Math.min(trimStart + trimDuration, duration);
      const maxTrimStart = Math.max(0, duration - trimDuration);
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "absolute inset-x-0 bottom-0 bg-zinc-950/95 backdrop-blur-xl rounded-t-3xl z-50 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-6 h-[80vh]", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-8", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => initialTrack ? onClose() : setTrimmingTrack(null), className: "p-2 text-white hover:bg-zinc-800 rounded-full transition-colors", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.X, { className: "w-6 h-6" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-white font-bold text-lg", children: "Select Music" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: handleDone, className: "text-purple-400 font-bold hover:text-purple-300 transition-colors", children: "Done" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col items-center gap-6 mb-8 mt-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            import_react3.motion.div,
            {
              initial: { scale: 0.9, opacity: 0 },
              animate: { scale: 1, opacity: 1 },
              className: "relative",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-purple-500 blur-2xl opacity-20 rounded-full" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: trimmingTrack.coverUrl, className: "w-40 h-40 rounded-2xl shadow-2xl object-cover relative z-10 border border-zinc-800" }),
                trimmingTrack.previewUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                  "button",
                  {
                    onClick: togglePlayback,
                    disabled: isAudioError,
                    className: "absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-2xl disabled:opacity-100",
                    children: isAudioError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.AlertCircle, { className: "w-12 h-12 text-red-500" }) : isAudioLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Loader2, { className: "w-12 h-12 text-white animate-spin" }) : isPlaying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Pause, { className: "w-12 h-12 text-white fill-white" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Play, { className: "w-12 h-12 text-white fill-white ml-2" })
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-center max-w-[80%]", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", { className: "text-white font-bold text-2xl truncate", children: trimmingTrack.title }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-zinc-400 font-medium truncate mt-1", children: trimmingTrack.artist })
          ] })
        ] }),
        trimmingTrack.previewUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-6 mb-8 px-4 flex flex-col items-center justify-center w-full max-w-md mx-auto", children: isAudioError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 w-full", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.AlertCircle, { className: "w-5 h-5 text-red-400 shrink-0 mt-0.5" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm text-red-400 leading-relaxed", children: "Audio preview is unavailable for this track." })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-full text-center mb-2", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-[10px] uppercase tracking-wider text-purple-400 font-bold bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20", children: "30-Second Preview Provided By Source" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between w-full", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-zinc-400 font-mono text-xs", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
              "0:",
              (Math.floor(trimStart) % 60).toString().padStart(2, "0")
            ] }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "button",
              {
                onClick: () => setShowDurationOptions(!showDurationOptions),
                className: "flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-full text-white text-xs font-medium transition-colors",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Clock, { className: "w-3 h-3" }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                    trimDuration,
                    "s Clip"
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-zinc-400 font-mono text-xs", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
              "0:",
              (Math.floor(trimEndSec) % 60).toString().padStart(2, "0")
            ] }) })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react3.AnimatePresence, { children: showDurationOptions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            import_react3.motion.div,
            {
              initial: { opacity: 0, height: 0 },
              animate: { opacity: 1, height: "auto" },
              exit: { opacity: 0, height: 0 },
              className: "w-full flex justify-center gap-2 overflow-hidden",
              children: [5, 10, 15, 20, 25, 30].map((dur) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                "button",
                {
                  onClick: () => {
                    setTrimDuration(Math.min(dur, duration));
                    if (trimStart + dur > duration) {
                      setTrimStart(Math.max(0, duration - dur));
                    }
                    setShowDurationOptions(false);
                  },
                  className: `w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center transition-colors ${trimDuration === dur ? "bg-purple-500 text-white" : "bg-zinc-900 text-zinc-400 hover:text-white"}`,
                  children: dur
                },
                dur
              ))
            }
          ) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "relative w-full h-16 bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden group touch-none", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 flex items-center justify-around opacity-30 px-2 pointer-events-none", children: Array.from({ length: 60 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-1 bg-white rounded-full", style: { height: `${20 + Math.sin(i * 0.5) * 40 + Math.random() * 20}%` } }, i)) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "div",
              {
                className: "absolute inset-0 z-10",
                onPointerDown: (e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x3 = e.clientX - rect.left;
                  const percentage = Math.max(0, Math.min(1, x3 / rect.width));
                  const clickTime = percentage * duration;
                  if (clickTime < trimStart || clickTime > trimStart + trimDuration) {
                    const newStart = Math.min(Math.max(0, clickTime - trimDuration / 2), duration - trimDuration);
                    handleTrimStartChange(newStart);
                  }
                }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "div",
              {
                className: "absolute top-0 bottom-0 bg-black/60 pointer-events-none transition-all duration-100",
                style: { left: 0, width: `${trimStart / duration * 100}%` }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "div",
              {
                className: "absolute top-0 bottom-0 bg-black/60 pointer-events-none transition-all duration-100",
                style: { left: `${(trimStart + trimDuration) / duration * 100}%`, right: 0 }
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
              "div",
              {
                className: "absolute top-0 bottom-0 bg-purple-500/30 border-y-2 border-purple-500 z-20 cursor-grab active:cursor-grabbing",
                style: {
                  left: `${trimStart / duration * 100}%`,
                  width: `${trimDuration / duration * 100}%`
                },
                onPointerDown: (e) => {
                  e.stopPropagation();
                  const parent = e.currentTarget.parentElement;
                  if (!parent) return;
                  const rect = parent.getBoundingClientRect();
                  const startX = e.clientX;
                  const initialStart = trimStart;
                  const onMove = (moveEvt) => {
                    const dx = moveEvt.clientX - startX;
                    const dTime = dx / rect.width * duration;
                    const newStart = Math.max(0, Math.min(initialStart + dTime, duration - trimDuration));
                    handleTrimStartChange(newStart);
                  };
                  const onUp = () => {
                    window.removeEventListener("pointermove", onMove);
                    window.removeEventListener("pointerup", onUp);
                  };
                  window.addEventListener("pointermove", onMove);
                  window.addEventListener("pointerup", onUp);
                },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "div",
                    {
                      className: "absolute top-0 bottom-0 -left-3 w-6 flex items-center justify-center cursor-ew-resize group/handle",
                      onPointerDown: (e) => {
                        e.stopPropagation();
                        const parent = e.currentTarget.parentElement?.parentElement;
                        if (!parent) return;
                        const rect = parent.getBoundingClientRect();
                        const initialStart = trimStart;
                        const initialDuration = trimDuration;
                        const onMove = (moveEvt) => {
                          const x3 = moveEvt.clientX - rect.left;
                          let newStart = Math.max(0, Math.min(x3 / rect.width * duration, initialStart + initialDuration - 1));
                          let newDuration = initialStart + initialDuration - newStart;
                          if (newDuration > 30) {
                            newDuration = 30;
                            newStart = initialStart + initialDuration - 30;
                          }
                          setTrimStart(newStart);
                          setTrimDuration(newDuration);
                          if (audioRef.current) {
                            audioRef.current.currentTime = newStart;
                          }
                        };
                        const onUp = () => {
                          window.removeEventListener("pointermove", onMove);
                          window.removeEventListener("pointerup", onUp);
                          if (audioRef.current && !isPlaying) {
                            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
                            });
                          }
                        };
                        window.addEventListener("pointermove", onMove);
                        window.addEventListener("pointerup", onUp);
                      },
                      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "w-2 h-full bg-white rounded-l-md shadow-md flex flex-col items-center justify-center gap-1", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-0.5 h-1.5 bg-zinc-400 rounded-full" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-0.5 h-1.5 bg-zinc-400 rounded-full" })
                      ] })
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
                    "div",
                    {
                      className: "absolute top-0 bottom-0 -right-3 w-6 flex items-center justify-center cursor-ew-resize group/handle",
                      onPointerDown: (e) => {
                        e.stopPropagation();
                        const parent = e.currentTarget.parentElement?.parentElement;
                        if (!parent) return;
                        const rect = parent.getBoundingClientRect();
                        const initialStart = trimStart;
                        const initialDuration = trimDuration;
                        const onMove = (moveEvt) => {
                          const x3 = moveEvt.clientX - rect.left;
                          let newEnd = Math.max(initialStart + 1, Math.min(x3 / rect.width * duration, duration));
                          let newDuration = newEnd - initialStart;
                          if (newDuration > 30) {
                            newDuration = 30;
                          }
                          setTrimDuration(newDuration);
                        };
                        const onUp = () => {
                          window.removeEventListener("pointermove", onMove);
                          window.removeEventListener("pointerup", onUp);
                        };
                        window.addEventListener("pointermove", onMove);
                        window.addEventListener("pointerup", onUp);
                      },
                      children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "w-2 h-full bg-white rounded-r-md shadow-md flex flex-col items-center justify-center gap-1", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-0.5 h-1.5 bg-zinc-400 rounded-full" }),
                        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-0.5 h-1.5 bg-zinc-400 rounded-full" })
                      ] })
                    }
                  )
                ]
              }
            ),
            isPlaying && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "div",
              {
                className: "absolute top-0 bottom-0 w-1 bg-purple-500 z-30 pointer-events-none",
                style: {
                  left: `${audioProgress / duration * 100}%`,
                  boxShadow: "0 0 10px rgba(168, 85, 247, 0.8)"
                }
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-3 w-full px-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-zinc-500 text-xs font-medium", children: "Vol" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "input",
              {
                type: "range",
                min: "0",
                max: "1",
                step: "0.01",
                value: trimVolume,
                onChange: handleVolumeChange,
                className: "flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "text-zinc-500 text-xs font-mono w-8 text-right", children: [
              Math.round(trimVolume * 100),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 text-zinc-500 text-xs mt-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Scissors, { className: "w-3 h-3" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Drag the timeline to adjust clip position" })
          ] })
        ] }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "space-y-3 mb-8 px-4 flex flex-col items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl flex items-start gap-3 text-left", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Info, { className: "w-5 h-5 text-purple-400 shrink-0 mt-0.5" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-sm text-zinc-300 leading-relaxed", children: "Music preview is unavailable. Select the song to attach its metadata to your story." })
        ] }) })
      ] });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "absolute inset-x-0 bottom-0 top-12 bg-zinc-950/95 backdrop-blur-xl rounded-t-3xl z-50 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col p-4 border-b border-zinc-800", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { className: "text-white font-bold text-xl", children: "Music" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: onClose, className: "p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.X, { className: "w-6 h-6" }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "relative mb-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Search, { className: "w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
            "input",
            {
              type: "text",
              placeholder: "Search iTunes Music...",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              className: "w-full bg-zinc-900/50 text-white rounded-2xl py-3 pl-12 pr-4 outline-none border border-zinc-800 focus:border-purple-500 focus:bg-zinc-900 transition-all font-medium placeholder:text-zinc-500"
            }
          )
        ] }),
        !searchQuery && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex overflow-x-auto gap-3 pb-2 scrollbar-hide -mx-4 px-4 snap-x", children: CATEGORIES.map((category) => {
          const Icon = category.icon;
          return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
            "button",
            {
              onClick: () => setActiveCategory(category.id),
              className: `snap-start flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors border ${activeCategory === category.id ? "bg-white text-black border-white" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white"}`,
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "w-4 h-4" }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "font-bold text-sm", children: category.name })
              ]
            },
            category.id
          );
        }) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 overflow-y-auto p-4 space-y-1", children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col items-center justify-center h-40 gap-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Loader2, { className: "w-8 h-8 text-purple-500 animate-spin" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-zinc-500 font-medium text-sm", children: "Searching iTunes..." })
      ] }) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex flex-col items-center justify-center h-40 gap-2 px-4 text-center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-red-400 font-medium", children: error }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { onClick: () => setDebouncedQuery(debouncedQuery), className: "text-purple-400 text-sm font-bold hover:underline", children: "Try Again" })
      ] }) : tracks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex flex-col items-center justify-center h-40", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "text-zinc-500 font-medium", children: "No music found" }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react3.AnimatePresence, { children: tracks.map((track, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
        import_react3.motion.div,
        {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { delay: i * 0.05 },
          className: "flex items-center justify-between group p-2 hover:bg-zinc-900/50 rounded-2xl transition-colors cursor-pointer",
          onClick: () => handleSelectTrack(track),
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-4 flex-1 overflow-hidden", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-14 h-14 rounded-xl overflow-hidden relative bg-zinc-800 shrink-0 shadow-md", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", { src: track.coverUrl, className: "w-full h-full object-cover" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "text-white font-bold text-base truncate", children: track.title }),
                  track.isLicensed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bg-purple-500/20 text-purple-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 border border-purple-500/30", children: "Licensed" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 border border-emerald-500/30", children: "Free" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "flex items-center gap-2 mt-0.5", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-zinc-400 text-sm truncate", children: track.artist }),
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "text-zinc-600 text-xs font-bold px-1.5 py-0.5 rounded bg-zinc-900", children: track.duration })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
              "button",
              {
                onClick: (e) => toggleFavorite(e, track),
                className: `p-3 transition-all ${favorites.includes(track.id) ? "text-red-500 opacity-100" : "text-zinc-500 hover:text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100"}`,
                children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Heart, { className: "w-5 h-5", fill: favorites.includes(track.id) ? "currentColor" : "none" })
              }
            )
          ]
        },
        `${track.id}-${i}`
      )) }) })
    ] });
  }

  // src/components/story/EmojiPicker.tsx
  var import_react4 = __require("react");
  var import_lucide_react2 = __require("lucide-react");
  var import_jsx_runtime2 = __require("react/jsx-runtime");
  var EMOJI_CATEGORIES = [
    { name: "Smileys & Emotion", emojis: ["\u{1F600}", "\u{1F603}", "\u{1F604}", "\u{1F601}", "\u{1F606}", "\u{1F605}", "\u{1F923}", "\u{1F602}", "\u{1F642}", "\u{1F643}", "\u{1F609}", "\u{1F60A}", "\u{1F607}", "\u{1F970}", "\u{1F60D}", "\u{1F929}", "\u{1F618}", "\u{1F617}", "\u{1F61A}", "\u{1F619}", "\u{1F972}", "\u{1F60B}", "\u{1F61B}", "\u{1F61C}", "\u{1F92A}", "\u{1F61D}", "\u{1F911}", "\u{1F917}", "\u{1F92D}", "\u{1F92B}", "\u{1F914}", "\u{1F910}", "\u{1F928}", "\u{1F610}", "\u{1F611}", "\u{1F636}", "\u{1F636}\u200D\u{1F32B}\uFE0F", "\u{1F60F}", "\u{1F612}", "\u{1F644}", "\u{1F62C}", "\u{1F62E}\u200D\u{1F4A8}", "\u{1F925}", "\u{1F60C}", "\u{1F614}", "\u{1F62A}", "\u{1F924}", "\u{1F634}", "\u{1F637}", "\u{1F912}", "\u{1F915}", "\u{1F922}", "\u{1F92E}", "\u{1F927}", "\u{1F975}", "\u{1F976}", "\u{1F974}", "\u{1F635}", "\u{1F635}\u200D\u{1F4AB}", "\u{1F92F}", "\u{1F920}", "\u{1F973}", "\u{1F978}", "\u{1F60E}", "\u{1F913}", "\u{1F9D0}", "\u{1F615}", "\u{1F61F}", "\u{1F641}", "\u2639\uFE0F", "\u{1F62E}", "\u{1F62F}", "\u{1F632}", "\u{1F633}", "\u{1F97A}", "\u{1F626}", "\u{1F627}", "\u{1F628}", "\u{1F630}", "\u{1F625}", "\u{1F622}", "\u{1F62D}", "\u{1F631}", "\u{1F616}", "\u{1F623}", "\u{1F61E}", "\u{1F613}", "\u{1F629}", "\u{1F62B}", " yawning_face:", "\u{1F624}", "\u{1F621}", "\u{1F620}", "\u{1F92C}", "\u{1F608}", "\u{1F47F}", "\u{1F480}", "\u2620\uFE0F", "\u{1F4A9}", "\u{1F921}", "\u{1F479}", "\u{1F47A}", "\u{1F47B}", "\u{1F47D}", "\u{1F47E}", "\u{1F916}"] },
    { name: "Animals & Nature", emojis: ["\u{1F648}", "\u{1F649}", "\u{1F64A}", "\u{1F435}", "\u{1F412}", "\u{1F98D}", "\u{1F9A7}", "\u{1F436}", "\u{1F415}", "\u{1F9AE}", "\u{1F415}\u200D\u{1F9BA}", "\u{1F429}", "\u{1F43A}", "\u{1F98A}", "\u{1F99D}", "\u{1F431}", "\u{1F408}", "\u{1F408}\u200D\u2B1B", "\u{1F981}", "\u{1F42F}", "\u{1F405}", "\u{1F406}", "\u{1F434}", "\u{1F40E}", "\u{1F984}", "\u{1F993}", "\u{1F98C}", "\u{1F9AC}", "\u{1F42E}", "\u{1F402}", "\u{1F403}", "\u{1F404}", "\u{1F437}", "\u{1F416}", "\u{1F417}", "\u{1F43D}", "\u{1F40F}", "\u{1F411}", "\u{1F410}", "\u{1F42A}", "\u{1F42B}", "\u{1F999}", "\u{1F992}", "\u{1F418}", "\u{1F9A3}", "\u{1F98F}", "\u{1F99B}", "\u{1F42D}", "\u{1F401}", "\u{1F400}", "\u{1F439}", "\u{1F430}", "\u{1F407}", "\u{1F43F}\uFE0F", "\u{1F9AB}", "\u{1F994}", "\u{1F987}", "\u718A", "\u{1F43B}", "\u{1F428}", "\u{1F43C}", "\u{1F9A5}", "\u{1F9A6}", "\u{1F9A8}", "\u{1F998}", "\u{1F9A1}", "\u{1F43E}", "\u{1F983}", "\u{1F414}", "\u{1F413}", "\u{1F423}", "\u{1F424}", "\u{1F425}", "\u{1F426}", "\u{1F427}", "\u{1F54A}\uFE0F", "\u{1F985}", "\u{1F986}", "\u{1F9A2}", "\u{1F989}", "\u{1F9A4}", "\u{1FAB6}", "\u{1F9A9}", "\u{1F99A}", "\u{1F99C}", "\u{1F438}", "\u{1F40A}", "\u{1F422}", "\u{1F98E}", "\u{1F40D}", "\u{1F432}", "\u{1F409}", "\u{1F995}", "\u{1F996}", "\u{1F433}", "\u{1F40B}", "\u{1F42C}", "\u{1F9AD}", "\u{1F41F}", "\u{1F420}", "\u{1F421}", "\u{1F988}", "\u{1F419}", "\u{1F41A}", "\u{1F40C}", "\u{1F98B}", "\u{1F41B}", "\u{1F41C}", "\u{1F41D}", "\u{1FAB2}", "\u{1F41E}", "\u{1F997}", "\u{1FAB3}", "\u{1F577}\uFE0F", "\u{1F578}\uFE0F", "\u{1F982}", "\u{1F99F}", "\u{1FAB0}", "\u{1FAB1}", "\u{1F9A0}", "\u{1F490}", "\u{1F338}", "\u{1F4AE}", "\u{1F3F5}\uFE0F", "\u{1F339}", "\u{1F940}", "\u{1F33A}", "\u{1F33B}", "\u{1F33C}", "\u{1F337}", "\u{1F331}", "\u{1FAB4}", "\u{1F332}", "\u{1F333}", "\u{1F334}", "\u{1F335}", "\u{1F33E}", "\u{1F33F}", "\u2618\uFE0F", "\u{1F340}", "\u{1F341}", "\u{1F342}", "\u{1F343}"] }
  ];
  function EmojiPicker({ onSelect, onClose }) {
    const [searchQuery, setSearchQuery] = (0, import_react4.useState)("");
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "absolute inset-x-0 bottom-0 top-1/2 bg-zinc-950/95 backdrop-blur-xl rounded-t-3xl z-50 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex flex-col p-4 border-b border-zinc-800", children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-4" }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "relative", children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_lucide_react2.Search, { className: "w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "input",
            {
              type: "text",
              placeholder: "Search emojis...",
              value: searchQuery,
              onChange: (e) => setSearchQuery(e.target.value),
              className: "w-full bg-zinc-900 text-white rounded-full py-2 pl-10 pr-4 outline-none border border-zinc-800 focus:border-purple-500"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "flex-1 overflow-y-auto px-4 pb-8", children: EMOJI_CATEGORIES.map((category) => {
        const emojis = category.emojis.filter((e) => e.includes(searchQuery));
        if (emojis.length === 0 && searchQuery) return null;
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "mb-6", children: [
          !searchQuery && /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h4", { className: "text-zinc-500 text-xs font-bold uppercase tracking-wider mb-3 sticky top-0 bg-zinc-950/95 py-2", children: category.name }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "grid grid-cols-7 gap-2", children: emojis.map((emoji, i) => /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
            "button",
            {
              onClick: () => onSelect(emoji),
              className: "text-3xl hover:bg-zinc-800 rounded-lg p-1 transition-colors flex items-center justify-center",
              children: emoji
            },
            i
          )) })
        ] }, category.name);
      }) })
    ] });
  }

  // src/components/story/StoryCreator.tsx
  var import_jsx_runtime3 = __require("react/jsx-runtime");
  var FILTERS = [
    { id: "normal", name: "Normal", css: "" },
    { id: "vintage", name: "Vintage", css: "sepia(0.5) contrast(1.2)" },
    { id: "cinema", name: "Cinema", css: "contrast(1.1) saturate(1.3)" },
    { id: "bw", name: "B&W", css: "grayscale(1) contrast(1.2)" },
    { id: "warm", name: "Warm", css: "sepia(0.3) saturate(1.5) hue-rotate(-10deg)" },
    { id: "cool", name: "Cool", css: "saturate(1.2) hue-rotate(10deg)" },
    { id: "beauty", name: "Beauty", css: "brightness(1.1) contrast(0.9) saturate(1.1)" }
  ];
  var MODES = [
    { id: "story", name: "Story" },
    { id: "photo", name: "Photo" },
    { id: "video", name: "Video" },
    { id: "boomerang", name: "Boomerang" },
    { id: "hands_free", name: "Hands-Free" },
    { id: "dual", name: "Dual" },
    { id: "layout", name: "Layout" }
  ];
  function StoryCreator({ onClose, onSuccess }) {
    const { user, dbUser } = useAuthStore();
    const [mediaFile, setMediaFile] = (0, import_react5.useState)(null);
    const [previewUrl, setPreviewUrl] = (0, import_react5.useState)(null);
    const [isRecording, setIsRecording] = (0, import_react5.useState)(false);
    const [isUploading, setIsUploading] = (0, import_react5.useState)(false);
    const [isAiProcessing, setIsAiProcessing] = (0, import_react5.useState)(false);
    const [isDraggingMusic, setIsDraggingMusic] = (0, import_react5.useState)(false);
    const [isOverTrash, setIsOverTrash] = (0, import_react5.useState)(false);
    const trashRef = (0, import_react5.useRef)(null);
    const [activeMode, setActiveMode] = (0, import_react5.useState)("story");
    const [facingMode, setFacingMode] = (0, import_react5.useState)("environment");
    const [flashMode, setFlashMode] = (0, import_react5.useState)("off");
    const [flashSupported, setFlashSupported] = (0, import_react5.useState)(true);
    const [showMusicPicker, setShowMusicPicker] = (0, import_react5.useState)(false);
    const [musicPickerMode, setMusicPickerMode] = (0, import_react5.useState)("new");
    const [showMusicOptions, setShowMusicOptions] = (0, import_react5.useState)(false);
    const [showEmojiPicker, setShowEmojiPicker] = (0, import_react5.useState)(false);
    const [selectedMusic, setSelectedMusic] = (0, import_react5.useState)(null);
    const [musicScale, setMusicScale] = (0, import_react5.useState)(1);
    const [musicRotate, setMusicRotate] = (0, import_react5.useState)(-10);
    const [gridEnabled, setGridEnabled] = (0, import_react5.useState)(false);
    const [isMuted, setIsMuted] = (0, import_react5.useState)(false);
    const [timer, setTimer] = (0, import_react5.useState)(0);
    const [timerCountdown, setTimerCountdown] = (0, import_react5.useState)(null);
    const [quality, setQuality] = (0, import_react5.useState)("HD");
    const [activeFilter, setActiveFilter] = (0, import_react5.useState)(FILTERS[0]);
    const [showFilters, setShowFilters] = (0, import_react5.useState)(false);
    const [zoomLevel, setZoomLevel] = (0, import_react5.useState)(1);
    const [showSettings, setShowSettings] = (0, import_react5.useState)(false);
    const [cameraError, setCameraError] = (0, import_react5.useState)(null);
    const [audience, setAudience] = (0, import_react5.useState)("public");
    const [showAudienceMenu, setShowAudienceMenu] = (0, import_react5.useState)(false);
    const [texts, setTexts] = (0, import_react5.useState)([]);
    const [editingTextId, setEditingTextId] = (0, import_react5.useState)(null);
    const [currentInputText, setCurrentInputText] = (0, import_react5.useState)("");
    const [currentTextColor, setCurrentTextColor] = (0, import_react5.useState)("#ffffff");
    const touchDistanceRef = (0, import_react5.useRef)(null);
    const recordTimeoutRef = (0, import_react5.useRef)(null);
    const videoRef = (0, import_react5.useRef)(null);
    const streamRef = (0, import_react5.useRef)(null);
    const mediaRecorderRef = (0, import_react5.useRef)(null);
    const chunksRef = (0, import_react5.useRef)([]);
    const fileInputRef = (0, import_react5.useRef)(null);
    const audioRef = (0, import_react5.useRef)(null);
    (0, import_react5.useEffect)(() => {
      if (selectedMusic && selectedMusic.previewUrl) {
        const audio = new Audio(selectedMusic.previewUrl);
        audio.currentTime = selectedMusic.startTime || 0;
        audio.volume = selectedMusic.volume !== void 0 ? selectedMusic.volume : 1;
        audio.play().catch((e) => console.error("Audio play error:", e));
        audioRef.current = audio;
        const handleTimeUpdate = () => {
          const endTime = (selectedMusic.startTime || 0) + (selectedMusic.trimDuration || 30);
          if (audio.currentTime >= endTime) {
            audio.currentTime = selectedMusic.startTime || 0;
            audio.play().catch((e) => {
            });
          }
        };
        audio.addEventListener("timeupdate", handleTimeUpdate);
        audioRef.current._handleTimeUpdate = handleTimeUpdate;
      } else {
        if (audioRef.current) {
          audioRef.current.pause();
          if (audioRef.current._handleTimeUpdate) {
            audioRef.current.removeEventListener("timeupdate", audioRef.current._handleTimeUpdate);
          }
          audioRef.current = null;
        }
      }
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          if (audioRef.current._handleTimeUpdate) {
            audioRef.current.removeEventListener("timeupdate", audioRef.current._handleTimeUpdate);
          }
          audioRef.current = null;
        }
      };
    }, [selectedMusic]);
    (0, import_react5.useEffect)(() => {
      if (!previewUrl) {
        setZoomLevel(1);
        startCamera();
      }
      return () => {
        stopCamera();
        if (recordTimeoutRef.current) clearTimeout(recordTimeoutRef.current);
      };
    }, [previewUrl, facingMode, quality]);
    const startCamera = async () => {
      stopCamera();
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            // Let the browser decide the best orientation and resolution, avoiding forced crops
            ...quality === "4K" ? { width: { ideal: 3840 } } : quality === "FHD" ? { width: { ideal: 1920 } } : { width: { ideal: 1280 } }
          },
          audio: true
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.() || {};
        setFlashSupported(!!capabilities.torch);
      } catch (error) {
        console.warn("Camera access issue:", error.message);
        setCameraError("Camera access denied or unavailable. You can still upload media.");
      }
    };
    const applyFlash = async (mode) => {
      if (streamRef.current) {
        const track = streamRef.current.getVideoTracks()[0];
        const capabilities = track.getCapabilities?.() || {};
        if (capabilities.torch) {
          try {
            await track.applyConstraints({
              advanced: [{ torch: mode === "on" || mode === "auto" }]
            });
          } catch (e) {
            console.error("Error applying torch", e);
          }
        }
      }
    };
    (0, import_react5.useEffect)(() => {
      applyFlash(flashMode);
    }, [flashMode]);
    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
    const executeCapture = () => {
      if (!videoRef.current || !streamRef.current) return;
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      if (activeFilter.css) {
        ctx.filter = activeFilter.css;
      }
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "story-capture.jpg", { type: "image/jpeg" });
          setMediaFile(file);
          setPreviewUrl(URL.createObjectURL(file));
          stopCamera();
        }
      }, "image/jpeg", 0.9);
    };
    const handleCapture = () => {
      if (timer > 0) {
        setTimerCountdown(timer);
        let count = timer;
        const interval = setInterval(() => {
          count--;
          if (count > 0) {
            setTimerCountdown(count);
          } else {
            clearInterval(interval);
            setTimerCountdown(null);
            executeCapture();
          }
        }, 1e3);
      } else {
        executeCapture();
      }
    };
    const executeStartRecording = () => {
      if (!streamRef.current) return;
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const file = new File([blob], "story-video.webm", { type: "video/webm" });
        setMediaFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        stopCamera();
      };
      mediaRecorder.start();
      setIsRecording(true);
    };
    const startRecording = () => {
      if (timer > 0) {
        setTimerCountdown(timer);
        let count = timer;
        const interval = setInterval(() => {
          count--;
          if (count > 0) {
            setTimerCountdown(count);
          } else {
            clearInterval(interval);
            setTimerCountdown(null);
            executeStartRecording();
          }
        }, 1e3);
      } else {
        executeStartRecording();
      }
    };
    const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    };
    const handleFileSelect = async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        let finalFile = file;
        if (file.type.startsWith("image/")) {
          try {
            finalFile = await (0, import_browser_image_compression.default)(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
          } catch (error) {
            console.error(error);
          }
        }
        setMediaFile(finalFile);
        setPreviewUrl(URL.createObjectURL(finalFile));
        stopCamera();
      }
    };
    const simulateAiEnhance = () => {
      setIsAiProcessing(true);
      setTimeout(() => {
        setIsAiProcessing(false);
        setActiveFilter(FILTERS.find((f3) => f3.id === "beauty") || FILTERS[0]);
      }, 2e3);
    };
    const toggleFlash = () => {
      if (!flashSupported) {
        alert("Flash is not supported on this device.");
        return;
      }
      const modes = ["off", "on", "auto"];
      setFlashMode(modes[(modes.indexOf(flashMode) + 1) % modes.length]);
    };
    const cycleTimer = () => {
      const timers = [0, 3, 5, 10];
      setTimer(timers[(timers.indexOf(timer) + 1) % timers.length]);
    };
    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchDistanceRef.current = Math.hypot(dx, dy);
      }
    };
    const handleTouchMove = (e) => {
      if (e.touches.length === 2 && touchDistanceRef.current !== null) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDistance = Math.hypot(dx, dy);
        const scaleDiff = (currentDistance - touchDistanceRef.current) * 0.01;
        setZoomLevel((prev) => Math.min(Math.max(0.5, prev + scaleDiff), 5));
        touchDistanceRef.current = currentDistance;
      }
    };
    const handleTouchEnd = () => {
      touchDistanceRef.current = null;
    };
    const addTextOverlay = () => {
      const newId = Math.random().toString(36).substr(2, 9);
      setEditingTextId(newId);
      setCurrentInputText("");
    };
    const addEmojiOverlay = (emoji) => {
      const newId = Math.random().toString(36).substr(2, 9);
      setTexts((prev) => [...prev, {
        id: newId,
        text: emoji,
        x: 50,
        y: 50,
        scale: 1,
        rotate: 0,
        color: "#ffffff",
        font: "Inter"
      }]);
      setShowEmojiPicker(false);
    };
    const handleRemoveMusic = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setSelectedMusic(null);
      setShowMusicOptions(false);
    };
    const handleMusicSelect = (track) => {
      setSelectedMusic(track);
      setShowMusicPicker(false);
    };
    const saveTextOverlay = () => {
      if (currentInputText.trim() && editingTextId) {
        setTexts((prev) => [...prev, {
          id: editingTextId,
          text: currentInputText,
          x: 50,
          y: 50,
          scale: 1,
          rotate: 0,
          color: currentTextColor,
          font: "Inter"
        }]);
      }
      setEditingTextId(null);
    };
    const handleUpload = async () => {
      if (!mediaFile && texts.length === 0) return;
      if (!user) {
        alert("Please login again.");
        return;
      }
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!session || sessionError) {
        alert("Please login again.");
        return;
      }
      setIsUploading(true);
      try {
        let publicUrl = "";
        let isVideo = false;
        if (mediaFile) {
          console.log("Selected file:", { name: mediaFile.name, type: mediaFile.type, size: mediaFile.size });
        } else {
          console.log("Selected file:", "No media, text only story");
        }
        if (mediaFile) {
          isVideo = mediaFile.type.startsWith("video/");
          const fileExt = mediaFile.name.split(".").pop() || "png";
          const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
          const filePath = fileName;
          console.log("Upload payload:", { bucket: "stories", path: filePath });
          const uploadRes = await supabase.storage.from("stories").upload(filePath, mediaFile, { upsert: true });
          console.log("Upload response:", uploadRes);
          if (uploadRes.error) {
            throw new Error(`Supabase Storage Error: ${uploadRes.error.message}`);
          }
          const { data: urlData } = supabase.storage.from("stories").getPublicUrl(filePath);
          publicUrl = urlData.publicUrl;
          console.log("Public URL:", publicUrl);
        }
        const captionText = texts.length > 0 ? texts.map((t) => t.text).join("\n") : null;
        const expiresAt = /* @__PURE__ */ new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        const payload = {
          user_id: session.user.id,
          media_url: publicUrl || "https://via.placeholder.com/1080x1920/111111/FFFFFF?text=Text+Story",
          expires_at: expiresAt.toISOString(),
          media_type: isVideo ? "video" : "image",
          privacy: "public"
        };
        if (captionText) payload.caption = captionText;
        if (selectedMusic) {
          payload.music = JSON.stringify({
            music_id: selectedMusic.id,
            title: selectedMusic.title,
            artist: selectedMusic.artist,
            artwork: selectedMusic.coverUrl,
            preview_url: selectedMusic.previewUrl,
            start_time: selectedMusic.startTime,
            duration: selectedMusic.trimDuration || 30,
            volume: selectedMusic.volume !== void 0 ? selectedMusic.volume : 1
          });
        }
        console.log("--- PRE-INSERT DEBUG ---");
        console.log("session.user.id:", session.user.id);
        console.log("dbUser.id:", dbUser?.id);
        console.log("payload.user_id:", payload.user_id);
        if (!payload.user_id) {
          throw new Error("payload.user_id is missing! Ensure you are fully logged in and your user profile exists.");
        }
        try {
          const { data: userExists } = await supabase.from("profiles").select("id").eq("id", payload.user_id).single();
          if (!userExists) {
            console.log("Profile not found in public.profiles for payload.user_id! Attempting to create...");
            await supabase.from("profiles").insert({
              id: payload.user_id,
              username: session.user.email ? session.user.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") + "_" + Date.now().toString().slice(-4) : "user_" + Date.now(),
              display_name: "User",
              is_verified: false
            });
          } else {
            console.log("Verified: profile exists in public.profiles");
          }
        } catch (e) {
          console.warn("Failed to check profile in public.profiles:", e);
        }
        console.log("--- PRE-INSERT DEBUG END ---");
        console.log("Insert payload:", payload);
        const insertRes = await supabase.from("stories").insert(payload).select();
        console.log("Insert response:", insertRes);
        if (insertRes.error) {
          throw new Error(`Supabase Database Error: ${insertRes.error.message}`);
        }
        onSuccess();
        onClose();
      } catch (error) {
        console.error("Upload error:", error);
        alert(`${error.message || JSON.stringify(error)}`);
      } finally {
        setIsUploading(false);
      }
    };
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "fixed inset-0 z-[100] bg-black flex flex-col font-sans select-none overflow-hidden touch-none", children: [
      !previewUrl && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "absolute top-0 inset-x-0 z-30 flex justify-between items-start p-4 bg-gradient-to-b from-black/80 to-transparent", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { onClick: onClose, className: "p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.X, { className: "w-6 h-6" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex flex-col gap-4 items-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { onClick: toggleFlash, className: `p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40 relative group ${!flashSupported ? "opacity-50" : ""}`, children: [
            flashMode === "off" ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.ZapOff, { className: "w-5 h-5" }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Zap, { className: `w-5 h-5 ${flashMode === "auto" ? "text-yellow-400" : "text-white"}` }),
            flashMode === "auto" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "absolute -bottom-1 -right-1 text-[9px] font-bold bg-yellow-400 text-black px-1 rounded-sm", children: "A" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { onClick: () => setFacingMode((f3) => f3 === "user" ? "environment" : "user"), className: "p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.RotateCw, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { onClick: () => setShowSettings(!showSettings), className: "p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.ChevronDown, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react6.AnimatePresence, { children: showSettings && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            import_react6.motion.div,
            {
              initial: { opacity: 0, height: 0, scale: 0.9 },
              animate: { opacity: 1, height: "auto", scale: 1 },
              exit: { opacity: 0, height: 0, scale: 0.9 },
              className: "flex flex-col gap-4 items-center overflow-hidden",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { onClick: () => setGridEnabled(!gridEnabled), className: `p-3 rounded-full backdrop-blur ${gridEnabled ? "bg-purple-500 text-white" : "bg-black/20 text-white hover:bg-black/40"}`, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Grid3X3, { className: "w-5 h-5" }) }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { onClick: cycleTimer, className: `p-3 rounded-full backdrop-blur relative ${timer > 0 ? "bg-purple-500 text-white" : "bg-black/20 text-white hover:bg-black/40"}`, children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Clock, { className: "w-5 h-5" }),
                  timer > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { className: "absolute -bottom-1 -right-1 text-[10px] font-bold bg-white text-purple-600 px-1 rounded-sm", children: [
                    timer,
                    "s"
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { onClick: () => setQuality((q2) => q2 === "HD" ? "FHD" : q2 === "FHD" ? "4K" : "HD"), className: "p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40 text-xs font-bold w-11 h-11 flex items-center justify-center", children: quality })
              ]
            }
          ) })
        ] })
      ] }),
      previewUrl && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { onClick: onClose, className: "p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.X, { className: "w-6 h-6" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { onClick: simulateAiEnhance, className: "p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Sparkles, { className: "w-5 h-5 text-purple-400" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { onClick: addTextOverlay, className: "p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Type, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { onClick: () => setShowEmojiPicker(true), className: "p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Smile, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { onClick: () => {
            if (selectedMusic) {
              setShowMusicOptions(true);
            } else {
              setMusicPickerMode("new");
              setShowMusicPicker(true);
            }
          }, className: "p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Music, { className: "w-5 h-5" }) }),
          mediaFile?.type.startsWith("video/") && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { onClick: () => setIsMuted(!isMuted), className: "p-3 text-white rounded-full bg-black/20 backdrop-blur hover:bg-black/40", children: isMuted ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.VolumeX, { className: "w-5 h-5" }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Volume2, { className: "w-5 h-5" }) })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex-1 relative bg-black flex items-center justify-center overflow-hidden sm:rounded-none", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react6.AnimatePresence, { children: timerCountdown !== null && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          import_react6.motion.div,
          {
            initial: { scale: 0.5, opacity: 0 },
            animate: { scale: 1.5, opacity: 1 },
            exit: { scale: 2, opacity: 0 },
            className: "absolute z-50 text-white font-bold text-9xl drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]",
            children: timerCountdown
          }
        ) }),
        isAiProcessing && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "absolute inset-0 z-40 bg-black/40 backdrop-blur flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "w-64 h-64 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin absolute" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Sparkles, { className: "w-12 h-12 text-purple-400 animate-pulse mb-4" }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { className: "text-xl font-bold text-white mb-2", children: "Enhancing Magic..." })
        ] }),
        !previewUrl ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_react6.motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "w-full h-full relative", children: [
          cameraError ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-zinc-900 z-10", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Camera, { className: "w-16 h-16 text-zinc-600 mb-4" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h3", { className: "text-xl font-bold text-white mb-2", children: "Camera Unavailable" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("p", { className: "text-zinc-400 mb-6", children: cameraError }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                onClick: () => fileInputRef.current?.click(),
                className: "bg-white text-black px-6 py-3 rounded-full font-bold",
                children: "Upload from Device"
              }
            )
          ] }) : null,
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
            "video",
            {
              ref: videoRef,
              autoPlay: true,
              playsInline: true,
              muted: true,
              onTouchStart: handleTouchStart,
              onTouchMove: handleTouchMove,
              onTouchEnd: handleTouchEnd,
              className: "w-full h-full object-cover origin-center transition-transform",
              style: {
                transform: `${zoomLevel !== 1 ? `scale(${zoomLevel})` : ""} ${facingMode === "user" ? "scaleX(-1)" : ""}`.trim() || void 0,
                filter: activeFilter.css || void 0
              }
            }
          ),
          gridEnabled && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30 z-10", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "border-r border-b border-white" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "border-r border-b border-white" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "border-b border-white" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "border-r border-b border-white" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "border-r border-b border-white" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "border-b border-white" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "border-r border-white" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "border-r border-white" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "border-white" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "absolute bottom-40 left-1/2 -translate-x-1/2 flex items-center justify-center gap-4 z-20 pointer-events-auto bg-black/40 rounded-full px-4 py-2 backdrop-blur-md", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { onClick: () => setZoomLevel(0.5), className: `text-sm font-bold rounded-full w-10 h-10 flex items-center justify-center transition-colors ${zoomLevel === 0.5 ? "bg-white text-black" : "text-white"}`, children: ".5x" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { onClick: () => setZoomLevel(1), className: `text-sm font-bold rounded-full w-10 h-10 flex items-center justify-center transition-colors ${zoomLevel === 1 ? "bg-white text-black" : "text-white"}`, children: "1x" }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { onClick: () => setZoomLevel(2), className: `text-sm font-bold rounded-full w-10 h-10 flex items-center justify-center transition-colors ${zoomLevel === 2 ? "bg-white text-black" : "text-white"}`, children: "2x" })
          ] })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "w-full h-full relative group", children: [
          mediaFile?.type.startsWith("video/") ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("video", { src: previewUrl, className: "w-full h-full object-contain bg-black", autoPlay: true, loop: true, muted: isMuted, style: { filter: activeFilter.css } }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("img", { src: previewUrl, className: "w-full h-full object-contain bg-black", alt: "Preview", style: { filter: activeFilter.css } }),
          texts.map((text) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            import_react6.motion.div,
            {
              drag: true,
              dragMomentum: false,
              onDoubleClick: () => setTexts(texts.filter((t) => t.id !== text.id)),
              className: "absolute text-center whitespace-pre-wrap font-bold text-4xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] cursor-move group/text",
              style: {
                left: `${text.x}%`,
                top: `${text.y}%`,
                x: "-50%",
                y: "-50%",
                color: text.color,
                fontFamily: text.font,
                scale: text.scale || 1,
                rotate: text.rotate || 0,
                transformOrigin: "center"
              },
              children: [
                text.text,
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "button",
                  {
                    onClick: () => setTexts(texts.filter((t) => t.id !== text.id)),
                    className: "absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/text:opacity-100 transition-opacity",
                    children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.X, { className: "w-3 h-3" })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "div",
                  {
                    className: "absolute -bottom-3 -right-3 w-6 h-6 bg-white text-black rounded-full shadow-lg opacity-0 group-hover/text:opacity-100 transition-opacity flex items-center justify-center cursor-nwse-resize pointer-events-auto",
                    onPointerDown: (e) => {
                      e.stopPropagation();
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startScale = text.scale || 1;
                      const startRotate = text.rotate || 0;
                      const handleMove = (moveEvent) => {
                        const dx = moveEvent.clientX - startX;
                        const dy = moveEvent.clientY - startY;
                        const newScale = Math.max(0.2, startScale + (dx + dy) * 0.01);
                        const newRotate = startRotate + dx * 0.5;
                        setTexts((prev) => prev.map(
                          (t) => t.id === text.id ? { ...t, scale: newScale, rotate: newRotate } : t
                        ));
                      };
                      const handleUp = () => {
                        window.removeEventListener("pointermove", handleMove);
                        window.removeEventListener("pointerup", handleUp);
                      };
                      window.addEventListener("pointermove", handleMove);
                      window.addEventListener("pointerup", handleUp);
                    },
                    children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.RotateCw, { className: "w-3 h-3" })
                  }
                )
              ]
            },
            text.id
          )),
          selectedMusic && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            import_react6.motion.div,
            {
              drag: true,
              dragMomentum: false,
              onDragStart: () => setIsDraggingMusic(true),
              onDrag: (event, info) => {
                if (trashRef.current) {
                  const rect = trashRef.current.getBoundingClientRect();
                  const isOver = info.point.x > rect.left && info.point.x < rect.right && info.point.y > rect.top && info.point.y < rect.bottom;
                  setIsOverTrash(isOver);
                }
              },
              onDragEnd: (event, info) => {
                setIsDraggingMusic(false);
                if (isOverTrash) {
                  handleRemoveMusic();
                }
                setIsOverTrash(false);
              },
              initial: { scale: 0, opacity: 0, rotate: -10 },
              animate: { scale: musicScale, opacity: 1, rotate: musicRotate },
              exit: { scale: 0, opacity: 0 },
              whileTap: { scale: musicScale * 1.05 },
              className: "absolute bg-white/10 backdrop-blur-xl text-white font-medium rounded-2xl p-2 pr-4 cursor-grab active:cursor-grabbing flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 group/music z-40",
              onClick: () => setShowMusicOptions(true),
              style: { left: "50%", top: "20%", x: "-50%", y: "-50%", transformOrigin: "center" },
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "relative w-10 h-10 rounded-xl overflow-hidden shadow-md shrink-0", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("img", { src: selectedMusic.coverUrl, className: "w-full h-full object-cover animate-[spin_10s_linear_infinite]" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "absolute inset-0 flex items-center justify-center bg-black/20", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Music, { className: "w-4 h-4 text-white drop-shadow-md" }) })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex flex-col items-start min-w-[100px] max-w-[160px] mr-2", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "font-bold text-sm truncate w-full shadow-black drop-shadow-sm", children: selectedMusic.title }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[10px] text-white/80 truncate w-full", children: selectedMusic.artist })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      setSelectedMusic(null);
                    },
                    className: "absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover/music:opacity-100 transition-all shadow-lg scale-75 group-hover/music:scale-100",
                    children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.X, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "div",
                  {
                    className: "absolute -bottom-3 -right-3 w-6 h-6 bg-white text-black rounded-full shadow-lg opacity-0 group-hover/music:opacity-100 transition-opacity flex items-center justify-center cursor-nwse-resize pointer-events-auto",
                    onPointerDown: (e) => {
                      e.stopPropagation();
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startScale = musicScale;
                      const startRotate = musicRotate;
                      const handleMove = (moveEvent) => {
                        const dx = moveEvent.clientX - startX;
                        const dy = moveEvent.clientY - startY;
                        setMusicScale(Math.max(0.5, startScale + (dx + dy) * 0.01));
                        setMusicRotate(startRotate + dx * 0.5);
                      };
                      const handleUp = () => {
                        window.removeEventListener("pointermove", handleMove);
                        window.removeEventListener("pointerup", handleUp);
                      };
                      window.addEventListener("pointermove", handleMove);
                      window.addEventListener("pointerup", handleUp);
                    },
                    children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.RotateCw, { className: "w-3 h-3" })
                  }
                )
              ]
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react6.AnimatePresence, { children: isDraggingMusic && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          import_react6.motion.div,
          {
            ref: trashRef,
            initial: { opacity: 0, y: 50 },
            animate: { opacity: 1, y: 0, scale: isOverTrash ? 1.5 : 1 },
            exit: { opacity: 0, y: 50 },
            className: `absolute bottom-32 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center z-50 transition-colors ${isOverTrash ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)]" : "bg-black/50 backdrop-blur-md text-white/80 border border-white/20"}`,
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Trash2, { className: "w-6 h-6" })
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react6.AnimatePresence, { children: editingTextId && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          import_react6.motion.div,
          {
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.9 },
            className: "absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-6",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex justify-between items-center mb-8", children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { onClick: () => setEditingTextId(null), className: "text-white text-lg font-medium", children: "Cancel" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "flex gap-2", children: ["#ffffff", "#000000", "#ef4444", "#a855f7", "#3b82f6", "#22c55e", "#eab308"].map((color) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                  "button",
                  {
                    onClick: () => setCurrentTextColor(color),
                    className: `w-8 h-8 rounded-full border-2 ${currentTextColor === color ? "border-white scale-110" : "border-white/20 hover:scale-110"} transition-transform`,
                    style: { backgroundColor: color }
                  },
                  color
                )) }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { onClick: saveTextOverlay, className: "text-white text-lg font-bold bg-white/20 px-6 py-2 rounded-full", children: "Done" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                "textarea",
                {
                  autoFocus: true,
                  value: currentInputText,
                  onChange: (e) => setCurrentInputText(e.target.value),
                  placeholder: "Type something...",
                  style: { color: currentTextColor },
                  className: "w-full flex-1 bg-transparent text-center text-4xl font-bold resize-none outline-none placeholder:text-white/30 leading-relaxed"
                }
              )
            ]
          }
        ) })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "relative z-30 flex flex-col bg-black", children: !previewUrl ? /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "px-4 pb-8 pt-4 bg-gradient-to-t from-black via-black/80 to-transparent", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "flex overflow-x-auto gap-4 mb-6 px-4 scrollbar-hide snap-x", children: FILTERS.map((f3) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            onClick: () => setActiveFilter(f3),
            className: `snap-center flex flex-col items-center gap-1 min-w-[64px] ${activeFilter.id === f3.id ? "opacity-100" : "opacity-50"}`,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: `w-14 h-14 rounded-full border-2 overflow-hidden ${activeFilter.id === f3.id ? "border-purple-500 scale-110" : "border-transparent"} transition-all`, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "w-full h-full bg-gradient-to-br from-purple-400 to-pink-500", style: { filter: f3.css } }) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "text-[10px] text-white font-medium", children: f3.name })
            ]
          },
          f3.id
        )) }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "flex items-center justify-between max-w-sm mx-auto w-full mb-6", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { onClick: () => fileInputRef.current?.click(), className: "w-12 h-12 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Image, { className: "w-6 h-6 text-white" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "relative flex items-center justify-center", children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("svg", { className: "absolute w-[100px] h-[100px] -rotate-90 pointer-events-none", children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "50", cy: "50", r: "48", fill: "transparent", stroke: "#3f3f46", strokeWidth: "4" }),
              isRecording && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "50", cy: "50", r: "48", fill: "transparent", stroke: "#ec4899", strokeWidth: "4", strokeDasharray: "301", strokeDashoffset: "0", className: "animate-[dash_15s_linear_forwards]" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              import_react6.motion.button,
              {
                whileTap: { scale: 0.9 },
                onPointerDown: () => {
                  if (activeMode === "video" || activeMode === "hands_free") {
                    recordTimeoutRef.current = setTimeout(() => startRecording(), 300);
                  } else if (activeMode === "story") {
                    recordTimeoutRef.current = setTimeout(() => {
                      if (!previewUrl) startRecording();
                    }, 500);
                  }
                },
                onPointerUp: () => {
                  if (recordTimeoutRef.current) {
                    clearTimeout(recordTimeoutRef.current);
                    recordTimeoutRef.current = null;
                  }
                  if (isRecording && activeMode !== "hands_free") {
                    stopRecording();
                  }
                },
                onClick: () => {
                  if (recordTimeoutRef.current) {
                    clearTimeout(recordTimeoutRef.current);
                    recordTimeoutRef.current = null;
                  }
                  if (isRecording && activeMode === "hands_free") {
                    stopRecording();
                  } else if (!isRecording && (activeMode === "photo" || activeMode === "story")) {
                    handleCapture();
                  }
                },
                className: `w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-[0_0_0_4px_rgba(255,255,255,0.2)] ${isRecording ? "bg-red-500 scale-75" : "bg-white"}`,
                children: isRecording && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "w-8 h-8 bg-black rounded-md" })
              }
            )
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { onClick: () => setFacingMode((f3) => f3 === "user" ? "environment" : "user"), className: "w-12 h-12 bg-zinc-900 rounded-full border border-zinc-800 flex items-center justify-center text-white", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.RotateCw, { className: "w-6 h-6" }) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          "div",
          {
            className: "flex overflow-x-auto gap-6 px-[50%] scrollbar-hide snap-x items-center h-8",
            style: { scrollSnapType: "x mandatory" },
            children: MODES.map((mode) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
              "button",
              {
                onClick: () => setActiveMode(mode.id),
                className: `snap-center whitespace-nowrap text-sm font-bold uppercase tracking-wider transition-colors ${activeMode === mode.id ? "text-white" : "text-zinc-500"}`,
                children: mode.name
              },
              mode.id
            ))
          }
        )
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "w-full flex items-center justify-between p-4 pb-8 max-w-lg mx-auto bg-black", children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "relative", children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            "button",
            {
              onClick: () => setShowAudienceMenu(!showAudienceMenu),
              className: "flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-4 py-3 rounded-full text-white font-medium transition-colors",
              children: [
                audience === "public" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Globe, { className: "w-4 h-4 text-blue-400" }),
                audience === "followers" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Users, { className: "w-4 h-4 text-purple-400" }),
                audience === "close_friends" && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Sparkles, { className: "w-4 h-4 text-green-400" }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "capitalize", children: audience.replace("_", " ") }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.ChevronDown, { className: "w-4 h-4 text-zinc-500" })
              ]
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react6.AnimatePresence, { children: showAudienceMenu && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
            import_react6.motion.div,
            {
              initial: { opacity: 0, y: 10 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: 10 },
              className: "absolute bottom-full left-0 mb-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden py-1 z-50",
              children: [
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { onClick: () => {
                  setAudience("public");
                  setShowAudienceMenu(false);
                }, className: "w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-zinc-800 text-left", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "p-2 bg-blue-500/20 rounded-full", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Globe, { className: "w-5 h-5 text-blue-400" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "font-medium", children: "Public" }),
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "text-xs text-zinc-400", children: "Anyone on Omnix" })
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { onClick: () => {
                  setAudience("followers");
                  setShowAudienceMenu(false);
                }, className: "w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-zinc-800 text-left", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "p-2 bg-purple-500/20 rounded-full", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Users, { className: "w-5 h-5 text-purple-400" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "font-medium", children: "Followers" }),
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "text-xs text-zinc-400", children: "Only your followers" })
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { onClick: () => {
                  setAudience("close_friends");
                  setShowAudienceMenu(false);
                }, className: "w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-zinc-800 text-left", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "p-2 bg-green-500/20 rounded-full", children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Sparkles, { className: "w-5 h-5 text-green-400" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { children: [
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "font-medium", children: "Close Friends" }),
                    /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "text-xs text-zinc-400", children: "Selected list" })
                  ] })
                ] })
              ]
            }
          ) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          "button",
          {
            onClick: handleUpload,
            disabled: isUploading,
            className: "flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-8 py-3 rounded-full text-white font-bold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-lg shadow-purple-500/25",
            children: [
              isUploading ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Loader2, { className: "w-5 h-5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_lucide_react3.Share2, { className: "w-5 h-5" }),
              isUploading ? "Posting..." : "Share Story"
            ]
          }
        )
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("input", { type: "file", ref: fileInputRef, className: "hidden", accept: "image/*,video/*", onChange: handleFileSelect }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_react6.AnimatePresence, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react6.AnimatePresence, { children: showMusicOptions && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
          import_react6.motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "absolute inset-0 z-50 flex items-end justify-center bg-black/50",
            onClick: () => setShowMusicOptions(false),
            children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
              import_react6.motion.div,
              {
                initial: { y: "100%" },
                animate: { y: 0 },
                exit: { y: "100%" },
                className: "w-full bg-zinc-950 rounded-t-3xl p-6 flex flex-col gap-2",
                onClick: (e) => e.stopPropagation(),
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-4" }),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                    "button",
                    {
                      onClick: () => {
                        setShowMusicOptions(false);
                        setMusicPickerMode("new");
                        setShowMusicPicker(true);
                      },
                      className: "w-full py-4 bg-zinc-900 rounded-xl text-white font-bold hover:bg-zinc-800 transition-colors",
                      children: "Change Music"
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                    "button",
                    {
                      onClick: () => {
                        setShowMusicOptions(false);
                        setMusicPickerMode("edit");
                        setShowMusicPicker(true);
                      },
                      className: "w-full py-4 bg-zinc-900 rounded-xl text-white font-bold hover:bg-zinc-800 transition-colors",
                      children: "Edit Clip"
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
                    "button",
                    {
                      onClick: handleRemoveMusic,
                      className: "w-full py-4 bg-red-500/10 text-red-500 rounded-xl font-bold hover:bg-red-500/20 transition-colors",
                      children: "Remove Music"
                    }
                  )
                ]
              }
            )
          }
        ) }),
        showMusicPicker && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
          import_react6.motion.div,
          {
            initial: { y: "100%" },
            animate: { y: 0 },
            exit: { y: "100%" },
            className: "absolute inset-x-0 bottom-0 top-0 z-50 pointer-events-auto",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "absolute inset-0 bg-black/50", onClick: () => setShowMusicPicker(false) }),
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(MusicPicker, { onSelect: handleMusicSelect, onClose: () => setShowMusicPicker(false), initialTrack: musicPickerMode === "edit" ? selectedMusic : void 0 })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_react6.AnimatePresence, { children: showEmojiPicker && /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
        import_react6.motion.div,
        {
          initial: { y: "100%" },
          animate: { y: 0 },
          exit: { y: "100%" },
          className: "absolute inset-x-0 bottom-0 top-0 z-50 pointer-events-auto",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "absolute inset-0 bg-black/50", onClick: () => setShowEmojiPicker(false) }),
            /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(EmojiPicker, { onSelect: addEmojiOverlay, onClose: () => setShowEmojiPicker(false) })
          ]
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("style", { dangerouslySetInnerHTML: { __html: `
        @keyframes dash { to { stroke-dashoffset: 0; } from { stroke-dashoffset: 301; } }
      ` } })
    ] });
  }

  // src/components/story/StoryViewer.tsx
  var import_react7 = __require("react");
  var import_react8 = __require("motion/react");
  var import_lucide_react4 = __require("lucide-react");

  // node_modules/date-fns/constants.js
  var daysInYear = 365.2425;
  var maxTime = Math.pow(10, 8) * 24 * 60 * 60 * 1e3;
  var minTime = -maxTime;
  var minutesInMonth = 43200;
  var minutesInDay = 1440;
  var secondsInHour = 3600;
  var secondsInDay = secondsInHour * 24;
  var secondsInWeek = secondsInDay * 7;
  var secondsInYear = secondsInDay * daysInYear;
  var secondsInMonth = secondsInYear / 12;
  var secondsInQuarter = secondsInMonth * 3;
  var constructFromSymbol = Symbol.for("constructDateFrom");

  // node_modules/date-fns/constructFrom.js
  function constructFrom(date, value) {
    if (typeof date === "function") return date(value);
    if (date && typeof date === "object" && constructFromSymbol in date)
      return date[constructFromSymbol](value);
    if (date instanceof Date) return new date.constructor(value);
    return new Date(value);
  }

  // node_modules/date-fns/toDate.js
  function toDate(argument, context) {
    return constructFrom(context || argument, argument);
  }

  // node_modules/date-fns/_lib/defaultOptions.js
  var defaultOptions = {};
  function getDefaultOptions() {
    return defaultOptions;
  }

  // node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds.js
  function getTimezoneOffsetInMilliseconds(date) {
    const _date = toDate(date);
    const utcDate = new Date(
      Date.UTC(
        _date.getFullYear(),
        _date.getMonth(),
        _date.getDate(),
        _date.getHours(),
        _date.getMinutes(),
        _date.getSeconds(),
        _date.getMilliseconds()
      )
    );
    utcDate.setUTCFullYear(_date.getFullYear());
    return +date - +utcDate;
  }

  // node_modules/date-fns/_lib/normalizeDates.js
  function normalizeDates(context, ...dates) {
    const normalize = constructFrom.bind(
      null,
      context || dates.find((date) => typeof date === "object")
    );
    return dates.map(normalize);
  }

  // node_modules/date-fns/compareAsc.js
  function compareAsc(dateLeft, dateRight) {
    const diff = +toDate(dateLeft) - +toDate(dateRight);
    if (diff < 0) return -1;
    else if (diff > 0) return 1;
    return diff;
  }

  // node_modules/date-fns/constructNow.js
  function constructNow(date) {
    return constructFrom(date, Date.now());
  }

  // node_modules/date-fns/differenceInCalendarMonths.js
  function differenceInCalendarMonths(laterDate, earlierDate, options) {
    const [laterDate_, earlierDate_] = normalizeDates(
      options?.in,
      laterDate,
      earlierDate
    );
    const yearsDiff = laterDate_.getFullYear() - earlierDate_.getFullYear();
    const monthsDiff = laterDate_.getMonth() - earlierDate_.getMonth();
    return yearsDiff * 12 + monthsDiff;
  }

  // node_modules/date-fns/_lib/getRoundingMethod.js
  function getRoundingMethod(method) {
    return (number) => {
      const round = method ? Math[method] : Math.trunc;
      const result = round(number);
      return result === 0 ? 0 : result;
    };
  }

  // node_modules/date-fns/differenceInMilliseconds.js
  function differenceInMilliseconds(laterDate, earlierDate) {
    return +toDate(laterDate) - +toDate(earlierDate);
  }

  // node_modules/date-fns/endOfDay.js
  function endOfDay(date, options) {
    const _date = toDate(date, options?.in);
    _date.setHours(23, 59, 59, 999);
    return _date;
  }

  // node_modules/date-fns/endOfMonth.js
  function endOfMonth(date, options) {
    const _date = toDate(date, options?.in);
    const month = _date.getMonth();
    _date.setFullYear(_date.getFullYear(), month + 1, 0);
    _date.setHours(23, 59, 59, 999);
    return _date;
  }

  // node_modules/date-fns/isLastDayOfMonth.js
  function isLastDayOfMonth(date, options) {
    const _date = toDate(date, options?.in);
    return +endOfDay(_date, options) === +endOfMonth(_date, options);
  }

  // node_modules/date-fns/differenceInMonths.js
  function differenceInMonths(laterDate, earlierDate, options) {
    const [laterDate_, workingLaterDate, earlierDate_] = normalizeDates(
      options?.in,
      laterDate,
      laterDate,
      earlierDate
    );
    const sign = compareAsc(workingLaterDate, earlierDate_);
    const difference = Math.abs(
      differenceInCalendarMonths(workingLaterDate, earlierDate_)
    );
    if (difference < 1) return 0;
    if (workingLaterDate.getMonth() === 1 && workingLaterDate.getDate() > 27)
      workingLaterDate.setDate(30);
    workingLaterDate.setMonth(workingLaterDate.getMonth() - sign * difference);
    let isLastMonthNotFull = compareAsc(workingLaterDate, earlierDate_) === -sign;
    if (isLastDayOfMonth(laterDate_) && difference === 1 && compareAsc(laterDate_, earlierDate_) === 1) {
      isLastMonthNotFull = false;
    }
    const result = sign * (difference - +isLastMonthNotFull);
    return result === 0 ? 0 : result;
  }

  // node_modules/date-fns/differenceInSeconds.js
  function differenceInSeconds(laterDate, earlierDate, options) {
    const diff = differenceInMilliseconds(laterDate, earlierDate) / 1e3;
    return getRoundingMethod(options?.roundingMethod)(diff);
  }

  // node_modules/date-fns/locale/en-US/_lib/formatDistance.js
  var formatDistanceLocale = {
    lessThanXSeconds: {
      one: "less than a second",
      other: "less than {{count}} seconds"
    },
    xSeconds: {
      one: "1 second",
      other: "{{count}} seconds"
    },
    halfAMinute: "half a minute",
    lessThanXMinutes: {
      one: "less than a minute",
      other: "less than {{count}} minutes"
    },
    xMinutes: {
      one: "1 minute",
      other: "{{count}} minutes"
    },
    aboutXHours: {
      one: "about 1 hour",
      other: "about {{count}} hours"
    },
    xHours: {
      one: "1 hour",
      other: "{{count}} hours"
    },
    xDays: {
      one: "1 day",
      other: "{{count}} days"
    },
    aboutXWeeks: {
      one: "about 1 week",
      other: "about {{count}} weeks"
    },
    xWeeks: {
      one: "1 week",
      other: "{{count}} weeks"
    },
    aboutXMonths: {
      one: "about 1 month",
      other: "about {{count}} months"
    },
    xMonths: {
      one: "1 month",
      other: "{{count}} months"
    },
    aboutXYears: {
      one: "about 1 year",
      other: "about {{count}} years"
    },
    xYears: {
      one: "1 year",
      other: "{{count}} years"
    },
    overXYears: {
      one: "over 1 year",
      other: "over {{count}} years"
    },
    almostXYears: {
      one: "almost 1 year",
      other: "almost {{count}} years"
    }
  };
  var formatDistance = (token, count, options) => {
    let result;
    const tokenValue = formatDistanceLocale[token];
    if (typeof tokenValue === "string") {
      result = tokenValue;
    } else if (count === 1) {
      result = tokenValue.one;
    } else {
      result = tokenValue.other.replace("{{count}}", count.toString());
    }
    if (options?.addSuffix) {
      if (options.comparison && options.comparison > 0) {
        return "in " + result;
      } else {
        return result + " ago";
      }
    }
    return result;
  };

  // node_modules/date-fns/locale/_lib/buildFormatLongFn.js
  function buildFormatLongFn(args) {
    return (options = {}) => {
      const width = options.width ? String(options.width) : args.defaultWidth;
      const format = args.formats[width] || args.formats[args.defaultWidth];
      return format;
    };
  }

  // node_modules/date-fns/locale/en-US/_lib/formatLong.js
  var dateFormats = {
    full: "EEEE, MMMM do, y",
    long: "MMMM do, y",
    medium: "MMM d, y",
    short: "MM/dd/yyyy"
  };
  var timeFormats = {
    full: "h:mm:ss a zzzz",
    long: "h:mm:ss a z",
    medium: "h:mm:ss a",
    short: "h:mm a"
  };
  var dateTimeFormats = {
    full: "{{date}} 'at' {{time}}",
    long: "{{date}} 'at' {{time}}",
    medium: "{{date}}, {{time}}",
    short: "{{date}}, {{time}}"
  };
  var formatLong = {
    date: buildFormatLongFn({
      formats: dateFormats,
      defaultWidth: "full"
    }),
    time: buildFormatLongFn({
      formats: timeFormats,
      defaultWidth: "full"
    }),
    dateTime: buildFormatLongFn({
      formats: dateTimeFormats,
      defaultWidth: "full"
    })
  };

  // node_modules/date-fns/locale/en-US/_lib/formatRelative.js
  var formatRelativeLocale = {
    lastWeek: "'last' eeee 'at' p",
    yesterday: "'yesterday at' p",
    today: "'today at' p",
    tomorrow: "'tomorrow at' p",
    nextWeek: "eeee 'at' p",
    other: "P"
  };
  var formatRelative = (token, _date, _baseDate, _options) => formatRelativeLocale[token];

  // node_modules/date-fns/locale/_lib/buildLocalizeFn.js
  function buildLocalizeFn(args) {
    return (value, options) => {
      const context = options?.context ? String(options.context) : "standalone";
      let valuesArray;
      if (context === "formatting" && args.formattingValues) {
        const defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
        const width = options?.width ? String(options.width) : defaultWidth;
        valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
      } else {
        const defaultWidth = args.defaultWidth;
        const width = options?.width ? String(options.width) : args.defaultWidth;
        valuesArray = args.values[width] || args.values[defaultWidth];
      }
      const index = args.argumentCallback ? args.argumentCallback(value) : value;
      return valuesArray[index];
    };
  }

  // node_modules/date-fns/locale/en-US/_lib/localize.js
  var eraValues = {
    narrow: ["B", "A"],
    abbreviated: ["BC", "AD"],
    wide: ["Before Christ", "Anno Domini"]
  };
  var quarterValues = {
    narrow: ["1", "2", "3", "4"],
    abbreviated: ["Q1", "Q2", "Q3", "Q4"],
    wide: ["1st quarter", "2nd quarter", "3rd quarter", "4th quarter"]
  };
  var monthValues = {
    narrow: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
    abbreviated: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ],
    wide: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ]
  };
  var dayValues = {
    narrow: ["S", "M", "T", "W", "T", "F", "S"],
    short: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    abbreviated: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    wide: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ]
  };
  var dayPeriodValues = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night"
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night"
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      night: "night"
    }
  };
  var formattingDayPeriodValues = {
    narrow: {
      am: "a",
      pm: "p",
      midnight: "mi",
      noon: "n",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night"
    },
    abbreviated: {
      am: "AM",
      pm: "PM",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night"
    },
    wide: {
      am: "a.m.",
      pm: "p.m.",
      midnight: "midnight",
      noon: "noon",
      morning: "in the morning",
      afternoon: "in the afternoon",
      evening: "in the evening",
      night: "at night"
    }
  };
  var ordinalNumber = (dirtyNumber, _options) => {
    const number = Number(dirtyNumber);
    const rem100 = number % 100;
    if (rem100 > 20 || rem100 < 10) {
      switch (rem100 % 10) {
        case 1:
          return number + "st";
        case 2:
          return number + "nd";
        case 3:
          return number + "rd";
      }
    }
    return number + "th";
  };
  var localize = {
    ordinalNumber,
    era: buildLocalizeFn({
      values: eraValues,
      defaultWidth: "wide"
    }),
    quarter: buildLocalizeFn({
      values: quarterValues,
      defaultWidth: "wide",
      argumentCallback: (quarter) => quarter - 1
    }),
    month: buildLocalizeFn({
      values: monthValues,
      defaultWidth: "wide"
    }),
    day: buildLocalizeFn({
      values: dayValues,
      defaultWidth: "wide"
    }),
    dayPeriod: buildLocalizeFn({
      values: dayPeriodValues,
      defaultWidth: "wide",
      formattingValues: formattingDayPeriodValues,
      defaultFormattingWidth: "wide"
    })
  };

  // node_modules/date-fns/locale/_lib/buildMatchFn.js
  function buildMatchFn(args) {
    return (string, options = {}) => {
      const width = options.width;
      const matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
      const matchResult = string.match(matchPattern);
      if (!matchResult) {
        return null;
      }
      const matchedString = matchResult[0];
      const parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
      const key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, (pattern) => pattern.test(matchedString)) : (
        // [TODO] -- I challenge you to fix the type
        findKey(parsePatterns, (pattern) => pattern.test(matchedString))
      );
      let value;
      value = args.valueCallback ? args.valueCallback(key) : key;
      value = options.valueCallback ? (
        // [TODO] -- I challenge you to fix the type
        options.valueCallback(value)
      ) : value;
      const rest = string.slice(matchedString.length);
      return { value, rest };
    };
  }
  function findKey(object, predicate) {
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key) && predicate(object[key])) {
        return key;
      }
    }
    return void 0;
  }
  function findIndex(array, predicate) {
    for (let key = 0; key < array.length; key++) {
      if (predicate(array[key])) {
        return key;
      }
    }
    return void 0;
  }

  // node_modules/date-fns/locale/_lib/buildMatchPatternFn.js
  function buildMatchPatternFn(args) {
    return (string, options = {}) => {
      const matchResult = string.match(args.matchPattern);
      if (!matchResult) return null;
      const matchedString = matchResult[0];
      const parseResult = string.match(args.parsePattern);
      if (!parseResult) return null;
      let value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
      value = options.valueCallback ? options.valueCallback(value) : value;
      const rest = string.slice(matchedString.length);
      return { value, rest };
    };
  }

  // node_modules/date-fns/locale/en-US/_lib/match.js
  var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
  var parseOrdinalNumberPattern = /\d+/i;
  var matchEraPatterns = {
    narrow: /^(b|a)/i,
    abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
    wide: /^(before christ|before common era|anno domini|common era)/i
  };
  var parseEraPatterns = {
    any: [/^b/i, /^(a|c)/i]
  };
  var matchQuarterPatterns = {
    narrow: /^[1234]/i,
    abbreviated: /^q[1234]/i,
    wide: /^[1234](th|st|nd|rd)? quarter/i
  };
  var parseQuarterPatterns = {
    any: [/1/i, /2/i, /3/i, /4/i]
  };
  var matchMonthPatterns = {
    narrow: /^[jfmasond]/i,
    abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
  };
  var parseMonthPatterns = {
    narrow: [
      /^j/i,
      /^f/i,
      /^m/i,
      /^a/i,
      /^m/i,
      /^j/i,
      /^j/i,
      /^a/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i
    ],
    any: [
      /^ja/i,
      /^f/i,
      /^mar/i,
      /^ap/i,
      /^may/i,
      /^jun/i,
      /^jul/i,
      /^au/i,
      /^s/i,
      /^o/i,
      /^n/i,
      /^d/i
    ]
  };
  var matchDayPatterns = {
    narrow: /^[smtwf]/i,
    short: /^(su|mo|tu|we|th|fr|sa)/i,
    abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
    wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
  };
  var parseDayPatterns = {
    narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
    any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
  };
  var matchDayPeriodPatterns = {
    narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
    any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
  };
  var parseDayPeriodPatterns = {
    any: {
      am: /^a/i,
      pm: /^p/i,
      midnight: /^mi/i,
      noon: /^no/i,
      morning: /morning/i,
      afternoon: /afternoon/i,
      evening: /evening/i,
      night: /night/i
    }
  };
  var match = {
    ordinalNumber: buildMatchPatternFn({
      matchPattern: matchOrdinalNumberPattern,
      parsePattern: parseOrdinalNumberPattern,
      valueCallback: (value) => parseInt(value, 10)
    }),
    era: buildMatchFn({
      matchPatterns: matchEraPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseEraPatterns,
      defaultParseWidth: "any"
    }),
    quarter: buildMatchFn({
      matchPatterns: matchQuarterPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseQuarterPatterns,
      defaultParseWidth: "any",
      valueCallback: (index) => index + 1
    }),
    month: buildMatchFn({
      matchPatterns: matchMonthPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseMonthPatterns,
      defaultParseWidth: "any"
    }),
    day: buildMatchFn({
      matchPatterns: matchDayPatterns,
      defaultMatchWidth: "wide",
      parsePatterns: parseDayPatterns,
      defaultParseWidth: "any"
    }),
    dayPeriod: buildMatchFn({
      matchPatterns: matchDayPeriodPatterns,
      defaultMatchWidth: "any",
      parsePatterns: parseDayPeriodPatterns,
      defaultParseWidth: "any"
    })
  };

  // node_modules/date-fns/locale/en-US.js
  var enUS = {
    code: "en-US",
    formatDistance,
    formatLong,
    formatRelative,
    localize,
    match,
    options: {
      weekStartsOn: 0,
      firstWeekContainsDate: 1
    }
  };

  // node_modules/date-fns/formatDistance.js
  function formatDistance2(laterDate, earlierDate, options) {
    const defaultOptions2 = getDefaultOptions();
    const locale = options?.locale ?? defaultOptions2.locale ?? enUS;
    const minutesInAlmostTwoDays = 2520;
    const comparison = compareAsc(laterDate, earlierDate);
    if (isNaN(comparison)) throw new RangeError("Invalid time value");
    const localizeOptions = Object.assign({}, options, {
      addSuffix: options?.addSuffix,
      comparison
    });
    const [laterDate_, earlierDate_] = normalizeDates(
      options?.in,
      ...comparison > 0 ? [earlierDate, laterDate] : [laterDate, earlierDate]
    );
    const seconds = differenceInSeconds(earlierDate_, laterDate_);
    const offsetInSeconds = (getTimezoneOffsetInMilliseconds(earlierDate_) - getTimezoneOffsetInMilliseconds(laterDate_)) / 1e3;
    const minutes = Math.round((seconds - offsetInSeconds) / 60);
    let months;
    if (minutes < 2) {
      if (options?.includeSeconds) {
        if (seconds < 5) {
          return locale.formatDistance("lessThanXSeconds", 5, localizeOptions);
        } else if (seconds < 10) {
          return locale.formatDistance("lessThanXSeconds", 10, localizeOptions);
        } else if (seconds < 20) {
          return locale.formatDistance("lessThanXSeconds", 20, localizeOptions);
        } else if (seconds < 40) {
          return locale.formatDistance("halfAMinute", 0, localizeOptions);
        } else if (seconds < 60) {
          return locale.formatDistance("lessThanXMinutes", 1, localizeOptions);
        } else {
          return locale.formatDistance("xMinutes", 1, localizeOptions);
        }
      } else {
        if (minutes === 0) {
          return locale.formatDistance("lessThanXMinutes", 1, localizeOptions);
        } else {
          return locale.formatDistance("xMinutes", minutes, localizeOptions);
        }
      }
    } else if (minutes < 45) {
      return locale.formatDistance("xMinutes", minutes, localizeOptions);
    } else if (minutes < 90) {
      return locale.formatDistance("aboutXHours", 1, localizeOptions);
    } else if (minutes < minutesInDay) {
      const hours = Math.round(minutes / 60);
      return locale.formatDistance("aboutXHours", hours, localizeOptions);
    } else if (minutes < minutesInAlmostTwoDays) {
      return locale.formatDistance("xDays", 1, localizeOptions);
    } else if (minutes < minutesInMonth) {
      const days = Math.round(minutes / minutesInDay);
      return locale.formatDistance("xDays", days, localizeOptions);
    } else if (minutes < minutesInMonth * 2) {
      months = Math.round(minutes / minutesInMonth);
      return locale.formatDistance("aboutXMonths", months, localizeOptions);
    }
    months = differenceInMonths(earlierDate_, laterDate_);
    if (months < 12) {
      const nearestMonth = Math.round(minutes / minutesInMonth);
      return locale.formatDistance("xMonths", nearestMonth, localizeOptions);
    } else {
      const monthsSinceStartOfYear = months % 12;
      const years = Math.trunc(months / 12);
      if (monthsSinceStartOfYear < 3) {
        return locale.formatDistance("aboutXYears", years, localizeOptions);
      } else if (monthsSinceStartOfYear < 9) {
        return locale.formatDistance("overXYears", years, localizeOptions);
      } else {
        return locale.formatDistance("almostXYears", years + 1, localizeOptions);
      }
    }
  }

  // node_modules/date-fns/formatDistanceToNow.js
  function formatDistanceToNow(date, options) {
    return formatDistance2(date, constructNow(date), options);
  }

  // src/components/story/StoryViewer.tsx
  var import_react_router_dom = __require("react-router-dom");
  var import_jsx_runtime4 = __require("react/jsx-runtime");
  function StoryViewer({ storyGroups, initialUserIndex, initialStoryIndex = 0, onClose }) {
    const { user } = useAuthStore();
    const [currentUserIndex, setCurrentUserIndex] = (0, import_react7.useState)(initialUserIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = (0, import_react7.useState)(initialStoryIndex);
    const [isPaused, setIsPaused] = (0, import_react7.useState)(false);
    const [progress, setProgress] = (0, import_react7.useState)(0);
    const [isMuted, setIsMuted] = (0, import_react7.useState)(false);
    const [showMenu, setShowMenu] = (0, import_react7.useState)(false);
    const [liveViewCount, setLiveViewCount] = (0, import_react7.useState)(0);
    const audioRef = (0, import_react7.useRef)(null);
    const [musicTrack, setMusicTrack] = (0, import_react7.useState)(null);
    const [showReactions, setShowReactions] = (0, import_react7.useState)(false);
    const [replyText, setReplyText] = (0, import_react7.useState)("");
    const [toastMessage, setToastMessage] = (0, import_react7.useState)(null);
    const [isPinned, setIsPinned] = (0, import_react7.useState)(false);
    const showToast = (msg) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3e3);
    };
    const videoRef = (0, import_react7.useRef)(null);
    const progressInterval = (0, import_react7.useRef)(null);
    const currentGroup = storyGroups[currentUserIndex];
    const currentStory = currentGroup?.stories[currentStoryIndex];
    const isOwnStory = user?.id === currentGroup?.userId;
    let dynamicDuration = 5e3;
    if (currentStory) {
      let track = null;
      if (currentStory.music) {
        try {
          track = JSON.parse(currentStory.music);
        } catch (e) {
        }
      } else if (currentStory.caption && currentStory.caption.includes("|||MUSIC|||")) {
        try {
          track = JSON.parse(currentStory.caption.split("|||MUSIC|||")[1]);
        } catch (e) {
        }
      }
      if (track) {
        const trimDur = track.trimDuration !== void 0 ? track.trimDuration : typeof track.duration === "number" ? track.duration : 30;
        if (trimDur) {
          dynamicDuration = trimDur * 1e3;
        }
      }
    }
    const storyDuration = dynamicDuration;
    (0, import_react7.useEffect)(() => {
      if (!currentStory || !user) return;
      const pinned = JSON.parse(localStorage.getItem("pinned_stories") || "[]");
      setIsPinned(pinned.includes(currentStory.id));
      setLiveViewCount(currentStory.view_count || 0);
      const trackView = async () => {
        try {
          const { error } = await supabase.from("story_views").insert({
            story_id: currentStory.id,
            user_id: user.id
          });
          if (error) {
            console.log("Track view error (might be duplicate):", error);
          } else {
            setLiveViewCount((prev) => prev + 1);
          }
        } catch (e) {
          console.error("Exception in trackView:", e);
        }
      };
      if (!isOwnStory) {
        trackView();
      }
      const channel = supabase.channel(`story-${currentStory.id}`).on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "stories",
          filter: `id=eq.${currentStory.id}`
        },
        (payload) => {
          if (payload.new && payload.new.view_count !== void 0) {
            setLiveViewCount(payload.new.view_count);
          }
        }
      ).subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }, [currentStory, user, isOwnStory]);
    (0, import_react7.useEffect)(() => {
      if (!currentStory) return;
      let track = null;
      if (currentStory.music) {
        try {
          track = JSON.parse(currentStory.music);
        } catch (e) {
        }
      } else if (currentStory.caption && currentStory.caption.includes("|||MUSIC|||")) {
        try {
          track = JSON.parse(currentStory.caption.split("|||MUSIC|||")[1]);
        } catch (e) {
        }
      }
      if (track) {
        try {
          const parsedMusic = {
            ...track,
            previewUrl: track.preview_url || track.previewUrl,
            startTime: track.start_time !== void 0 ? track.start_time : track.startTime,
            trimDuration: track.trimDuration !== void 0 ? track.trimDuration : typeof track.duration === "number" ? track.duration : 30,
            coverUrl: track.artwork || track.coverUrl
          };
          setMusicTrack(parsedMusic);
          if (parsedMusic.previewUrl && !isMuted) {
            const audio = new Audio(parsedMusic.previewUrl);
            audio.currentTime = parsedMusic.startTime || 0;
            audio.volume = parsedMusic.volume !== void 0 ? parsedMusic.volume : 1;
            audioRef.current = audio;
            const handleTimeUpdate = () => {
              const endTime = (parsedMusic.startTime || 0) + (parsedMusic.trimDuration || 30);
              if (audio.currentTime >= endTime) {
                audio.currentTime = parsedMusic.startTime || 0;
              }
            };
            audio.addEventListener("timeupdate", handleTimeUpdate);
            audioRef.current._handleTimeUpdate = handleTimeUpdate;
          }
        } catch (e) {
          console.error("Failed to parse music", e);
          setMusicTrack(null);
        }
      } else {
        setMusicTrack(null);
      }
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          if (audioRef.current._handleTimeUpdate) {
            audioRef.current.removeEventListener("timeupdate", audioRef.current._handleTimeUpdate);
          }
          audioRef.current = null;
        }
      };
    }, [currentStory, isMuted]);
    (0, import_react7.useEffect)(() => {
      if (audioRef.current) {
        if (isPaused) {
          audioRef.current.pause();
        } else {
          const playPromise = audioRef.current.play();
          if (playPromise !== void 0) {
            playPromise.catch((e) => {
              if (e.name !== "AbortError") console.error("Audio playback blocked", e);
            });
          }
        }
      }
      if (videoRef.current) {
        if (isPaused) {
          videoRef.current.pause();
        } else {
          const playPromise = videoRef.current.play();
          if (playPromise !== void 0) {
            playPromise.catch((e) => {
              if (e.name !== "AbortError") console.error("Video playback blocked", e);
            });
          }
        }
      }
    }, [isPaused, musicTrack, currentStoryIndex, isMuted]);
    const nextStory = (0, import_react7.useCallback)(() => {
      if (currentStoryIndex < currentGroup.stories.length - 1) {
        setCurrentStoryIndex((c) => c + 1);
      } else if (currentUserIndex < storyGroups.length - 1) {
        setCurrentUserIndex((c) => c + 1);
        setCurrentStoryIndex(0);
      } else {
        onClose();
      }
    }, [currentStoryIndex, currentUserIndex, currentGroup?.stories.length, storyGroups.length, onClose]);
    const prevStory = (0, import_react7.useCallback)(() => {
      if (currentStoryIndex > 0) {
        setCurrentStoryIndex((c) => c - 1);
      } else if (currentUserIndex > 0) {
        setCurrentUserIndex((c) => c - 1);
        setCurrentStoryIndex(storyGroups[currentUserIndex - 1].stories.length - 1);
      }
    }, [currentStoryIndex, currentUserIndex, storyGroups]);
    (0, import_react7.useEffect)(() => {
      if (progress >= 100) {
        nextStory();
      }
    }, [progress, nextStory]);
    (0, import_react7.useEffect)(() => {
      setProgress(0);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }, [currentStoryIndex, currentUserIndex]);
    (0, import_react7.useEffect)(() => {
      if (!currentStory) return;
      if (progressInterval.current !== null) {
        clearInterval(progressInterval.current);
      }
      if (isPaused) return;
      if ((currentStory.media_url?.endsWith(".mp4") || currentStory.media_url?.endsWith(".webm")) && videoRef.current) {
        const video = videoRef.current;
        const playPromise = video.play();
        if (playPromise !== void 0) {
          playPromise.catch((e) => {
            if (e.name !== "AbortError") console.error("Video playback blocked", e);
          });
        }
        const updateProgress = () => {
          if (!isPaused) {
            const percent = video.currentTime / video.duration * 100;
            setProgress(percent);
          }
        };
        video.addEventListener("timeupdate", updateProgress);
        return () => {
          video.removeEventListener("timeupdate", updateProgress);
        };
      } else {
        const interval = 50;
        const step = interval / storyDuration * 100;
        progressInterval.current = window.setInterval(() => {
          setProgress((p2) => {
            if (p2 >= 100) return 100;
            return p2 + step;
          });
        }, interval);
        return () => {
          if (progressInterval.current !== null) {
            clearInterval(progressInterval.current);
          }
        };
      }
    }, [currentStory, isPaused, storyDuration]);
    const handleTap = (e) => {
      const width = e.currentTarget.offsetWidth;
      const x3 = e.nativeEvent.offsetX;
      if (x3 < width / 3) {
        prevStory();
      } else {
        nextStory();
      }
    };
    const handlePin = () => {
      if (!currentStory) return;
      try {
        const pinned = JSON.parse(localStorage.getItem("pinned_stories") || "[]");
        if (pinned.includes(currentStory.id)) {
          const newPinned = pinned.filter((id) => id !== currentStory.id);
          localStorage.setItem("pinned_stories", JSON.stringify(newPinned));
          setIsPinned(false);
          showToast("Story unpinned");
        } else {
          pinned.push(currentStory.id);
          localStorage.setItem("pinned_stories", JSON.stringify(pinned));
          setIsPinned(true);
          showToast("Story pinned");
        }
      } catch (e) {
        console.error(e);
        showToast("Failed to pin story");
      }
    };
    const handleShare = async () => {
      if (!currentStory) return;
      const shareData = {
        title: "Story",
        text: "Check out this story!",
        url: window.location.origin + "/story/" + currentStory.id
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (e) {
        }
      } else {
        navigator.clipboard.writeText(shareData.url);
        showToast("Link copied to clipboard");
        showToast("Link copied to clipboard");
      }
    };
    const handleSend = () => {
      if (!replyText.trim()) return;
      setReplyText("");
      showToast("Message sent to " + (currentGroup?.username || "user"));
      setIsPaused(false);
    };
    const handleReaction = (emoji) => {
      showToast(`Reaction ${emoji} sent`);
      setShowReactions(false);
      setIsPaused(false);
    };
    const handleDragEnd = (e, info) => {
      if (info.offset.y > 100 || info.velocity.y > 500) {
        onClose();
      } else if (info.offset.x > 100) {
        if (currentUserIndex > 0) {
          setCurrentUserIndex((c) => c - 1);
          setCurrentStoryIndex(0);
        }
      } else if (info.offset.x < -100) {
        if (currentUserIndex < storyGroups.length - 1) {
          setCurrentUserIndex((c) => c + 1);
          setCurrentStoryIndex(0);
        } else {
          onClose();
        }
      }
    };
    const [isDeleting, setIsDeleting] = (0, import_react7.useState)(false);
    const handleDeleteStory = async () => {
      if (!currentStory || !isOwnStory || isDeleting) return;
      setIsPaused(true);
      setIsDeleting(true);
      try {
        const { error } = await supabase.from("stories").delete().eq("id", currentStory.id);
        if (error) throw error;
        if (currentStory.media_url && currentStory.media_url.includes("storage/v1/object/public/stories/")) {
          const path = currentStory.media_url.split("storage/v1/object/public/stories/")[1];
          if (path) {
            await supabase.storage.from("stories").remove([path]);
          }
        }
        onClose();
      } catch (e) {
        console.error("Failed to delete story:", e);
        setIsPaused(false);
        setIsDeleting(false);
        showToast("Failed to delete story");
      }
    };
    if (!currentGroup || !currentStory) return null;
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_react8.AnimatePresence, { children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
      import_react8.motion.div,
      {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { type: "spring", damping: 25, stiffness: 300 },
        className: "fixed inset-0 z-[200] bg-black sm:bg-black/90 touch-none flex flex-col justify-center items-center backdrop-blur-sm",
        children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
          import_react8.motion.div,
          {
            className: "relative w-full h-full sm:max-w-[480px] sm:h-[85vh] bg-zinc-950 sm:rounded-[32px] overflow-hidden shadow-2xl flex flex-col sm:border sm:border-zinc-800",
            drag: "y",
            dragConstraints: { top: 0, bottom: 0 },
            onDragEnd: handleDragEnd,
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "absolute top-0 inset-x-0 pt-4 px-2 z-30 flex gap-1 bg-gradient-to-b from-black/80 via-black/40 to-transparent pb-8", children: currentGroup.stories.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "h-1 flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                "div",
                {
                  className: "h-full bg-white transition-all duration-75 ease-linear",
                  style: { width: i === currentStoryIndex ? `${progress}%` : i < currentStoryIndex ? "100%" : "0%" }
                }
              ) }, s.id)) }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "absolute top-6 inset-x-0 px-4 pt-2 z-30 flex items-center justify-between", children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(import_react_router_dom.Link, { to: `/@${currentGroup.username}`, className: "flex items-center gap-3 drop-shadow-md", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "w-10 h-10 rounded-full overflow-hidden border border-white/20", children: currentGroup.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("img", { src: currentGroup.avatar_url, alt: currentGroup.username, className: "w-full h-full object-cover" }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "w-full h-full bg-zinc-800 flex items-center justify-center text-white font-bold", children: currentGroup.username.charAt(0).toUpperCase() }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex flex-col", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-1.5", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-white font-bold text-sm drop-shadow-md", children: currentGroup.username }),
                      /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("span", { className: "text-white/80 text-xs", children: [
                        "\u2022 ",
                        formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true })
                      ] })
                    ] }),
                    currentStory.privacy === "close_friends" && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-1 bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded text-[10px] w-fit font-medium backdrop-blur", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.Sparkles, { className: "w-3 h-3" }),
                      " Close Friends"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-2 drop-shadow-md", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { onClick: () => setIsMuted(!isMuted), className: "p-2 text-white hover:bg-white/20 rounded-full transition-colors backdrop-blur", children: isMuted ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.VolumeX, { className: "w-5 h-5" }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.Volume2, { className: "w-5 h-5" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { onClick: () => {
                    setIsPaused(true);
                    setShowMenu(true);
                  }, className: "p-2 text-white hover:bg-white/20 rounded-full transition-colors backdrop-blur", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.MoreHorizontal, { className: "w-5 h-5" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { onClick: onClose, className: "p-2 text-white hover:bg-white/20 rounded-full transition-colors backdrop-blur", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.X, { className: "w-6 h-6" }) })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                "div",
                {
                  className: "flex-1 relative bg-black flex items-center justify-center overflow-hidden",
                  onClick: handleTap,
                  onPointerDown: () => setIsPaused(true),
                  onPointerUp: () => setIsPaused(false),
                  onPointerLeave: () => setIsPaused(false),
                  children: [
                    currentStory.media_url?.endsWith(".mp4") || currentStory.media_url?.endsWith(".webm") ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                      "video",
                      {
                        ref: videoRef,
                        src: currentStory.media_url,
                        className: "w-full h-full object-cover sm:object-contain",
                        playsInline: true,
                        muted: isMuted,
                        loop: false
                      }
                    ) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                      "img",
                      {
                        src: currentStory.media_url,
                        alt: "Story",
                        className: "w-full h-full object-cover sm:object-contain"
                      }
                    ),
                    musicTrack && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                      "div",
                      {
                        className: "absolute z-20 bg-white/10 backdrop-blur-xl text-white font-medium rounded-2xl p-2 pr-4 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 pointer-events-none",
                        style: { left: "50%", top: "20%", transform: "translate(-50%, -50%) rotate(-10deg)" },
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "relative w-10 h-10 rounded-xl overflow-hidden shadow-md shrink-0", children: [
                            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("img", { src: musicTrack.coverUrl, className: `w-full h-full object-cover ${!isPaused ? "animate-[spin_10s_linear_infinite]" : ""}`, alt: "Album art" }),
                            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "absolute inset-0 flex items-center justify-center bg-black/20", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.Music, { className: "w-4 h-4 text-white drop-shadow-md" }) })
                          ] }),
                          /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex flex-col items-start min-w-[100px] max-w-[160px] mr-2", children: [
                            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "font-bold text-sm truncate w-full shadow-black drop-shadow-sm", children: musicTrack.title }),
                            /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "text-[10px] text-white/80 truncate w-full", children: musicTrack.artist })
                          ] })
                        ]
                      }
                    ),
                    currentStory.caption && currentStory.caption.split("|||MUSIC|||")[0] && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "absolute bottom-28 inset-x-8 text-center z-20 pointer-events-none", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "inline-block bg-black/60 text-white px-5 py-3 rounded-2xl text-lg font-medium backdrop-blur-md whitespace-pre-wrap shadow-xl border border-white/10", children: currentStory.caption.split("|||MUSIC|||")[0] }) })
                  ]
                }
              ),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "absolute bottom-0 inset-x-0 p-4 pt-12 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none", children: isOwnStory ? /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center justify-between pointer-events-auto pb-4", children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("button", { className: "flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-white backdrop-blur transition-colors text-sm font-medium", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.Eye, { className: "w-4 h-4" }),
                  liveViewCount,
                  " views"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { onClick: handlePin, className: `p-3 hover:bg-white/20 rounded-full text-white backdrop-blur transition-colors ${isPinned ? "bg-pink-500" : "bg-white/10"}`, children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.Pin, { className: `w-5 h-5 ${isPinned ? "fill-white" : ""}` }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { onClick: handleShare, className: "p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur transition-colors", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.Share2, { className: "w-5 h-5" }) })
                ] })
              ] }) : /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex flex-col gap-2 pointer-events-auto", children: [
                /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_react8.AnimatePresence, { children: showReactions && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                  import_react8.motion.div,
                  {
                    initial: { opacity: 0, y: 20 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: 20 },
                    className: "flex justify-between items-center bg-black/60 backdrop-blur-xl p-3 rounded-full border border-white/10 mb-2 shadow-2xl",
                    children: ["\u{1F602}", "\u{1F62E}", "\u{1F60D}", "\u{1F622}", "\u{1F44F}", "\u{1F525}"].map((emoji) => /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("button", { onClick: () => handleReaction(emoji), className: "text-3xl hover:scale-125 transition-transform hover:-translate-y-2 relative group", children: [
                      emoji,
                      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity", children: "Send" })
                    ] }, emoji))
                  }
                ) }),
                /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex items-center gap-3 pb-2 sm:pb-4", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "flex-1 relative group", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                    "input",
                    {
                      type: "text",
                      placeholder: `Reply to ${currentGroup.username}...`,
                      value: replyText,
                      onChange: (e) => setReplyText(e.target.value),
                      onKeyDown: (e) => e.key === "Enter" && handleSend(),
                      onFocus: () => {
                        setIsPaused(true);
                        setShowReactions(false);
                      },
                      onBlur: () => setIsPaused(false),
                      className: "w-full bg-transparent border border-white/30 text-white placeholder:text-white/70 px-6 py-3.5 rounded-full outline-none focus:bg-white/10 focus:border-white/50 transition-all backdrop-blur-md"
                    }
                  ) }),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                    "button",
                    {
                      onClick: () => setShowReactions(!showReactions),
                      className: `p-3.5 rounded-full text-white transition-all backdrop-blur-md ${showReactions ? "bg-pink-500 shadow-lg shadow-pink-500/50" : "bg-transparent border border-white/30 hover:bg-white/10"}`,
                      children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.Heart, { className: `w-6 h-6 ${showReactions ? "fill-white" : ""}` })
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("button", { onClick: handleSend, className: "p-3.5 bg-transparent border border-white/30 hover:bg-white/10 rounded-full text-white transition-all backdrop-blur-md", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.Send, { className: "w-6 h-6" }) })
                ] })
              ] }) }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_react8.AnimatePresence, { children: toastMessage && /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)(
                import_react8.motion.div,
                {
                  initial: { opacity: 0, y: 50, x: "-50%" },
                  animate: { opacity: 1, y: 0, x: "-50%" },
                  exit: { opacity: 0, y: 50, x: "-50%" },
                  className: "absolute bottom-24 left-1/2 z-50 bg-white text-black px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 pointer-events-none whitespace-nowrap",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_lucide_react4.Sparkles, { className: "w-5 h-5 text-pink-500" }),
                    toastMessage
                  ]
                }
              ) }),
              /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(import_react8.AnimatePresence, { children: showMenu && /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                import_react8.motion.div,
                {
                  initial: { opacity: 0 },
                  animate: { opacity: 1 },
                  exit: { opacity: 0 },
                  className: "absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto",
                  onClick: () => {
                    setShowMenu(false);
                    setIsPaused(false);
                  },
                  children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                    import_react8.motion.div,
                    {
                      initial: { scale: 0.95 },
                      animate: { scale: 1 },
                      exit: { scale: 0.95 },
                      className: "bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-[300px] overflow-hidden",
                      onClick: (e) => e.stopPropagation(),
                      children: /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "flex flex-col", children: [
                        isOwnStory ? /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                          "button",
                          {
                            onClick: () => {
                              handleDeleteStory();
                            },
                            disabled: isDeleting,
                            className: "py-4 font-bold text-red-500 hover:bg-white/5 active:bg-white/10 border-b border-white/10 transition-colors disabled:opacity-50",
                            children: isDeleting ? "Deleting..." : "Delete Story"
                          }
                        ) : /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                          "button",
                          {
                            onClick: () => {
                              showToast("Story reported to moderators");
                              setShowMenu(false);
                              setIsPaused(false);
                            },
                            className: "py-4 font-bold text-red-500 hover:bg-white/5 active:bg-white/10 border-b border-white/10 transition-colors",
                            children: "Report"
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                          "button",
                          {
                            onClick: () => {
                              navigator.clipboard.writeText(`${window.location.origin}/@${currentGroup.username}/story/${currentStory.id}`);
                              showToast("Link copied to clipboard");
                              setShowMenu(false);
                              setIsPaused(false);
                            },
                            className: "py-4 font-medium text-white hover:bg-white/5 active:bg-white/10 border-b border-white/10 transition-colors",
                            children: "Copy Link"
                          }
                        ),
                        /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(
                          "button",
                          {
                            onClick: () => {
                              setShowMenu(false);
                              setIsPaused(false);
                            },
                            className: "py-4 font-medium text-white/70 hover:bg-white/5 active:bg-white/10 transition-colors",
                            children: "Cancel"
                          }
                        )
                      ] })
                    }
                  )
                }
              ) })
            ]
          }
        )
      }
    ) });
  }

  // src/components/StoriesBar.tsx
  var import_jsx_runtime5 = __require("react/jsx-runtime");
  function StoriesBar() {
    const { user } = useAuthStore();
    const [isCreatorOpen, setIsCreatorOpen] = (0, import_react9.useState)(false);
    const [viewerState, setViewerState] = (0, import_react9.useState)({
      isOpen: false,
      initialUserIndex: 0,
      initialStoryIndex: 0
    });
    const { data: currentUserProfile } = (0, import_react_query.useQuery)({
      queryKey: ["profile", user?.id],
      queryFn: async () => {
        if (!user) return null;
        const { data, error } = await supabase.from("profiles").select("avatar_url, username").eq("id", user.id).single();
        if (error) throw error;
        return data;
      },
      enabled: !!user
    });
    const { data: stories, refetch } = (0, import_react_query.useQuery)({
      queryKey: ["stories"],
      queryFn: async () => {
        const { data, error } = await supabase.from("stories").select(`
          id,
          media_url,
          music,
          view_count,
          caption,
          created_at,
          user_id,
          user:users!stories_user_id_fkey(username, full_name)
        `).gt("expires_at", (/* @__PURE__ */ new Date()).toISOString()).order("created_at", { ascending: true });
        if (error) throw error;
        return data || [];
      }
    });
    const storyGroups = (0, import_react9.useMemo)(() => {
      if (!stories) return [];
      const groupsMap = /* @__PURE__ */ new Map();
      stories.forEach((story) => {
        const dbUserRecord = Array.isArray(story.user) ? story.user[0] : story.user;
        if (!groupsMap.has(story.user_id)) {
          groupsMap.set(story.user_id, {
            userId: story.user_id,
            username: dbUserRecord?.username || "Unknown",
            avatar_url: null,
            // Since users table doesn't have avatar_url
            stories: [],
            hasCloseFriends: false
          });
        }
        const group = groupsMap.get(story.user_id);
        group.stories.push(story);
      });
      const groupsArray = Array.from(groupsMap.values());
      const currentUserGroup2 = groupsArray.find((g2) => g2.userId === user?.id);
      const otherGroups = groupsArray.filter((g2) => g2.userId !== user?.id);
      return currentUserGroup2 ? [currentUserGroup2, ...otherGroups] : otherGroups;
    }, [stories, user?.id]);
    const currentUserGroup = storyGroups.find((g2) => g2.userId === user?.id);
    const currentUserHasStory = !!currentUserGroup;
    const getRingColor = (hasCloseFriends) => {
      return hasCloseFriends ? "from-green-400 via-emerald-500 to-teal-500" : "from-pink-500 via-purple-500 to-yellow-500";
    };
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(import_jsx_runtime5.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "w-full bg-zinc-950 border-b border-zinc-900 pb-2", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex overflow-x-auto gap-4 p-4 scrollbar-hide items-center", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex flex-col items-center gap-1.5 cursor-pointer relative min-w-[76px] group", children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "div",
            {
              className: `w-[72px] h-[72px] rounded-full p-[2px] transition-transform group-hover:scale-105 ${currentUserHasStory ? `bg-gradient-to-tr ${getRingColor(currentUserGroup.hasCloseFriends)}` : "bg-zinc-800"}`,
              onClick: () => {
                if (currentUserHasStory) {
                  setViewerState({ isOpen: true, initialUserIndex: 0, initialStoryIndex: 0 });
                } else {
                  setIsCreatorOpen(true);
                }
              },
              children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "w-full h-full rounded-full bg-zinc-950 p-[3px]", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "w-full h-full rounded-full overflow-hidden bg-zinc-800 shadow-inner", children: currentUserProfile?.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("img", { src: currentUserProfile.avatar_url, alt: "Your story", className: "w-full h-full object-cover" }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "w-full h-full flex items-center justify-center text-zinc-500", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react5.User, { className: "w-6 h-6" }) }) }) })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                setIsCreatorOpen(true);
              },
              className: "absolute bottom-6 right-0 bg-purple-500 hover:bg-purple-400 rounded-full p-1.5 border-[3px] border-zinc-950 shadow-lg transition-transform hover:scale-110 active:scale-95",
              children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react5.Plus, { className: "w-3.5 h-3.5 text-white stroke-[3]" })
            }
          ),
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "text-xs text-zinc-400 font-medium tracking-tight", children: "Your Story" })
        ] }),
        storyGroups.filter((g2) => g2.userId !== user?.id).map((group, index) => /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
          "div",
          {
            className: "flex flex-col items-center gap-1.5 cursor-pointer group min-w-[76px]",
            onClick: () => setViewerState({ isOpen: true, initialUserIndex: currentUserHasStory ? index + 1 : index, initialStoryIndex: 0 }),
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: `w-[72px] h-[72px] rounded-full p-[2px] bg-gradient-to-tr ${getRingColor(group.hasCloseFriends)} transition-transform group-hover:scale-105`, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "w-full h-full rounded-full bg-zinc-950 p-[3px]", children: /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "w-full h-full rounded-full overflow-hidden bg-zinc-800 relative shadow-inner", children: [
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("img", { src: group.stories[0].media_url, alt: "", className: "w-full h-full object-cover opacity-60 absolute inset-0 mix-blend-overlay" }),
                group.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("img", { src: group.avatar_url, alt: "Avatar", className: "w-full h-full object-cover relative z-10" }) : /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "w-full h-full flex items-center justify-center text-zinc-300 font-bold bg-black/60 relative z-10", children: group.username?.charAt(0)?.toUpperCase() || "U" })
              ] }) }) }),
              /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "flex items-center gap-1", children: [
                group.hasCloseFriends && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(import_lucide_react5.Sparkles, { className: "w-2.5 h-2.5 text-green-400" }),
                /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "text-xs text-zinc-300 font-medium truncate w-16 text-center tracking-tight", children: group.username })
              ] })
            ]
          },
          group.userId
        ))
      ] }) }),
      isCreatorOpen && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        StoryCreator,
        {
          onClose: () => setIsCreatorOpen(false),
          onSuccess: () => {
            setIsCreatorOpen(false);
            refetch();
          }
        }
      ),
      viewerState.isOpen && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(
        StoryViewer,
        {
          storyGroups,
          initialUserIndex: viewerState.initialUserIndex,
          initialStoryIndex: viewerState.initialStoryIndex,
          onClose: () => setViewerState({ ...viewerState, isOpen: false })
        }
      )
    ] });
  }

  // src/components/CreatePost.tsx
  var import_react11 = __require("react");

  // src/lib/storage.ts
  var uploadMedia = async (bucket, path, file) => {
    const uploadRes = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (uploadRes.error) {
      if (uploadRes.error.message.includes("not found") || uploadRes.error.message.includes("bucket")) {
        try {
          await supabase.storage.createBucket(bucket, { public: true });
          const retryRes = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
          if (retryRes.error) {
            throw new Error(`Upload failed after bucket creation: ${retryRes.error.message}`);
          }
        } catch (createErr) {
          throw new Error(`Storage bucket '${bucket}' is missing and could not be created. Error: ${createErr.message || "Unknown"}`);
        }
      } else {
        throw new Error(`Storage error: ${uploadRes.error.message}`);
      }
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  // src/components/CreatePost.tsx
  var import_react_query2 = __require("@tanstack/react-query");
  var import_lucide_react7 = __require("lucide-react");
  var import_browser_image_compression2 = __toESM(__require("browser-image-compression"), 1);
  var import_react12 = __require("motion/react");

  // src/components/PostEditorModal.tsx
  var import_react10 = __require("react");
  var import_lucide_react6 = __require("lucide-react");
  var import_jsx_runtime6 = __require("react/jsx-runtime");
  function PostEditorModal({ mediaFile, previewUrl, onClose, onSave }) {
    const [filter, setFilter] = (0, import_react10.useState)("none");
    const [brightness, setBrightness] = (0, import_react10.useState)(100);
    const [contrast, setContrast] = (0, import_react10.useState)(100);
    const [saturation, setSaturation] = (0, import_react10.useState)(100);
    const isVideo = mediaFile.type.startsWith("video/");
    const handleSave = () => {
      onSave(mediaFile, previewUrl);
    };
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "fixed inset-0 z-[200] bg-black/95 flex flex-col touch-none", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex items-center justify-between p-4 border-b border-zinc-800", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { onClick: onClose, className: "p-2 text-zinc-400 hover:text-white transition-colors", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react6.X, { className: "w-6 h-6" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h3", { className: "text-white font-bold", children: "Edit Media" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { onClick: handleSave, className: "p-2 text-purple-500 hover:text-purple-400 font-bold transition-colors", children: "Done" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex-1 flex flex-col lg:flex-row overflow-hidden", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "flex-1 p-4 flex items-center justify-center bg-black relative", children: /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(
          "div",
          {
            className: "relative w-full h-full max-w-3xl flex items-center justify-center",
            style: {
              filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${filter !== "none" ? filter : ""}`
            },
            children: isVideo ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("video", { src: previewUrl, controls: true, className: "max-w-full max-h-full object-contain" }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("img", { src: previewUrl, alt: "Editing", className: "max-w-full max-h-full object-contain" })
          }
        ) }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "w-full lg:w-80 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 overflow-y-auto p-4 flex flex-col gap-6", children: [
          !isVideo && /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("h4", { className: "text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react6.Crop, { className: "w-4 h-4" }),
              " Transform"
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("button", { className: "flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white text-sm transition-colors flex items-center justify-center gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react6.Crop, { className: "w-4 h-4" }),
                " Crop"
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("button", { className: "flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white text-sm transition-colors flex items-center justify-center gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react6.RotateCw, { className: "w-4 h-4" }),
                " Rotate"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h4", { className: "text-sm font-medium text-zinc-400 mb-3", children: "Adjustments" }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex flex-col gap-4", children: [
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex justify-between text-xs text-zinc-400 mb-1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react6.Sun, { className: "w-3 h-3" }),
                    " Brightness"
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { children: [
                    brightness,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("input", { type: "range", min: "50", max: "150", value: brightness, onChange: (e) => setBrightness(Number(e.target.value)), className: "w-full accent-purple-500" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex justify-between text-xs text-zinc-400 mb-1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react6.Contrast, { className: "w-3 h-3" }),
                    " Contrast"
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { children: [
                    contrast,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("input", { type: "range", min: "50", max: "150", value: contrast, onChange: (e) => setContrast(Number(e.target.value)), className: "w-full accent-purple-500" })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
                /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "flex justify-between text-xs text-zinc-400 mb-1", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime6.jsx)(import_lucide_react6.Droplet, { className: "w-3 h-3" }),
                    " Saturation"
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("span", { children: [
                    saturation,
                    "%"
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("input", { type: "range", min: "0", max: "200", value: saturation, onChange: (e) => setSaturation(Number(e.target.value)), className: "w-full accent-purple-500" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h4", { className: "text-sm font-medium text-zinc-400 mb-3", children: "Filters" }),
            /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "flex overflow-x-auto gap-3 pb-2 scrollbar-hide", children: [
              { name: "Normal", value: "none" },
              { name: "Clarendon", value: "contrast(1.2) saturate(1.35)" },
              { name: "Gingham", value: "brightness(1.05) hue-rotate(-10deg)" },
              { name: "Moon", value: "grayscale(1) contrast(1.1) brightness(1.1)" },
              { name: "Lark", value: "contrast(0.9)" },
              { name: "Reyes", value: "sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)" }
            ].map((f3) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)(
              "button",
              {
                onClick: () => setFilter(f3.value),
                className: `flex-shrink-0 flex flex-col items-center gap-2 ${filter === f3.value ? "text-purple-500" : "text-zinc-400"}`,
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: `w-16 h-16 rounded-lg border-2 overflow-hidden ${filter === f3.value ? "border-purple-500" : "border-transparent"}`, children: isVideo ? /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("video", { src: previewUrl, className: "w-full h-full object-cover", style: { filter: f3.value } }) : /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("img", { src: previewUrl, className: "w-full h-full object-cover", style: { filter: f3.value } }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "text-xs font-medium", children: f3.name })
                ]
              },
              f3.name
            )) })
          ] })
        ] })
      ] })
    ] });
  }

  // src/components/CreatePost.tsx
  var import_jsx_runtime7 = __require("react/jsx-runtime");
  function CreatePost() {
    const { user } = useAuthStore();
    const [content, setContent] = (0, import_react11.useState)("");
    const [isSubmitting, setIsSubmitting] = (0, import_react11.useState)(false);
    const queryClient = (0, import_react_query2.useQueryClient)();
    const fileInputRef = (0, import_react11.useRef)(null);
    const [mediaFiles, setMediaFiles] = (0, import_react11.useState)([]);
    const [visibility, setVisibility] = (0, import_react11.useState)("public");
    const [location, setLocation] = (0, import_react11.useState)("");
    const [showAdvanced, setShowAdvanced] = (0, import_react11.useState)(false);
    const [editingMediaIndex, setEditingMediaIndex] = (0, import_react11.useState)(null);
    (0, import_react11.useEffect)(() => {
      const savedDraft = localStorage.getItem("post_draft_content");
      const savedLocation = localStorage.getItem("post_draft_location");
      if (savedDraft) setContent(savedDraft);
      if (savedLocation) setLocation(savedLocation);
    }, []);
    (0, import_react11.useEffect)(() => {
      const saveTimer = setTimeout(() => {
        if (content.trim() || location.trim()) {
          localStorage.setItem("post_draft_content", content);
          localStorage.setItem("post_draft_location", location);
        } else {
          localStorage.removeItem("post_draft_content");
          localStorage.removeItem("post_draft_location");
        }
      }, 1e3);
      return () => clearTimeout(saveTimer);
    }, [content, location]);
    const extractHashtags = (text) => {
      const regex = /#[\w]+/g;
      return text.match(regex) || [];
    };
    const extractMentions = (text) => {
      const regex = /@[\w]+/g;
      return text.match(regex) || [];
    };
    const handleFileSelect = async (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      if (mediaFiles.length + files.length > 4) {
        alert("You can only upload up to 4 media files per post.");
        return;
      }
      const newMedia = await Promise.all(files.map(async (file) => {
        if (file.type.startsWith("image/")) {
          const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
          try {
            const compressedFile = await (0, import_browser_image_compression2.default)(file, options);
            return { file: compressedFile, url: URL.createObjectURL(compressedFile) };
          } catch (error) {
            console.error("Compression error:", error);
            return { file, url: URL.createObjectURL(file) };
          }
        }
        return { file, url: URL.createObjectURL(file) };
      }));
      setMediaFiles((prev) => [...prev, ...newMedia]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    const removeMedia = (index) => {
      setMediaFiles((prev) => {
        const newFiles = [...prev];
        URL.revokeObjectURL(newFiles[index].url);
        newFiles.splice(index, 1);
        return newFiles;
      });
    };
    const handleSaveEdit = async (editedBlob) => {
      if (editingMediaIndex === null) return;
      const file = new File([editedBlob], `edited_image_${Date.now()}.jpg`, { type: "image/jpeg" });
      const url = URL.createObjectURL(file);
      setMediaFiles((prev) => {
        const newFiles = [...prev];
        URL.revokeObjectURL(newFiles[editingMediaIndex].url);
        newFiles[editingMediaIndex] = { file, url };
        return newFiles;
      });
      setEditingMediaIndex(null);
    };
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!content.trim() && mediaFiles.length === 0) return;
      if (!user) return alert("You must be logged in to post.");
      setIsSubmitting(true);
      try {
        let isVideo = false;
        const uploadedUrls = [];
        for (const media of mediaFiles) {
          if (media.file.type.startsWith("video/")) isVideo = true;
          const fileExt = media.file.name.split(".").pop();
          const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
          const filePath = `posts/${fileName}`;
          const publicUrl = await uploadMedia("media", filePath, media.file);
          uploadedUrls.push(publicUrl);
        }
        const hashtags = extractHashtags(content);
        const mentions = extractMentions(content);
        const mediaType = mediaFiles.length === 0 ? "text" : isVideo ? "video" : "image";
        const postData = {
          user_id: user.id,
          caption: content.trim(),
          media_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
          image_url: uploadedUrls[0] || null,
          video_url: isVideo ? uploadedUrls[0] : null,
          media_type: mediaType,
          visibility,
          location: location || null,
          hashtags,
          mentions
        };
        try {
          const { data: profileExists } = await supabase.from("profiles").select("id").eq("id", user.id).single();
          if (!profileExists) {
            console.log("Profile not found, creating a default one...");
            const username = user.email ? user.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") + "_" + Date.now().toString().slice(-4) : "user_" + Date.now();
            await supabase.from("profiles").insert({
              id: user.id,
              username,
              display_name: username,
              avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + username
            });
          }
        } catch (e2) {
          console.warn("Failed to check/create profile:", e2);
        }
        const { error } = await supabase.from("posts").insert(postData);
        if (error) {
          const fallbackData = {
            user_id: user.id,
            caption: content.trim(),
            image_url: !isVideo ? uploadedUrls[0] || null : null,
            video_url: isVideo ? uploadedUrls[0] || null : null,
            visibility,
            location: location || null
          };
          const { error: fallbackError } = await supabase.from("posts").insert(fallbackData);
          if (fallbackError) throw fallbackError;
        }
        setContent("");
        setMediaFiles([]);
        setLocation("");
        setShowAdvanced(false);
        localStorage.removeItem("post_draft_content");
        localStorage.removeItem("post_draft_location");
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      } catch (error) {
        console.error("Error creating post:", error);
        alert("Failed to post. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "border-b border-zinc-800 p-4 transition-all focus-within:bg-zinc-900/20", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0", children: user?.user_metadata?.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("img", { src: user.user_metadata.avatar_url, alt: "You", className: "w-full h-full object-cover" }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: "w-full h-full flex items-center justify-center text-zinc-500 font-bold bg-zinc-800", children: user?.email?.charAt(0).toUpperCase() }) }),
          /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex-1", children: [
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
              "textarea",
              {
                value: content,
                onChange: (e) => setContent(e.target.value),
                placeholder: "What's on your mind?",
                className: "w-full bg-transparent text-white text-lg resize-none outline-none min-h-[80px] placeholder:text-zinc-500",
                maxLength: 2e3
              }
            ),
            mediaFiles.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("div", { className: `grid gap-2 mb-3 mt-2 ${mediaFiles.length > 1 ? "grid-cols-2" : "grid-cols-1"}`, children: mediaFiles.map((media, index) => /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "relative group rounded-xl overflow-hidden bg-black aspect-video border border-zinc-800", children: [
              media.file.type.startsWith("video/") ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("video", { src: media.url, className: "w-full h-full object-cover" }) : /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("img", { src: media.url, alt: `Upload ${index}`, className: "w-full h-full object-cover" }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "button",
                  {
                    type: "button",
                    onClick: (e) => {
                      e.preventDefault();
                      setEditingMediaIndex(index);
                    },
                    className: "p-2 bg-zinc-900/80 hover:bg-zinc-800 rounded-full text-white backdrop-blur-sm transition-colors",
                    children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react7.Edit2, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "button",
                  {
                    type: "button",
                    onClick: (e) => {
                      e.preventDefault();
                      removeMedia(index);
                    },
                    className: "p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white backdrop-blur-sm transition-colors",
                    children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react7.X, { className: "w-4 h-4" })
                  }
                )
              ] })
            ] }, index)) }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_react12.AnimatePresence, { children: showAdvanced && /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)(
              import_react12.motion.div,
              {
                initial: { height: 0, opacity: 0 },
                animate: { height: "auto", opacity: 1 },
                exit: { height: 0, opacity: 0 },
                className: "overflow-hidden mb-3 flex flex-col gap-3",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-2 bg-zinc-900 rounded-lg p-2 border border-zinc-800", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react7.MapPin, { className: "w-4 h-4 text-zinc-400" }),
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                      "input",
                      {
                        type: "text",
                        placeholder: "Add location",
                        value: location,
                        onChange: (e) => setLocation(e.target.value),
                        className: "bg-transparent text-sm text-white outline-none w-full placeholder:text-zinc-500"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex gap-2", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("button", { type: "button", onClick: () => setVisibility("public"), className: `flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${visibility === "public" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react7.Globe, { className: "w-3 h-3" }),
                      " Public"
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("button", { type: "button", onClick: () => setVisibility("followers"), className: `flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${visibility === "followers" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react7.Users, { className: "w-3 h-3" }),
                      " Followers"
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("button", { type: "button", onClick: () => setVisibility("private"), className: `flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${visibility === "private" ? "bg-purple-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`, children: [
                      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react7.Lock, { className: "w-3 h-3" }),
                      " Private"
                    ] })
                  ] })
                ]
              }
            ) }),
            /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center justify-between pt-3 border-t border-zinc-800/50 mt-2", children: [
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-1 text-purple-500", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "button",
                  {
                    type: "button",
                    onClick: () => fileInputRef.current?.click(),
                    className: "p-2 hover:bg-purple-500/10 rounded-full transition-colors",
                    title: "Media",
                    children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react7.Image, { className: "w-5 h-5" })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "button",
                  {
                    type: "button",
                    className: "p-2 hover:bg-purple-500/10 rounded-full transition-colors hidden sm:block",
                    title: "Emoji",
                    children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react7.Smile, { className: "w-5 h-5" })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { type: "button", className: "p-2 hover:bg-purple-500/10 rounded-full transition-colors", title: "Poll", children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react7.BarChart2, { className: "w-5 h-5" }) }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "button",
                  {
                    type: "button",
                    onClick: () => setShowAdvanced(!showAdvanced),
                    className: `p-2 rounded-full transition-colors ${showAdvanced ? "bg-purple-500/20 text-purple-400" : "hover:bg-purple-500/10"}`,
                    title: "Advanced",
                    children: /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react7.Settings, { className: "w-5 h-5" })
                  }
                )
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: `text-xs ${content.length > 1800 ? "text-red-500" : "text-zinc-500"}`, children: [
                  content.length,
                  "/2000"
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
                  "button",
                  {
                    type: "submit",
                    disabled: isSubmitting || !content.trim() && mediaFiles.length === 0,
                    className: "bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 px-5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
                    children: isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(import_lucide_react7.Loader2, { className: "w-4 h-4 animate-spin" }) : "Post"
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
          "input",
          {
            type: "file",
            ref: fileInputRef,
            onChange: handleFileSelect,
            className: "hidden",
            accept: "image/*,video/*",
            multiple: true
          }
        )
      ] }),
      editingMediaIndex !== null && mediaFiles[editingMediaIndex] && /* @__PURE__ */ (0, import_jsx_runtime7.jsx)(
        PostEditorModal,
        {
          mediaFile: mediaFiles[editingMediaIndex].file,
          previewUrl: mediaFiles[editingMediaIndex].url,
          onClose: () => setEditingMediaIndex(null),
          onSave: handleSaveEdit
        }
      )
    ] });
  }

  // src/components/Feed.tsx
  var import_react29 = __require("react");
  var import_react_query3 = __require("@tanstack/react-query");

  // node_modules/react-intersection-observer/dist/index.mjs
  var React9 = __toESM(__require("react"), 1);
  var React22 = __toESM(__require("react"), 1);
  var React32 = __toESM(__require("react"), 1);
  var observerMap = /* @__PURE__ */ new Map();
  var RootIds = /* @__PURE__ */ new WeakMap();
  var rootId = 0;
  var unsupportedValue;
  function getRootId(root) {
    if (!root) return "0";
    if (RootIds.has(root)) return RootIds.get(root);
    rootId += 1;
    RootIds.set(root, rootId.toString());
    return RootIds.get(root);
  }
  function optionsToId(options) {
    return Object.keys(options).sort().filter(
      (key) => options[key] !== void 0
    ).map((key) => {
      return `${key}_${key === "root" ? getRootId(options.root) : options[key]}`;
    }).toString();
  }
  function createObserver(options) {
    const id = optionsToId(options);
    let instance = observerMap.get(id);
    if (!instance) {
      const elements = /* @__PURE__ */ new Map();
      let thresholds;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          var _a2;
          const inView = entry.isIntersecting && thresholds.some((threshold) => entry.intersectionRatio >= threshold);
          if (options.trackVisibility && typeof entry.isVisible === "undefined") {
            entry.isVisible = inView;
          }
          [...(_a2 = elements.get(entry.target)) != null ? _a2 : []].forEach((callback) => {
            callback(inView, entry);
          });
        });
      }, options);
      thresholds = observer.thresholds || (Array.isArray(options.threshold) ? options.threshold : [options.threshold || 0]);
      instance = {
        id,
        observer,
        elements
      };
      observerMap.set(id, instance);
    }
    return instance;
  }
  function observe(element, callback, options = {}, fallbackInView = unsupportedValue) {
    if (typeof window.IntersectionObserver === "undefined" && fallbackInView !== void 0) {
      const bounds = element.getBoundingClientRect();
      callback(fallbackInView, {
        isIntersecting: fallbackInView,
        target: element,
        intersectionRatio: typeof options.threshold === "number" ? options.threshold : 0,
        time: 0,
        boundingClientRect: bounds,
        intersectionRect: bounds,
        rootBounds: bounds
      });
      return () => {
      };
    }
    const { id, observer, elements } = createObserver(options);
    const callbacks = elements.get(element) || [];
    if (!elements.has(element)) {
      elements.set(element, callbacks);
    }
    callbacks.push(callback);
    observer.observe(element);
    return function unobserve() {
      callbacks.splice(callbacks.indexOf(callback), 1);
      if (callbacks.length === 0) {
        elements.delete(element);
        observer.unobserve(element);
      }
      if (elements.size === 0) {
        observer.disconnect();
        observerMap.delete(id);
      }
    };
  }
  function useInView({
    threshold,
    delay,
    trackVisibility,
    rootMargin,
    root,
    triggerOnce,
    skip,
    initialInView,
    fallbackInView,
    onChange
  } = {}) {
    var _a2;
    const [ref, setRef] = React22.useState(null);
    const callback = React22.useRef(onChange);
    const lastInViewRef = React22.useRef(initialInView);
    const [state, setState] = React22.useState({
      inView: !!initialInView,
      entry: void 0
    });
    callback.current = onChange;
    React22.useEffect(
      () => {
        if (lastInViewRef.current === void 0) {
          lastInViewRef.current = initialInView;
        }
        if (skip || !ref) return;
        let unobserve;
        unobserve = observe(
          ref,
          (inView, entry) => {
            const previousInView = lastInViewRef.current;
            lastInViewRef.current = inView;
            if (previousInView === void 0 && !inView) {
              return;
            }
            setState({
              inView,
              entry
            });
            if (callback.current) callback.current(inView, entry);
            if (entry.isIntersecting && triggerOnce && unobserve) {
              unobserve();
              unobserve = void 0;
            }
          },
          {
            root,
            rootMargin,
            threshold,
            // @ts-expect-error
            trackVisibility,
            delay
          },
          fallbackInView
        );
        return () => {
          if (unobserve) {
            unobserve();
          }
        };
      },
      // We break the rule here, because we aren't including the actual `threshold` variable
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        // If the threshold is an array, convert it to a string, so it won't change between renders.
        Array.isArray(threshold) ? threshold.toString() : threshold,
        ref,
        root,
        rootMargin,
        triggerOnce,
        skip,
        trackVisibility,
        fallbackInView,
        delay
      ]
    );
    const entryTarget = (_a2 = state.entry) == null ? void 0 : _a2.target;
    const previousEntryTarget = React22.useRef(void 0);
    if (!ref && entryTarget && !triggerOnce && !skip && previousEntryTarget.current !== entryTarget) {
      previousEntryTarget.current = entryTarget;
      setState({
        inView: !!initialInView,
        entry: void 0
      });
      lastInViewRef.current = initialInView;
    }
    const result = [setRef, state.inView, state.entry];
    result.ref = result[0];
    result.inView = result[1];
    result.entry = result[2];
    return result;
  }
  var _a;
  var _b;
  var useSyncEffect = (_b = (_a = "useInsertionEffect" in React32 ? React32.useInsertionEffect : void 0) != null ? _a : React32.useLayoutEffect) != null ? _b : React32.useEffect;

  // src/components/Feed.tsx
  var import_lucide_react15 = __require("lucide-react");
  var import_react_virtuoso = __require("react-virtuoso");

  // src/components/performance/OptimizedImage.tsx
  var import_react13 = __require("react");

  // node_modules/react-blurhash/dist/esm/index.js
  var l = __toESM(__require("react"));
  var f2 = __toESM(__require("react"));

  // node_modules/blurhash/dist/esm/index.js
  var q = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "#", "$", "%", "*", "+", ",", "-", ".", ":", ";", "=", "?", "@", "[", "]", "^", "_", "{", "|", "}", "~"];
  var x = (t) => {
    let e = 0;
    for (let r = 0; r < t.length; r++) {
      let n = t[r], l2 = q.indexOf(n);
      e = e * 83 + l2;
    }
    return e;
  };
  var f = (t) => {
    let e = t / 255;
    return e <= 0.04045 ? e / 12.92 : Math.pow((e + 0.055) / 1.055, 2.4);
  };
  var h = (t) => {
    let e = Math.max(0, Math.min(1, t));
    return e <= 31308e-7 ? Math.trunc(e * 12.92 * 255 + 0.5) : Math.trunc((1.055 * Math.pow(e, 0.4166666666666667) - 0.055) * 255 + 0.5);
  };
  var F = (t) => t < 0 ? -1 : 1;
  var M = (t, e) => F(t) * Math.pow(Math.abs(t), e);
  var d = class extends Error {
    constructor(e) {
      super(e), this.name = "ValidationError", this.message = e;
    }
  };
  var C = (t) => {
    if (!t || t.length < 6) throw new d("The blurhash string must be at least 6 characters");
    let e = x(t[0]), r = Math.floor(e / 9) + 1, n = e % 9 + 1;
    if (t.length !== 4 + 2 * n * r) throw new d(`blurhash length mismatch: length is ${t.length} but it should be ${4 + 2 * n * r}`);
  };
  var z = (t) => {
    let e = t >> 16, r = t >> 8 & 255, n = t & 255;
    return [f(e), f(r), f(n)];
  };
  var L = (t, e) => {
    let r = Math.floor(t / 361), n = Math.floor(t / 19) % 19, l2 = t % 19;
    return [M((r - 9) / 9, 2) * e, M((n - 9) / 9, 2) * e, M((l2 - 9) / 9, 2) * e];
  };
  var U = (t, e, r, n) => {
    C(t), n = n | 1;
    let l2 = x(t[0]), m2 = Math.floor(l2 / 9) + 1, b2 = l2 % 9 + 1, i = (x(t[1]) + 1) / 166, u2 = new Array(b2 * m2);
    for (let o2 = 0; o2 < u2.length; o2++) if (o2 === 0) {
      let a = x(t.substring(2, 6));
      u2[o2] = z(a);
    } else {
      let a = x(t.substring(4 + o2 * 2, 6 + o2 * 2));
      u2[o2] = L(a, i * n);
    }
    let c = e * 4, s = new Uint8ClampedArray(c * r);
    for (let o2 = 0; o2 < r; o2++) for (let a = 0; a < e; a++) {
      let y = 0, B = 0, R2 = 0;
      for (let w = 0; w < m2; w++) for (let P2 = 0; P2 < b2; P2++) {
        let G = Math.cos(Math.PI * a * P2 / e) * Math.cos(Math.PI * o2 * w / r), T = u2[P2 + w * b2];
        y += T[0] * G, B += T[1] * G, R2 += T[2] * G;
      }
      let V = h(y), I = h(B), E = h(R2);
      s[4 * a + 0 + o2 * c] = V, s[4 * a + 1 + o2 * c] = I, s[4 * a + 2 + o2 * c] = E, s[4 * a + 3 + o2 * c] = 255;
    }
    return s;
  };
  var j = U;

  // node_modules/react-blurhash/dist/esm/index.js
  var P = Object.defineProperty;
  var R = Object.defineProperties;
  var C2 = Object.getOwnPropertyDescriptors;
  var m = Object.getOwnPropertySymbols;
  var v = Object.prototype.hasOwnProperty;
  var x2 = Object.prototype.propertyIsEnumerable;
  var b = (e, s, t) => s in e ? P(e, s, { enumerable: true, configurable: true, writable: true, value: t }) : e[s] = t;
  var h2 = (e, s) => {
    for (var t in s || (s = {})) v.call(s, t) && b(e, t, s[t]);
    if (m) for (var t of m(s)) x2.call(s, t) && b(e, t, s[t]);
    return e;
  };
  var p = (e, s) => R(e, C2(s));
  var g = (e, s) => {
    var t = {};
    for (var r in e) v.call(e, r) && s.indexOf(r) < 0 && (t[r] = e[r]);
    if (e != null && m) for (var r of m(e)) s.indexOf(r) < 0 && x2.call(e, r) && (t[r] = e[r]);
    return t;
  };
  var o = class extends f2.PureComponent {
    constructor() {
      super(...arguments);
      this.canvas = null;
      this.handleRef = (t) => {
        this.canvas = t, this.draw();
      };
      this.draw = () => {
        let { hash: t, height: r, punch: n, width: a } = this.props;
        if (this.canvas) {
          let i = j(t, a, r, n), c = this.canvas.getContext("2d"), d2 = c.createImageData(a, r);
          d2.data.set(i), c.putImageData(d2, 0, 0);
        }
      };
    }
    componentDidUpdate() {
      this.draw();
    }
    render() {
      let i = this.props, { hash: t, height: r, width: n } = i, a = g(i, ["hash", "height", "width"]);
      return f2.createElement("canvas", p(h2({}, a), { height: r, width: n, ref: this.handleRef }));
    }
  };
  o.defaultProps = { height: 128, width: 128 };
  var D = { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, width: "100%", height: "100%" };
  var u = class extends l.PureComponent {
    componentDidUpdate() {
      if (this.props.resolutionX <= 0) throw new Error("resolutionX must be larger than zero");
      if (this.props.resolutionY <= 0) throw new Error("resolutionY must be larger than zero");
    }
    render() {
      let w = this.props, { hash: s, height: t, width: r, punch: n, resolutionX: a, resolutionY: i, style: c } = w, d2 = g(w, ["hash", "height", "width", "punch", "resolutionX", "resolutionY", "style"]);
      return l.createElement("div", p(h2({}, d2), { style: p(h2({ display: "inline-block", height: t, width: r }, c), { position: "relative" }) }), l.createElement(o, { hash: s, height: i, width: a, punch: n, style: D }));
    }
  };
  u.defaultProps = { height: 128, width: 128, resolutionX: 32, resolutionY: 32 };

  // src/components/performance/OptimizedImage.tsx
  var import_jsx_runtime8 = __require("react/jsx-runtime");
  function OptimizedImage({
    src,
    alt = "",
    blurhash,
    className = "",
    objectFit = "cover",
    ...props
  }) {
    const [isLoaded, setIsLoaded] = (0, import_react13.useState)(false);
    const [hasError, setHasError] = (0, import_react13.useState)(false);
    const [retryCount, setRetryCount] = (0, import_react13.useState)(0);
    (0, import_react13.useEffect)(() => {
      if (hasError && retryCount < 3) {
        const timer = setTimeout(() => {
          setHasError(false);
          setRetryCount((prev) => prev + 1);
        }, 2e3 * Math.pow(2, retryCount));
        return () => clearTimeout(timer);
      }
    }, [hasError, retryCount]);
    (0, import_react13.useEffect)(() => {
      setIsLoaded(false);
      setHasError(false);
      setRetryCount(0);
    }, [src]);
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: `relative overflow-hidden ${className}`, children: [
      !isLoaded && !hasError && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "absolute inset-0 bg-zinc-800 animate-pulse flex items-center justify-center", children: blurhash ? /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(u, { hash: blurhash, width: "100%", height: "100%", resolutionX: 32, resolutionY: 32, punch: 1 }) : null }),
      hasError && retryCount >= 3 && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "absolute inset-0 bg-zinc-900 flex items-center justify-center text-zinc-500 text-xs text-center p-2", children: "Failed to load image" }),
      (!hasError || retryCount < 3) && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(
        "img",
        {
          src,
          alt,
          loading: "lazy",
          className: `w-full h-full object-${objectFit} transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`,
          onLoad: () => setIsLoaded(true),
          onError: () => setHasError(true),
          ...props
        }
      )
    ] });
  }

  // src/components/performance/OptimizedVideo.tsx
  var import_react14 = __require("react");
  var import_jsx_runtime9 = __require("react/jsx-runtime");
  function OptimizedVideo({
    src,
    poster,
    className = "",
    autoPlay = false,
    ...props
  }) {
    const videoRef = (0, import_react14.useRef)(null);
    const { ref, inView } = useInView({
      threshold: 0.5
      // 50% of video must be visible
    });
    const [isLoaded, setIsLoaded] = (0, import_react14.useState)(false);
    (0, import_react14.useEffect)(() => {
      if (!videoRef.current) return;
      if (inView && autoPlay) {
        const playPromise = videoRef.current.play();
        if (playPromise !== void 0) {
          playPromise.catch(() => {
            console.warn("Autoplay prevented for video");
          });
        }
      } else if (!inView) {
        videoRef.current.pause();
      }
    }, [inView, autoPlay]);
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { ref, className: `relative overflow-hidden bg-zinc-900 ${className}`, children: [
      !isLoaded && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("div", { className: "absolute inset-0 flex items-center justify-center bg-zinc-900 z-10 animate-pulse", children: poster && /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("img", { src: poster, className: "w-full h-full object-cover opacity-50 blur-sm", alt: "Loading..." }) }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(
        "video",
        {
          ref: videoRef,
          src,
          className: `w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`,
          poster,
          playsInline: true,
          preload: "metadata",
          onLoadedData: () => setIsLoaded(true),
          ...props
        }
      )
    ] });
  }

  // src/components/PostCard.tsx
  var import_react27 = __require("react");
  var import_lucide_react14 = __require("lucide-react");

  // src/lib/utils.ts
  function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = /* @__PURE__ */ new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1e3);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  }

  // src/components/PostCard.tsx
  var import_react_router_dom4 = __require("react-router-dom");

  // src/lib/username.ts
  var import_react15 = __toESM(__require("react"), 1);
  var import_react_router_dom2 = __require("react-router-dom");
  function renderMentions(text) {
    if (!text) return "";
    const parts = text.split(/(@[a-z0-9_.]+)/gi);
    return import_react15.default.createElement(
      import_react15.default.Fragment,
      null,
      ...parts.map((part, index) => {
        if (part.startsWith("@")) {
          const username = part.slice(1);
          if (username.length >= 3 && username.length <= 30 && /^[a-zA-Z0-9_.\-']+$/.test(username)) {
            return import_react15.default.createElement(
              import_react_router_dom2.Link,
              {
                key: index,
                to: `/@${username}`,
                className: "text-purple-400 hover:underline font-semibold",
                onClick: (e) => e.stopPropagation()
              },
              part
            );
          }
        }
        return part;
      })
    );
  }

  // src/components/PostCard.tsx
  var import_react28 = __require("motion/react");

  // src/components/engagement/CommentsSheet.tsx
  var import_react16 = __require("react");
  var import_react17 = __require("motion/react");
  var import_lucide_react8 = __require("lucide-react");
  var import_react_router_dom3 = __require("react-router-dom");
  var import_jsx_runtime10 = __require("react/jsx-runtime");
  function CommentsSheet({ post, onClose }) {
    const { user } = useAuthStore();
    const [comments, setComments] = (0, import_react16.useState)([]);
    const [newComment, setNewComment] = (0, import_react16.useState)("");
    const [replyingTo, setReplyingTo] = (0, import_react16.useState)(null);
    const [loading, setLoading] = (0, import_react16.useState)(true);
    const [submitting, setSubmitting] = (0, import_react16.useState)(false);
    const inputRef = (0, import_react16.useRef)(null);
    (0, import_react16.useEffect)(() => {
      fetchComments();
      const channel = supabase.channel(`public:comments-${Date.now()}`).on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${post.id}` }, (payload) => {
        fetchComments();
      }).subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }, [post.id]);
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase.from("comments").select(`
          *,
          profiles:user_id (id, username, avatar_url, display_name),
          
        `).eq("post_id", post.id).order("is_pinned", { ascending: false }).order("created_at", { ascending: true });
        if (error) throw error;
        setComments(data || []);
      } catch (err) {
        console.error("Error fetching comments", err);
      } finally {
        setLoading(false);
      }
    };
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!newComment.trim() || !user || submitting) return;
      setSubmitting(true);
      const content = newComment.trim();
      setNewComment("");
      const optimisticId = `temp-${Date.now()}`;
      const optimisticComment = {
        id: optimisticId,
        post_id: post.id,
        user_id: user.id,
        content,
        parent_id: replyingTo?.id || null,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        likes: [],
        reply_count: 0,
        is_pinned: false,
        is_edited: false,
        profiles: {
          id: user.id,
          username: user.user_metadata?.username || user.email?.split("@")[0],
          avatar_url: user.user_metadata?.avatar_url
        }
      };
      setComments((prev) => [...prev, optimisticComment]);
      try {
        const { data, error } = await supabase.from("comments").insert({
          post_id: post.id,
          user_id: user.id,
          content,
          parent_id: replyingTo?.id || null
        }).select().single();
        if (error) throw error;
        if (post.user_id !== user.id && !replyingTo) {
          await supabase.from("notifications").insert({ user_id: post.user_id, type: "comment", title: `${user.user_metadata?.username || "Someone"} commented on your post` });
        }
        if (replyingTo && replyingTo.user_id !== user.id) {
          await supabase.from("notifications").insert({ user_id: replyingTo.user_id, type: "comment", title: `${user.user_metadata?.username || "Someone"} replied to your comment` });
        }
      } catch (error) {
        console.error("Error adding comment", error);
        setComments((prev) => prev.filter((c) => c.id !== optimisticId));
      } finally {
        setSubmitting(false);
        setReplyingTo(null);
      }
    };
    const rootComments = comments.filter((c) => !c.parent_id);
    const repliesByParent = comments.reduce((acc, c) => {
      if (c.parent_id) {
        if (!acc[c.parent_id]) acc[c.parent_id] = [];
        acc[c.parent_id].push(c);
      }
      return acc;
    }, {});
    const renderComment = (comment, isReply = false) => {
      const isLiked = comment.likes?.some((l2) => l2.user_id === user?.id);
      const likeCount = comment.likes?.length || 0;
      const isOwner = user?.id === comment.user_id;
      const isPostCreator = user?.id === post.user_id;
      const handleLike = async () => {
        if (!user) return;
        const updatedComments = comments.map((c) => {
          if (c.id === comment.id) {
            const newLikes = isLiked ? c.likes.filter((l2) => l2.user_id !== user.id) : [...c.likes, { user_id: user.id }];
            return { ...c, likes: newLikes };
          }
          return c;
        });
        setComments(updatedComments);
        try {
          if (isLiked) {
          } else {
            if (comment.user_id !== user.id) {
              await supabase.from("notifications").insert({ user_id: comment.user_id, type: "like", title: `${user.user_metadata?.username || "Someone"} liked your comment` });
            }
          }
        } catch (err) {
          console.error("Like error", err);
        }
      };
      return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: `flex gap-3 mb-4 ${isReply ? "ml-10 mt-3" : "mt-4"}`, children: [
        /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_react_router_dom3.Link, { to: `/@${comment.profiles?.username}`, className: "flex-shrink-0", children: comment.profiles?.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("img", { src: comment.profiles.avatar_url, className: "w-8 h-8 rounded-full object-cover" }) : /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold", children: comment.profiles?.username?.charAt(0).toUpperCase() || "U" }) }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_react_router_dom3.Link, { to: `/@${comment.profiles?.username}`, className: "font-bold text-sm text-white hover:underline", children: comment.profiles?.username }),
            comment.user_id === post.user_id && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded font-bold", children: "Creator" }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "text-xs text-zinc-500", children: formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }) }),
            comment.is_edited && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "text-[10px] text-zinc-500 font-medium", children: "Edited" }),
            comment.is_pinned && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_lucide_react8.Pin, { className: "w-3 h-3 text-yellow-500" })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "text-zinc-200 text-sm mt-0.5 leading-relaxed break-words whitespace-pre-wrap", children: renderMentions(comment.content) }),
          /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex items-center gap-4 mt-2", children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("button", { onClick: () => {
              setReplyingTo(comment);
              inputRef.current?.focus();
            }, className: "text-xs text-zinc-400 hover:text-white font-bold transition-colors", children: "Reply" }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("button", { className: "text-xs text-zinc-500 hover:text-white font-bold transition-colors", children: "Translate" })
          ] }),
          repliesByParent[comment.id] && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "mt-2", children: repliesByParent[comment.id].map((reply) => renderComment(reply, true)) })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex flex-col items-center gap-1 pl-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("button", { onClick: handleLike, className: `p-1.5 rounded-full transition-colors ${isLiked ? "text-red-500 hover:bg-red-500/10" : "text-zinc-500 hover:text-red-400 hover:bg-zinc-800"}`, children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_lucide_react8.Heart, { className: `w-4 h-4 ${isLiked ? "fill-current" : ""}` }) }),
          likeCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("span", { className: "text-xs text-zinc-500 font-medium", children: likeCount })
        ] })
      ] }, comment.id);
    };
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "fixed inset-0 z-50 flex flex-col justify-end", children: [
      /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
        import_react17.motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
          onClick: onClose
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)(
        import_react17.motion.div,
        {
          initial: { y: "100%" },
          animate: { y: 0 },
          exit: { y: "100%" },
          transition: { type: "spring", damping: 25, stiffness: 300 },
          className: "relative bg-zinc-950 border-t border-zinc-800 rounded-t-3xl flex flex-col max-h-[85vh] h-[85vh]",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex items-center justify-between p-4 border-b border-zinc-800/50", children: [
              /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("h2", { className: "text-white font-bold text-lg", children: [
                "Comments ",
                /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "text-zinc-500 text-sm font-normal", children: [
                  "(",
                  comments.length,
                  ")"
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("button", { onClick: onClose, className: "p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_lucide_react8.X, { className: "w-5 h-5" }) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "flex-1 overflow-y-auto p-4 custom-scrollbar", children: loading ? /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "space-y-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex gap-3 animate-pulse", children: [
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "w-8 h-8 rounded-full bg-zinc-800" }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex-1 space-y-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "h-4 bg-zinc-800 rounded w-24" }),
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "h-3 bg-zinc-800 rounded w-full max-w-[200px]" })
              ] })
            ] }, i)) }) : rootComments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex flex-col items-center justify-center h-full text-center text-zinc-500 py-10", children: [
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(MessageCircleIcon, { className: "w-12 h-12 mb-3 text-zinc-800" }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "font-medium text-white mb-1", children: "No comments yet" }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("p", { className: "text-sm", children: "Be the first to share your thoughts." })
            ] }) : /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "pb-20", children: rootComments.map((comment) => renderComment(comment)) }) }),
            /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "p-4 bg-zinc-900 border-t border-zinc-800 safe-bottom", children: [
              replyingTo && /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex items-center justify-between text-xs text-zinc-400 mb-2 px-2 bg-zinc-800/50 py-1.5 rounded", children: [
                /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { children: [
                  "Replying to ",
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("span", { className: "font-bold text-white", children: [
                    "@",
                    replyingTo.profiles?.username
                  ] })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("button", { onClick: () => setReplyingTo(null), className: "hover:text-white", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_lucide_react8.X, { className: "w-3 h-3" }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("form", { onSubmit: handleSubmit, className: "flex items-end gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex-1 bg-black/50 border border-zinc-800 rounded-2xl flex flex-col focus-within:border-purple-500/50 transition-colors", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                    "input",
                    {
                      ref: inputRef,
                      type: "text",
                      placeholder: replyingTo ? "Add a reply..." : "Add a comment...",
                      value: newComment,
                      onChange: (e) => setNewComment(e.target.value),
                      className: "w-full bg-transparent text-white px-4 py-3 outline-none text-sm placeholder:text-zinc-600"
                    }
                  ),
                  /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("div", { className: "flex items-center justify-between px-3 pb-2 pt-1", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsxs)("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("button", { type: "button", className: "text-zinc-500 hover:text-purple-400 transition-colors p-1", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_lucide_react8.Smile, { className: "w-4 h-4" }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("button", { type: "button", className: "text-zinc-500 hover:text-blue-400 transition-colors p-1", children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_lucide_react8.Image, { className: "w-4 h-4" }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("button", { type: "button", className: "text-zinc-500 hover:text-green-400 transition-colors p-1 font-bold text-xs uppercase", children: "GIF" })
                  ] }) })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
                  "button",
                  {
                    type: "submit",
                    disabled: !newComment.trim() || submitting,
                    className: `p-3 rounded-2xl flex items-center justify-center transition-all h-[52px] w-[52px] shrink-0
                ${newComment.trim() ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:bg-purple-600" : "bg-zinc-800 text-zinc-500"}`,
                    children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(import_lucide_react8.Send, { className: "w-5 h-5" })
                  }
                )
              ] })
            ] })
          ]
        }
      )
    ] });
  }
  function MessageCircleIcon(props) {
    return /* @__PURE__ */ (0, import_jsx_runtime10.jsx)(
      "svg",
      {
        ...props,
        xmlns: "http://www.w3.org/2000/svg",
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        children: /* @__PURE__ */ (0, import_jsx_runtime10.jsx)("path", { d: "m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" })
      }
    );
  }

  // src/components/engagement/ShareSheet.tsx
  var import_react18 = __require("react");
  var import_react19 = __require("motion/react");
  var import_lucide_react9 = __require("lucide-react");
  var import_jsx_runtime11 = __require("react/jsx-runtime");
  function ShareSheet({ post, onClose }) {
    const { user } = useAuthStore();
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const handleShare = async (platform) => {
      try {
        if (user) {
          await supabase.from("shares").insert({
            post_id: post.id,
            user_id: user.id,
            platform
          });
          if (post.user_id !== user.id) {
            await supabase.from("notifications").insert({ user_id: post.user_id, type: "share", title: `${user.user_metadata?.username || "Someone"} shared your post` });
          }
        }
        if (platform === "copy") {
          await navigator.clipboard.writeText(postUrl);
          alert("Link copied to clipboard!");
        } else if (platform === "native" && navigator.share) {
          await navigator.share({
            title: "Check out this post on Omnix",
            url: postUrl
          });
        }
        onClose();
      } catch (err) {
        console.error("Error sharing", err);
      }
    };
    const [showQr, setShowQr] = (0, import_react18.useState)(false);
    const shareOptions = [
      { id: "chat", label: "Send in Chat", icon: import_lucide_react9.Send, color: "bg-blue-500", textColor: "text-white" },
      { id: "communities", label: "Communities", icon: import_lucide_react9.Globe2, color: "bg-purple-500", textColor: "text-white" },
      { id: "copy", label: "Copy Link", icon: import_lucide_react9.Copy, color: "bg-zinc-800", textColor: "text-white" },
      { id: "native", label: "More Options", icon: MoreHorizontalIcon, color: "bg-zinc-800", textColor: "text-white" },
      { id: "qr", label: "QR Code", icon: import_lucide_react9.QrCode, color: "bg-zinc-800", textColor: "text-white" }
    ];
    if (showQr) {
      return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "fixed inset-0 z-[60] flex items-center justify-center p-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "absolute inset-0 bg-black/80 backdrop-blur-sm", onClick: () => setShowQr(false) }),
        /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "relative bg-zinc-900 rounded-3xl p-8 border border-zinc-800 flex flex-col items-center shadow-2xl max-w-sm w-full", children: [
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "bg-white p-4 rounded-2xl mb-6", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("img", { src: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(postUrl)}`, alt: "QR Code", className: "w-48 h-48" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("h3", { className: "text-white font-bold text-xl text-center mb-2", children: "Scan to View Post" }),
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "text-zinc-400 text-sm text-center mb-6", children: "Anyone can scan this code with their camera to open the post directly in Omnix." }),
          /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("button", { onClick: () => setShowQr(false), className: "w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors", children: "Close" })
        ] })
      ] });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "fixed inset-0 z-50 flex flex-col justify-end", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(
        import_react19.motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
          onClick: onClose
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)(
        import_react19.motion.div,
        {
          initial: { y: "100%" },
          animate: { y: 0 },
          exit: { y: "100%" },
          transition: { type: "spring", damping: 25, stiffness: 300 },
          className: "relative bg-zinc-950 border-t border-zinc-800 rounded-t-3xl flex flex-col pb-safe",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "flex items-center justify-between p-4 border-b border-zinc-800/50", children: [
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("h2", { className: "text-white font-bold text-lg", children: "Share" }),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("button", { onClick: onClose, className: "p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react9.X, { className: "w-5 h-5" }) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "p-6", children: [
              /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "grid grid-cols-4 gap-4 mb-6", children: [
                /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "flex flex-col items-center gap-2 cursor-pointer", onClick: () => handleShare("copy"), children: [
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:scale-105 transition-transform", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react9.Copy, { className: "w-6 h-6" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "text-xs text-zinc-400 font-medium text-center", children: "Copy Link" })
                ] }),
                navigator.share && /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "flex flex-col items-center gap-2 cursor-pointer", onClick: () => handleShare("native"), children: [
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:scale-105 transition-transform", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(MoreHorizontalIcon, { className: "w-6 h-6" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "text-xs text-zinc-400 font-medium text-center", children: "More" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "flex flex-col items-center gap-2 cursor-pointer", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105 transition-transform", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react9.Send, { className: "w-6 h-6" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "text-xs text-zinc-400 font-medium text-center", children: "Chat" })
                ] }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "flex flex-col items-center gap-2 cursor-pointer", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:scale-105 transition-transform", children: /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react9.Globe2, { className: "w-6 h-6" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("span", { className: "text-xs text-zinc-400 font-medium text-center", children: "Community" })
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "bg-zinc-900 rounded-2xl p-4 flex items-center gap-4", children: [
                /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("div", { className: "w-12 h-12 bg-black rounded-xl overflow-hidden shrink-0 border border-zinc-800 flex items-center justify-center", children: post.media_urls?.[0] ? /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("img", { src: post.media_urls[0], className: "w-full h-full object-cover" }) : /* @__PURE__ */ (0, import_jsx_runtime11.jsx)(import_lucide_react9.MessageSquare, { className: "w-5 h-5 text-zinc-600" }) }),
                /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("p", { className: "text-white text-sm font-bold truncate", children: [
                    "@",
                    Array.isArray(post.users) ? post.users[0]?.username : post.users?.username
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("p", { className: "text-zinc-500 text-xs truncate mt-0.5", children: post.caption || "No caption" })
                ] })
              ] })
            ] })
          ]
        }
      )
    ] });
  }
  function MoreHorizontalIcon(props) {
    return /* @__PURE__ */ (0, import_jsx_runtime11.jsxs)("svg", { ...props, xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("circle", { cx: "12", cy: "12", r: "1" }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("circle", { cx: "19", cy: "12", r: "1" }),
      /* @__PURE__ */ (0, import_jsx_runtime11.jsx)("circle", { cx: "5", cy: "12", r: "1" })
    ] });
  }

  // src/components/engagement/HeartBurst.tsx
  var import_react20 = __require("motion/react");
  var import_lucide_react10 = __require("lucide-react");
  var import_jsx_runtime12 = __require("react/jsx-runtime");
  function HeartBurst({ show }) {
    return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_react20.AnimatePresence, { children: show && /* @__PURE__ */ (0, import_jsx_runtime12.jsxs)("div", { className: "absolute inset-0 pointer-events-none flex items-center justify-center z-50 overflow-hidden", children: [
      /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
        import_react20.motion.div,
        {
          initial: { scale: 0, opacity: 0, rotate: -15 },
          animate: {
            scale: [0, 1.5, 1],
            opacity: [0, 1, 0],
            rotate: [-15, 0, 15]
          },
          exit: { scale: 0, opacity: 0 },
          transition: { duration: 0.8, ease: "easeOut" },
          className: "absolute drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]",
          children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_lucide_react10.Heart, { className: "w-32 h-32 text-red-500 fill-current" })
        }
      ),
      Array.from({ length: 8 }).map((_, i) => {
        const angle = i * 45 * (Math.PI / 180);
        const radius = 100;
        const x3 = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        return /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(
          import_react20.motion.div,
          {
            initial: { x: 0, y: 0, scale: 0, opacity: 1 },
            animate: {
              x: x3,
              y,
              scale: [0, 1, 0],
              opacity: [1, 0]
            },
            transition: { duration: 0.6, ease: "easeOut" },
            className: "absolute w-4 h-4 text-red-400",
            children: /* @__PURE__ */ (0, import_jsx_runtime12.jsx)(import_lucide_react10.Heart, { className: "w-full h-full fill-current" })
          },
          i
        );
      })
    ] }) });
  }

  // src/components/ImageViewer.tsx
  var import_react22 = __toESM(__require("react"), 1);

  // node_modules/react-zoom-pan-pinch/dist/index.esm.js
  var import_react21 = __toESM(__require("react"));
  var import_jsx_runtime13 = __require("react/jsx-runtime");
  var roundNumber = function(num, decimal) {
    return Number(num.toFixed(decimal));
  };
  var checkIsNumber = function(num, defaultValue) {
    return typeof num === "number" ? num : defaultValue;
  };
  var handleCallback = function(context, event, callback) {
    if (callback && typeof callback === "function") {
      callback(context, event);
    }
  };
  var easeOut = function(t) {
    return -Math.cos(t * Math.PI) / 2 + 0.5;
  };
  var linear = function(t) {
    return t;
  };
  var easeInQuad = function(t) {
    return t * t;
  };
  var easeOutQuad = function(t) {
    return t * (2 - t);
  };
  var easeInOutQuad = function(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  };
  var easeInCubic = function(t) {
    return t * t * t;
  };
  var easeOutCubic = function(t) {
    return --t * t * t + 1;
  };
  var easeInOutCubic = function(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  };
  var easeInQuart = function(t) {
    return t * t * t * t;
  };
  var easeOutQuart = function(t) {
    return 1 - --t * t * t * t;
  };
  var easeInOutQuart = function(t) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
  };
  var easeInQuint = function(t) {
    return t * t * t * t * t;
  };
  var easeOutQuint = function(t) {
    return 1 + --t * t * t * t * t;
  };
  var easeInOutQuint = function(t) {
    return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
  };
  var animations = {
    easeOut,
    linear,
    easeInQuad,
    easeOutQuad,
    easeInOutQuad,
    easeInCubic,
    easeOutCubic,
    easeInOutCubic,
    easeInQuart,
    easeOutQuart,
    easeInOutQuart,
    easeInQuint,
    easeOutQuint,
    easeInOutQuint
  };
  var handleCancelAnimationFrame = function(animation) {
    if (typeof animation === "number") {
      cancelAnimationFrame(animation);
    }
  };
  var handleCancelAnimation = function(contextInstance) {
    if (!contextInstance.mounted)
      return;
    handleCancelAnimationFrame(contextInstance.animation);
    contextInstance.isAnimating = false;
    contextInstance.animation = null;
    contextInstance.velocity = null;
  };
  function handleSetupAnimation(contextInstance, animationName, animationTime, callback) {
    if (!contextInstance.mounted)
      return;
    var startTime = (/* @__PURE__ */ new Date()).getTime();
    var lastStep = 1;
    handleCancelAnimation(contextInstance);
    contextInstance.animation = function() {
      if (!contextInstance.mounted) {
        return handleCancelAnimationFrame(contextInstance.animation);
      }
      var frameTime = (/* @__PURE__ */ new Date()).getTime() - startTime;
      var animationProgress = frameTime / animationTime;
      var animationType = animations[animationName];
      var step = animationType(animationProgress);
      if (frameTime >= animationTime) {
        callback(lastStep);
        contextInstance.animation = null;
      } else if (contextInstance.animation) {
        callback(step);
        requestAnimationFrame(contextInstance.animation);
      }
    };
    requestAnimationFrame(contextInstance.animation);
  }
  function isValidTargetState(targetState) {
    var scale = targetState.scale, positionX = targetState.positionX, positionY = targetState.positionY;
    if (Number.isNaN(scale) || Number.isNaN(positionX) || Number.isNaN(positionY)) {
      return false;
    }
    return true;
  }
  function animate(contextInstance, targetState, animationTime, animationName) {
    var isValid = isValidTargetState(targetState);
    if (!contextInstance.mounted || !isValid)
      return;
    var setState = contextInstance.setState;
    var _a2 = contextInstance.state, scale = _a2.scale, positionX = _a2.positionX, positionY = _a2.positionY;
    var scaleDiff = targetState.scale - scale;
    var positionXDiff = targetState.positionX - positionX;
    var positionYDiff = targetState.positionY - positionY;
    if (animationTime === 0) {
      setState(targetState.scale, targetState.positionX, targetState.positionY);
    } else {
      handleSetupAnimation(contextInstance, animationName, animationTime, function(step) {
        if (step !== 1) {
          contextInstance.isAnimating = true;
        } else {
          contextInstance.isAnimating = false;
        }
        var newScale = scale + scaleDiff * step;
        var newPositionX = positionX + positionXDiff * step;
        var newPositionY = positionY + positionYDiff * step;
        setState(newScale, newPositionX, newPositionY);
      });
    }
  }
  function getComponentsSizes(wrapperComponent, contentComponent, newScale) {
    var wrapperWidth = wrapperComponent.offsetWidth;
    var wrapperHeight = wrapperComponent.offsetHeight;
    var contentWidth = contentComponent.offsetWidth;
    var contentHeight = contentComponent.offsetHeight;
    var newContentWidth = contentWidth * newScale;
    var newContentHeight = contentHeight * newScale;
    var newDiffWidth = wrapperWidth - newContentWidth;
    var newDiffHeight = wrapperHeight - newContentHeight;
    return {
      wrapperWidth,
      wrapperHeight,
      newContentWidth,
      newDiffWidth,
      newContentHeight,
      newDiffHeight
    };
  }
  var getBounds = function(wrapperWidth, newContentWidth, diffWidth, wrapperHeight, newContentHeight, diffHeight, centerZoomedOut) {
    var scaleWidthFactor = wrapperWidth > newContentWidth ? diffWidth * (centerZoomedOut ? 0.5 : 1) : 0;
    var scaleHeightFactor = wrapperHeight > newContentHeight ? diffHeight * (centerZoomedOut ? 0.5 : 1) : 0;
    var minPositionX = wrapperWidth - newContentWidth - scaleWidthFactor;
    var maxPositionX = scaleWidthFactor;
    var minPositionY = wrapperHeight - newContentHeight - scaleHeightFactor;
    var maxPositionY = scaleHeightFactor;
    return {
      minPositionX,
      maxPositionX,
      minPositionY,
      maxPositionY,
      scaleWidthFactor,
      scaleHeightFactor
    };
  };
  var calculateBounds = function(contextInstance, newScale) {
    var wrapperComponent = contextInstance.wrapperComponent, contentComponent = contextInstance.contentComponent;
    var _a2 = contextInstance.setup, centerZoomedOut = _a2.centerZoomedOut, disablePadding = _a2.disablePadding;
    if (!wrapperComponent || !contentComponent) {
      throw new Error("Components are not mounted");
    }
    var _b2 = getComponentsSizes(wrapperComponent, contentComponent, newScale), wrapperWidth = _b2.wrapperWidth, wrapperHeight = _b2.wrapperHeight, newContentWidth = _b2.newContentWidth, newContentHeight = _b2.newContentHeight, newDiffWidth = _b2.newDiffWidth, newDiffHeight = _b2.newDiffHeight;
    var bounds = getBounds(wrapperWidth, newContentWidth, newDiffWidth, wrapperHeight, newContentHeight, newDiffHeight, Boolean(centerZoomedOut));
    var contentFitsCompletely = wrapperWidth >= newContentWidth && wrapperHeight >= newContentHeight;
    if (disablePadding && contentFitsCompletely && !centerZoomedOut) {
      bounds.minPositionX = 0;
      bounds.maxPositionX = 0;
      bounds.minPositionY = 0;
      bounds.maxPositionY = 0;
    }
    var _c = contextInstance.setup, propMinX = _c.minPositionX, propMaxX = _c.maxPositionX, propMinY = _c.minPositionY, propMaxY = _c.maxPositionY;
    if (propMinX != null) {
      bounds.minPositionX = wrapperWidth * (1 - newScale) + propMinX * newScale;
    }
    if (propMaxX != null) {
      bounds.maxPositionX = propMaxX * newScale;
    }
    if (propMinY != null) {
      bounds.minPositionY = wrapperHeight * (1 - newScale) + propMinY * newScale;
    }
    if (propMaxY != null) {
      bounds.maxPositionY = propMaxY * newScale;
    }
    return bounds;
  };
  var boundLimiter = function(value, minBound, maxBound, isActive) {
    if (!isActive)
      return roundNumber(value, 2);
    if (value < minBound)
      return roundNumber(minBound, 2);
    if (value > maxBound)
      return roundNumber(maxBound, 2);
    return roundNumber(value, 2);
  };
  var handleCalculateBounds = function(contextInstance, newScale) {
    var bounds = calculateBounds(contextInstance, newScale);
    contextInstance.bounds = bounds;
    return bounds;
  };
  function getMouseBoundedPosition(positionX, positionY, bounds, limitToBounds, paddingValueX, paddingValueY, wrapperComponent) {
    var minPositionX = bounds.minPositionX, minPositionY = bounds.minPositionY, maxPositionX = bounds.maxPositionX, maxPositionY = bounds.maxPositionY;
    var paddingX = 0;
    var paddingY = 0;
    if (wrapperComponent) {
      paddingX = paddingValueX;
      paddingY = paddingValueY;
    }
    var x3 = boundLimiter(positionX, minPositionX - paddingX, maxPositionX + paddingX, limitToBounds);
    var y = boundLimiter(positionY, minPositionY - paddingY, maxPositionY + paddingY, limitToBounds);
    return { x: x3, y };
  }
  function handleCalculateZoomPositions(contextInstance, mouseX, mouseY, newScale, bounds, limitToBounds) {
    var _a2 = contextInstance.state, scale = _a2.scale, positionX = _a2.positionX, positionY = _a2.positionY;
    var scaleDifference = newScale - scale;
    if (typeof mouseX !== "number" || typeof mouseY !== "number") {
      console.error("Mouse X and Y position were not provided!");
      return { x: positionX, y: positionY };
    }
    var calculatedPositionX = positionX - mouseX * scaleDifference;
    var calculatedPositionY = positionY - mouseY * scaleDifference;
    var newPositions = getMouseBoundedPosition(calculatedPositionX, calculatedPositionY, bounds, limitToBounds, 0, 0, null);
    return newPositions;
  }
  var MIN_SAFE_SCALE = 1e-7;
  function checkZoomBounds(zoom, minScale, maxScale, zoomPadding, enablePadding) {
    var scalePadding = enablePadding ? zoomPadding : 0;
    var minScaleWithPadding = Math.max(minScale - scalePadding, MIN_SAFE_SCALE);
    var maxScaleWithPadding = maxScale + scalePadding;
    if (!Number.isNaN(maxScale) && zoom >= maxScaleWithPadding)
      return maxScaleWithPadding;
    if (!Number.isNaN(minScale) && zoom <= minScaleWithPadding)
      return minScaleWithPadding;
    return Math.max(zoom, MIN_SAFE_SCALE);
  }
  var isPanningStartAllowed = function(contextInstance, event) {
    var excluded = contextInstance.setup.panning.excluded;
    var isInitialized = contextInstance.isInitialized, wrapperComponent = contextInstance.wrapperComponent;
    var target = event.target;
    var targetIsShadowDom = "shadowRoot" in target && "composedPath" in event;
    var isWrapperChild = targetIsShadowDom ? event.composedPath().some(function(el) {
      if (!(el instanceof Element)) {
        return false;
      }
      return wrapperComponent === null || wrapperComponent === void 0 ? void 0 : wrapperComponent.contains(el);
    }) : wrapperComponent === null || wrapperComponent === void 0 ? void 0 : wrapperComponent.contains(target);
    var isAllowed = isInitialized && target && isWrapperChild;
    if (!isAllowed)
      return false;
    var isExcluded = isExcludedNode(target, excluded);
    if (isExcluded)
      return false;
    if (target.getAttribute("draggable") === "true" || target.getAttribute("contenteditable") === "true" || target.isContentEditable) {
      return false;
    }
    return true;
  };
  var isPanningAllowed = function(contextInstance) {
    var isInitialized = contextInstance.isInitialized, isPanning = contextInstance.isPanning, setup = contextInstance.setup;
    var disabled = setup.panning.disabled;
    var isAllowed = isInitialized && isPanning && !disabled;
    if (!isAllowed)
      return false;
    return true;
  };
  var handlePanningSetup = function(contextInstance, event) {
    var _a2 = contextInstance.state, positionX = _a2.positionX, positionY = _a2.positionY;
    contextInstance.isPanning = true;
    var x3 = event.clientX;
    var y = event.clientY;
    contextInstance.startCoords = { x: x3 - positionX, y: y - positionY };
  };
  var handleTouchPanningSetup = function(contextInstance, event) {
    var touches = event.touches;
    var _a2 = contextInstance.state, positionX = _a2.positionX, positionY = _a2.positionY;
    contextInstance.isPanning = true;
    var oneFingerTouch = touches.length === 1;
    if (oneFingerTouch) {
      var x3 = touches[0].clientX;
      var y = touches[0].clientY;
      contextInstance.startCoords = { x: x3 - positionX, y: y - positionY };
    }
  };
  function handlePanToBounds(contextInstance) {
    var _a2 = contextInstance.state, positionX = _a2.positionX, positionY = _a2.positionY, scale = _a2.scale;
    var _b2 = contextInstance.setup, disabled = _b2.disabled, limitToBounds = _b2.limitToBounds, centerZoomedOut = _b2.centerZoomedOut;
    var wrapperComponent = contextInstance.wrapperComponent;
    if (disabled || !wrapperComponent || !contextInstance.bounds)
      return;
    var _c = contextInstance.bounds, maxPositionX = _c.maxPositionX, minPositionX = _c.minPositionX, maxPositionY = _c.maxPositionY, minPositionY = _c.minPositionY;
    var xChanged = positionX > maxPositionX || positionX < minPositionX;
    var yChanged = positionY > maxPositionY || positionY < minPositionY;
    var mousePosX = positionX > maxPositionX ? wrapperComponent.offsetWidth : contextInstance.setup.minPositionX || 0;
    var mousePosY = positionY > maxPositionY ? wrapperComponent.offsetHeight : contextInstance.setup.minPositionY || 0;
    var _d = handleCalculateZoomPositions(contextInstance, mousePosX, mousePosY, scale, contextInstance.bounds, limitToBounds || centerZoomedOut), x3 = _d.x, y = _d.y;
    return {
      scale,
      positionX: xChanged ? x3 : positionX,
      positionY: yChanged ? y : positionY
    };
  }
  function handleNewPosition(contextInstance, newPositionX, newPositionY, paddingValueX, paddingValueY) {
    var limitToBounds = contextInstance.setup.limitToBounds;
    var wrapperComponent = contextInstance.wrapperComponent, bounds = contextInstance.bounds;
    var _a2 = contextInstance.state, scale = _a2.scale, positionX = _a2.positionX, positionY = _a2.positionY;
    if (wrapperComponent === null || bounds === null || newPositionX === positionX && newPositionY === positionY) {
      return;
    }
    var _b2 = getMouseBoundedPosition(newPositionX, newPositionY, bounds, limitToBounds, paddingValueX, paddingValueY, wrapperComponent), x3 = _b2.x, y = _b2.y;
    contextInstance.setState(scale, x3, y);
  }
  var getPanningClientPosition = function(contextInstance, clientX, clientY) {
    var startCoords = contextInstance.startCoords, state = contextInstance.state;
    var panning = contextInstance.setup.panning;
    var lockAxisX = panning.lockAxisX, lockAxisY = panning.lockAxisY;
    var positionX = state.positionX, positionY = state.positionY;
    if (!startCoords) {
      return { x: positionX, y: positionY };
    }
    var mouseX = clientX - startCoords.x;
    var mouseY = clientY - startCoords.y;
    var newPositionX = lockAxisX ? positionX : mouseX;
    var newPositionY = lockAxisY ? positionY : mouseY;
    return { x: newPositionX, y: newPositionY };
  };
  var getPaddingValue = function(contextInstance, size, explicitScale) {
    var setup = contextInstance.setup, state = contextInstance.state;
    var minScale = setup.minScale, disablePadding = setup.disablePadding, centerZoomedOut = setup.centerZoomedOut;
    var scale = explicitScale !== null && explicitScale !== void 0 ? explicitScale : state.scale;
    if (size > 0 && scale >= minScale && !disablePadding && !centerZoomedOut) {
      return size;
    }
    return 0;
  };
  var DeviceType;
  (function(DeviceType2) {
    DeviceType2["TRACK_PAD"] = "track_pad";
    DeviceType2["MOUSE"] = "mouse";
    DeviceType2["TOUCH"] = "touch";
  })(DeviceType || (DeviceType = {}));
  var isVelocityCalculationAllowed = function(contextInstance) {
    var mounted = contextInstance.mounted, wrapperComponent = contextInstance.wrapperComponent, contentComponent = contextInstance.contentComponent;
    var _a2 = contextInstance.setup, disabled = _a2.disabled, velocityAnimation = _a2.velocityAnimation, limitToBounds = _a2.limitToBounds;
    var scale = contextInstance.state.scale;
    var disabledVelocity = velocityAnimation.disabled;
    if (disabledVelocity || disabled || !mounted)
      return false;
    if (!wrapperComponent || !contentComponent)
      return false;
    if (!limitToBounds)
      return true;
    var contentOverflows = wrapperComponent.offsetWidth < contentComponent.offsetWidth * scale || wrapperComponent.offsetHeight < contentComponent.offsetHeight * scale;
    return contentOverflows;
  };
  var isVelocityAllowed = function(contextInstance) {
    var mounted = contextInstance.mounted, velocity = contextInstance.velocity, bounds = contextInstance.bounds;
    var _a2 = contextInstance.setup, disabled = _a2.disabled, velocityAnimation = _a2.velocityAnimation;
    var disabledVelocity = velocityAnimation.disabled;
    var isAllowed = !disabledVelocity && !disabled && mounted;
    if (!isAllowed)
      return false;
    if (!velocity || !bounds)
      return false;
    return true;
  };
  function getVelocityMoveTime(contextInstance, velocity) {
    var velocityAnimation = contextInstance.setup.velocityAnimation;
    var animationTime = velocityAnimation.animationTime, maxAnimationTime = velocityAnimation.maxAnimationTime, inertia = velocityAnimation.inertia;
    return Math.min(animationTime * Math.max(1, Math.abs(velocity / inertia)), maxAnimationTime);
  }
  function getVelocityPosition(newPosition, startPosition, currentPosition, isLocked, limitToBounds, minPosition, maxPosition, minTarget, maxTarget, step) {
    if (limitToBounds) {
      if (startPosition > maxPosition && currentPosition > maxPosition) {
        var calculatedPosition = maxPosition + (newPosition - maxPosition) * step;
        if (calculatedPosition > maxTarget)
          return maxTarget;
        if (calculatedPosition < maxPosition)
          return maxPosition;
        return calculatedPosition;
      }
      if (startPosition < minPosition && currentPosition < minPosition) {
        var calculatedPosition = minPosition + (newPosition - minPosition) * step;
        if (calculatedPosition < minTarget)
          return minTarget;
        if (calculatedPosition > minPosition)
          return minPosition;
        return calculatedPosition;
      }
    }
    if (isLocked)
      return startPosition;
    return boundLimiter(newPosition, minPosition, maxPosition, limitToBounds);
  }
  function getSizeMultiplier(wrapperComponent) {
    var defaultMultiplier = 1;
    var value = wrapperComponent.offsetWidth / window.innerWidth;
    if (Number.isNaN(value)) {
      return defaultMultiplier;
    }
    return Math.min(defaultMultiplier, value);
  }
  var getMinMaxVelocity = function(velocity, maxStrength, sensitivity) {
    var defaultMultiplier = 0;
    var value = velocity * sensitivity;
    if (Number.isNaN(value)) {
      return defaultMultiplier;
    }
    if (velocity < 0) {
      return Math.max(value, -maxStrength);
    }
    return Math.min(value, maxStrength);
  };
  function handleCalculateVelocity(contextInstance, position, device) {
    var _a2, _b2;
    var isAllowed = isVelocityCalculationAllowed(contextInstance);
    if (!isAllowed) {
      return;
    }
    var lastMousePosition = contextInstance.lastMousePosition, velocityTime = contextInstance.velocityTime, setup = contextInstance.setup;
    var wrapperComponent = contextInstance.wrapperComponent;
    var _c = setup.velocityAnimation, maxStrengthMouse = _c.maxStrengthMouse, maxStrengthTouch = _c.maxStrengthTouch, sensitivityTouch = _c.sensitivityTouch, sensitivityMouse = _c.sensitivityMouse;
    var now = Date.now();
    if (lastMousePosition && velocityTime && wrapperComponent) {
      var sizeMultiplier = getSizeMultiplier(wrapperComponent);
      var sensitivity = (_a2 = {}, _a2[DeviceType.TOUCH] = sensitivityTouch, _a2[DeviceType.MOUSE] = sensitivityMouse, _a2)[device];
      var maxStrength = (_b2 = {}, _b2[DeviceType.TOUCH] = maxStrengthTouch, _b2[DeviceType.MOUSE] = maxStrengthMouse, _b2)[device];
      var distanceX = position.x - lastMousePosition.x;
      var distanceY = position.y - lastMousePosition.y;
      var velocityX = getMinMaxVelocity(distanceX / sizeMultiplier, maxStrength, sensitivity);
      var velocityY = getMinMaxVelocity(distanceY / sizeMultiplier, maxStrength, sensitivity);
      var interval = now - velocityTime;
      var speed = distanceX * distanceX + distanceY * distanceY;
      var velocity = getMinMaxVelocity(Math.sqrt(speed) / interval, maxStrength, sensitivity);
      contextInstance.velocity = { velocityX, velocityY, total: velocity };
    }
    contextInstance.lastMousePosition = position;
    contextInstance.velocityTime = now;
  }
  function handleVelocityPanning(contextInstance) {
    var velocity = contextInstance.velocity, bounds = contextInstance.bounds, setup = contextInstance.setup, wrapperComponent = contextInstance.wrapperComponent;
    var isAllowed = isVelocityAllowed(contextInstance);
    if (!isAllowed || !velocity || !bounds || !wrapperComponent) {
      return;
    }
    var velocityX = velocity.velocityX, velocityY = velocity.velocityY, total = velocity.total;
    var maxPositionX = bounds.maxPositionX, minPositionX = bounds.minPositionX, maxPositionY = bounds.maxPositionY, minPositionY = bounds.minPositionY;
    var limitToBounds = setup.limitToBounds, autoAlignment = setup.autoAlignment;
    var zoomAnimation = setup.zoomAnimation, panning = setup.panning;
    var lockAxisY = panning.lockAxisY, lockAxisX = panning.lockAxisX;
    var animationType = zoomAnimation.animationType;
    var sizeX = autoAlignment.sizeX, sizeY = autoAlignment.sizeY, velocityAlignmentTime = autoAlignment.velocityAlignmentTime;
    var alignAnimationTime = velocityAlignmentTime;
    var moveAnimationTime = getVelocityMoveTime(contextInstance, total);
    var finalAnimationTime = Math.max(moveAnimationTime, alignAnimationTime);
    var paddingValueX = getPaddingValue(contextInstance, sizeX);
    var paddingValueY = getPaddingValue(contextInstance, sizeY);
    var paddingX = paddingValueX * wrapperComponent.offsetWidth / 100;
    var paddingY = paddingValueY * wrapperComponent.offsetHeight / 100;
    var maxTargetX = maxPositionX + paddingX;
    var minTargetX = minPositionX - paddingX;
    var maxTargetY = maxPositionY + paddingY;
    var minTargetY = minPositionY - paddingY;
    var startState = contextInstance.state;
    var startTime = (/* @__PURE__ */ new Date()).getTime();
    handleSetupAnimation(contextInstance, animationType, finalAnimationTime, function(step) {
      var _a2 = contextInstance.state, scale = _a2.scale, positionX = _a2.positionX, positionY = _a2.positionY;
      var frameTime = (/* @__PURE__ */ new Date()).getTime() - startTime;
      var animationProgress = frameTime / alignAnimationTime;
      var alignAnimation = animations[autoAlignment.animationType];
      var alignStep = 1 - alignAnimation(Math.min(1, animationProgress));
      var customStep = 1 - step;
      var newPositionX = positionX + velocityX * customStep;
      var newPositionY = positionY + velocityY * customStep;
      var currentPositionX = getVelocityPosition(newPositionX, startState.positionX, positionX, lockAxisX, limitToBounds, minPositionX, maxPositionX, minTargetX, maxTargetX, alignStep);
      var currentPositionY = getVelocityPosition(newPositionY, startState.positionY, positionY, lockAxisY, limitToBounds, minPositionY, maxPositionY, minTargetY, maxTargetY, alignStep);
      if (positionX !== newPositionX || positionY !== newPositionY) {
        contextInstance.setState(scale, currentPositionX, currentPositionY);
        var onPanning = contextInstance.props.onPanning;
        if (onPanning) {
          onPanning(getContext(contextInstance), {});
        }
      }
    });
  }
  function handlePanningStart(contextInstance, event) {
    var _a2 = contextInstance.state, scale = _a2.scale, positionX = _a2.positionX, positionY = _a2.positionY;
    contextInstance.panStartPosition = { x: positionX, y: positionY };
    handleCancelAnimation(contextInstance);
    handleCalculateBounds(contextInstance, scale);
    if (window.TouchEvent !== void 0 && event instanceof TouchEvent) {
      handleTouchPanningSetup(contextInstance, event);
    } else {
      handlePanningSetup(contextInstance, event);
    }
  }
  function handleAlignToBounds(contextInstance, customAnimationTime) {
    var scale = contextInstance.state.scale;
    var _a2 = contextInstance.setup, minScale = _a2.minScale, autoAlignment = _a2.autoAlignment;
    var disabled = autoAlignment.disabled, sizeX = autoAlignment.sizeX, sizeY = autoAlignment.sizeY, animationTime = autoAlignment.animationTime, animationType = autoAlignment.animationType;
    var isDisabled = disabled || scale < minScale || !sizeX && !sizeY;
    if (isDisabled)
      return;
    var targetState = handlePanToBounds(contextInstance);
    if (targetState) {
      animate(contextInstance, targetState, customAnimationTime !== null && customAnimationTime !== void 0 ? customAnimationTime : animationTime, animationType);
    }
  }
  function handlePanning(contextInstance, clientX, clientY, device) {
    var startCoords = contextInstance.startCoords, setup = contextInstance.setup;
    var _a2 = setup.autoAlignment, sizeX = _a2.sizeX, sizeY = _a2.sizeY;
    if (!startCoords)
      return;
    var _b2 = getPanningClientPosition(contextInstance, clientX, clientY), x3 = _b2.x, y = _b2.y;
    var paddingValueX = getPaddingValue(contextInstance, sizeX);
    var paddingValueY = getPaddingValue(contextInstance, sizeY);
    handleCalculateVelocity(contextInstance, { x: x3, y }, device);
    handleNewPosition(contextInstance, x3, y, paddingValueX, paddingValueY);
  }
  function handlePanningEnd(contextInstance, velocityDisabled) {
    if (contextInstance.isPanning) {
      var velocity = contextInstance.velocity, wrapperComponent = contextInstance.wrapperComponent, contentComponent = contextInstance.contentComponent;
      contextInstance.isPanning = false;
      var _a2 = contextInstance.state, positionX = _a2.positionX, positionY = _a2.positionY, scale = _a2.scale;
      var start = contextInstance.panStartPosition;
      contextInstance.panStartPosition = null;
      if (start) {
        var dx = positionX - start.x;
        var dy = positionY - start.y;
        if (dx * dx + dy * dy <= 25)
          return;
      }
      contextInstance.isAnimating = false;
      contextInstance.animation = null;
      var wrapperWidth = (wrapperComponent === null || wrapperComponent === void 0 ? void 0 : wrapperComponent.offsetWidth) || 0;
      var wrapperHeight = (wrapperComponent === null || wrapperComponent === void 0 ? void 0 : wrapperComponent.offsetHeight) || 0;
      var contentWidth = ((contentComponent === null || contentComponent === void 0 ? void 0 : contentComponent.offsetWidth) || 0) * scale;
      var contentHeight = ((contentComponent === null || contentComponent === void 0 ? void 0 : contentComponent.offsetHeight) || 0) * scale;
      var isContentOverflowing = !contextInstance.setup.limitToBounds || wrapperWidth < contentWidth || wrapperHeight < contentHeight;
      var shouldAnimate = !velocityDisabled && velocity && velocity.total > 0.1 && isContentOverflowing;
      if (shouldAnimate) {
        handleVelocityPanning(contextInstance);
      } else {
        handleAlignToBounds(contextInstance);
      }
    }
  }
  function handleZoomToPoint(contextInstance, scale, mouseX, mouseY) {
    var _a2 = contextInstance.setup, minScale = _a2.minScale, maxScale = _a2.maxScale, limitToBounds = _a2.limitToBounds;
    var newScale = checkZoomBounds(roundNumber(scale, 2), minScale, maxScale, 0, false);
    var bounds = handleCalculateBounds(contextInstance, newScale);
    var _b2 = handleCalculateZoomPositions(contextInstance, mouseX, mouseY, newScale, bounds, limitToBounds), x3 = _b2.x, y = _b2.y;
    return { scale: newScale, positionX: x3, positionY: y };
  }
  function handleAlignToScaleBounds(contextInstance, mousePositionX, mousePositionY) {
    var scale = contextInstance.state.scale;
    var wrapperComponent = contextInstance.wrapperComponent;
    var _a2 = contextInstance.setup, minScale = _a2.minScale, maxScale = _a2.maxScale, limitToBounds = _a2.limitToBounds, zoomAnimation = _a2.zoomAnimation;
    var disabled = zoomAnimation.disabled, animationTime = zoomAnimation.animationTime, animationType = zoomAnimation.animationType;
    var isWithinBounds = scale >= minScale && scale <= maxScale;
    var isDisabled = disabled || isWithinBounds;
    if (scale >= 1 || limitToBounds) {
      handleAlignToBounds(contextInstance);
    }
    if (isDisabled || !wrapperComponent || !contextInstance.mounted)
      return;
    var mouseX = mousePositionX || wrapperComponent.offsetWidth / 2;
    var mouseY = mousePositionY || wrapperComponent.offsetHeight / 2;
    var targetScale = scale < minScale ? minScale : maxScale;
    var targetState = handleZoomToPoint(contextInstance, targetScale, mouseX, mouseY);
    if (targetState) {
      animate(contextInstance, targetState, animationTime, animationType);
    }
  }
  var __assign = function() {
    __assign = Object.assign || function __assign2(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p2 in s) if (Object.prototype.hasOwnProperty.call(s, p2)) t[p2] = s[p2];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l2 = from.length, ar; i < l2; i++) {
      if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
  }
  var initialState = {
    previousScale: 1,
    scale: 1,
    positionX: 0,
    positionY: 0
  };
  var initialSetup = {
    disabled: false,
    minPositionX: null,
    maxPositionX: null,
    minPositionY: null,
    maxPositionY: null,
    minScale: 1,
    maxScale: 8,
    limitToBounds: true,
    centerZoomedOut: false,
    centerOnInit: false,
    disablePadding: false,
    smooth: true,
    detached: false,
    wheel: {
      step: 0.015,
      disabled: false,
      wheelDisabled: false,
      touchPadDisabled: false,
      activationKeys: [],
      excluded: []
    },
    trackPadPanning: {
      disabled: true,
      velocityDisabled: false,
      lockAxisX: false,
      lockAxisY: false,
      activationKeys: [],
      excluded: []
    },
    panning: {
      disabled: false,
      velocityDisabled: false,
      lockAxisX: false,
      lockAxisY: false,
      allowLeftClickPan: true,
      allowMiddleClickPan: true,
      allowRightClickPan: true,
      activationKeys: [],
      excluded: []
    },
    pinch: {
      step: 5,
      disabled: false,
      allowPanning: true,
      excluded: []
    },
    doubleClick: {
      disabled: false,
      step: 0.7,
      mode: "zoomIn",
      animationType: "easeOut",
      animationTime: 200,
      excluded: []
    },
    zoomAnimation: {
      disabled: false,
      size: 0.4,
      animationTime: 200,
      animationType: "easeOut"
    },
    autoAlignment: {
      disabled: false,
      sizeX: 100,
      sizeY: 100,
      animationTime: 200,
      velocityAlignmentTime: 400,
      animationType: "easeOut"
    },
    velocityAnimation: {
      disabled: false,
      sensitivityMouse: 1,
      sensitivityTouch: 1.2,
      maxStrengthMouse: 20,
      maxStrengthTouch: 40,
      inertia: 1,
      animationTime: 300,
      maxAnimationTime: 800,
      animationType: "easeOut"
    }
  };
  var baseClasses = {
    wrapperClass: "react-transform-wrapper",
    contentClass: "react-transform-component"
  };
  var createState = function(props) {
    var _a2, _b2, _c, _d, _e, _f, _g, _h, _j;
    var minScale = Math.max((_a2 = props.minScale) !== null && _a2 !== void 0 ? _a2 : initialSetup.minScale, 1e-7);
    var maxScale = (_b2 = props.maxScale) !== null && _b2 !== void 0 ? _b2 : initialSetup.maxScale;
    var rawScale = (_c = props.initialScale) !== null && _c !== void 0 ? _c : initialState.scale;
    var scale = Math.min(Math.max(rawScale, minScale), maxScale);
    var positionX = boundLimiter((_d = props.initialPositionX) !== null && _d !== void 0 ? _d : initialState.positionX, (_e = props.minPositionX) !== null && _e !== void 0 ? _e : -Infinity, (_f = props.maxPositionX) !== null && _f !== void 0 ? _f : Infinity, props.minPositionX != null || props.maxPositionX != null);
    var positionY = boundLimiter((_g = props.initialPositionY) !== null && _g !== void 0 ? _g : initialState.positionY, (_h = props.minPositionY) !== null && _h !== void 0 ? _h : -Infinity, (_j = props.maxPositionY) !== null && _j !== void 0 ? _j : Infinity, props.minPositionY != null || props.maxPositionY != null);
    return {
      previousScale: scale,
      scale,
      positionX,
      positionY
    };
  };
  var createSetup = function(props) {
    var newSetup = __assign({}, initialSetup);
    Object.keys(props).forEach(function(key) {
      var k = key;
      var validValue = typeof props[k] !== "undefined";
      var validParameter = typeof initialSetup[k] !== "undefined";
      if (validParameter && validValue) {
        var dataType = Object.prototype.toString.call(initialSetup[k]);
        var isObject = dataType === "[object Object]";
        var isArray = dataType === "[object Array]";
        if (isObject) {
          newSetup[k] = __assign(__assign({}, initialSetup[k]), props[k]);
        } else if (isArray) {
          newSetup[k] = __spreadArray(__spreadArray([], initialSetup[k], true), props[k], true);
        } else {
          newSetup[k] = props[k];
        }
      }
    });
    if (newSetup.minScale <= 0) {
      newSetup.minScale = 1e-7;
    }
    return newSetup;
  };
  var handleCalculateButtonZoom = function(contextInstance, delta, step) {
    var scale = contextInstance.state.scale;
    var wrapperComponent = contextInstance.wrapperComponent, setup = contextInstance.setup;
    var maxScale = setup.maxScale, minScale = setup.minScale, zoomAnimation = setup.zoomAnimation, smooth = setup.smooth;
    var size = zoomAnimation.size;
    if (!wrapperComponent) {
      throw new Error("Wrapper is not mounted");
    }
    var targetScale = smooth ? scale * Math.exp(delta * step) : scale + delta * step;
    var newScale = checkZoomBounds(roundNumber(targetScale, 3), minScale, maxScale, size, false);
    return newScale;
  };
  function handleZoomToViewCenter(contextInstance, delta, step, animationTime, animationType) {
    var _a2, _b2;
    var wrapperComponent = contextInstance.wrapperComponent;
    var _c = contextInstance.state, scale = _c.scale, positionX = _c.positionX, positionY = _c.positionY;
    var zoomAnimation = contextInstance.setup.zoomAnimation;
    if (!wrapperComponent)
      return console.error("No WrapperComponent found");
    var effectiveAnimationTime = zoomAnimation.disabled ? 0 : animationTime;
    var wrapperWidth = wrapperComponent.offsetWidth;
    var wrapperHeight = wrapperComponent.offsetHeight;
    var mouseX = (wrapperWidth / 2 - positionX) / scale;
    var mouseY = (wrapperHeight / 2 - positionY) / scale;
    var newScale = handleCalculateButtonZoom(contextInstance, delta, step);
    var targetState = handleZoomToPoint(contextInstance, newScale, mouseX, mouseY);
    if (!targetState) {
      return console.error("Error during zoom event. New transformation state was not calculated.");
    }
    var _d = contextInstance.props, onZoomStart = _d.onZoomStart, onZoom = _d.onZoom, onZoomStop = _d.onZoomStop;
    var event = new MouseEvent("mousemove", { bubbles: true });
    var ctx = getContext(contextInstance);
    handleCallback(ctx, event, onZoomStart);
    handleCallback(ctx, event, onZoom);
    animate(contextInstance, targetState, effectiveAnimationTime, animationType);
    var win = (_b2 = (_a2 = wrapperComponent.ownerDocument) === null || _a2 === void 0 ? void 0 : _a2.defaultView) !== null && _b2 !== void 0 ? _b2 : typeof window !== "undefined" ? window : null;
    if (win) {
      win.setTimeout(function() {
        if (!contextInstance.mounted)
          return;
        handleCallback(getContext(contextInstance), event, onZoomStop);
      }, effectiveAnimationTime);
    }
  }
  function resetTransformations(contextInstance, animationTime, animationType, onResetTransformation) {
    var _a2, _b2;
    var setup = contextInstance.setup, wrapperComponent = contextInstance.wrapperComponent, contentComponent = contextInstance.contentComponent;
    var limitToBounds = setup.limitToBounds, centerOnInit = setup.centerOnInit;
    var initialTransformation = createState(contextInstance.props);
    var _c = contextInstance.state, scale = _c.scale, positionX = _c.positionX, positionY = _c.positionY;
    if (!wrapperComponent)
      return;
    var targetPositionX = initialTransformation.positionX;
    var targetPositionY = initialTransformation.positionY;
    if (centerOnInit && contentComponent) {
      var centered = getCenterPosition(initialTransformation.scale, wrapperComponent, contentComponent);
      targetPositionX = centered.positionX;
      targetPositionY = centered.positionY;
    }
    var newBounds = calculateBounds(contextInstance, initialTransformation.scale);
    var boundedPositions = getMouseBoundedPosition(targetPositionX, targetPositionY, newBounds, limitToBounds, 0, 0, wrapperComponent);
    var newState = {
      scale: initialTransformation.scale,
      positionX: boundedPositions.x,
      positionY: boundedPositions.y
    };
    if (scale === initialTransformation.scale && positionX === initialTransformation.positionX && positionY === initialTransformation.positionY) {
      return;
    }
    onResetTransformation === null || onResetTransformation === void 0 ? void 0 : onResetTransformation();
    var _d = contextInstance.props, onZoomStart = _d.onZoomStart, onZoom = _d.onZoom, onZoomStop = _d.onZoomStop;
    var event = new MouseEvent("mousemove", { bubbles: true });
    var ctx = getContext(contextInstance);
    handleCallback(ctx, event, onZoomStart);
    handleCallback(ctx, event, onZoom);
    animate(contextInstance, newState, animationTime, animationType);
    var win = (_b2 = (_a2 = wrapperComponent.ownerDocument) === null || _a2 === void 0 ? void 0 : _a2.defaultView) !== null && _b2 !== void 0 ? _b2 : typeof window !== "undefined" ? window : null;
    if (win) {
      win.setTimeout(function() {
        if (!contextInstance.mounted)
          return;
        handleCallback(getContext(contextInstance), event, onZoomStop);
      }, animationTime);
    }
  }
  function getOffset(element, wrapper, content, state) {
    var offset = element.getBoundingClientRect();
    var wrapperOffset = wrapper.getBoundingClientRect();
    var contentOffset = content.getBoundingClientRect();
    var xOff = wrapperOffset.x * state.scale;
    var yOff = wrapperOffset.y * state.scale;
    return {
      x: (offset.x - contentOffset.x + xOff) / state.scale,
      y: (offset.y - contentOffset.y + yOff) / state.scale
    };
  }
  function calculateZoomToNode(contextInstance, node, customZoom, customOffsetX, customOffsetY) {
    if (customOffsetX === void 0) {
      customOffsetX = 0;
    }
    if (customOffsetY === void 0) {
      customOffsetY = 0;
    }
    var wrapperComponent = contextInstance.wrapperComponent, contentComponent = contextInstance.contentComponent, state = contextInstance.state;
    var _a2 = contextInstance.setup, limitToBounds = _a2.limitToBounds, minScale = _a2.minScale, maxScale = _a2.maxScale;
    if (!wrapperComponent || !contentComponent)
      return state;
    var wrapperRect = wrapperComponent.getBoundingClientRect();
    var nodeRect = node.getBoundingClientRect();
    var nodeOffset = getOffset(node, wrapperComponent, contentComponent, state);
    var nodeLeft = nodeOffset.x;
    var nodeTop = nodeOffset.y;
    var nodeWidth = nodeRect.width / state.scale;
    var nodeHeight = nodeRect.height / state.scale;
    var scaleX = wrapperComponent.offsetWidth / nodeWidth;
    var scaleY = wrapperComponent.offsetHeight / nodeHeight;
    var newScale = checkZoomBounds(customZoom || Math.min(scaleX, scaleY), minScale, maxScale, 0, false);
    var offsetX = (wrapperRect.width - nodeWidth * newScale) / 2;
    var offsetY = (wrapperRect.height - nodeHeight * newScale) / 2;
    var newPositionX = (wrapperRect.left - nodeLeft) * newScale + offsetX + customOffsetX;
    var newPositionY = (wrapperRect.top - nodeTop) * newScale + offsetY + customOffsetY;
    var bounds = calculateBounds(contextInstance, newScale);
    var _b2 = getMouseBoundedPosition(newPositionX, newPositionY, bounds, limitToBounds, 0, 0, wrapperComponent), x3 = _b2.x, y = _b2.y;
    return { positionX: x3, positionY: y, scale: newScale };
  }
  var zoomIn = function(contextInstance) {
    return function(step, animationTime, animationType) {
      if (step === void 0) {
        step = 0.5;
      }
      if (animationTime === void 0) {
        animationTime = 300;
      }
      if (animationType === void 0) {
        animationType = "easeOut";
      }
      handleZoomToViewCenter(contextInstance, 1, step, animationTime, animationType);
    };
  };
  var zoomOut = function(contextInstance) {
    return function(step, animationTime, animationType) {
      if (step === void 0) {
        step = 0.5;
      }
      if (animationTime === void 0) {
        animationTime = 300;
      }
      if (animationType === void 0) {
        animationType = "easeOut";
      }
      handleZoomToViewCenter(contextInstance, -1, step, animationTime, animationType);
    };
  };
  var setTransform = function(contextInstance) {
    return function(newPositionX, newPositionY, newScale, animationTime, animationType) {
      if (animationTime === void 0) {
        animationTime = 300;
      }
      if (animationType === void 0) {
        animationType = "easeOut";
      }
      var _a2 = contextInstance.state, positionX = _a2.positionX, positionY = _a2.positionY, scale = _a2.scale;
      var wrapperComponent = contextInstance.wrapperComponent, contentComponent = contextInstance.contentComponent;
      var disabled = contextInstance.setup.disabled;
      if (disabled || !wrapperComponent || !contentComponent)
        return;
      var targetState = {
        positionX: Number.isNaN(newPositionX) ? positionX : newPositionX,
        positionY: Number.isNaN(newPositionY) ? positionY : newPositionY,
        scale: Number.isNaN(newScale) ? scale : newScale
      };
      animate(contextInstance, targetState, animationTime, animationType);
    };
  };
  var resetTransform = function(contextInstance) {
    return function(animationTime, animationType) {
      if (animationTime === void 0) {
        animationTime = 200;
      }
      if (animationType === void 0) {
        animationType = "easeOut";
      }
      resetTransformations(contextInstance, animationTime, animationType);
    };
  };
  var centerView = function(contextInstance) {
    return function(scale, animationTime, animationType) {
      if (animationTime === void 0) {
        animationTime = 200;
      }
      if (animationType === void 0) {
        animationType = "easeOut";
      }
      var state = contextInstance.state, wrapperComponent = contextInstance.wrapperComponent, contentComponent = contextInstance.contentComponent;
      if (wrapperComponent && contentComponent) {
        var targetState = getCenterPosition(scale || state.scale, wrapperComponent, contentComponent);
        animate(contextInstance, targetState, animationTime, animationType);
      }
    };
  };
  var zoomToElement = function(contextInstance) {
    return function(node, scale, animationTime, animationType, offsetX, offsetY) {
      if (animationTime === void 0) {
        animationTime = 600;
      }
      if (animationType === void 0) {
        animationType = "easeOut";
      }
      if (offsetX === void 0) {
        offsetX = 0;
      }
      if (offsetY === void 0) {
        offsetY = 0;
      }
      handleCancelAnimation(contextInstance);
      var wrapperComponent = contextInstance.wrapperComponent;
      var target = typeof node === "string" ? document.getElementById(node) : node;
      if (wrapperComponent && target && wrapperComponent.contains(target)) {
        var targetState = calculateZoomToNode(contextInstance, target, scale, offsetX, offsetY);
        animate(contextInstance, targetState, animationTime, animationType);
      }
    };
  };
  var getControls = function(contextInstance) {
    return {
      instance: contextInstance,
      state: contextInstance.state,
      zoomIn: zoomIn(contextInstance),
      zoomOut: zoomOut(contextInstance),
      setTransform: setTransform(contextInstance),
      resetTransform: resetTransform(contextInstance),
      centerView: centerView(contextInstance),
      zoomToElement: zoomToElement(contextInstance)
    };
  };
  var getState = function(contextInstance) {
    return {
      instance: contextInstance,
      state: contextInstance.state
    };
  };
  var getContext = function(contextInstance) {
    var ref = {};
    Object.assign(ref, getState(contextInstance));
    Object.assign(ref, getControls(contextInstance));
    return ref;
  };
  var passiveSupported = false;
  function makePassiveEventOption() {
    try {
      var options = {
        get passive() {
          passiveSupported = true;
          return false;
        }
      };
      return options;
    } catch (err) {
      passiveSupported = false;
      return passiveSupported;
    }
  }
  var matchPrefix = ".".concat(baseClasses.wrapperClass);
  var isExcludedNode = function(node, excluded) {
    return excluded.some(function(exclude) {
      return node.matches("".concat(matchPrefix, " ").concat(exclude, ", ").concat(matchPrefix, " .").concat(exclude, ", ").concat(matchPrefix, " ").concat(exclude, " *, ").concat(matchPrefix, " .").concat(exclude, " *"));
    });
  };
  var cancelTimeout = function(timeout) {
    if (timeout) {
      clearTimeout(timeout);
    }
  };
  var roundScaleForTransform = function(scale) {
    return Number.parseFloat(scale.toFixed(8));
  };
  var getTransformStyles = function(x3, y, scale) {
    var s = roundScaleForTransform(scale);
    return "translate(".concat(x3, "px, ").concat(y, "px) scale(").concat(s, ")");
  };
  var getCenterPosition = function(scale, wrapperComponent, contentComponent) {
    var contentWidth = contentComponent.offsetWidth * scale;
    var contentHeight = contentComponent.offsetHeight * scale;
    var centerPositionX = (wrapperComponent.offsetWidth - contentWidth) / 2;
    var centerPositionY = (wrapperComponent.offsetHeight - contentHeight) / 2;
    return {
      scale,
      positionX: centerPositionX,
      positionY: centerPositionY
    };
  };
  function assignRef(ref, value) {
    if (ref == null)
      return;
    if (typeof ref === "function") {
      ref(value);
    } else {
      ref.current = value;
    }
  }
  function mergeRefs(refs) {
    return function(value) {
      refs.forEach(function(ref) {
        if (typeof ref === "function") {
          ref(value);
        } else if (ref != null) {
          ref.current = value;
        }
      });
    };
  }
  var isWheelAllowed = function(contextInstance, event) {
    var _a2 = contextInstance.setup.wheel, disabled = _a2.disabled, wheelDisabled = _a2.wheelDisabled, touchPadDisabled = _a2.touchPadDisabled, excluded = _a2.excluded;
    var isInitialized = contextInstance.isInitialized, isPanning = contextInstance.isPanning;
    var target = event.target;
    var isAllowed = isInitialized && !isPanning && !disabled && target;
    if (!isAllowed)
      return false;
    if (wheelDisabled && !event.ctrlKey)
      return false;
    if (touchPadDisabled && event.ctrlKey)
      return false;
    var isExcluded = isExcludedNode(target, excluded);
    if (isExcluded)
      return false;
    var keysPressed = contextInstance.isPressingKeys(contextInstance.setup.wheel.activationKeys);
    if (!keysPressed)
      return false;
    return true;
  };
  var isWheelPanningAllowed = function(contextInstance, event) {
    var _a2 = contextInstance.setup, disabled = _a2.disabled, trackPadPanning = _a2.trackPadPanning;
    var activationKeys = trackPadPanning.activationKeys, excluded = trackPadPanning.excluded;
    if (!contextInstance.wrapperComponent || !contextInstance.contentComponent) {
      return false;
    }
    if (disabled || trackPadPanning.disabled || event.ctrlKey) {
      return false;
    }
    var isAllowed = isWheelAllowed(contextInstance, event);
    if (isAllowed)
      return false;
    var target = event.target;
    var isExcluded = isExcludedNode(target, excluded);
    if (isExcluded)
      return false;
    var keysPressed = contextInstance.isPressingKeys(activationKeys);
    if (!keysPressed)
      return false;
    return true;
  };
  var getDeltaY = function(event) {
    if (event) {
      return event.deltaY < 0 ? 1 : -1;
    }
    return 0;
  };
  function getDelta(event, customDelta) {
    var deltaY = getDeltaY(event);
    var delta = checkIsNumber(customDelta, deltaY);
    return delta;
  }
  function getMousePosition(event, contentComponent, scale) {
    var contentRect = contentComponent.getBoundingClientRect();
    var mouseX = 0;
    var mouseY = 0;
    if ("clientX" in event) {
      mouseX = (event.clientX - contentRect.left) / scale;
      mouseY = (event.clientY - contentRect.top) / scale;
    } else {
      var touch = event.touches[0];
      mouseX = (touch.clientX - contentRect.left) / scale;
      mouseY = (touch.clientY - contentRect.top) / scale;
    }
    if (Number.isNaN(mouseX) || Number.isNaN(mouseY))
      console.error("No mouse or touch offset found");
    return {
      x: mouseX,
      y: mouseY
    };
  }
  var handleCalculateWheelZoom = function(contextInstance, delta, step, disable, getTarget) {
    var scale = contextInstance.state.scale;
    var wrapperComponent = contextInstance.wrapperComponent, setup = contextInstance.setup;
    var maxScale = setup.maxScale, minScale = setup.minScale, zoomAnimation = setup.zoomAnimation, disablePadding = setup.disablePadding;
    var size = zoomAnimation.size, disabled = zoomAnimation.disabled;
    if (!wrapperComponent) {
      throw new Error("Wrapper is not mounted");
    }
    var targetScale = scale + delta * step;
    if (getTarget)
      return targetScale;
    var paddingEnabled = disable ? false : !disabled;
    var newScale = checkZoomBounds(targetScale, minScale, maxScale, size, paddingEnabled && !disablePadding);
    return newScale;
  };
  var handleWheelZoomStop = function(contextInstance, event) {
    var previousWheelEvent = contextInstance.previousWheelEvent;
    var scale = contextInstance.state.scale;
    var _a2 = contextInstance.setup, maxScale = _a2.maxScale, minScale = _a2.minScale;
    if (!previousWheelEvent)
      return false;
    if (scale < maxScale || scale > minScale)
      return true;
    if (Math.sign(previousWheelEvent.deltaY) !== Math.sign(event.deltaY))
      return true;
    if (previousWheelEvent.deltaY > 0 && previousWheelEvent.deltaY < event.deltaY)
      return true;
    if (previousWheelEvent.deltaY < 0 && previousWheelEvent.deltaY > event.deltaY)
      return true;
    if (Math.sign(previousWheelEvent.deltaY) !== Math.sign(event.deltaY))
      return true;
    return false;
  };
  var isPinchStartAllowed = function(contextInstance, event) {
    var _a2 = contextInstance.setup.pinch, disabled = _a2.disabled, excluded = _a2.excluded;
    var isInitialized = contextInstance.isInitialized;
    var target = event.target;
    var isAllowed = isInitialized && !disabled && target;
    if (!isAllowed)
      return false;
    var isExcluded = isExcludedNode(target, excluded);
    if (isExcluded)
      return false;
    return true;
  };
  var isPinchAllowed = function(contextInstance) {
    var disabled = contextInstance.setup.pinch.disabled;
    var isInitialized = contextInstance.isInitialized, pinchStartDistance = contextInstance.pinchStartDistance;
    var isAllowed = isInitialized && !disabled && pinchStartDistance !== null;
    if (!isAllowed)
      return false;
    return true;
  };
  var calculateTouchMidPoint = function(event, scale, contentComponent) {
    var contentRect = contentComponent.getBoundingClientRect();
    var touches = event.touches;
    var firstPointX = touches[0].clientX - contentRect.left;
    var firstPointY = touches[0].clientY - contentRect.top;
    var secondPointX = touches[1].clientX - contentRect.left;
    var secondPointY = touches[1].clientY - contentRect.top;
    return {
      x: (firstPointX + secondPointX) / 2 / scale,
      y: (firstPointY + secondPointY) / 2 / scale
    };
  };
  var getTouchDistance = function(event) {
    return Math.sqrt(Math.pow(event.touches[0].pageX - event.touches[1].pageX, 2) + Math.pow(event.touches[0].pageY - event.touches[1].pageY, 2));
  };
  var DEFAULT_PINCH_STEP = 5;
  var calculatePinchZoom = function(contextInstance, currentDistance) {
    var pinchStartScale = contextInstance.pinchStartScale, pinchStartDistance = contextInstance.pinchStartDistance, setup = contextInstance.setup;
    var maxScale = setup.maxScale, minScale = setup.minScale, zoomAnimation = setup.zoomAnimation, disablePadding = setup.disablePadding, pinch = setup.pinch;
    var size = zoomAnimation.size, disabled = zoomAnimation.disabled;
    var step = pinch.step;
    if (!pinchStartScale || pinchStartDistance === null) {
      throw new Error("Pinch touches distance was not provided");
    }
    if (currentDistance < 0) {
      return contextInstance.state.scale;
    }
    var touchProportion = currentDistance / pinchStartDistance;
    var rawScale = touchProportion * pinchStartScale;
    var scaleDelta = (rawScale - pinchStartScale) * (step / DEFAULT_PINCH_STEP);
    var computed = pinchStartScale + scaleDelta;
    var scale = computed === Infinity ? 0 : roundNumber(computed, 10);
    return checkZoomBounds(scale, minScale, maxScale, size, !disabled && !disablePadding);
  };
  var wheelStopEventTime = 160;
  var wheelAnimationTime = 100;
  var handleWheelStart = function(contextInstance, event) {
    var _a2 = contextInstance.props, onWheelStart = _a2.onWheelStart, onZoomStart = _a2.onZoomStart;
    if (!contextInstance.wheelStopEventTimer) {
      handleCancelAnimation(contextInstance);
      handleCallback(getContext(contextInstance), event, onWheelStart);
      handleCallback(getContext(contextInstance), event, onZoomStart);
    }
  };
  var handleWheelZoom = function(contextInstance, event) {
    var _a2 = contextInstance.props, onWheel = _a2.onWheel, onZoom = _a2.onZoom;
    var contentComponent = contextInstance.contentComponent, setup = contextInstance.setup, state = contextInstance.state;
    var scale = state.scale;
    var limitToBounds = setup.limitToBounds, centerZoomedOut = setup.centerZoomedOut, zoomAnimation = setup.zoomAnimation, wheel = setup.wheel, disablePadding = setup.disablePadding, smooth = setup.smooth;
    var size = zoomAnimation.size, disabled = zoomAnimation.disabled;
    var step = wheel.step;
    if (!contentComponent) {
      throw new Error("Component not mounted");
    }
    event.preventDefault();
    event.stopPropagation();
    var delta = getDelta(event, null);
    var zoomStep = smooth ? step * Math.abs(event.deltaY) : step;
    var newScale = handleCalculateWheelZoom(contextInstance, delta, zoomStep, !event.ctrlKey);
    if (scale === newScale)
      return;
    var bounds = handleCalculateBounds(contextInstance, newScale);
    var mousePosition = getMousePosition(event, contentComponent, scale);
    var isPaddingDisabled = disabled || size === 0 || centerZoomedOut || disablePadding;
    var isLimitedToBounds = limitToBounds && isPaddingDisabled;
    var _b2 = handleCalculateZoomPositions(contextInstance, mousePosition.x, mousePosition.y, newScale, bounds, isLimitedToBounds), x3 = _b2.x, y = _b2.y;
    contextInstance.previousWheelEvent = event;
    contextInstance.setState(newScale, x3, y);
    handleCallback(getContext(contextInstance), event, onWheel);
    handleCallback(getContext(contextInstance), event, onZoom);
  };
  var handleWheelStop = function(contextInstance, event) {
    var _a2 = contextInstance.props, onWheelStop = _a2.onWheelStop, onZoomStop = _a2.onZoomStop;
    cancelTimeout(contextInstance.wheelAnimationTimer);
    contextInstance.wheelAnimationTimer = setTimeout(function() {
      if (!contextInstance.mounted)
        return;
      handleAlignToScaleBounds(contextInstance, event.x, event.y);
      contextInstance.wheelAnimationTimer = null;
    }, wheelAnimationTime);
    var hasStoppedZooming = handleWheelZoomStop(contextInstance, event);
    if (hasStoppedZooming) {
      cancelTimeout(contextInstance.wheelStopEventTimer);
      contextInstance.wheelStopEventTimer = setTimeout(function() {
        if (!contextInstance.mounted)
          return;
        contextInstance.wheelStopEventTimer = null;
        handleCallback(getContext(contextInstance), event, onWheelStop);
        handleCallback(getContext(contextInstance), event, onZoomStop);
      }, wheelStopEventTime);
    }
  };
  var handleWheelPanningStart = function(contextInstance, event) {
    var _a2 = contextInstance.props, onWheelStart = _a2.onWheelStart, onPanningStart = _a2.onPanningStart;
    if (!contextInstance.wheelStopEventTimer) {
      handleCancelAnimation(contextInstance);
      handleCallback(getContext(contextInstance), event, onWheelStart);
      handleCallback(getContext(contextInstance), event, onPanningStart);
    }
  };
  var handleWheelPanningStop = function(contextInstance, event) {
    var _a2 = contextInstance.props, onWheelStop = _a2.onWheelStop, onPanningStop = _a2.onPanningStop;
    cancelTimeout(contextInstance.wheelAnimationTimer);
    contextInstance.wheelAnimationTimer = setTimeout(function() {
      if (!contextInstance.mounted)
        return;
      handleAlignToScaleBounds(contextInstance, event.x, event.y);
      contextInstance.wheelAnimationTimer = null;
    }, wheelAnimationTime);
    var hasStoppedZooming = handleWheelZoomStop(contextInstance, event);
    if (hasStoppedZooming) {
      cancelTimeout(contextInstance.wheelStopEventTimer);
      contextInstance.wheelStopEventTimer = setTimeout(function() {
        if (!contextInstance.mounted)
          return;
        contextInstance.wheelStopEventTimer = null;
        handleCallback(getContext(contextInstance), event, onWheelStop);
        handleCallback(getContext(contextInstance), event, onPanningStop);
      }, wheelStopEventTime);
    }
  };
  var getTouchCenter = function(event) {
    var totalX = 0;
    var totalY = 0;
    for (var i = 0; i < 2; i += 1) {
      totalX += event.touches[i].clientX;
      totalY += event.touches[i].clientY;
    }
    var x3 = totalX / 2;
    var y = totalY / 2;
    return { x: x3, y };
  };
  var handlePinchStart = function(contextInstance, event) {
    var distance = getTouchDistance(event);
    contextInstance.pinchStartDistance = distance;
    contextInstance.lastDistance = distance;
    contextInstance.pinchStartScale = contextInstance.state.scale;
    contextInstance.isPanning = false;
    contextInstance.isPinching = true;
    contextInstance.pinchPreviousCenter = getTouchCenter(event);
    handleCancelAnimation(contextInstance);
  };
  var handlePinchZoom = function(contextInstance, event) {
    var contentComponent = contextInstance.contentComponent, pinchStartDistance = contextInstance.pinchStartDistance, wrapperComponent = contextInstance.wrapperComponent, pinchPreviousCenter = contextInstance.pinchPreviousCenter;
    var scale = contextInstance.state.scale;
    var _a2 = contextInstance.setup, limitToBounds = _a2.limitToBounds, centerZoomedOut = _a2.centerZoomedOut, zoomAnimation = _a2.zoomAnimation, autoAlignment = _a2.autoAlignment, pinch = _a2.pinch, panning = _a2.panning;
    var disabled = zoomAnimation.disabled, size = zoomAnimation.size;
    var allowPanning = pinch.allowPanning;
    if (pinchStartDistance === null || !contentComponent)
      return;
    var midPoint = calculateTouchMidPoint(event, scale, contentComponent);
    if (!Number.isFinite(midPoint.x) || !Number.isFinite(midPoint.y))
      return;
    var currentDistance = getTouchDistance(event);
    var newScale = calculatePinchZoom(contextInstance, currentDistance);
    var center = getTouchCenter(event);
    var scaleDiff = scale / newScale;
    var panX = (center.x - ((pinchPreviousCenter === null || pinchPreviousCenter === void 0 ? void 0 : pinchPreviousCenter.x) || 0)) * scaleDiff;
    var panY = (center.y - ((pinchPreviousCenter === null || pinchPreviousCenter === void 0 ? void 0 : pinchPreviousCenter.y) || 0)) * scaleDiff;
    if (newScale === scale && panX === 0 && panY === 0)
      return;
    contextInstance.pinchPreviousCenter = center;
    var bounds = handleCalculateBounds(contextInstance, newScale);
    var isPaddingDisabled = disabled || size === 0 || centerZoomedOut;
    var isLimitedToBounds = limitToBounds && isPaddingDisabled;
    var _b2 = handleCalculateZoomPositions(contextInstance, midPoint.x, midPoint.y, newScale, bounds, isLimitedToBounds), x3 = _b2.x, y = _b2.y;
    contextInstance.pinchMidpoint = midPoint;
    contextInstance.lastDistance = currentDistance;
    if (panning.disabled || !allowPanning) {
      contextInstance.setState(newScale, x3, y);
    } else {
      var sizeX = autoAlignment.sizeX, sizeY = autoAlignment.sizeY;
      var paddingValueX = getPaddingValue(contextInstance, sizeX, newScale);
      var paddingValueY = getPaddingValue(contextInstance, sizeY, newScale);
      var newPositionX = x3 + panX;
      var newPositionY = y + panY;
      var _c = getMouseBoundedPosition(newPositionX, newPositionY, bounds, limitToBounds, paddingValueX, paddingValueY, wrapperComponent), finalX = _c.x, finalY = _c.y;
      contextInstance.setState(newScale, finalX, finalY);
    }
  };
  var handlePinchStop = function(contextInstance) {
    var pinchMidpoint = contextInstance.pinchMidpoint;
    contextInstance.velocity = null;
    contextInstance.lastDistance = null;
    contextInstance.pinchMidpoint = null;
    contextInstance.pinchStartScale = null;
    contextInstance.pinchStartDistance = null;
    contextInstance.isPinching = false;
    handleAlignToScaleBounds(contextInstance, pinchMidpoint === null || pinchMidpoint === void 0 ? void 0 : pinchMidpoint.x, pinchMidpoint === null || pinchMidpoint === void 0 ? void 0 : pinchMidpoint.y);
  };
  var handleDoubleClickStop = function(contextInstance, event) {
    var onZoomStop = contextInstance.props.onZoomStop;
    var animationTime = contextInstance.setup.doubleClick.animationTime;
    cancelTimeout(contextInstance.doubleClickStopEventTimer);
    contextInstance.doubleClickStopEventTimer = setTimeout(function() {
      contextInstance.doubleClickStopEventTimer = null;
      handleCallback(getContext(contextInstance), event, onZoomStop);
    }, animationTime);
  };
  var handleDoubleClickResetMode = function(contextInstance, event) {
    var _a2 = contextInstance.props, onZoomStart = _a2.onZoomStart, onZoom = _a2.onZoom;
    var _b2 = contextInstance.setup.doubleClick, animationTime = _b2.animationTime, animationType = _b2.animationType;
    handleCallback(getContext(contextInstance), event, onZoomStart);
    resetTransformations(contextInstance, animationTime, animationType, function() {
      return handleCallback(getContext(contextInstance), event, onZoom);
    });
    handleDoubleClickStop(contextInstance, event);
  };
  function getDoubleClickScale(mode, scale) {
    if (mode === "toggle") {
      return scale === 1 ? 1 : -1;
    }
    return mode === "zoomOut" ? -1 : 1;
  }
  function handleDoubleClick(contextInstance, event) {
    var setup = contextInstance.setup, doubleClickStopEventTimer = contextInstance.doubleClickStopEventTimer, state = contextInstance.state, contentComponent = contextInstance.contentComponent;
    var scale = state.scale;
    var _a2 = contextInstance.props, onZoomStart = _a2.onZoomStart, onZoom = _a2.onZoom;
    var _b2 = setup.doubleClick, disabled = _b2.disabled, mode = _b2.mode, step = _b2.step, animationTime = _b2.animationTime, animationType = _b2.animationType;
    if (disabled)
      return;
    if (doubleClickStopEventTimer)
      return;
    if (mode === "reset") {
      return handleDoubleClickResetMode(contextInstance, event);
    }
    if (!contentComponent)
      return console.error("No ContentComponent found");
    var delta = getDoubleClickScale(mode, contextInstance.state.scale);
    var newScale = handleCalculateButtonZoom(contextInstance, delta, step);
    if (scale === newScale)
      return;
    handleCallback(getContext(contextInstance), event, onZoomStart);
    var mousePosition = getMousePosition(event, contentComponent, scale);
    var targetState = handleZoomToPoint(contextInstance, newScale, mousePosition.x, mousePosition.y);
    if (!targetState) {
      return console.error("Error during zoom event. New transformation state was not calculated.");
    }
    handleCallback(getContext(contextInstance), event, onZoom);
    animate(contextInstance, targetState, animationTime, animationType);
    handleDoubleClickStop(contextInstance, event);
  }
  var isDoubleClickAllowed = function(contextInstance, event) {
    var isInitialized = contextInstance.isInitialized, setup = contextInstance.setup, wrapperComponent = contextInstance.wrapperComponent;
    var _a2 = setup.doubleClick, disabled = _a2.disabled, excluded = _a2.excluded;
    var target = event.target;
    var isWrapperChild = wrapperComponent === null || wrapperComponent === void 0 ? void 0 : wrapperComponent.contains(target);
    var isAllowed = isInitialized && target && isWrapperChild && !disabled;
    if (!isAllowed)
      return false;
    var isExcluded = isExcludedNode(target, excluded);
    if (isExcluded)
      return false;
    return true;
  };
  var ZoomPanPinch = (
    /** @class */
    /* @__PURE__ */ (function() {
      function ZoomPanPinch2(props) {
        var _this = this;
        this.mounted = true;
        this.onChangeCallbacks = /* @__PURE__ */ new Set();
        this.onInitCallbacks = /* @__PURE__ */ new Set();
        this.onTransformCallbacks = /* @__PURE__ */ new Set();
        this.wrapperComponent = null;
        this.contentComponent = null;
        this.isInitialized = false;
        this.bounds = null;
        this.previousWheelEvent = null;
        this.wheelStopEventTimer = null;
        this.wheelAnimationTimer = null;
        this.isPanning = false;
        this.isWheelPanning = false;
        this.startCoords = null;
        this.panStartPosition = null;
        this.lastTouch = null;
        this.isPinching = false;
        this.distance = null;
        this.lastDistance = null;
        this.pinchStartDistance = null;
        this.pinchStartScale = null;
        this.pinchMidpoint = null;
        this.pinchPreviousCenter = null;
        this.doubleClickStopEventTimer = null;
        this.velocity = null;
        this.velocityTime = null;
        this.lastMousePosition = null;
        this.isAnimating = false;
        this.animation = null;
        this.pressedKeys = {};
        this.mount = function() {
          _this.initializeWindowEvents();
        };
        this.unmount = function() {
          _this.cleanupWindowEvents();
        };
        this.update = function(newProps) {
          _this.props = newProps;
          if (_this.wrapperComponent && _this.contentComponent) {
            handleCalculateBounds(_this, _this.state.scale);
          }
          _this.setup = createSetup(newProps);
        };
        this.initializeWindowEvents = function() {
          var _a2, _b2, _c, _d;
          var passive = makePassiveEventOption();
          var currentDocument = (_a2 = _this.wrapperComponent) === null || _a2 === void 0 ? void 0 : _a2.ownerDocument;
          var currentWindow = currentDocument === null || currentDocument === void 0 ? void 0 : currentDocument.defaultView;
          (_b2 = _this.wrapperComponent) === null || _b2 === void 0 ? void 0 : _b2.addEventListener("wheel", _this.onWheelPanning, passive);
          (_c = _this.wrapperComponent) === null || _c === void 0 ? void 0 : _c.addEventListener("keyup", _this.setKeyUnPressed, passive);
          (_d = _this.wrapperComponent) === null || _d === void 0 ? void 0 : _d.addEventListener("keydown", _this.setKeyPressed, passive);
          currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.addEventListener("mousedown", _this.onPanningStart, passive);
          currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.addEventListener("mousemove", _this.onPanning, passive);
          currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.addEventListener("mouseup", _this.onPanningStop, passive);
          currentDocument === null || currentDocument === void 0 ? void 0 : currentDocument.addEventListener("mouseleave", _this.clearPanning, passive);
          currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.addEventListener("keyup", _this.setKeyUnPressed, passive);
          currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.addEventListener("keydown", _this.setKeyPressed, passive);
          currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.addEventListener("blur", _this.handleWindowBlur);
        };
        this.cleanupWindowEvents = function() {
          var _a2, _b2, _c, _d, _e;
          var passive = makePassiveEventOption();
          var currentDocument = (_a2 = _this.wrapperComponent) === null || _a2 === void 0 ? void 0 : _a2.ownerDocument;
          var currentWindow = currentDocument === null || currentDocument === void 0 ? void 0 : currentDocument.defaultView;
          currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.removeEventListener("mousedown", _this.onPanningStart, passive);
          currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.removeEventListener("mousemove", _this.onPanning, passive);
          currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.removeEventListener("mouseup", _this.onPanningStop, passive);
          currentDocument === null || currentDocument === void 0 ? void 0 : currentDocument.removeEventListener("mouseleave", _this.clearPanning, passive);
          currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.removeEventListener("keyup", _this.setKeyUnPressed, passive);
          currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.removeEventListener("keydown", _this.setKeyPressed, passive);
          currentWindow === null || currentWindow === void 0 ? void 0 : currentWindow.removeEventListener("blur", _this.handleWindowBlur);
          document.removeEventListener("mouseleave", _this.clearPanning, passive);
          (_b2 = _this.wrapperComponent) === null || _b2 === void 0 ? void 0 : _b2.removeEventListener("wheel", _this.onWheelPanning, passive);
          (_c = _this.wrapperComponent) === null || _c === void 0 ? void 0 : _c.removeEventListener("keyup", _this.setKeyUnPressed, passive);
          (_d = _this.wrapperComponent) === null || _d === void 0 ? void 0 : _d.removeEventListener("keydown", _this.setKeyPressed, passive);
          handleCancelAnimation(_this);
          (_e = _this.observer) === null || _e === void 0 ? void 0 : _e.disconnect();
        };
        this.handleInitializeWrapperEvents = function(wrapper) {
          var passive = makePassiveEventOption();
          wrapper.addEventListener("wheel", _this.onWheelZoom, passive);
          wrapper.addEventListener("dblclick", _this.onDoubleClick, passive);
          wrapper.addEventListener("touchstart", _this.onTouchPanningStart, passive);
          wrapper.addEventListener("touchmove", _this.onTouchPanning, passive);
          wrapper.addEventListener("touchend", _this.onTouchPanningStop, passive);
        };
        this.handleInitialize = function(contentComponent) {
          var centerOnInit = _this.setup.centerOnInit;
          _this.applyTransformation();
          _this.onInitCallbacks.forEach(function(callback) {
            return callback(getContext(_this));
          });
          if (centerOnInit) {
            _this.setCenter();
            _this.observer = new ResizeObserver(function() {
              var _a2;
              var currentWidth = contentComponent.offsetWidth;
              var currentHeight = contentComponent.offsetHeight;
              if (currentWidth > 0 || currentHeight > 0) {
                _this.onInitCallbacks.forEach(function(callback) {
                  return callback(getContext(_this));
                });
                _this.setCenter();
                (_a2 = _this.observer) === null || _a2 === void 0 ? void 0 : _a2.disconnect();
              }
            });
            setTimeout(function() {
              var _a2;
              (_a2 = _this.observer) === null || _a2 === void 0 ? void 0 : _a2.disconnect();
            }, 5e3);
            _this.observer.observe(contentComponent);
          }
        };
        this.onWheelZoom = function(event) {
          var disabled = _this.setup.disabled;
          if (disabled)
            return;
          _this.syncModifierKeys(event);
          var isAllowed = isWheelAllowed(_this, event);
          if (!isAllowed)
            return;
          handleWheelStart(_this, event);
          handleWheelZoom(_this, event);
          handleWheelStop(_this, event);
        };
        this.onWheelPanning = function(event) {
          var onPanning = _this.props.onPanning;
          var trackPadPanning = _this.setup.trackPadPanning;
          var lockAxisX = trackPadPanning.lockAxisX, lockAxisY = trackPadPanning.lockAxisY;
          _this.syncModifierKeys(event);
          var isAllowed = isWheelPanningAllowed(_this, event);
          if (!isAllowed)
            return;
          event.preventDefault();
          event.stopPropagation();
          var _a2 = _this.state, positionX = _a2.positionX, positionY = _a2.positionY;
          var mouseX = positionX - event.deltaX;
          var mouseY = positionY - event.deltaY;
          var newPositionX = lockAxisX ? positionX : mouseX;
          var newPositionY = lockAxisY ? positionY : mouseY;
          var _b2 = _this.setup.autoAlignment, sizeX = _b2.sizeX, sizeY = _b2.sizeY;
          var paddingValueX = getPaddingValue(_this, sizeX);
          var paddingValueY = getPaddingValue(_this, sizeY);
          if (newPositionX === positionX && newPositionY === positionY)
            return;
          handleWheelPanningStart(_this, event);
          handleNewPosition(_this, newPositionX, newPositionY, paddingValueX, paddingValueY);
          handleCallback(getContext(_this), event, onPanning);
          handleWheelPanningStop(_this, event);
        };
        this.onPanningStart = function(event) {
          var disabled = _this.setup.disabled;
          var onPanningStart = _this.props.onPanningStart;
          if (disabled)
            return;
          _this.syncModifierKeys(event);
          var isAllowed = isPanningStartAllowed(_this, event);
          if (!isAllowed)
            return;
          var keysPressed = _this.isPressingKeys(_this.setup.panning.activationKeys);
          if (!keysPressed)
            return;
          if (event.button === 0 && !_this.setup.panning.allowLeftClickPan)
            return;
          if (event.button === 1 && !_this.setup.panning.allowMiddleClickPan)
            return;
          if (event.button === 2 && !_this.setup.panning.allowRightClickPan)
            return;
          event.preventDefault();
          event.stopPropagation();
          handleCancelAnimation(_this);
          handlePanningStart(_this, event);
          handleCallback(getContext(_this), event, onPanningStart);
        };
        this.onPanning = function(event) {
          var disabled = _this.setup.disabled;
          var onPanning = _this.props.onPanning;
          if (disabled)
            return;
          _this.syncModifierKeys(event);
          if (_this.isPanning && event.buttons === 0) {
            _this.clearPanning(event);
            return;
          }
          var isAllowed = isPanningAllowed(_this);
          if (!isAllowed)
            return;
          var keysPressed = _this.isPressingKeys(_this.setup.panning.activationKeys);
          if (!keysPressed)
            return;
          event.preventDefault();
          event.stopPropagation();
          handlePanning(_this, event.clientX, event.clientY, DeviceType.MOUSE);
          handleCallback(getContext(_this), event, onPanning);
        };
        this.onPanningStop = function(event) {
          var velocityDisabled = _this.setup.panning.velocityDisabled;
          var onPanningStop = _this.props.onPanningStop;
          if (_this.isPanning) {
            handlePanningEnd(_this, velocityDisabled);
            handleCallback(getContext(_this), event, onPanningStop);
          }
        };
        this.onPinchStart = function(event) {
          var disabled = _this.setup.disabled;
          var onPinchStart = _this.props.onPinchStart;
          if (disabled)
            return;
          var isAllowed = isPinchStartAllowed(_this, event);
          if (!isAllowed)
            return;
          handlePinchStart(_this, event);
          handleCancelAnimation(_this);
          handleCallback(getContext(_this), event, onPinchStart);
        };
        this.onPinch = function(event) {
          var disabled = _this.setup.disabled;
          var onPinch = _this.props.onPinch;
          if (disabled)
            return;
          var isAllowed = isPinchAllowed(_this);
          if (!isAllowed)
            return;
          event.preventDefault();
          event.stopPropagation();
          handlePinchZoom(_this, event);
          handleCallback(getContext(_this), event, onPinch);
        };
        this.onPinchStop = function(event) {
          var onPinchStop = _this.props.onPinchStop;
          if (_this.pinchStartScale) {
            handlePinchStop(_this);
            handleCallback(getContext(_this), event, onPinchStop);
          }
        };
        this.onTouchPanningStart = function(event) {
          var _a2 = _this.setup, disabled = _a2.disabled, doubleClick = _a2.doubleClick;
          var onPanningStart = _this.props.onPanningStart;
          if (disabled)
            return;
          var isDoubleTapAllowed = !(doubleClick === null || doubleClick === void 0 ? void 0 : doubleClick.disabled);
          var isDoubleTap = _this.lastTouch && +/* @__PURE__ */ new Date() - _this.lastTouch < 200;
          if (isDoubleTapAllowed && isDoubleTap && event.touches.length === 1) {
            _this.onDoubleClick(event);
          } else {
            _this.lastTouch = +/* @__PURE__ */ new Date();
            handleCancelAnimation(_this);
            var touches = event.touches;
            var isPanningAction = touches.length === 1;
            var isPinchAction = touches.length === 2;
            var isAllowed = isPanningStartAllowed(_this, event);
            if (isPanningAction) {
              if (!isAllowed)
                return;
              handleCancelAnimation(_this);
              handlePanningStart(_this, event);
              handleCallback(getContext(_this), event, onPanningStart);
            }
            if (isPinchAction) {
              _this.onPinchStart(event);
            }
          }
        };
        this.onTouchPanning = function(event) {
          var disabled = _this.setup.disabled;
          var onPanning = _this.props.onPanning;
          if (_this.isPanning && event.touches.length === 1) {
            if (disabled)
              return;
            var isAllowed = isPanningAllowed(_this);
            if (!isAllowed)
              return;
            if (event.cancelable) {
              event.preventDefault();
            }
            event.stopPropagation();
            var touch = event.touches[0];
            handlePanning(_this, touch.clientX, touch.clientY, DeviceType.TOUCH);
            handleCallback(getContext(_this), event, onPanning);
          } else if (event.touches.length > 1) {
            _this.onPinch(event);
          }
        };
        this.onTouchPanningStop = function(event) {
          _this.onPanningStop(event);
          _this.onPinchStop(event);
        };
        this.onDoubleClick = function(event) {
          var disabled = _this.setup.disabled;
          if (disabled)
            return;
          var isAllowed = isDoubleClickAllowed(_this, event);
          if (!isAllowed)
            return;
          handleDoubleClick(_this, event);
        };
        this.clearPanning = function(event) {
          if (_this.isPanning) {
            _this.onPanningStop(event);
          }
        };
        this.handleWindowBlur = function() {
          _this.pressedKeys = {};
          if (_this.isPanning) {
            _this.isPanning = false;
            _this.startCoords = null;
          }
        };
        this.syncModifierKeys = function(event) {
          var ctrlKey = event.ctrlKey, metaKey = event.metaKey, shiftKey = event.shiftKey, altKey = event.altKey;
          if (typeof ctrlKey === "boolean")
            _this.pressedKeys.Control = ctrlKey;
          if (typeof metaKey === "boolean")
            _this.pressedKeys.Meta = metaKey;
          if (typeof shiftKey === "boolean")
            _this.pressedKeys.Shift = shiftKey;
          if (typeof altKey === "boolean")
            _this.pressedKeys.Alt = altKey;
        };
        this.setKeyPressed = function(e) {
          _this.pressedKeys[e.key] = true;
        };
        this.setKeyUnPressed = function(e) {
          _this.pressedKeys[e.key] = false;
        };
        this.isPressingKeys = function(keys) {
          if (typeof keys === "function") {
            return keys(Object.entries(_this.pressedKeys).filter(function(_a2) {
              var pressed = _a2[1];
              return pressed;
            }).map(function(_a2) {
              var key = _a2[0];
              return key;
            }));
          }
          if (!keys.length) {
            return true;
          }
          return Boolean(keys.every(function(key) {
            return _this.pressedKeys[key];
          }));
        };
        this.setCenter = function() {
          if (_this.wrapperComponent && _this.contentComponent) {
            var targetState = getCenterPosition(_this.state.scale, _this.wrapperComponent, _this.contentComponent);
            _this.setState(targetState.scale, targetState.positionX, targetState.positionY);
          }
        };
        this.handleTransformStyles = function(x3, y, scale) {
          if (_this.props.customTransform) {
            return _this.props.customTransform(x3, y, scale);
          }
          return getTransformStyles(x3, y, scale);
        };
        this.getContext = function() {
          return getContext(_this);
        };
        this.applyTransformation = function() {
          if (!_this.mounted || !_this.contentComponent)
            return;
          var _a2 = _this.state, scale = _a2.scale, positionX = _a2.positionX, positionY = _a2.positionY;
          var transform = _this.handleTransformStyles(positionX, positionY, scale);
          if (!_this.props.detached) {
            _this.contentComponent.style.transform = transform;
          }
          _this.onTransformCallbacks.forEach(function(callback) {
            return callback({
              scale,
              positionX,
              positionY,
              previousScale: _this.state.previousScale,
              ref: getContext(_this)
            });
          });
        };
        this.setState = function(scale, positionX, positionY) {
          var onTransform = _this.props.onTransform;
          if (!Number.isNaN(scale) && !Number.isNaN(positionX) && !Number.isNaN(positionY)) {
            var safeScale = Math.max(scale, 1e-7);
            if (safeScale !== _this.state.scale) {
              _this.state.previousScale = _this.state.scale;
              _this.state.scale = safeScale;
            }
            _this.state.positionX = positionX;
            _this.state.positionY = positionY;
            _this.applyTransformation();
            var ctx_1 = getContext(_this);
            _this.onChangeCallbacks.forEach(function(callback) {
              return callback(ctx_1);
            });
            handleCallback(ctx_1, { scale: _this.state.scale, positionX, positionY }, onTransform);
          } else {
            console.error("Detected NaN set state values");
          }
        };
        this.onTransform = function(callback) {
          if (!_this.onTransformCallbacks.has(callback)) {
            _this.onTransformCallbacks.add(callback);
          }
          return function() {
            _this.onTransformCallbacks.delete(callback);
          };
        };
        this.onChange = function(callback) {
          if (!_this.onChangeCallbacks.has(callback)) {
            _this.onChangeCallbacks.add(callback);
          }
          return function() {
            _this.onChangeCallbacks.delete(callback);
          };
        };
        this.onInit = function(callback) {
          if (!_this.onInitCallbacks.has(callback)) {
            _this.onInitCallbacks.add(callback);
          }
          return function() {
            _this.onInitCallbacks.delete(callback);
          };
        };
        this.init = function(wrapperComponent, contentComponent) {
          _this.cleanupWindowEvents();
          _this.wrapperComponent = wrapperComponent;
          _this.contentComponent = contentComponent;
          handleCalculateBounds(_this, _this.state.scale);
          _this.handleInitializeWrapperEvents(wrapperComponent);
          _this.handleInitialize(contentComponent);
          _this.initializeWindowEvents();
          _this.isInitialized = true;
          var ctx = getContext(_this);
          handleCallback(ctx, void 0, _this.props.onInit);
          assignRef(_this.props.ref, ctx);
        };
        this.props = props;
        this.setup = createSetup(this.props);
        this.state = createState(this.props);
      }
      return ZoomPanPinch2;
    })()
  );
  var Context = import_react21.default.createContext(null);
  var getContent = function(children, ctx) {
    if (typeof children === "function") {
      return children(ctx);
    }
    return children;
  };
  var TransformWrapper = import_react21.default.forwardRef(function(props, ref) {
    var instance = (0, import_react21.useRef)(new ZoomPanPinch(props)).current;
    var content = getContent(props.children, getControls(instance));
    (0, import_react21.useImperativeHandle)(ref, function() {
      return getControls(instance);
    }, [instance]);
    (0, import_react21.useEffect)(function() {
      instance.update(props);
    }, [instance, props]);
    return (0, import_jsx_runtime13.jsx)(Context.Provider, __assign({ value: instance }, { children: content }));
  });
  var KeepScale = import_react21.default.forwardRef(function(props, ref) {
    var localRef = (0, import_react21.useRef)(null);
    var instance = (0, import_react21.useContext)(Context);
    (0, import_react21.useEffect)(function() {
      return instance.onChange(function(ctx) {
        if (localRef.current) {
          var positionX = 0;
          var positionY = 0;
          localRef.current.style.transform = instance.handleTransformStyles(positionX, positionY, 1 / ctx.instance.state.scale);
        }
      });
    }, [instance]);
    return (0, import_jsx_runtime13.jsx)("div", __assign({}, props, { ref: mergeRefs([localRef, ref]) }));
  });
  function styleInject(css, ref) {
    if (ref === void 0) ref = {};
    var insertAt = ref.insertAt;
    if (!css || typeof document === "undefined") {
      return;
    }
    var head = document.head || document.getElementsByTagName("head")[0];
    var style = document.createElement("style");
    style.type = "text/css";
    if (insertAt === "top") {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }
  var css_248z = ".transform-component-module_wrapper__SPB86 {\n  position: relative;\n  width: -moz-fit-content;\n  width: fit-content;\n  height: -moz-fit-content;\n  height: fit-content;\n  overflow: hidden;\n  -webkit-touch-callout: none; /* iOS Safari */\n  -webkit-user-select: none; /* Safari */\n  -khtml-user-select: none; /* Konqueror HTML */\n  -moz-user-select: none; /* Firefox */\n  -ms-user-select: none; /* Internet Explorer/Edge */\n  user-select: none;\n  margin: 0;\n  padding: 0;\n  transform: translate3d(0, 0, 0);\n}\n.transform-component-module_content__FBWxo {\n  display: flex;\n  flex-wrap: wrap;\n  width: -moz-fit-content;\n  width: fit-content;\n  height: -moz-fit-content;\n  height: fit-content;\n  margin: 0;\n  padding: 0;\n  transform-origin: 0% 0%;\n}\n.transform-component-module_content__FBWxo img {\n  pointer-events: none;\n}\n.transform-component-module_infiniteGrid__Z-aP3 {\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  background-image: radial-gradient(\n    circle,\n    rgba(0, 0, 0, 0.12) 1px,\n    transparent 1px\n  );\n  background-size: 20px 20px;\n  background-position: 0 0;\n}\n";
  var styles = { "wrapper": "transform-component-module_wrapper__SPB86", "content": "transform-component-module_content__FBWxo", "infiniteGrid": "transform-component-module_infiniteGrid__Z-aP3" };
  styleInject(css_248z);
  var TransformComponent = function(_a2) {
    var children = _a2.children, _b2 = _a2.wrapperClass, wrapperClass = _b2 === void 0 ? "" : _b2, _c = _a2.contentClass, contentClass = _c === void 0 ? "" : _c, wrapperStyle = _a2.wrapperStyle, contentStyle = _a2.contentStyle, _d = _a2.wrapperProps, wrapperProps = _d === void 0 ? {} : _d, _e = _a2.contentProps, contentProps = _e === void 0 ? {} : _e, _f = _a2.infinite, infinite = _f === void 0 ? false : _f;
    var instance = (0, import_react21.useContext)(Context);
    var init = instance.init, cleanupWindowEvents = instance.cleanupWindowEvents;
    var wrapperRef = (0, import_react21.useRef)(null);
    var contentRef = (0, import_react21.useRef)(null);
    var gridRef = (0, import_react21.useRef)(null);
    (0, import_react21.useEffect)(function() {
      var wrapper = wrapperRef.current;
      var content = contentRef.current;
      if (wrapper !== null && content !== null && init) {
        init === null || init === void 0 ? void 0 : init(wrapper, content);
      }
      return function() {
        cleanupWindowEvents === null || cleanupWindowEvents === void 0 ? void 0 : cleanupWindowEvents();
      };
    }, []);
    (0, import_react21.useEffect)(function() {
      if (!infinite)
        return;
      var grid = gridRef.current;
      if (!grid)
        return;
      var sync = function() {
        var _a3 = instance.state, positionX = _a3.positionX, positionY = _a3.positionY;
        grid.style.backgroundPosition = "".concat(positionX, "px ").concat(positionY, "px");
      };
      sync();
      return instance.onChange(sync);
    }, [infinite, instance]);
    return (0, import_jsx_runtime13.jsxs)("div", __assign({}, wrapperProps, { ref: wrapperRef, className: "".concat(baseClasses.wrapperClass, " ").concat(styles.wrapper, " ").concat(wrapperClass), style: wrapperStyle }, { children: [infinite && (0, import_jsx_runtime13.jsx)("div", { ref: gridRef, className: styles.infiniteGrid, "aria-hidden": true }), (0, import_jsx_runtime13.jsx)("div", __assign({}, contentProps, { ref: contentRef, className: "".concat(baseClasses.contentClass, " ").concat(styles.content, " ").concat(contentClass), style: __assign(__assign({}, contentStyle), { transform: getTransformStyles(instance.state.positionX, instance.state.positionY, instance.state.scale) }) }, { children }))] }));
  };
  function getOverlapArea(a, b2) {
    var overlapX = Math.max(0, Math.min(a.x + a.width, b2.x + b2.width) - Math.max(a.x, b2.x));
    var overlapY = Math.max(0, Math.min(a.y + a.height, b2.y + b2.height) - Math.max(a.y, b2.y));
    return overlapX * overlapY;
  }
  function isElementVisible(opts) {
    var elementX = opts.elementX, elementY = opts.elementY, elementWidth = opts.elementWidth, elementHeight = opts.elementHeight, scale = opts.scale, positionX = opts.positionX, positionY = opts.positionY, viewportWidth = opts.viewportWidth, viewportHeight = opts.viewportHeight, _a2 = opts.margin, margin = _a2 === void 0 ? 0 : _a2, _b2 = opts.threshold, threshold = _b2 === void 0 ? 0 : _b2;
    var viewport = {
      x: -margin,
      y: -margin,
      width: viewportWidth + 2 * margin,
      height: viewportHeight + 2 * margin
    };
    var element = {
      x: elementX * scale + positionX,
      y: elementY * scale + positionY,
      width: elementWidth * scale,
      height: elementHeight * scale
    };
    if (threshold <= 0) {
      var intersectsX = element.x < viewport.x + viewport.width && element.x + element.width > viewport.x;
      var intersectsY = element.y < viewport.y + viewport.height && element.y + element.height > viewport.y;
      return intersectsX && intersectsY;
    }
    var elementArea = element.width * element.height;
    if (elementArea <= 0)
      return false;
    var overlap = getOverlapArea(viewport, element);
    return overlap / elementArea >= threshold;
  }
  var Virtualize = import_react21.default.forwardRef(function(_a2, ref) {
    var x3 = _a2.x, y = _a2.y, width = _a2.width, height = _a2.height, _b2 = _a2.margin, margin = _b2 === void 0 ? 0 : _b2, _c = _a2.threshold, threshold = _c === void 0 ? 0 : _c, _d = _a2.placeholder, placeholder = _d === void 0 ? null : _d, onShow = _a2.onShow, onHide = _a2.onHide, children = _a2.children, className = _a2.className, style = _a2.style;
    var instance = (0, import_react21.useContext)(Context);
    var _e = (0, import_react21.useState)(false), visible = _e[0], setVisible = _e[1];
    var visibleRef = (0, import_react21.useRef)(false);
    var onShowRef = (0, import_react21.useRef)(onShow);
    var onHideRef = (0, import_react21.useRef)(onHide);
    onShowRef.current = onShow;
    onHideRef.current = onHide;
    (0, import_react21.useEffect)(function() {
      var check = function() {
        var _a3, _b3;
        var wrapper = instance.wrapperComponent;
        if (!wrapper)
          return;
        var nowVisible = isElementVisible({
          elementX: x3,
          elementY: y,
          elementWidth: width,
          elementHeight: height,
          scale: instance.state.scale,
          positionX: instance.state.positionX,
          positionY: instance.state.positionY,
          viewportWidth: wrapper.offsetWidth,
          viewportHeight: wrapper.offsetHeight,
          margin,
          threshold
        });
        if (nowVisible !== visibleRef.current) {
          visibleRef.current = nowVisible;
          setVisible(nowVisible);
          if (nowVisible) {
            (_a3 = onShowRef.current) === null || _a3 === void 0 ? void 0 : _a3.call(onShowRef);
          } else {
            (_b3 = onHideRef.current) === null || _b3 === void 0 ? void 0 : _b3.call(onHideRef);
          }
        }
      };
      check();
      var unsubChange = instance.onChange(check);
      var unsubInit;
      if (!instance.wrapperComponent) {
        unsubInit = instance.onInit(function() {
          return check();
        });
      }
      return function() {
        unsubChange();
        unsubInit === null || unsubInit === void 0 ? void 0 : unsubInit();
      };
    }, [instance, x3, y, width, height, margin, threshold]);
    if (!visible) {
      return placeholder ? (0, import_jsx_runtime13.jsx)(import_jsx_runtime13.Fragment, { children: placeholder }) : null;
    }
    return (0, import_jsx_runtime13.jsx)("div", __assign({ ref, className, style }, { children }));
  });

  // src/components/ImageViewer.tsx
  var import_lucide_react11 = __require("lucide-react");
  var import_jsx_runtime14 = __require("react/jsx-runtime");
  function ImageViewer({ src, alt, onClose }) {
    (0, import_react22.useEffect)(() => {
      const handleKeyDown = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "unset";
      };
    }, [onClose]);
    return /* @__PURE__ */ (0, import_jsx_runtime14.jsxs)("div", { className: "fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-200", children: [
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)("div", { className: "absolute top-0 right-0 p-4 z-10", children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
        "button",
        {
          onClick: onClose,
          className: "p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors backdrop-blur-sm",
          children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_lucide_react11.X, { className: "w-6 h-6" })
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
        "div",
        {
          className: "flex-1 w-full h-full flex items-center justify-center touch-none",
          onClick: (e) => {
            if (e.target === e.currentTarget) onClose();
          },
          children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
            TransformWrapper,
            {
              initialScale: 1,
              minScale: 1,
              maxScale: 4,
              centerOnInit: true,
              wheel: { step: 0.1 },
              doubleClick: { step: 1 },
              children: ({ zoomIn: zoomIn2, zoomOut: zoomOut2, resetTransform: resetTransform2 }) => /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(import_react22.default.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(TransformComponent, { wrapperClass: "!w-full !h-full", contentClass: "!w-full !h-full flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime14.jsx)(
                "img",
                {
                  src,
                  alt: alt || "Viewed image",
                  className: "max-w-full max-h-full object-contain",
                  onClick: (e) => e.stopPropagation()
                }
              ) }) })
            }
          )
        }
      )
    ] });
  }

  // src/components/engagement/ReactionsRow.tsx
  var import_react23 = __require("react");
  var import_react24 = __require("motion/react");
  var import_lucide_react12 = __require("lucide-react");
  var import_jsx_runtime15 = __require("react/jsx-runtime");
  var REACTIONS = ["\u2764\uFE0F", "\u{1F525}", "\u{1F602}", "\u{1F60D}", "\u{1F62E}", "\u{1F622}", "\u{1F44F}", "\u{1F44D}", "\u{1F44E}"];
  function ReactionsRow({ post }) {
    const { user } = useAuthStore();
    const [reactions, setReactions] = (0, import_react23.useState)([]);
    const [userReaction, setUserReaction] = (0, import_react23.useState)(null);
    const [showAnalytics, setShowAnalytics] = (0, import_react23.useState)(false);
    (0, import_react23.useEffect)(() => {
      fetchReactions();
    }, [post.id]);
    const fetchReactions = async () => {
      try {
        const { data, error } = await supabase.from("reactions").select("*").eq("post_id", post.id);
        if (error && !error.message.includes("find the table")) throw error;
        if (!error) {
          setReactions(data || []);
          if (user) {
            const ur = data?.find((r) => r.user_id === user.id);
            setUserReaction(ur ? ur.reaction_type : null);
          }
        }
      } catch (err) {
        console.error("Error fetching reactions", err);
      }
    };
    const handleReact = async (reaction) => {
      if (!user) return;
      try {
        if (userReaction === reaction) {
          setUserReaction(null);
          setReactions((prev) => prev.filter((r) => !(r.user_id === user.id && r.reaction_type === reaction)));
          const { error } = await supabase.from("reactions").delete().eq("post_id", post.id).eq("user_id", user.id).eq("reaction_type", reaction);
          if (error && error.message.includes("find the table")) {
            alert("Reactions feature requires database migration to be run.");
          }
        } else {
          setUserReaction(reaction);
          setReactions((prev) => {
            const filtered = prev.filter((r) => r.user_id !== user.id);
            return [...filtered, { user_id: user.id, reaction_type: reaction }];
          });
          await supabase.from("reactions").delete().eq("post_id", post.id).eq("user_id", user.id);
          const { error } = await supabase.from("reactions").insert({ post_id: post.id, user_id: user.id, reaction_type: reaction });
          if (error && error.message.includes("find the table")) {
            alert("Reactions feature requires database migration to be run.");
          }
        }
      } catch (err) {
        console.error("Reaction error", err);
      }
    };
    const reactionCounts = REACTIONS.reduce((acc, emoji) => {
      acc[emoji] = reactions.filter((r) => r.reaction_type === emoji).length;
      return acc;
    }, {});
    const activeReactions = REACTIONS.filter((r) => reactionCounts[r] > 0);
    return /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex flex-wrap gap-2 mt-3", children: [
      activeReactions.map((emoji) => /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
        "button",
        {
          onClick: () => handleReact(emoji),
          className: `flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold transition-all border
            ${userReaction === emoji ? "bg-purple-500/20 border-purple-500/50 text-purple-400" : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"}`,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { children: emoji }),
            /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { children: reactionCounts[emoji] })
          ]
        },
        emoji
      )),
      /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "relative group/reaction", children: [
        /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("button", { className: "flex items-center justify-center w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition-colors text-zinc-400 text-sm", children: "+" }),
        /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "absolute bottom-full left-0 mb-2 p-2 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl flex gap-1 opacity-0 group-hover/reaction:opacity-100 pointer-events-none group-hover/reaction:pointer-events-auto transition-opacity z-10 w-max", children: REACTIONS.map((emoji) => /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
          "button",
          {
            onClick: () => handleReact(emoji),
            className: "w-8 h-8 flex items-center justify-center hover:bg-zinc-800 rounded-full hover:scale-110 transition-all text-lg",
            children: emoji
          },
          emoji
        )) })
      ] }),
      user && post.user_id === user.id && reactions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("button", { onClick: () => setShowAnalytics(true), className: "ml-auto flex items-center text-xs text-zinc-500 font-medium cursor-pointer hover:text-white transition-colors", children: "View Analytics" }),
      /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(import_react24.AnimatePresence, { children: showAnalytics && /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
        /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
          import_react24.motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
            onClick: () => setShowAnalytics(false)
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)(
          import_react24.motion.div,
          {
            initial: { scale: 0.95, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            exit: { scale: 0.95, opacity: 0 },
            className: "relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[70vh]",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex items-center justify-between p-4 border-b border-zinc-800/50", children: [
                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("h2", { className: "text-white font-bold text-lg", children: "Reaction Analytics" }),
                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("button", { onClick: () => setShowAnalytics(false), className: "p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors", children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(import_lucide_react12.X, { className: "w-5 h-5" }) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "p-4 overflow-y-auto", children: [
                /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "flex flex-col gap-3", children: activeReactions.sort((a, b2) => reactionCounts[b2] - reactionCounts[a]).map((emoji) => /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex items-center justify-between p-3 bg-black/50 rounded-xl border border-zinc-800/50", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "flex items-center gap-3", children: [
                    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "text-2xl", children: emoji }),
                    /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("div", { className: "h-2 w-32 bg-zinc-800 rounded-full overflow-hidden", children: /* @__PURE__ */ (0, import_jsx_runtime15.jsx)(
                      "div",
                      {
                        className: "h-full bg-purple-500 rounded-full",
                        style: { width: `${reactionCounts[emoji] / reactions.length * 100}%` }
                      }
                    ) })
                  ] }),
                  /* @__PURE__ */ (0, import_jsx_runtime15.jsx)("span", { className: "text-white font-bold", children: reactionCounts[emoji] })
                ] }, emoji)) }),
                /* @__PURE__ */ (0, import_jsx_runtime15.jsxs)("div", { className: "mt-4 pt-4 border-t border-zinc-800/50 text-center text-xs text-zinc-500", children: [
                  "Total Reactions: ",
                  reactions.length
                ] })
              ] })
            ]
          }
        )
      ] }) })
    ] });
  }

  // src/components/engagement/SaveSheet.tsx
  var import_react25 = __require("react");
  var import_react26 = __require("motion/react");
  var import_lucide_react13 = __require("lucide-react");
  var import_jsx_runtime16 = __require("react/jsx-runtime");
  function SaveSheet({ post, onClose, isCurrentlySaved, onSaveToggle }) {
    const { user } = useAuthStore();
    const [collections, setCollections] = (0, import_react25.useState)([]);
    const [loading, setLoading] = (0, import_react25.useState)(true);
    const [creating, setCreating] = (0, import_react25.useState)(false);
    const [newCollectionName, setNewCollectionName] = (0, import_react25.useState)("");
    const defaultCategories = ["Favorites", "Watch Later", "Funny", "Travel", "Food", "Gaming"];
    (0, import_react25.useEffect)(() => {
      fetchCollections();
    }, []);
    const fetchCollections = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase.from("collections").select(`
          *,
          post_collections(post_id)
        `).eq("user_id", user.id).order("created_at", { ascending: false });
        if (error && !error.message.includes("find the table")) throw error;
        setCollections(data || []);
      } catch (err) {
        console.error("Error fetching collections", err);
      } finally {
        setLoading(false);
      }
    };
    const handleCreateCollection = async (name) => {
      if (!name.trim() || !user) return;
      try {
        const { data, error } = await supabase.from("collections").insert({
          user_id: user.id,
          name: name.trim()
        }).select().single();
        if (error) {
          if (error.message.includes("find the table")) {
            alert("Database not initialized for collections. Run the engagement.sql migration.");
            return;
          }
          throw error;
        }
        await handleToggleSave(data.id, false);
        setCreating(false);
        setNewCollectionName("");
        fetchCollections();
      } catch (err) {
        console.error("Error creating collection", err);
      }
    };
    const handleToggleSave = async (collectionId, isSavedInCollection) => {
      if (!user) return;
      try {
        if (isSavedInCollection) {
          await supabase.from("post_collections").delete().eq("collection_id", collectionId).eq("post_id", post.id);
        } else {
          await supabase.from("post_collections").insert({ collection_id: collectionId, post_id: post.id });
        }
        onSaveToggle(true);
        fetchCollections();
      } catch (err) {
        console.error("Error toggling save", err);
      }
    };
    return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "fixed inset-0 z-50 flex flex-col justify-end", children: [
      /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
        import_react26.motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          className: "absolute inset-0 bg-black/60 backdrop-blur-sm",
          onClick: onClose
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
        import_react26.motion.div,
        {
          initial: { y: "100%" },
          animate: { y: 0 },
          exit: { y: "100%" },
          transition: { type: "spring", damping: 25, stiffness: 300 },
          className: "relative bg-zinc-950 border-t border-zinc-800 rounded-t-3xl flex flex-col max-h-[70vh]",
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "flex items-center justify-between p-4 border-b border-zinc-800/50", children: [
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("h2", { className: "text-white font-bold text-lg", children: "Save to Collection" }),
              /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("button", { onClick: onClose, className: "p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_lucide_react13.X, { className: "w-5 h-5" }) })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "flex-1 overflow-y-auto p-4 space-y-2", children: [
              !creating ? /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
                "button",
                {
                  onClick: () => setCreating(true),
                  className: "w-full flex items-center gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-left hover:bg-zinc-800 transition-colors group",
                  children: [
                    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "w-10 h-10 rounded-full bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center text-white transition-colors", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_lucide_react13.Plus, { className: "w-5 h-5" }) }),
                    /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("span", { className: "font-bold text-white", children: "New Collection" })
                  ]
                }
              ) : /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("form", { onSubmit: (e) => {
                e.preventDefault();
                handleCreateCollection(newCollectionName);
              }, className: "flex gap-2 mb-4 bg-zinc-900 p-3 rounded-xl border border-zinc-800", children: [
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                  "input",
                  {
                    autoFocus: true,
                    type: "text",
                    placeholder: "Collection name...",
                    value: newCollectionName,
                    onChange: (e) => setNewCollectionName(e.target.value),
                    className: "flex-1 bg-transparent text-white outline-none px-2 font-medium"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                  "button",
                  {
                    type: "button",
                    onClick: () => setCreating(false),
                    className: "px-3 text-zinc-400 hover:text-white font-medium text-sm transition-colors",
                    children: "Cancel"
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                  "button",
                  {
                    type: "submit",
                    disabled: !newCollectionName.trim(),
                    className: "px-4 bg-white text-black font-bold rounded-lg text-sm disabled:opacity-50",
                    children: "Create"
                  }
                )
              ] }),
              loading ? /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "space-y-2 mt-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "h-16 bg-zinc-900 rounded-xl animate-pulse" }, i)) }) : /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "mt-4 space-y-2", children: [
                collections.map((collection) => {
                  const isSavedInCollection = collection.post_collections?.some((pc) => pc.post_id === post.id);
                  return /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)(
                    "button",
                    {
                      onClick: () => handleToggleSave(collection.id, isSavedInCollection),
                      className: "w-full flex items-center justify-between p-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700",
                      children: [
                        /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "flex items-center gap-3", children: [
                          /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_lucide_react13.Folder, { className: "w-5 h-5" }) }),
                          /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "text-left", children: [
                            /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("p", { className: "font-bold text-white text-sm", children: collection.name }),
                            /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("p", { className: "text-xs text-zinc-500 font-medium", children: [
                              collection.post_collections?.length || 0,
                              " posts"
                            ] })
                          ] })
                        ] }),
                        isSavedInCollection && /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-black", children: /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(import_lucide_react13.Check, { className: "w-4 h-4" }) })
                      ]
                    },
                    collection.id
                  );
                }),
                collections.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime16.jsxs)("div", { className: "pt-4 border-t border-zinc-800", children: [
                  /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("p", { className: "text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider pl-2", children: "Suggestions" }),
                  /* @__PURE__ */ (0, import_jsx_runtime16.jsx)("div", { className: "flex flex-wrap gap-2", children: defaultCategories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime16.jsx)(
                    "button",
                    {
                      onClick: () => handleCreateCollection(cat),
                      className: "px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors",
                      children: cat
                    },
                    cat
                  )) })
                ] })
              ] })
            ] })
          ]
        }
      )
    ] });
  }

  // src/components/PostCard.tsx
  var import_jsx_runtime17 = __require("react/jsx-runtime");
  function PostCard({ post, onDelete }) {
    const { user } = useAuthStore();
    const [isLiked, setIsLiked] = (0, import_react27.useState)(post.likes?.some((l2) => l2.user_id === user?.id) || false);
    const [likeCount, setLikeCount] = (0, import_react27.useState)(post.likes?.length || post.likes_count || 0);
    const [commentCount, setCommentCount] = (0, import_react27.useState)(post.comments?.length || post.comments_count || 0);
    const [shareCount, setShareCount] = (0, import_react27.useState)(post.shares_count || 0);
    const [isSaved, setIsSaved] = (0, import_react27.useState)(false);
    const [isLiking, setIsLiking] = (0, import_react27.useState)(false);
    const [showMenu, setShowMenu] = (0, import_react27.useState)(false);
    const [showHeartAnimation, setShowHeartAnimation] = (0, import_react27.useState)(false);
    const [currentMediaIndex, setCurrentMediaIndex] = (0, import_react27.useState)(0);
    const [showComments, setShowComments] = (0, import_react27.useState)(false);
    const [showShare, setShowShare] = (0, import_react27.useState)(false);
    const [showReport, setShowReport] = (0, import_react27.useState)(false);
    const [showSaveSheet, setShowSaveSheet] = (0, import_react27.useState)(false);
    const [viewerMedia, setViewerMedia] = (0, import_react27.useState)(null);
    const profile = Array.isArray(post.users) ? post.users[0] : post.users;
    const isOwnPost = user?.id === post.user_id;
    let mediaList = [];
    if (post.media_urls && Array.isArray(post.media_urls) && post.media_urls.length > 0) {
      mediaList = post.media_urls;
    } else if (post.image_url) {
      mediaList = [post.image_url];
    } else if (post.video_url) {
      mediaList = [post.video_url];
    }
    const handleLike = async () => {
      if (!user || isLiking) return;
      setIsLiking(true);
      const wasLiked = isLiked;
      setIsLiked(!wasLiked);
      setLikeCount((prev) => wasLiked ? prev - 1 : prev + 1);
      try {
        if (wasLiked) {
          await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", user.id);
        } else {
          await supabase.from("likes").insert({ post_id: post.id, user_id: user.id });
          if (post.user_id !== user.id) {
            await supabase.from("notifications").insert({ user_id: post.user_id, type: "like", title: `${user.user_metadata?.username || "Someone"} liked your post` });
          }
        }
      } catch (error) {
        setIsLiked(wasLiked);
        setLikeCount((prev) => wasLiked ? prev + 1 : prev - 1);
        console.error("Error toggling like:", error);
      } finally {
        setIsLiking(false);
      }
    };
    const handleSave = async () => {
      if (!user) return;
      const wasSaved = isSaved;
      setIsSaved(!wasSaved);
      try {
        if (wasSaved) {
          await supabase.from("saved_posts").delete().eq("post_id", post.id).eq("user_id", user.id);
        } else {
          await supabase.from("saved_posts").insert({ post_id: post.id, user_id: user.id });
        }
      } catch (err) {
        console.error(err);
        setIsSaved(wasSaved);
      }
    };
    const handleDoubleTap = (e) => {
      e.preventDefault();
      if (!isLiked) handleLike();
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 1e3);
    };
    const handleDelete = async () => {
      if (confirm("Are you sure you want to delete this post?")) {
        await supabase.from("posts").delete().eq("id", post.id);
        if (onDelete) onDelete();
        setShowMenu(false);
      }
    };
    const copyLink = () => {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      alert("Link copied to clipboard!");
      setShowMenu(false);
    };
    return /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(import_jsx_runtime17.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "border-b border-zinc-800 p-4 transition-all hover:bg-zinc-900/30 relative", children: [
        /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(import_react_router_dom4.Link, { to: `/@${profile?.username}`, className: "flex items-center gap-3", children: [
            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0", children: profile?.avatar_url ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(OptimizedImage, { src: profile.avatar_url, alt: profile.username || "user", className: "w-full h-full", objectFit: "cover" }) : /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "w-full h-full flex items-center justify-center text-zinc-500 font-bold bg-zinc-800", children: profile?.username?.charAt(0)?.toUpperCase() || "U" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("h3", { className: "font-bold text-[15px] text-white hover:underline", children: profile?.display_name || profile?.username || "User" }),
                post.created_at && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("span", { className: "text-zinc-500 text-xs font-normal", children: [
                  "\xB7 ",
                  timeAgo(post.created_at)
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("p", { className: "text-zinc-500 text-sm", children: [
                "@",
                profile?.username
              ] })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "relative", children: [
            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
              "button",
              {
                onClick: () => setShowMenu(!showMenu),
                className: "p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors",
                children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.MoreHorizontal, { className: "w-5 h-5" })
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_react28.AnimatePresence, { children: showMenu && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(import_jsx_runtime17.Fragment, { children: [
              /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "fixed inset-0 z-40", onClick: () => setShowMenu(false) }),
              /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
                import_react28.motion.div,
                {
                  initial: { opacity: 0, scale: 0.95, y: -10 },
                  animate: { opacity: 1, scale: 1, y: 0 },
                  exit: { opacity: 0, scale: 0.95, y: -10 },
                  className: "absolute right-0 top-12 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden py-1",
                  children: [
                    isOwnPost ? /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(import_jsx_runtime17.Fragment, { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("button", { className: "w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-zinc-800 transition-colors", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.Edit2, { className: "w-4 h-4" }),
                        " Edit post"
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("button", { className: "w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-zinc-800 transition-colors", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.Pin, { className: "w-4 h-4" }),
                        " Pin to profile"
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("button", { onClick: handleDelete, className: "w-full px-4 py-3 flex items-center gap-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.Trash2, { className: "w-4 h-4" }),
                        " Delete"
                      ] })
                    ] }) : /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(import_jsx_runtime17.Fragment, { children: [
                      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("button", { className: "w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-zinc-800 transition-colors", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.UserX, { className: "w-4 h-4" }),
                        " Unfollow @",
                        profile?.username
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("button", { className: "w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-zinc-800 transition-colors", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.EyeOff, { className: "w-4 h-4" }),
                        " Mute @",
                        profile?.username
                      ] }),
                      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("button", { className: "w-full px-4 py-3 flex items-center gap-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors", children: [
                        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.Flag, { className: "w-4 h-4" }),
                        " Report post"
                      ] })
                    ] }),
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "h-px bg-zinc-800 my-1" }),
                    /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("button", { onClick: copyLink, className: "w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-zinc-800 transition-colors", children: [
                      /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.Link2, { className: "w-4 h-4" }),
                      " Copy link"
                    ] })
                  ]
                }
              )
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "text-zinc-200 mb-3 whitespace-pre-wrap text-[15px] leading-relaxed", children: [
          renderMentions(post.content || post.caption || ""),
          post.hashtags && Array.isArray(post.hashtags) && post.hashtags.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "mt-2 text-purple-400", children: post.hashtags.map((tag, i) => /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("span", { className: "mr-2 hover:underline cursor-pointer", children: [
            "#",
            tag.replace("#", "")
          ] }, tag + i)) })
        ] }),
        mediaList.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
          "div",
          {
            className: "relative rounded-2xl overflow-hidden mb-3 border border-zinc-800 bg-black group",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                "div",
                {
                  className: "relative w-full cursor-pointer flex items-center justify-center bg-black min-h-[300px]",
                  onDoubleClick: handleDoubleTap,
                  onClick: () => {
                    const current = mediaList[currentMediaIndex];
                    setViewerMedia({ url: current, type: current.includes(".mp4") || current.includes(".webm") ? "video" : "image" });
                  },
                  children: mediaList[currentMediaIndex].includes(".mp4") || mediaList[currentMediaIndex].includes(".webm") ? /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(OptimizedVideo, { src: mediaList[currentMediaIndex], controls: true, playsInline: true, className: "w-full h-full max-h-[600px]" }) : /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(OptimizedImage, { src: mediaList[currentMediaIndex], alt: "Post media", className: "w-full max-h-[600px] select-none pointer-events-none", objectFit: "contain" })
                }
              ),
              mediaList.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(import_jsx_runtime17.Fragment, { children: [
                currentMediaIndex > 0 && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      setCurrentMediaIndex((c) => c - 1);
                    },
                    className: "absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full backdrop-blur hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100",
                    children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "w-4 h-4 flex items-center justify-center", children: "\u2190" })
                  }
                ),
                currentMediaIndex < mediaList.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      setCurrentMediaIndex((c) => c + 1);
                    },
                    className: "absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full backdrop-blur hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100",
                    children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "w-4 h-4 flex items-center justify-center", children: "\u2192" })
                  }
                ),
                /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "absolute bottom-3 inset-x-0 flex justify-center gap-1.5 pointer-events-none", children: mediaList.map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: `h-1.5 rounded-full transition-all ${i === currentMediaIndex ? "w-4 bg-purple-500" : "w-1.5 bg-white/50"}` }, i)) })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(HeartBurst, { show: showHeartAnimation })
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(ReactionsRow, { post }),
        /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex items-center justify-between text-zinc-500 mt-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "flex items-center gap-6", children: [
            /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
              "button",
              {
                onClick: handleLike,
                disabled: isLiking,
                className: `flex items-center gap-1.5 group transition-colors ${isLiked ? "text-red-500" : "hover:text-red-400"}`,
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: `p-2 -ml-2 rounded-full group-hover:bg-red-500/10 transition-colors ${isLiked ? "bg-red-500/10" : ""}`, children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.Heart, { className: `w-5 h-5 ${isLiked ? "fill-current" : ""}` }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "text-sm font-medium", children: likeCount > 0 ? likeCount : "" })
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(
              "button",
              {
                onClick: () => setShowComments(true),
                className: "flex items-center gap-1.5 group hover:text-blue-400 transition-colors",
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "p-2 -ml-2 rounded-full group-hover:bg-blue-500/10 transition-colors", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.MessageCircle, { className: "w-5 h-5" }) }),
                  /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "text-sm font-medium", children: commentCount > 0 ? commentCount : "" })
                ]
              }
            ),
            /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("button", { onClick: () => setShowShare(true), className: "flex items-center gap-1.5 group hover:text-green-400 transition-colors", children: [
              /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "p-2 -ml-2 rounded-full group-hover:bg-green-500/10 transition-colors", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.Share2, { className: "w-5 h-5" }) }),
              /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("span", { className: "text-sm font-medium", children: shareCount > 0 ? shareCount : "" })
            ] })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
            "button",
            {
              onClick: () => setShowSaveSheet(true),
              className: `flex items-center gap-1.5 group transition-colors ${isSaved ? "text-yellow-500" : "hover:text-yellow-400"}`,
              children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: `p-2 -mr-2 rounded-full group-hover:bg-yellow-500/10 transition-colors ${isSaved ? "bg-yellow-500/10" : ""}`, children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.Bookmark, { className: `w-5 h-5 ${isSaved ? "fill-current" : ""}` }) })
            }
          )
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "text-xs text-zinc-600 mt-2 ml-1", children: post.views_count ? `${post.views_count} views` : "1 view" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)(import_react28.AnimatePresence, { children: [
        showComments && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(CommentsSheet, { post, onClose: () => setShowComments(false) }),
        showShare && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(ShareSheet, { post, onClose: () => setShowShare(false) }),
        showSaveSheet && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(SaveSheet, { post, onClose: () => setShowSaveSheet(false), isCurrentlySaved: isSaved, onSaveToggle: setIsSaved })
      ] }),
      viewerMedia && viewerMedia.type === "image" && /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
        ImageViewer,
        {
          src: viewerMedia.url,
          onClose: () => setViewerMedia(null)
        }
      ),
      viewerMedia && viewerMedia.type === "video" && /* @__PURE__ */ (0, import_jsx_runtime17.jsxs)("div", { className: "fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-200", children: [
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(
          "button",
          {
            onClick: () => setViewerMedia(null),
            className: "absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors backdrop-blur-sm",
            children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)(import_lucide_react14.X, { className: "w-6 h-6" })
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("div", { className: "flex-1 w-full h-full flex items-center justify-center p-4", children: /* @__PURE__ */ (0, import_jsx_runtime17.jsx)("video", { src: viewerMedia.url, controls: true, autoPlay: true, className: "max-w-full max-h-full object-contain" }) })
      ] })
    ] });
  }

  // src/components/performance/PostSkeleton.tsx
  var import_jsx_runtime18 = __require("react/jsx-runtime");
  function PostSkeleton() {
    return /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "bg-black border-b border-zinc-900 pb-4 mb-4 animate-pulse", children: [
      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "p-4 flex items-center justify-between", children: /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "w-10 h-10 bg-zinc-800 rounded-full" }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "space-y-2", children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "w-24 h-4 bg-zinc-800 rounded" }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "w-16 h-3 bg-zinc-900 rounded" })
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "w-full aspect-[4/5] bg-zinc-900" }),
      /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "p-4 space-y-3", children: [
        /* @__PURE__ */ (0, import_jsx_runtime18.jsxs)("div", { className: "flex gap-4", children: [
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "w-6 h-6 bg-zinc-800 rounded-full" }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "w-6 h-6 bg-zinc-800 rounded-full" }),
          /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "w-6 h-6 bg-zinc-800 rounded-full" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "w-1/2 h-4 bg-zinc-800 rounded" }),
        /* @__PURE__ */ (0, import_jsx_runtime18.jsx)("div", { className: "w-3/4 h-3 bg-zinc-900 rounded" })
      ] })
    ] });
  }

  // src/components/Feed.tsx
  var import_jsx_runtime19 = __require("react/jsx-runtime");
  function Feed() {
    const [feedType, setFeedType] = (0, import_react29.useState)(() => {
      return localStorage.getItem("omnix_feed_type") || "forYou";
    });
    const { ref, inView } = useInView();
    const queryClient = (0, import_react_query3.useQueryClient)();
    const { user } = useAuthStore();
    const [isRefreshing, setIsRefreshing] = (0, import_react29.useState)(false);
    const [pullProgress, setPullProgress] = (0, import_react29.useState)(0);
    (0, import_react29.useEffect)(() => {
      localStorage.setItem("omnix_feed_type", feedType);
    }, [feedType]);
    const fetchPosts = async ({ pageParam = 0 }) => {
      let query = supabase.from("posts").select(`
        id,
        content:caption,
        caption,
        image_url,
        video_url,
        location,
        visibility,
        created_at,
        user_id,
        likes (id, user_id),
        comments (id)
      `).order("created_at", { ascending: false }).range(pageParam * 10, (pageParam + 1) * 10 - 1);
      const { data: data2, error: error2 } = await query;
      if (error2) {
        console.error("[Feed/fetchPosts] Query failed with error:", error2);
        return [];
      }
      let profilesData = [];
      if (data2 && data2.length > 0) {
        const userIds = [...new Set(data2.map((p2) => p2.user_id).filter(Boolean))];
        if (userIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id, username, display_name, is_verified, avatar_url").in("id", userIds);
          if (profilesError) {
            console.warn("[Feed/fetchPosts] Failed to fetch profiles:", profilesError);
          } else if (profiles) {
            profilesData = profiles;
          }
        }
      }
      const mappedData = data2?.map((post) => {
        const profile = profilesData.find((p2) => p2.id === post.user_id);
        return {
          ...post,
          content: post.caption || post.content || "",
          users: profile || null
        };
      }) || [];
      if (feedType === "forYou") {
        const shuffled = [...mappedData].sort((a, b2) => {
          const scoreA = (a.likes?.length || 0) * 2 + (a.comments?.length || 0) * 3 + Math.random() * 5;
          const scoreB = (b2.likes?.length || 0) * 2 + (b2.comments?.length || 0) * 3 + Math.random() * 5;
          return scoreB - scoreA;
        });
        return shuffled;
      }
      return mappedData;
    };
    const {
      data,
      error,
      fetchNextPage,
      hasNextPage,
      isFetching,
      isFetchingNextPage,
      status,
      refetch
    } = (0, import_react_query3.useInfiniteQuery)({
      queryKey: ["posts", feedType],
      queryFn: fetchPosts,
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage && lastPage.length === 10 ? allPages.length : void 0;
      }
    });
    (0, import_react29.useEffect)(() => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);
    (0, import_react29.useEffect)(() => {
      let startY = 0;
      const handleTouchStart = (e) => {
        if (window.scrollY === 0) {
          startY = e.touches[0].clientY;
        }
      };
      const handleTouchMove = (e) => {
        if (startY > 0) {
          const y = e.touches[0].clientY;
          const diff = y - startY;
          if (diff > 0 && window.scrollY === 0) {
            e.preventDefault();
            setPullProgress(Math.min(diff / 100, 1));
          }
        }
      };
      const handleTouchEnd = async () => {
        if (pullProgress > 0.6) {
          setIsRefreshing(true);
          setPullProgress(1);
          await refetch();
          setIsRefreshing(false);
        }
        setPullProgress(0);
        startY = 0;
      };
      document.addEventListener("touchstart", handleTouchStart, { passive: true });
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
      return () => {
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }, [pullProgress, refetch]);
    const uniquePosts = /* @__PURE__ */ new Map();
    data?.pages.forEach((page) => {
      page?.forEach((post) => {
        uniquePosts.set(post.id, post);
      });
    });
    const postsArray = Array.from(uniquePosts.values());
    return /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "pb-10 min-h-screen", children: [
      /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
        "div",
        {
          className: "flex justify-center items-center overflow-hidden transition-all duration-200",
          style: { height: `${pullProgress * 50}px`, opacity: pullProgress },
          children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_lucide_react15.RefreshCw, { className: `w-5 h-5 text-purple-500 ${isRefreshing ? "animate-spin" : ""}`, style: { transform: `rotate(${pullProgress * 360}deg)` } })
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex border-b border-zinc-800 bg-black/80 backdrop-blur-xl sticky top-[60px] z-30", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
          "button",
          {
            onClick: () => setFeedType("forYou"),
            className: `flex-1 py-4 text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-colors ${feedType === "forYou" ? "border-purple-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"}`,
            "aria-label": "For You Feed",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_lucide_react15.Sparkles, { className: "w-4 h-4" }),
              "For You"
            ]
          }
        ),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)(
          "button",
          {
            onClick: () => setFeedType("following"),
            className: `flex-1 py-4 text-sm font-bold border-b-2 flex items-center justify-center gap-2 transition-colors ${feedType === "following" ? "border-purple-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"}`,
            "aria-label": "Following Feed",
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(import_lucide_react15.Clock, { className: "w-4 h-4" }),
              "Following"
            ]
          }
        )
      ] }),
      status === "error" ? /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "p-8 text-center text-red-500", children: "Error loading feed. Please try again." }) : postsArray.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(
        import_react_virtuoso.Virtuoso,
        {
          useWindowScroll: true,
          data: postsArray,
          endReached: () => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          },
          itemContent: (index, post) => /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(PostCard, { post, onDelete: () => refetch() }, post.id),
          components: {
            Footer: () => {
              if (isFetchingNextPage) {
                return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "flex flex-col", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(PostSkeleton, {}) });
              }
              if (!hasNextPage && postsArray.length > 0) {
                return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "p-8 flex justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "text-zinc-500 font-medium", children: "You're all caught up! \u2728" }) });
              }
              return /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "h-20" });
            }
          }
        }
      ) : status === "pending" ? /* @__PURE__ */ (0, import_jsx_runtime19.jsxs)("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(PostSkeleton, {}),
        /* @__PURE__ */ (0, import_jsx_runtime19.jsx)(PostSkeleton, {})
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("div", { className: "p-8 flex justify-center text-center", children: /* @__PURE__ */ (0, import_jsx_runtime19.jsx)("span", { className: "text-zinc-500", children: "No posts yet. Be the first to share!" }) })
    ] });
  }

  // src/pages/Home.tsx
  var import_jsx_runtime20 = __require("react/jsx-runtime");
  function Home() {
    const navigate = (0, import_react_router_dom5.useNavigate)();
    const location = (0, import_react_router_dom5.useLocation)();
    const isAiPage = location.pathname === "/ai";
    return /* @__PURE__ */ (0, import_jsx_runtime20.jsxs)(import_jsx_runtime20.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("div", { className: "sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4", children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)("h1", { className: "text-xl font-bold text-white", children: "Home" }) }),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(StoriesBar, {}),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(CreatePost, {}),
      /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(Feed, {}),
      !isAiPage && /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(
        "button",
        {
          onClick: () => navigate("/ai"),
          className: "fixed bottom-20 md:bottom-6 right-6 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full shadow-2xl transition-all hover:scale-105 z-40 shadow-purple-500/20 xl:hidden",
          children: /* @__PURE__ */ (0, import_jsx_runtime20.jsx)(import_lucide_react16.Sparkles, { className: "w-6 h-6" })
        }
      )
    ] });
  }
})();
