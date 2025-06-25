export interface playlist {
  _id?: string;
  title: string;
  description: string;
  thumbnail: string;
  videos: Video[];
  isPublic: boolean;
  category: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Video {
  _id?: string;
  title: string;
  description: string;
  url: string; // Youtube or Vimeo URL
  thumbnail: string;
  duration: string; // Format: "HH:MM:SS"
  isPublic: boolean;
}

export const videoCategories = [
  { id: 'tutorials', name: 'Tutorials' },
  { id: 'lifestyle', name: 'Lifestyle' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'beauty', name: 'Beauty' },
  { id: 'fitness', name: 'Fitness' },
];

// Mock data
// export const mockPlaylists: playlist[] = [
//   {
//     _id: '1',
//     title: 'Self-Care',
//     description: 'Learn how to create beautiful summer makeup looks with these step-by-step tutorials.',
//     // thumbnail: 'https://images.pexels.com/photos/2253832/pexels-photo-2253832.jpeg',
//     thumbnail:"/video/1.png",
//     category: 'beauty',
//     isPublic: true,
//     videos: [
//       {
//         _id: 'v1',
//         title: 'Natural Glowy Makeup',
//         description: 'Achieve that perfect summer glow with minimal products.',
//         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
//         thumbnail: 'https://images.pexels.com/photos/2253832/pexels-photo-2253832.jpeg',
//         duration: '12:34',
//         isPublic: true,
//       },
//       {
//         _id: 'v2',
//         title: 'Beach Day Makeup',
//         description: 'Waterproof makeup that stays put all day at the beach.',
//         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
//         thumbnail: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg',
//         duration: '15:21',
//         isPublic: true,
//       },
//     ],
//   },
//   {
//     _id: '2',
//     title: 'Dinning & Kitchen',
//     description: 'Transform your space with these easy and affordable DIY room decor projects.',
//     thumbnail: '/video/2.png',
//     category: 'lifestyle',
//     isPublic: false,
//     videos: [
//       {
//         _id: 'v3',
//         title: 'Wall Art DIY',
//         description: 'Create stunning wall art with simple materials.',
//         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
//         thumbnail: 'https://images.pexels.com/photos/4846461/pexels-photo-4846461.jpeg',
//         duration: '18:45',
//         isPublic: false,
//       },
//       {
//         _id: 'v4',
//         title: 'Desk Organization',
//         description: 'Organize your desk with these cute DIY projects.',
//         url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
//         thumbnail: 'https://images.pexels.com/photos/5412270/pexels-photo-5412270.jpeg',
//         duration: '14:29',
//         isPublic: true,
//       },
//     ],
//   },
// ];