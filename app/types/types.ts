type ShippingZone = {
  _id: string;
  zone_name: string;
  zone_rate: number;
  localGlobal: string; // 'local' or 'global'
};

type Country = {
  _id: string; // or string, depending on your data
  id:number;
  name: string;
  shipping_zone: ShippingZone; // other properties, if any
};

type Category = {
  _id: string;
  categoryName: string;
  description?: string;
};

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
