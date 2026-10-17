import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument, CustomerStatus } from './schemas/customer.schema';
import { CreateCustomerDto, VerifyCustomerDto, AddDocumentDto } from './dto/create-customer.dto';
import { CounterService } from '../../database/counters/counter.service';
import { CryptoUtil } from '../../common/utils/crypto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    private counterService: CounterService,
  ) {}

  async create(dto: CreateCustomerDto, user: any): Promise<Customer> {
    const customerCode = await this.counterService.generateFormattedCode('CUST', 'customer_code', 5);

    let aadhaarHash = '';
    let encryptedAadhaar = '';
    let maskedAadhaar = '';

    if (dto.aadhaarNumber) {
      if (!CryptoUtil.validateAadhaarVerhoeff(dto.aadhaarNumber)) {
        throw new BadRequestException('Invalid Aadhaar checksum (Verhoeff verification failed)');
      }
      aadhaarHash = CryptoUtil.hashSensitive(dto.aadhaarNumber);
      const existing = await this.customerModel.findOne({ aadhaarHash, isDeleted: false });
      if (existing) {
        throw new BadRequestException(`Customer with this Aadhaar already exists (Code: ${existing.customerCode})`);
      }
      encryptedAadhaar = CryptoUtil.encrypt(dto.aadhaarNumber);
      maskedAadhaar = CryptoUtil.maskAadhaar(dto.aadhaarNumber);
    }

    let panHash = '';
    let encryptedPan = '';
    let maskedPan = '';

    if (dto.panNumber) {
      const cleanPan = dto.panNumber.toUpperCase();
      panHash = CryptoUtil.hashSensitive(cleanPan);
      const existingPan = await this.customerModel.findOne({ panHash, isDeleted: false });
      if (existingPan) {
        throw new BadRequestException(`Customer with this PAN already exists (Code: ${existingPan.customerCode})`);
      }
      encryptedPan = CryptoUtil.encrypt(cleanPan);
      maskedPan = CryptoUtil.maskPan(cleanPan);
    }

    let guarantorData: any = null;
    if (dto.guarantor) {
      guarantorData = {
        fullName: dto.guarantor.fullName,
        mobile: dto.guarantor.mobile,
        relationship: dto.guarantor.relationship,
        address: dto.guarantor.address,
        maskedAadhaar: dto.guarantor.aadhaarNumber ? CryptoUtil.maskAadhaar(dto.guarantor.aadhaarNumber) : '',
        aadhaarHash: dto.guarantor.aadhaarNumber ? CryptoUtil.hashSensitive(dto.guarantor.aadhaarNumber) : '',
      };
    }

    const assignedTo = user.roles?.includes('SALESPERSON')
      ? new Types.ObjectId(user.id)
      : dto.assignedTo
      ? new Types.ObjectId(dto.assignedTo)
      : new Types.ObjectId(user.id);

    const branchId = user.branchId ? new Types.ObjectId(user.branchId) : new Types.ObjectId();

    const created = new this.customerModel({
      customerCode,
      fullName: dto.fullName,
      mobile: dto.mobile,
      dob: dto.dob,
      gender: dto.gender,
      address: dto.address,
      aadhaarHash,
      encryptedAadhaar,
      maskedAadhaar,
      panHash,
      encryptedPan,
      maskedPan,
      status: CustomerStatus.SUBMITTED,
      assignedRouteId: dto.assignedRouteId || 'ROUTE-001',
      assignedTo,
      branchId,
      createdBy: new Types.ObjectId(user.id),
      guarantor: guarantorData,
      customFields: dto.customFields || {},
      documents: [],
    });

    return created.save();
  }

  async findAll(user: any, query: { page?: number; limit?: number; search?: string; status?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = { isDeleted: false };

    // Scoping
    if (user.roles?.includes('SALESPERSON')) {
      filter.assignedTo = new Types.ObjectId(user.id);
    } else if (user.roles?.includes('MANAGER') && user.branchId) {
      filter.branchId = new Types.ObjectId(user.branchId);
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      filter.$or = [
        { fullName: { $regex: query.search, $options: 'i' } },
        { mobile: { $regex: query.search, $options: 'i' } },
        { customerCode: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.customerModel
        .find(filter)
        .select('-encryptedAadhaar -encryptedPan')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('assignedTo', 'fullName employeeCode')
        .exec(),
      this.customerModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getVerificationQueue(user: any) {
    const filter: any = { status: CustomerStatus.SUBMITTED, isDeleted: false };
    if (user.roles?.includes('MANAGER') && user.branchId) {
      filter.branchId = new Types.ObjectId(user.branchId);
    }

    return this.customerModel
      .find(filter)
      .select('-encryptedAadhaar -encryptedPan')
      .sort({ createdAt: 1 })
      .populate('createdBy', 'fullName role')
      .populate('assignedTo', 'fullName')
      .limit(50)
      .exec();
  }

  async findOne(id: string, user: any): Promise<Customer> {
    const customer = await this.customerModel
      .findOne({ _id: id, isDeleted: false })
      .select('-encryptedAadhaar -encryptedPan')
      .populate('assignedTo', 'fullName employeeCode mobile')
      .populate('createdBy', 'fullName role')
      .exec();

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Role Scoping verification
    if (user.roles?.includes('SALESPERSON') && customer.assignedTo?._id?.toString() !== user.id) {
      throw new ForbiddenException('You can only view customers assigned to your route/profile');
    }

    return customer;
  }

  async verify(id: string, dto: VerifyCustomerDto, user: any): Promise<Customer> {
    const customer = await this.customerModel.findOne({ _id: id, isDeleted: false });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    if (dto.action === 'VERIFIED') {
      customer.status = CustomerStatus.VERIFIED;
      customer.verifiedBy = new Types.ObjectId(user.id);
      customer.verifiedAt = new Date();
      customer.rejectionReason = undefined;
    } else {
      customer.status = CustomerStatus.REJECTED;
      customer.rejectionReason = dto.reason || 'Verification criteria not met';
    }

    return customer.save();
  }

  async addDocument(id: string, dto: AddDocumentDto, user: any): Promise<Customer> {
    const customer = await this.customerModel.findOne({ _id: id, isDeleted: false });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Replace if same docType exists or push new
    const existingIndex = customer.documents.findIndex((d) => d.docType === dto.docType);
    const newDoc = {
      docType: dto.docType,
      title: dto.title,
      fileKey: dto.fileKey,
      fileUrl: dto.fileUrl,
      mimeType: dto.mimeType,
      status: 'PENDING',
      uploadedAt: new Date(),
    };

    if (existingIndex >= 0) {
      customer.documents[existingIndex] = newDoc as any;
    } else {
      customer.documents.push(newDoc as any);
    }

    return customer.save();
  }

  async verifyDocument(
    id: string,
    docType: string,
    action: 'VERIFIED' | 'REJECTED',
    user: any,
    remarks?: string
  ): Promise<Customer> {
    const customer = await this.customerModel.findOne({ _id: id, isDeleted: false });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const doc = customer.documents.find((d) => d.docType === docType);
    if (!doc) {
      throw new NotFoundException(`Document ${docType} not found for this customer`);
    }

    doc.status = action;
    doc.verifiedBy = new Types.ObjectId(user.id);
    doc.verifiedAt = new Date();
    doc.remarks = remarks || '';

    return customer.save();
  }
}
