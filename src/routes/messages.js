const route = require('express-promise-router')();

const { getMessageIDCharacter, insertMessageIDCharacter, deleteStaleMessageCharacter } = require('../db/tables/message_character/message_character');
const { invalidBoolSetting } = require('../util/functions/validators');

const { getMessageIDPendingImage, insertPendingImage, deleteMessageIDPendingImage } = require('../db/tables/pending_images/pending_images');

route.post('/characters', async (req, res) => {
  const {
    messageID,
    characterID,
    isCustomWaifu,
    userID,
    unlockableEmbedColor,
  } = req.body;

  const embedColor = invalidBoolSetting(unlockableEmbedColor) == null ? false : unlockableEmbedColor;

  if (!messageID || !characterID || !userID || invalidBoolSetting(isCustomWaifu) == null) {
    return res.status(400).send({ error: `Expected messageID, characterID, userID, isCustomWaifu as boolean, unlockableEmbedColor as boolean. Recieved: ${JSON.stringify(req.body)}` });
  }

  await insertMessageIDCharacter(messageID, characterID, isCustomWaifu, userID, embedColor);
  return res.status(204).send();
});

route.delete('/characters/one-day', async (_, res) => {
  await deleteStaleMessageCharacter();

  return res.status(204).send();
});

route.get('/:messageID/characters', async (req, res) => {
  const { messageID } = req.params;

  const query = await getMessageIDCharacter(messageID);
  if (!query || !query[0] || query.length <= 0) return res.status(404).send({ error: `Could not find a character message match with messageID: ${messageID}` });

  return res.status(200).send(query[0]);
});

route.get('/:messageID/images/pending', async (req, res) => {
  const { messageID } = req.params;

  const query = await getMessageIDPendingImage(messageID);
  if (!query || !query[0] || query.length <= 0) return res.status(404).send({ error: `Could not find a pending image with messageID: ${messageID}` });

  return res.status(200).send(query[0]);
});

route.post('/images/pending', async (req, res) => {
  const {
    messageID,
    characterID,
    uploaderID,
    body,
    imageURL,
    nsfw,
  } = req.body;

  if (!characterID || !body || !imageURL || invalidBoolSetting(nsfw) == null) return res.status(400).send({ error: `Expected characterID, body, imageURL, nsfw as boolean. Recieved: ${JSON.stringify(req.body)}` });

  await insertPendingImage(messageID, characterID, uploaderID, body, imageURL, nsfw);

  return res.status(201).send();
});

route.delete('/:messageID/images/pending', async (req, res) => {
  const { messageID } = req.params;

  await deleteMessageIDPendingImage(messageID);

  return res.status(204).send();
});

module.exports = route;
