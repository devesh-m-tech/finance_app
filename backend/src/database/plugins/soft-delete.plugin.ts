import { Schema } from 'mongoose';

export function softDeletePlugin(schema: Schema) {
  schema.add({
    deletedAt: { type: Date, default: null, index: true },
    deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    deleteReason: { type: String, default: null },
  });

  const excludeDeleted = function (this: any) {
    if (this.getQuery().includeDeleted !== true) {
      this.where({ deletedAt: null });
    }
  };

  schema.pre('find', excludeDeleted);
  schema.pre('findOne', excludeDeleted);
  schema.pre('findOneAndUpdate', excludeDeleted);
  schema.pre('countDocuments', excludeDeleted);

  schema.methods.softDelete = async function (
    deletedBy: string,
    reason: string
  ) {
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
    this.deleteReason = reason;
    return this.save();
  };

  schema.methods.restore = async function () {
    this.deletedAt = null;
    this.deletedBy = null;
    this.deleteReason = null;
    return this.save();
  };
}
