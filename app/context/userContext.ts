import { createContext } from "react";
import { CartItem, User } from "../interfaces/interfaces";

// export const cartContext=createContext<CartItem[]>([]);

interface UserContextType {
    user: User;
    setUser: React.Dispatch<React.SetStateAction<User>>;
  }
  
 export  const userContext = createContext<UserContextType>({
    // user: {email:"",userId:""},
    user: {email:"",userId:"",userCountry:"",firstName:"",lastName:"",phoneNumber:"",address:"",title:"",dob:"",deviceType:""},
    setUser: () => {},
  });