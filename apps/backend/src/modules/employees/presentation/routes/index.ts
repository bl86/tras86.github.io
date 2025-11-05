/**
 * Employee Routes
 */

import { Router } from 'express';
import { employeeController } from '../controllers/employee.controller';
import { authenticate } from '@/modules/auth/presentation/middlewares/authenticate';

export const employeeRouter = Router();

employeeRouter.use(authenticate);

employeeRouter.get('/:companyId/employees', employeeController.getEmployees.bind(employeeController));
employeeRouter.get('/:companyId/employees/:employeeId', employeeController.getEmployee.bind(employeeController));
employeeRouter.post('/:companyId/employees', employeeController.createEmployee.bind(employeeController));
employeeRouter.put('/:companyId/employees/:employeeId', employeeController.updateEmployee.bind(employeeController));
employeeRouter.delete('/:companyId/employees/:employeeId', employeeController.deleteEmployee.bind(employeeController));
