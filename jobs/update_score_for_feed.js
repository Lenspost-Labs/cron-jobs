const prisma = require("../prisma");
const get_scs_for_casts = require("../functions/get_scs_for_casts");
const redis = require("../client/redis");

const update_score_for_feed = async () => {
  let user_published_posts = await prisma.user_published_canvases.findMany({
    where: {
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 1)),
      },
    },
  });

  let txHashes = user_published_posts.map((post) => post.txHash);

  let data = await get_scs_for_casts(txHashes);

  let promises = data.map((cast) => {
    return prisma.user_published_canvases.update({
      where: {
        txHash: cast.hash,
      },
      data: {
        social_capital_score: cast.socialCapitalScore,
      },
    });
  });

  await Promise.all(promises);

  await redis.del("casts_data");

  console.log(`Updated Social Score at ${new Date()}`);
};

module.exports = update_score_for_feed;
