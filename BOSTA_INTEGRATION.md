# Bosta Shipping Integration

This document explains how to set up and use the Bosta shipping integration in your e-commerce application.

## Overview

The Bosta integration provides:
- Automatic shipment creation when orders are placed
- Real-time order status updates via webhooks
- Shipment tracking through Bosta's delivery network
- Support for Cash on Delivery (COD) orders

## Setup

### 1. Environment Variables

Copy the Bosta-related variables from `.env.example` to your `.env.local` file and fill in your actual values:

```env
# Bosta API Configuration
BOSTA_API=http://app.bosta.co/api/v2
BOSTA_BEARER_TOKEN=your_actual_bearer_token

# Pickup Address (Your warehouse/business location)
BOSTA_PICKUP_CITY=Cairo
BOSTA_PICKUP_ZONE_ID=your_zone_id
BOSTA_PICKUP_DISTRICT_ID=your_district_id
BOSTA_PICKUP_ADDRESS=Your Business Address
BOSTA_PICKUP_ADDRESS_2=Additional address details
BOSTA_PICKUP_BUILDING=123
BOSTA_PICKUP_FLOOR=1
BOSTA_PICKUP_APARTMENT=1

# Return Address (Where returns should be sent)
BOSTA_RETURN_CITY=Cairo
BOSTA_RETURN_ZONE_ID=your_zone_id
BOSTA_RETURN_DISTRICT_ID=your_district_id
BOSTA_RETURN_ADDRESS=Your Return Address
BOSTA_RETURN_ADDRESS_2=Return location details
BOSTA_RETURN_BUILDING=123
BOSTA_RETURN_FLOOR=1
BOSTA_RETURN_APARTMENT=1
```

### 2. Getting Bosta Credentials

1. Sign up for a Bosta account at [https://bosta.co](https://bosta.co)
2. Get your API credentials from the Bosta dashboard
3. Obtain zone IDs and district IDs for your pickup and return addresses

### 3. Webhook Configuration

In your Bosta dashboard, set up a webhook pointing to:
```
https://yourdomain.com/api/webhooks/bosta
```

This webhook will receive real-time updates about shipment status changes.

## How It Works

### Order Flow

1. **Order Creation**: When a customer places an order, the system:
   - Creates the order in your database
   - Automatically creates a Bosta delivery if Bosta is configured
   - Updates the order with a `shipmentID`
   - Sets order status to 'confirmed'

2. **Status Updates**: Bosta sends webhook notifications when:
   - Package is picked up
   - Package is in transit
   - Package is out for delivery
   - Package is delivered
   - Package is cancelled or returned

3. **Order Tracking**: Orders now include a `shipmentID` field for tracking

### API Endpoints

#### Create Delivery
```
POST /api/bosta/create-delivery
```
Manually create a Bosta delivery for an existing order.

#### Webhook Endpoint
```
POST /api/webhooks/bosta
```
Receives status updates from Bosta and updates order status accordingly.

The webhook receives the following payload structure:

```json
{
  "_id": "The order id",
  "trackingNumber": "The order tracking Number",
  "state": "A code representing the current state of the order",
  "type": "SEND | EXCHANGE | CUSTOMER_RETURN_PICKUP | RTO | SIGN_AND_RETURN | FXF_SEND (fulfillment)",
  "cod": "The amount collected from you customer", // only in Delivered state
  "timeStamp": "The timestamp at which the state was changed",
  "isConfirmedDelivery": "Boolean value", // Will be sent as a proof of delivery
  "deliveryPromiseDate": "Date in ('DD-MM-YYYY') format", // e.x 23-02-2023
  "exceptionReason": "Reason (NDR)", // only in Exception state
  "exceptionCode": "A code representing the exception reason", // All codes is listed below
  "businessReference": "The businessReference value that was sent in the creation request",
  "numberOfAttempts": "The number of attempts that Bosta made to deliver the shipment to your customer"
}
```

## Status Mapping

Bosta statuses are mapped to your order statuses as follows:

| Bosta Status | Order Status |
|--------------|-------------|
| PENDING | pending |
| PICKED_UP | confirmed |
| IN_TRANSIT | shipped |
| OUT_FOR_DELIVERY | shipped |
| DELIVERED | delivered |
| CANCELLED | cancelled |
| RETURNED | cancelled |
| EXCEPTION | pending |

## Database Changes

The integration adds a `shipmentID` field to your order model:

```typescript
shipmentID: { type: String, required: false } // Bosta shipment ID
```

## Testing

### 1. Test Order Creation
1. Place a test order
2. Check the console logs for Bosta delivery creation
3. Verify the order has a `shipmentID`

### 2. Test Webhook
1. Use a tool like ngrok to expose your local server
2. Configure the webhook URL in Bosta dashboard
3. Create a test delivery and monitor status updates

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   - Ensure all Bosta environment variables are set
   - Check that `BOSTA_BEARER_TOKEN` is valid

2. **Zone/District ID Issues**
   - Contact Bosta support to get correct zone and district IDs
   - Ensure addresses match Bosta's coverage areas

3. **Webhook Not Working**
   - Verify webhook URL is accessible from the internet
   - Check webhook endpoint logs for errors
   - Ensure webhook URL is correctly configured in Bosta dashboard

4. **Order Creation Fails**
   - Check console logs for Bosta API errors
   - Verify order data includes required fields (address, phone, etc.)
   - Ensure customer address is in Bosta's delivery area

### Debug Mode

The integration includes extensive logging. Check your console for:
- Bosta delivery creation attempts
- API responses from Bosta
- Webhook payload processing
- Error messages and stack traces

## Support

For Bosta-specific issues:
- Contact Bosta support at [support@bosta.co](mailto:support@bosta.co)
- Check Bosta API documentation

For integration issues:
- Check the console logs
- Verify environment variables
- Test API endpoints manually

## Security Notes

- Keep your `BOSTA_BEARER_TOKEN` secure and never commit it to version control
- Use HTTPS for webhook endpoints in production
- Validate webhook payloads to ensure they come from Bosta
- Consider implementing webhook signature verification for additional security