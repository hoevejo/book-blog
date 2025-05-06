import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // ✅ ADD THIS
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(), // ✅ ADD THIS
    tailwindcss(),
  ],
});
