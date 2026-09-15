import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pins Turbopack's workspace root to this app, not whatever ancestor
  // directory happens to hold a stray lockfile (this repo isn't a
  // monorepo, but the home directory above it has an unrelated one).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
