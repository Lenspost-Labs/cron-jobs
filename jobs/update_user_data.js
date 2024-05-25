const { default: axios } = require("axios");
const fs = require("fs");
const { request, gql } = require("graphql-request");
const prisma = require("../prisma");

const update_user_data = async () => {
  let fids = await axios.get("https://api.warpcast.com/v2/power-badge-users");

  let fids_array = fids.data.result.fids;

  let data_array = [];

  for (let i = 0; i < 4387; i++) {
    try {
      let stats = await fetch_details_for_fid(fids_array[i]);
      data_array.push({
        fid: fids_array[i],
        ...stats,
      });
      console.log(data_array);
    } catch (error) {
      continue;
    }
  }

  await prisma.target_ad_users.createMany({
    data: data_array,
    skipDuplicates: true,
  });

  console.log("Data added to target_ad_users table");
};

async function fetch_details_for_fid(fid) {
  let totalCasts = 0;
  let totalLikes = 0;
  let totalRecasts = 0;
  let totalReplies = 0;
  const fileName = `data/${fid}.json`;

  try {
    let casts = fs.readFileSync(fileName, "utf8");
    casts = JSON.parse(casts);

    totalCasts += casts.length;
    totalLikes += casts.reduce((sum, cast) => sum + cast.numberOfLikes, 0);
    totalReplies += casts.reduce((sum, cast) => sum + cast.numberOfReplies, 0);
    totalRecasts += casts.reduce((sum, cast) => sum + cast.numberOfRecasts, 0);

    return {
      total_casts: totalCasts,
      average_like_per_cast: totalLikes / totalCasts,
      average_recast_per_cast: totalRecasts / totalCasts,
      average_replies_per_cast: totalReplies / totalCasts,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

module.exports = update_user_data;
