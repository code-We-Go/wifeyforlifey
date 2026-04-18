const { MongoClient, ObjectId } = require('mongodb');
const ExcelJS = require('exceljs');

const MONGODB_URI = 'mongodb+srv://wifeyforlifey:Wifey4Lifey%21@wifeyforlifey.j0pm4vx.mongodb.net/wifeyforlifey?retryWrites=true&w=majority&appName=WifeyForLifey';

async function run() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('wifeyforlifey');
    
    // 1. Fetch matching subscriptions
    const subQuery = {
      packageID: new ObjectId('68bf6ae9c4d5c1af12cdcd37'),
      createdAt: { $gt: new Date('2026-02-07T00:00:00.000Z') }
    };
    
    const subscriptions = await db.collection('subscriptions').find(subQuery).toArray();
    console.log(`Found ${subscriptions.length} subscriptions matching criteria.`);
    
    const subEmails = new Set(subscriptions.map((s) => s.email).filter(Boolean));
    
    // 2. Fetch Users associated with these subscriptions
    const users = await db.collection('users').find({
      email: { $in: Array.from(subEmails) }
    }).toArray();
    console.log(`Found ${users.length} distinct users for these subscriptions.`);
    
    const userIds = users.map(u => u._id);
    const userMap = new Map();
    users.forEach(u => userMap.set(u._id.toString(), u));

    // 3. Find progress collection name (mongoose pluralization check)
    const collections = await db.listCollections().toArray();
    const playlistProgressName = collections.find(c => c.name.toLowerCase().includes('playlistprogress'))?.name || 'playlistprogresses';
    
    // 4. Aggregate playlistsProgress to find users with > 1 playlist and count videos watched
    const progressAgg = await db.collection(playlistProgressName).aggregate([
      { $match: { userID: { $in: userIds } } },
      { $group: { 
          _id: "$userID", 
          playlists: { 
            $push: { 
              playlistID: "$playlistID", 
              videosWatchedCount: { $size: { $ifNull: ["$videosWatched", []] } } 
            } 
          }
      }},
      { $match: { "playlists.1": { $exists: true } } }
    ]).toArray();
    
    console.log(`Found ${progressAgg.length} users that watched > 1 playlist.`);
    
    // Fetch playlists to map names
    const playlists = await db.collection("playlists").find({}).toArray();
    const playlistMap = new Map();
    playlists.forEach(p => playlistMap.set(p._id.toString(), p.title));
    
    // 5. Create Excel Report
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Report');
    
    sheet.columns = [
      { header: 'User ID', key: 'uid', width: 30 },
      { header: 'First Name', key: 'firstName', width: 20 },
      { header: 'Last Name', key: 'lastName', width: 20 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Playlists Watched Total', key: 'pCount', width: 20 },
      { header: 'Videos Watched per Playlist', key: 'playlistDetails', width: 60 },
    ];
    
    // Style the header row
    sheet.getRow(1).font = { bold: true };
    
    for (const p of progressAgg) {
      const uidStr = p._id.toString();
      const u = userMap.get(uidStr);
      if (u) {
        const details = p.playlists.map(pl => {
          const title = playlistMap.get(pl.playlistID?.toString()) || `Unknown Playlist (${pl.playlistID})`;
          return `${title}: ${pl.videosWatchedCount} videos`;
        }).join(' | ');

        sheet.addRow({
          uid: uidStr,
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email || '',
          username: u.username || '',
          pCount: p.playlists.length,
          playlistDetails: details
        });
      }
    }
    
    const filename = 'subscriptions_report.xlsx';
    await workbook.xlsx.writeFile(filename);
    console.log(`Report successfully saved to ${filename}`);
  } catch (error) {
    console.error('Error generating report:', error);
  } finally {
    await client.close();
  }
}

run();
