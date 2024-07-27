const { PrismaClient } = require("@prisma/client");
const getAllChannels = require("../functions/getAllChannels");
const prisma = new PrismaClient();
const redis = require("../client/redis")

async function update_channels() {
  const channels = await getAllChannels();

  // Filter channels with follower count above 100
  const filteredChannels = channels.filter(
    (channel) => channel.followerCount > 100
  );

  let channelData = [];
  const date = new Date();
  for (let i = 0; i < filteredChannels.length; i++) {
    filteredChannels[i].description = filteredChannels[i].description.replace(
      "\\u",
      ""
    );

    // 24 hours else continue
    if (date - new Date(filteredChannels[i].createdAt * 1000) > 86410000) {
      continue;
    }

    channelData.push({
      name: filteredChannels[i].name,
      description: filteredChannels[i].description.split("\n")[0].slice(0, 255),
      imageUrl: filteredChannels[i].imageUrl,
      id: filteredChannels[i].id,
      followerCount: filteredChannels[i].followerCount,
      leadFid: filteredChannels[i].leadFid,
      createdAt: new Date(filteredChannels[i].createdAt * 1000),
    });
  }

  for (let i = 0; i < channelData.length; i++) {
    try {
      await prisma.channels.upsert({
        where: {
          id: channelData[i].id,
        },
        update: {
          name: channelData[i].name,
          description: channelData[i].description,
          imageUrl: channelData[i].imageUrl,
          followerCount: channelData[i].followerCount,
          leadFid: channelData[i].leadFid,
          createdAt: channelData[i].createdAt,
        },
        create: {
          name: channelData[i].name,
          description: channelData[i].description,
          imageUrl: channelData[i].imageUrl,
          id: channelData[i].id,
          followerCount: channelData[i].followerCount,
          leadFid: channelData[i].leadFid,
          createdAt: channelData[i].createdAt,
        },
      });

      redis.del("channels");
    } catch (e) {
      console.log(e);
      console.log(channelData[i]);
    }
  }
}

module.exports = update_channels;
