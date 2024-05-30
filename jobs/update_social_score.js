const { default: axios } = require("axios");
const fs = require("fs");
const { request, gql } = require("graphql-request");
const prisma = require("../prisma");

const update_social_score = async () => {
  let target_ad = await prisma.target_ad_users.findMany({
    select: {
      fid: true,
    },
  });

  let fids_array = target_ad.map((user) => user.fid);
  let fids_array_length = fids_array.length;

  console.log(fids_array_length);

  let data = fs.readFileSync("social_data.json");

  let data_array = JSON.parse(data);

  let data_array_length = data_array.length;

  console.log(data_array_length);

  let promises = [];

  for (let i = 0; i < fids_array_length; i++) {
    let scs = data_array.find((user) => parseInt(user.fid) === fids_array[i]);
    if (scs) {
      promises.push(
        prisma.target_ad_users.update({
          where: {
            fid: fids_array[i],
          },
          data: {
            social_capital_score: scs.socialCapitalScore,
          },
        })
      );
    } else {
      console.log(`No social capital score found for fid: ${fids_array[i]}`);
    }
  }

  await Promise.all(promises);

  // for (let i = 0; i < fids_array_length; i += batchSize) {
  //   const batchFids = fids_array.slice(i, i + batchSize);
  //   try {
  //     const stats = await fetch_details_for_fids(batchFids);
  //     data_array.push(...stats);
  //   } catch (error) {
  //     console.error(`Error fetching details for fids ${batchFids}:`, error);
  //     continue;
  //   }
  // }

  // fs.writeFileSync("social_data.json", JSON.stringify(data_array, null, 2));

  console.log("Data added to target_ad_users table");
};

const AIRSTACK_API_KEY = process.env.AIRSTACK_API_KEY;
const AIRSTACK_API_URL = "https://api.airstack.xyz/gql";

const farcasterCastsQuery = gql`
  query MyQuery($fids: [Identity!]) {
    Socials(
      input: {
        filter: { dappName: { _eq: farcaster }, identity: { _in: $fids } }
        blockchain: ethereum
        limit: 200
      }
    ) {
      Social {
        socialCapital {
          socialCapitalScore
        }
        userId
      }
    }
  }
`;

async function fetch_details_for_fids(fids) {
  try {
    fids = fids.map((fid) => `fc_fid:${fid}`);
    const variables = { fids };

    const response = await request(
      AIRSTACK_API_URL,
      farcasterCastsQuery,
      variables,
      {
        Authorization: AIRSTACK_API_KEY,
      }
    );

    const socialData = response.Socials.Social.map((social) => ({
      fid: social.userId,
      socialCapitalScore: social.socialCapital.socialCapitalScore,
    }));

    return socialData;
  } catch (error) {
    console.error(`Error fetching details for fids ${fids}:`, error);
    return [];
  }
}

module.exports = update_social_score;
