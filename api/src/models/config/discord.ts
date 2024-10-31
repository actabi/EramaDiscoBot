// api/src/config/discord.ts
export const DISCORD_CONFIG = {
    clientId: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    redirectUri: `${process.env.APP_URL}/api/auth/discord/callback`,
    scope: ['identify', 'email'],
  };
  
  // api/src/routes/auth.ts
  import express from 'express';
  import { AuthController } from '../controllers/auth';
  
  const router = express.Router();
  const authController = new AuthController();
  
  router.get('/discord', authController.startDiscordAuth);
  router.get('/discord/callback', authController.handleDiscordCallback);
  router.get('/me', authController.getCurrentUser);
  router.post('/logout', authController.logout);
  
  export default router;
  
  // api/src/controllers/auth.ts
  import { Request, Response } from 'express';
  import { DISCORD_CONFIG } from '../config/discord';
  
  export class AuthController {
    // Démarre le processus d'authentification Discord
    startDiscordAuth(req: Request, res: Response) {
      const params = new URLSearchParams({
        client_id: DISCORD_CONFIG.clientId,
        redirect_uri: DISCORD_CONFIG.redirectUri,
        response_type: 'code',
        scope: DISCORD_CONFIG.scope.join(' ')
      });
  
      res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
    }
  
    // Gère le callback de Discord
    async handleDiscordCallback(req: Request, res: Response) {
      try {
        const { code } = req.query;
        if (!code) throw new Error('No code provided');
  
        // Échange le code contre un token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: DISCORD_CONFIG.clientId,
            client_secret: DISCORD_CONFIG.clientSecret,
            grant_type: 'authorization_code',
            code: code.toString(),
            redirect_uri: DISCORD_CONFIG.redirectUri,
          })
        });
  
        const tokenData = await tokenResponse.json();
  
        // Récupère les informations de l'utilisateur
        const userResponse = await fetch('https://discord.com/api/users/@me', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` }
        });
  
        const userData = await userResponse.json();
  
        // Crée ou met à jour l'utilisateur dans la base de données
        const user = await prisma.user.upsert({
          where: { discordId: userData.id },
          update: {
            username: userData.username,
            email: userData.email,
            avatar: userData.avatar,
            lastLogin: new Date(),
          },
          create: {
            discordId: userData.id,
            username: userData.username,
            email: userData.email,
            avatar: userData.avatar,
          },
        });
  
        // Crée un JWT
        const token = jwt.sign(
          { userId: user.id },
          process.env.JWT_SECRET!,
          { expiresIn: '24h' }
        );
  
        // Redirige vers le frontend avec le token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
      } catch (error) {
        console.error('Auth error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
      }
    }
  
    // Récupère l'utilisateur courant
    async getCurrentUser(req: Request, res: Response) {
      try {
        if (!req.user) {
          return res.status(401).json({ error: 'Not authenticated' });
        }
        res.json({ user: req.user });
      } catch (error) {
        res.status(500).json({ error: 'Server error' });
      }
    }
  
    // Déconnexion
    logout(req: Request, res: Response) {
      res.clearCookie('token');
      res.json({ message: 'Logged out successfully' });
    }
  }