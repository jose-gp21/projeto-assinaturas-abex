// src/services/contentService.ts
import Content from '@/lib/models/Content'; // Your Content model
import Plan from '@/lib/models/Plan';     // Your Plan model
import { connectMongoose } from '@/lib/mongodb';

// Function to create content
export async function createNewContent(data: { title: string; description: string; type: string; url?: string | null; restricted?: boolean; planId?: string | null }) {
  await connectMongoose(); // Ensure connection

  const { title, description, type, url, restricted, planId } = data;

  // Input validation (now inside the service)
  if (!title || !description || !type) {
    throw new Error('Title, description, and type are required for the content.');
  }

  if (planId) {
    const existingPlan = await Plan.findById(planId);
    if (!existingPlan) {
      throw new Error('The provided plan ID does not exist.');
    }
  }

  const newContent = await Content.create({
    title,
    description,
    publicationDate: new Date(),
    type,
    url: url || null,
    restricted: typeof restricted === 'boolean' ? restricted : true,
    planId: planId || null,
  });

  return newContent;
}

// Function to get content(s)
export async function getContents(id?: string) {
  await connectMongoose(); // Ensure connection

  if (id) {
    const content = await Content.findById(id).populate('planId', 'name');
    if (!content) {
      throw new Error('Content not found.');
    }
    return content;
  } else {
    const contents = await Content.find({}).populate('planId', 'name');
    return contents;
  }
}

// Function to update content
export async function updateContent(id: string, data: any) {
  await connectMongoose(); // Ensure connection

  if (!id) {
    throw new Error('Content ID is required for updating.');
  }

  if (data.planId) {
    const existingPlan = await Plan.findById(data.planId);
    if (!existingPlan) {
      throw new Error('The provided plan ID does not exist.');
    }
  }

  const updatedContent = await Content.findByIdAndUpdate(
    id,
    data, // Pass the data object directly
    { new: true, runValidators: true }
  );

  if (!updatedContent) {
    throw new Error('Content not found.');
  }

  return updatedContent;
}

// Function to delete content
export async function deleteContent(id: string) {
  await connectMongoose(); // Ensure connection

  if (!id) {
    throw new Error('Content ID is required for deletion.');
  }

  const deletedContent = await Content.findByIdAndDelete(id);

  if (!deletedContent) {
    throw new Error('Content not found.');
  }

  return deletedContent;
}