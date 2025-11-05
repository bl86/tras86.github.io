/**
 * Partner Controller
 * Handles partner-related HTTP requests
 */

import { Request, Response, NextFunction } from 'express';
import { PartnerService } from '../../application/partner.service';

const partnerService = new PartnerService();

export class PartnerController {
  /**
   * Get all partners for a company
   */
  async getPartners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId } = req.params;

      const partners = await partnerService.getPartners(companyId);

      res.json(partners);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get partner by ID
   */
  async getPartner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId, partnerId } = req.params;
      const partner = await partnerService.getPartnerById(partnerId, companyId);

      res.json(partner);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new partner
   */
  async createPartner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId } = req.params;

      const partner = await partnerService.createPartner(companyId, req.body);

      res.status(201).json(partner);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update partner
   */
  async updatePartner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId, partnerId } = req.params;

      const partner = await partnerService.updatePartner(
        partnerId,
        companyId,
        req.body
      );

      res.json(partner);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete partner
   */
  async deletePartner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId, partnerId } = req.params;

      await partnerService.deactivatePartner(partnerId, companyId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const partnerController = new PartnerController();
