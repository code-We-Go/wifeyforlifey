type ShippingZone = {
    _id: string;
    zone_name: string
    zone_rate: number;
  };

  type Country = {
    id: number; // or string, depending on your data
    name: string;
    shipping_zone:number; // other properties, if any
  };

  type Category = {
    _id: string;
    categoryName: string;
    description?: string;
  }
  

// type category={id:string,
//     categoryName:string,
//     imageURL:string
// }

// type subCategory={
//     id:string, 
//     subCategoryName:string,
//     categoryId:string,
//     imageURL:string
// }
