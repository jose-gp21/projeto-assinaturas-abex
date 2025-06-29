// src/lib/models/index.ts
// This file ensures that all your Mongoose models are loaded
// and their Schemas are registered when this file is imported.

import './User';       // Imports the User model
import './Admin';      // Imports the Admin model
import './Plan';       // Imports the Plan model
import './Subscription';  // Imports the Subscription model
import './Content';    // Imports the Content model

// You don't need to export anything from here, just importing the files
// forces their loading and the registration of Schemas by Mongoose
// (due to the lines 'mongoose.models.X || mongoose.model<I...>(...)')