/**
 * Copyright 2021 Yannick Seeger
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as functions from "firebase-functions";
import fetch from "node-fetch";

// eslint-disable-next-line max-len
export const spotifyAuth = functions.https.onRequest(async (request, response) => {
  const code = request.query.code;
  if (!code) {
    response.sendStatus(400);
    return;
  }
  const clientId = functions.config().spotify_auth.client_id;
  const clientSecret = functions.config().spotify_auth.client_secret;
  const redirectUri = functions.config().spotify_auth.redirect_uri;
  const redirectTo = functions.config().spotify_auth.redirect_to;

  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code as string);
  params.append("redirect_uri", redirectUri);
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);

  try {
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    const spotifyRes = await res.json();
    const redParams = new URLSearchParams();
    redParams.append("access_token", spotifyRes.access_token);
    redParams.append("refresh_token", spotifyRes.refresh_token);
    response.redirect(`${redirectTo}?${redParams.toString()}`);
    functions.logger.info("Successful Login");
  } catch (err) {
    functions.logger.error(err);
    response.sendStatus(400);
  }
});
