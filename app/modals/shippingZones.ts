import mongoose from 'mongoose';

const ShippingZonesSchema = new mongoose.Schema({
  zone_id: { type: Number, required: true, unique: true },
  zone_name: { type: String, required: true },
  zone_rate: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.models.shipping_zones || mongoose.model('shipping_zones', ShippingZonesSchema);
