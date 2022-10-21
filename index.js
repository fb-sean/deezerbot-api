import fastify from "fastify";
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
dotenv.config()

const apiClient = fastify({
    logger: true,
    trustProxy: true,
});

apiClient.get('/login', (request, reply) => {
    return reply.redirect(`https://connect.deezer.com/oauth/auth.php?app_id=${process.env.APPID}&redirect_uri=${process.env.REDIRECT}&perms=basic_access,email,offline_access,manage_library, delete_library, listening_history`);
})

apiClient.get('/callback', async (request, reply) => {
    if (!request?.query?.code) return {
        Error: 'Didn\'t got the code for the authentication.',
    };

    let deezerResponse = await fetch(`https://connect.deezer.com/oauth/access_token.php?app_id=${process.env.APPID}&secret=${process.env.SECRET}&code=${request?.query?.code}`).catch(err => {
        return {
            Error: err,
        };
    });

    if(!deezerResponse) return {
        Error: 'Didn\'t got the access token from deezer.',
    };

    deezerResponse = await deezerResponse?.text();

    if(!deezerResponse) return {
        Error: 'Can\'t parse your access token from deezer.',
    };

    deezerResponse = await fetch(`https://api.deezer.com/user/me?${deezerResponse}`).catch(err => {
        return {
            Error: err,
        };
    });

    if(!deezerResponse) return {
        Error: 'User data from deezer.',
    };

    deezerResponse = await deezerResponse?.json();

    if(!deezerResponse) return {
        Error: 'Can\'t parse your user data from deezer.',
    };

    return {
        message: `Hi ${deezerResponse?.name ?? 'Unkown User'}`,
        fullData: deezerResponse,
    };
})

apiClient.listen({ port: 3000 }, (err, address) => {
    if (err) throw err;
})