import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Route, RouteDocument } from './schemas/route.schema';

@Injectable()
export class RoutesService {
  constructor(@InjectModel(Route.name) private routeModel: Model<RouteDocument>) {}

  async create(data: Partial<Route>): Promise<Route> {
    const route = new this.routeModel({
      ...data,
      branchId: data.branchId ? new Types.ObjectId(data.branchId as any) : new Types.ObjectId(),
    });
    return route.save();
  }

  async findAll(branchId?: string): Promise<Route[]> {
    const filter: any = { isDeleted: false };
    if (branchId) filter.branchId = new Types.ObjectId(branchId);
    return this.routeModel
      .find(filter)
      .populate('assignedAgentId', 'fullName employeeCode mobile')
      .populate('branchId', 'name code')
      .exec();
  }

  async findOne(id: string): Promise<Route> {
    const route = await this.routeModel
      .findOne({ _id: id, isDeleted: false })
      .populate('assignedAgentId', 'fullName employeeCode mobile')
      .exec();
    if (!route) throw new NotFoundException(`Route ${id} not found`);
    return route;
  }

  async assignAgent(routeId: string, agentId: string): Promise<Route> {
    const route = await this.findOne(routeId);
    route.assignedAgentId = new Types.ObjectId(agentId);
    return route.save();
  }
}
