import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This repository also has a package-lock at its root. Without an explicit
  // root, Turbopack selects that parent directory and watches the whole
  // repository, including the backend's generated files.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
