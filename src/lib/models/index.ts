// src/lib/models/index.ts
// ✅ Centralized Mongoose model loader
// Importing these files ensures that all Schemas are registered
// when this file is imported anywhere in the project.

import "./User";          // User model
import "./Admin";         // Admin model
import "./Plan";          // Plan model
import "./Subscription";  // Subscription model
import "./Payment";       // Payment model
import "./Content";       // Content model

/**
 * You don't need to export anything here.
 * Simply importing this file guarantees that all models
 * are loaded and registered in Mongoose.
 *
 * Each model file already contains:
 *   export default mongoose.models.X || mongoose.model<IModel>('X', schema)
 *
 * This approach prevents the "OverwriteModelError"
 * during hot reloads or multiple imports in Next.js.
 */
