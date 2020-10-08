const {
  getRandomCustomWaifuOwnerClaimed,
  getRandomCustomWaifuOwnerNotClaimed,
} = require('../db/tables/cg_custom_waifu/cg_custom_waifu');

const { getCountForServer } = require('../db/tables/guild_data/guild_data');

const {
  getRandomWaifuOwnerNotClaimed,
  getRandomWaifuOwnerClaimed,
  getRandomWaifuOwnerWishlistNotClaimed,
} = require('../db/tables/cg_claim_waifu/cg_claim_waifu');


const getServerCharacterAll = async (guildID) => {
  const query = await getCountForServer(guildID);

  if (!query || query.length <= 0 || !query[0]) {
    return {
      characterCount: 30000,
      characterClaimed: 0,
      customCount: 0,
      customCharacterClaimed: 0,
    };
  }

  const [data] = query;

  const {
    character_count: characterCount,
    claimed_characters: characterClaimed,
    custom_characters_count: customCount,
    claimed_custom_characters: customCharacterClaimed,
  } = data;

  return {
    characterCount: characterCount || 30000,
    characterClaimed: characterClaimed || 0,
    customCount: customCount || 0,
    customCharacterClaimed: customCharacterClaimed || 0,
  };
};

const rollCharacter = async (
  userID,
  guildID,
  nsfw = false,
  userRollClaimed,
  rollWestern,
  rollAnime = true,
  rollGame,
  rarityPercentage = 100,
  limitMultiplier = 1,
  rollCustomWaifuOnly,
  unlimitedClaims,
  croppedImage,
  isHusbando,
) => {
  const {
    characterClaimed,
    characterCount,
    customCount,
    customCharacterClaimed,
  } = await getServerCharacterAll(guildID);

  const total = customCount + characterCount;
  const randomDecision = Math.floor(Math.random() * total);
  const randomWeight = Math.random();
  const randomRarity = Math.random();

  // custom only
  if (rollCustomWaifuOnly && customCount > 0) {
    if (!userRollClaimed && (randomRarity <= ((customCharacterClaimed / customCount / 100) * rarityPercentage))) {
      const claimedCustomQuery = await getRandomCustomWaifuOwnerClaimed(guildID, nsfw);
      if (claimedCustomQuery && claimedCustomQuery[0]) {
        return { customWaifu: true, waifu: claimedCustomQuery[0] };
      }
    }

    const notClaimedCustomQuery = await getRandomCustomWaifuOwnerNotClaimed(guildID, nsfw);
    if (notClaimedCustomQuery && notClaimedCustomQuery[0]) {
      return { customWaifu: true, waifu: notClaimedCustomQuery[0] };
    }

    if (unlimitedClaims) {
      const randomClaimed = await getRandomCustomWaifuOwnerClaimed(guildID, nsfw);
      if (randomClaimed && randomClaimed[0]) {
        return { customWaifu: true, waifu: randomClaimed[0] };
      }
    }
    // return custom character error
    return { error: 'I could not find any custom characters. Please try disabling the custom character only option in the `serversettings` command or add more custom characters.' };
  }

  // normal
  if (!userRollClaimed && (randomRarity <= ((characterClaimed / total / 100) * rarityPercentage))) {
    if ((randomDecision > characterCount || randomWeight <= 0.005) && customCount > 0) {
      const claimedCustomQuery = await getRandomCustomWaifuOwnerClaimed(guildID, nsfw);
      if (claimedCustomQuery && claimedCustomQuery[0]) {
        return { customWaifu: true, waifu: claimedCustomQuery[0] };
      }
    }

    const randomOwnerClaimed = await getRandomWaifuOwnerClaimed(userID, guildID, nsfw, rollWestern, rollGame, croppedImage, limitMultiplier, rollAnime, isHusbando);
    if (randomOwnerClaimed && randomOwnerClaimed[0]) return randomOwnerClaimed;
  }

  if ((randomDecision > characterCount || randomWeight <= 0.005) && customCount > 0) {
    const randomWaifuQuery = await getRandomCustomWaifuOwnerNotClaimed(guildID, nsfw);
    if (randomWaifuQuery && randomWaifuQuery[0]) {
      return { customWaifu: true, waifu: randomWaifuQuery[0] };
    }
  }

  const limitMultiplierRandom = (Math.random() * 200) - 1;
  if (limitMultiplierRandom <= limitMultiplier) {
    const randomOwnerWishlistNotClaimed = await getRandomWaifuOwnerWishlistNotClaimed(userID, guildID, nsfw, rollWestern, rollGame, croppedImage, limitMultiplier, rollAnime, isHusbando);
    if (randomOwnerWishlistNotClaimed && randomOwnerWishlistNotClaimed[0]) return randomOwnerWishlistNotClaimed;
  }

  const randomOwnerNotClaimed = await getRandomWaifuOwnerNotClaimed(userID, guildID, nsfw, rollWestern, rollGame, croppedImage, limitMultiplier, rollAnime, isHusbando);
  return randomOwnerNotClaimed;
};

module.exports = {
  rollCharacter,
};
