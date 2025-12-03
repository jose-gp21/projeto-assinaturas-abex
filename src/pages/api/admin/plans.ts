// src/pages/api/admin/plans.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { connectMongoose } from '@/lib/mongodb';
import Plan from '@/lib/models/Plan';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // @ts-ignore
    if (session.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }

    await connectMongoose();

    // GET - Listar todos os planos
    if (req.method === 'GET') {
      const plans = await Plan.find({}).lean().exec();
      return res.status(200).json(plans);
    }

    // POST - Criar novo plano
    if (req.method === 'POST') {
      const { name, description, monthlyPrice, annualPrice, features, trialDays, isActive } = req.body;

      // Validações
      if (!name || !description) {
        return res.status(400).json({ error: 'Nome e descrição são obrigatórios' });
      }

      if (!monthlyPrice || monthlyPrice < 0) {
        return res.status(400).json({ error: 'Preço mensal inválido' });
      }

      if (!annualPrice || annualPrice < 0) {
        return res.status(400).json({ error: 'Preço anual inválido' });
      }

      if (!Array.isArray(features) || features.length === 0) {
        return res.status(400).json({ error: 'Adicione pelo menos uma feature' });
      }

      // Criar novo plano
      const newPlan = new Plan({
        name,
        description,
        monthlyPrice: parseFloat(monthlyPrice),
        annualPrice: parseFloat(annualPrice),
        features,
        trialDays: parseInt(trialDays) || 0,
        isActive: isActive !== undefined ? isActive : true,
      });

      await newPlan.save();

      return res.status(201).json({
        message: 'Plano criado com sucesso',
        plan: newPlan,
      });
    }

    // PUT - Atualizar plano
    if (req.method === 'PUT') {
      const { id, ...updateData } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID do plano é obrigatório' });
      }

      const updatedPlan = await Plan.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!updatedPlan) {
        return res.status(404).json({ error: 'Plano não encontrado' });
      }

      return res.status(200).json({
        message: 'Plano atualizado com sucesso',
        plan: updatedPlan,
      });
    }

    // DELETE - Deletar plano
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID do plano é obrigatório' });
      }

      const deletedPlan = await Plan.findByIdAndDelete(id);

      if (!deletedPlan) {
        return res.status(404).json({ error: 'Plano não encontrado' });
      }

      return res.status(200).json({
        message: 'Plano deletado com sucesso',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in plans API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}