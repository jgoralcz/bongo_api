const { poolQuery } = require('../../index');

/**
 * updates the user's playlist to be public or not.
 * @param userID the user's id.
 * @param name the client's playlist name.
 * @param isPublic sets whether the client's playlist is public or not
 * @returns {Promise<void>}
 */
const updatePlaylistIsPublic = async (userID, name, isPublic) => poolQuery(`
  UPDATE clients_playlists
  SET is_public = $3
  WHERE user_id = $1 AND playlist_name = $2;
`, [userID, isPublic, name]);

/**
 * upserts the user's custom playlist
 * @param userID the user's id.
 * @param isPublic whether it's public or not
 * @param playlist the user's playlist.
 * @param name the playlist's name.
 * @param length the length of the array.
 * @returns {Promise<*>}
 */
const upsertCustomPlaylist = async (userID, isPublic, playlist, name, length) => poolQuery(`
  INSERT INTO clients_playlists(user_id, playlist_name, playlist, is_public, length) 
  VALUES($1, $2, $3, $4, $5)
  
  ON CONFLICT(user_id, playlist_name) DO
    UPDATE
    SET playlist = $3, is_public = $4, length = $5;
`, [userID, name, playlist, isPublic, length]);

/**
 * updates the user's custom playlist.
 * @param userID the user's id.
 * @param playlistID the user's playlist ID.
 * @param playlist the user's playlist array
 * @param length the user's length of array
 * @returns {Promise<Promise<*>|*>}
 */
const updateCustomPlaylist = async (userID, playlistID, playlist, length) => poolQuery(`
  UPDATE clients_playlists
  SET playlist = $3, length = $4
  WHERE user_id = $1 AND id = $2;
`, [userID, playlistID, playlist, length]);

/**
 * tests if the  the user's custom playlist exists.
 * @param userID the user's id.
 * @param name the playlist's name.
 * @returns {Promise<*>}
 */
const testCustomPlaylistExists = async (userID, name) => poolQuery(`
  SELECT id, length
  FROM clients_playlists
  WHERE user_id = $1 
    AND playlist_name LIKE $2 || '%'
  ORDER BY playlist_name = $2 DESC;
`, [userID, name]);

/**
 * tests if the  the user's custom playlist exists and is public
 * @param userID the user's id.
 * @param name the playlist's name.
 * @returns {Promise<*>}
 */
const testCustomPlaylistExistsPublic = async (userID, name) => poolQuery(`
  SELECT id, length
  FROM clients_playlists
  WHERE user_id = $1 
    AND playlist_name LIKE $2 || '%' 
    AND is_public = TRUE
  ORDER BY playlist_name = $2 DESC;
`, [userID, name]);

/**
 * deletes the user's custom playlist
 * @param userID the user's id.
 * @param name the playlist's name.
 * @returns {Promise<*>}
 */
const deleteCustomPlaylist = async (userID, name) => poolQuery(`
  DELETE
  FROM clients_playlists
  WHERE user_id = $1 
    AND playlist_name LIKE $2 || '%'
  ORDER BY playlist_name = $2 DESC;
`, [userID, name]);

/**
 * gets the custom playlist offset and limit
 * @param userID the user's id.
 * @param name the playlist name
 * @param start the start position (offset) of the playlist
 * @param end the end (limit) of the playlist.
 * @returns {Promise<void>}
 */
const getCustomPlaylistOffsetLimit = async (userID, name, start, end) => {
  // eslint-disable-next-line no-param-reassign
  if (!end) end = 1;
  return poolQuery(`
    SELECT array_agg(playlist) AS playlist, id, is_public, playlist_name
    FROM (
      SELECT id, user_id, playlist_name, is_public,
        UNNEST(CASE WHEN length >= 1 THEN playlist ELSE '{null}' END) playlist
      FROM clients_playlists
      WHERE user_id = $1 AND playlist_name LIKE $2 || '%'
      LIMIT $4 OFFSET $3
    ) sub
    GROUP BY id, is_public, playlist_name
    ORDER BY playlist_name = $2 DESC;
  `, [userID, name, start, end]);
};

/**
 * gets the custom playlist offset and limit
 * @param userID the user's id.
 * @param name the playlist name
 * @param start the start position (offset) of the playlist
 * @returns {Promise<void>}
 */
const getCustomPlaylistOffset = async (userID, name, start) => poolQuery(`
  SELECT array_agg(playlist) AS playlist, id, is_public, playlist_name
  FROM (
    SELECT id, user_id, playlist_name, is_public,
      UNNEST(CASE WHEN length >= 1 THEN playlist ELSE '{null}' END) playlist
    FROM clients_playlists
    WHERE user_id = $1 AND playlist_name LIKE $2 || '%'
    OFFSET $3
  ) sub
  GROUP BY id, is_public, playlist_name
  ORDER BY playlist_name = $2 DESC;
`, [userID, name, start]);


/**
 * views the custom playlists
 * @param userID the user's id.
 * @param offset the offset to query (for pagination).
 * @param limit the limit to query (for pagination).
 * @returns {Promise<void>}
 */
const seeUsersPlaylists = async (userID, offset, limit) => poolQuery(`
  SELECT playlist_name, is_public, length
  FROM clients_playlists
  WHERE user_id = $1
  LIMIT $3 OFFSET $2;
`, [userID, offset, limit]);

/**
 * views the custom playlists
 * @param userID the user's id.
 * @returns {Promise<void>}
 */
const seeUserPlaylistsCount = async userID => poolQuery(`
  SELECT count(*)
  FROM clients_playlists
  WHERE user_id = $1;
`, [userID]);

/**
 * gets the count of the custom playlist
 * @param userID the user's id.
 * @param name the name of the playlist.
 * @returns {Promise<void>}
 */
const seeUserPlaylistCount = async (userID, name) => poolQuery(`
  SELECT playlist_name, is_public, length
  FROM clients_playlists
  WHERE user_id = $1 
    AND playlist_name LIKE $2 || '%'
  ORDER BY playlist_name = $2 DESC;
`, [userID, name]);


module.exports = {
  upsertCustomPlaylist,
  testCustomPlaylistExists,
  testCustomPlaylistExistsPublic,
  deleteCustomPlaylist,
  getCustomPlaylistOffsetLimit,
  getCustomPlaylistOffset,
  seeUsersPlaylists,
  seeUserPlaylistsCount,
  seeUserPlaylistCount,
  updatePlaylistIsPublic,
  updateCustomPlaylist,
};
