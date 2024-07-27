const { request, gql } = require("graphql-request");
const AIRSTACK_API_KEY = process.env.AIRSTACK_API_KEY;
const AIRSTACK_API_URL = "https://api.airstack.xyz/gql";

const farcasterCastsQuery = gql`
  query MyQuery($hash: [String!]) {
    FarcasterCasts(
      input: { filter: { hash: { _in: $hash } }, blockchain: ALL, limit: 200 }
    ) {
      Cast {
        socialCapitalValue {
          rawValue
          formattedValue
          hash 
        }
      }
    }
  }
`;

async function get_scs_for_casts(hashes) {
  try {
    let final_casts = [];
    const batchSize = 200;

    for (let i = 0; i < hashes.length; i += batchSize) {
      const batch = hashes.slice(i, i + batchSize);
      const variables = { hash: batch };
      
      const response = await request(
        AIRSTACK_API_URL,
        farcasterCastsQuery,
        variables,
        {
          Authorization: AIRSTACK_API_KEY,
        }
      );

      const casts = response.FarcasterCasts.Cast;
      
      for (let cast of casts) {
        if (cast.socialCapitalValue) {
          final_casts.push({
            hash: cast.socialCapitalValue.hash,
            socialCapitalScore: cast.socialCapitalValue.formattedValue,
          });
        }
      }
    }

    return final_casts;
  } catch (error) {
    console.error(`Error fetching details for casts:`, error);
    return [];
  }
}

module.exports = get_scs_for_casts;