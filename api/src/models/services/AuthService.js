const User = require('../models/User');
const { OAuth2Client } = require('discord-oauth2');

class AuthService {
  constructor() {
    this.oauth = new OAuth2Client({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      redirectUri: process.env.DISCORD_REDIRECT_URI,
    });
  }

  async authenticateUser(code) {
    try {
      // Échanger le code contre un token
      const tokenData = await this.oauth.tokenRequest({
        code,
        grantType: 'authorization_code',
        scope: ['identify', 'email'],
      });

      // Récupérer les informations de l'utilisateur
      const userData = await this.oauth.getUser(tokenData.access_token);

      // Créer ou mettre à jour l'utilisateur
      const [user, created] = await User.findOrCreate({
        where: { discordId: userData.id },
        defaults: {
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar,
        },
      });

      if (!created) {
        // Mettre à jour les informations si l'utilisateur existe déjà
        await user.update({
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar,
          lastLogin: new Date(),
        });
      }

      return {
        user,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
      };
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error('Authentication failed');
    }
  }
}

module.exports = new AuthService();