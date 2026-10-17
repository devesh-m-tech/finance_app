import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Branch } from './branch.schema';

export interface CreateBranchDto {
  code: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  state?: string;
  pincode: string;
  phone: string;
}

@Injectable()
export class BranchesService {
  constructor(@InjectModel(Branch.name) private branchModel: Model<Branch>) {}

  async createBranch(dto: CreateBranchDto) {
    const branch = new this.branchModel(dto);
    return branch.save();
  }

  async listBranches() {
    return this.branchModel.find({ isActive: true }).exec();
  }

  async getBranchById(id: string) {
    const branch = await this.branchModel.findById(id).exec();
    if (!branch) throw new NotFoundException(`Branch ${id} not found`);
    return branch;
  }
}
