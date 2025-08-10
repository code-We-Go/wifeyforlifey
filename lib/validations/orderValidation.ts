function orderValidation(formData: any){

   type ErrorType = {
    firstName?: string;
    lastName?: string;
    email?: string;
    postalZip?: string;
    city?: string;
    address?: string;
    phone?: string;
    whatsAppNumber?: string;
  };

  // Initialize error object with the type
  const errors: ErrorType = {};

  if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!formData.firstName.trim()) {
    errors.firstName = "First name is required.";
  }
  if (!formData.lastName.trim()) {
    errors.lastName = "Last name is required.";
  }
  if (!formData.address.trim()) {
    errors.address = "Address is required.";
  }
  if (!formData.postalZip || !/^\d+$/.test(formData.postalZip)) {
    errors.postalZip = "Zip code is required.";
  }
  if (!formData.city.trim()) {
    errors.city = "City is required.";
  }

  if (!formData.phone || !/^\+?\d+$/.test(formData.phone.trim())) {
    errors.phone = "Phone number is required.";
  }
  
  if (!formData.whatsAppNumber || !/^\+?\d+$/.test(formData.whatsAppNumber.trim())) {
    errors.whatsAppNumber = "WhatsApp number is required.";
  }
    
    return errors;
    
    
    }
    
    export default orderValidation ;