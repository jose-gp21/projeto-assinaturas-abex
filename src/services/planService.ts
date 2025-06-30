// src/services/planoService.ts
import Plan from '@/lib/models/Plan'; // Your Plan model
import { connectMongoose } from '@/lib/mongodb';

// Function to create a new plan
export async function createNewPlan(data: {
  name: string;
  monthlyValue?: number | null;
  annualValue?: number | null;
  description: string;
  benefits?: string[];
  trialDays?: number;
}) {
  await connectMongoose(); // Ensure connection

  const { name, description } = data;

  // Input validation (now within the service)
  if (!name || !description) {
    throw new Error('Plan name and description are required.');
  }

  try {
    const newPlan = await Plan.create({
      name,
      monthlyValue: data.monthlyValue || null,
      annualValue: data.annualValue || null,
      description,
      benefits: data.benefits || [],
      trialDays: data.trialDays || 0,
    });
    return newPlan;
  } catch (error: any) {
    if (error.code === 11000) { // MongoDB duplicate error code (if 'name' is unique)
      throw new Error('A plan with this name already exists.');
    }
    console.error('Error creating plan in service:', error);
    throw new Error('Internal error while creating plan.');
  }
}

// Function to get plans
export async function getPlans() {
  await connectMongoose(); // Ensure connection

  try {
    const plans = await Plan.find({});
    return plans;
  } catch (error) {
    console.error('Error fetching plans in service:', error);
    throw new Error('Internal error while listing plans.');
  }
}

// Function to update an existing plan
export async function updateExistingPlan(id: string, data: any) {
  await connectMongoose(); // Ensure connection

  if (!id) {
    throw new Error('Plan ID is required for update.');
  }

  try {
    const updatedPlan = await Plan.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      throw new Error('Plan not found.');
    }
    return updatedPlan;
  } catch (error: any) {
    if (error.code === 11000) { // MongoDB duplicate error code
      throw new Error('Another plan with this name already exists.');
    }
    console.error('Error updating plan in service:', error);
    throw new Error('Internal error while updating plan.');
  }
}

// Function to delete a plan
export async function deleteExistingPlan(id: string) {
  await connectMongoose(); // Ensure connection

  if (!id) {
    throw new Error('Plan ID is required for deletion.');
  }

  try {
    const deletedPlan = await Plan.findByIdAndDelete(id);

    if (!deletedPlan) {
      throw new Error('Plan not found.');
    }
    return deletedPlan;
  } catch (error) {
    console.error('Error deleting plan in service:', error);
    throw new Error('Internal error while deleting plan.');
  }
}