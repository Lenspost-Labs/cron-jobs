const { default: axios } = require("axios");
const fs = require("fs");
const { request, gql } = require("graphql-request");
const prisma = require("../prisma");

const update_user_data = async () => {
  let fids = await axios.get("https://api.warpcast.com/v2/power-badge-users");

  let fids_array = fids.data.result.fids;
  let fids_array_length = fids_array.length;

  let data_array = [];

  for (let i = 0; i < fids_array_length; i++) {
    try {
      let stats = await fetch_details_for_fid(fids_array[i]);
      data_array.push({
        fid: fids_array[i],
        ...stats,
      });
      console.log(data_array)
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

const AIRSTACK_API_KEY = process.env.AIRSTACK_API_KEY;
const AIRSTACK_API_URL = "https://api.airstack.xyz/gql";

const farcasterCastsQuery = gql`
  query MyQuery($cursor: String, $eq: Identity) {
    FarcasterCasts(
      input: {
        filter: { castedBy: { _eq: $eq } }
        blockchain: ALL
        cursor: $cursor
      }
    ) {
      Cast {
        castedAtTimestamp
        embeds
        url
        text
        numberOfRecasts
        numberOfLikes
        numberOfReplies
        channel {
          channelId
        }
        mentions {
          fid
          position
        }
      }
      pageInfo {
        nextCursor
        hasNextPage
        hasPrevPage
        prevCursor
      }
    }
  }
`;

async function fetch_details_for_fid(fid) {
  let cursor = null;
  let totalCasts = 0;
  let totalLikes = 0;
  let totalRecasts = 0;
  let totalReplies = 0;
  let allCasts = [];
  const fileName = `data/${fid}.json`;

  try {
    do {
      const variables = { cursor, eq: `fc_fid:${fid}` };
      const response = await request(
        AIRSTACK_API_URL,
        farcasterCastsQuery,
        variables,
        {
          Authorization: AIRSTACK_API_KEY,
        }
      );

      const casts = response.FarcasterCasts.Cast;
      const pageInfo = response.FarcasterCasts.pageInfo;

      totalCasts += casts.length;
      totalLikes += casts.reduce((sum, cast) => sum + cast.numberOfLikes, 0);
      totalReplies += casts.reduce(
        (sum, cast) => sum + cast.numberOfReplies,
        0
      );
      totalRecasts += casts.reduce(
        (sum, cast) => sum + cast.numberOfRecasts,
        0
      );
      allCasts.push(...casts);
      cursor = pageInfo.hasNextPage ? pageInfo.nextCursor : null;

      console.log("Total casts:", totalCasts);
    } while (cursor);

    fs.writeFileSync(fileName, JSON.stringify(allCasts, null, 2));

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
