/**
 * Report Controller
 */

import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../../application/report.service';
import { BadRequestError } from '@/shared/domain/errors/app-error';

const reportService = new ReportService();

export class ReportController {
  async generateBalanceSheet(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId } = req.params;
      const { endDate } = req.query;

      if (!endDate) {
        throw new BadRequestError('endDate is required');
      }

      const report = await reportService.generateBalanceSheet({
        companyId,
        startDate: new Date(), // Not used for balance sheet
        endDate: new Date(endDate as string),
      });

      res.status(200).json({
        status: 'success',
        data: { report },
      });
    } catch (error) {
      next(error);
    }
  }

  async generateProfitAndLoss(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new BadRequestError('startDate and endDate are required');
      }

      const report = await reportService.generateProfitAndLoss({
        companyId,
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      });

      res.status(200).json({
        status: 'success',
        data: { report },
      });
    } catch (error) {
      next(error);
    }
  }

  async generateCashFlow(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new BadRequestError('startDate and endDate are required');
      }

      const report = await reportService.generateCashFlow({
        companyId,
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      });

      res.status(200).json({
        status: 'success',
        data: { report },
      });
    } catch (error) {
      next(error);
    }
  }

  async generateAllReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { companyId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw new BadRequestError('startDate and endDate are required');
      }

      const reports = await reportService.generateAllReports({
        companyId,
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      });

      res.status(200).json({
        status: 'success',
        data: { reports },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
