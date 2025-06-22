function emailValidation(state: {
    name: string;
    email: string;
    subject: string;
    message: string;
}){

   type ErrorType = {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  // Initialize error object with the type
  const errors: ErrorType = {};
    if(!state.name){
        errors.name='Name is required'
    }
    
    if(!state.email){
        errors.email='email is required'
    }
    if(!state.subject){
        errors.subject='subject is required'
    }
    if(!state.message){
        errors.message='Please write your message'
    }
    // else if(value.whatsappNumber.length !== 11){
    // error.whatsappNumber='Your number is incorrect'
    // }
    
    return errors;
    
    
    }
    
    export default emailValidation ;