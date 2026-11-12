export interface Pin {
  id: string;
  publicId: string; // Cloudinary Public ID
  title?: string;
  width?: number;
  height?: number;
}

export interface Section {
  id: string;
  title: string;
  pins: Pin[];
}

export interface Board {
  id: string;
  title: string;
  pinCount: number;
  sectionCount: number;
  coverImages: string[]; // Public IDs for the collage cover
  sections: Section[];
}
