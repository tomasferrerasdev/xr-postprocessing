import { defineConfig } from "tsup";
import fs from "fs";
import path from "path";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  loader: {
    ".vert": "text",
    ".frag": "text",
    ".glsl": "text",
  },
  onSuccess: async () => {
    // Copy shader files to dist
    const copyShaders = (srcDir: string, destDir: string) => {
      if (!fs.existsSync(srcDir)) return;
      
      const items = fs.readdirSync(srcDir, { withFileTypes: true });
      
      for (const item of items) {
        const srcPath = path.join(srcDir, item.name);
        const destPath = path.join(destDir, item.name);
        
        if (item.isDirectory()) {
          if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath, { recursive: true });
          }
          copyShaders(srcPath, destPath);
        } else if (item.name.endsWith(".vert") || item.name.endsWith(".frag") || item.name.endsWith(".glsl")) {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };
    
    copyShaders("src", "dist");
  },
});

