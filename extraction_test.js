require('dotenv').config();
const { Player } = require('discord-player');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

// Create a new Player instance with the Client instance
const player = new Player(client);

// Function to load default extractors except YouTubeExtractor
async function loadExtractors() {
    await player.extractors.loadDefault((ext) => ext !== 'YouTubeExtractor');
}

// Event listener for when a track starts to play
player.on('trackStart', (queue, track) => {
    queue.metadata.channel.send(`Started playing **${track.title}**!`);
});

// Function to make the bot join a voice channel
async function joinVoiceChannel(channelId) {
    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel || channel.type !== 'GUILD_VOICE') throw new Error("Invalid voice channel.");
        
        const connection = await channel.join();
        console.log(`Joined voice channel: ${channel.name}`);
        return connection;
    } catch (error) {
        console.error("Error occurred while joining voice channel:", error);
    }
}

// Function to play a track in a specified voice channel
async function playTrackInVoiceChannel(channelId, query) {
    const connection = await joinVoiceChannel(channelId);
    if (!connection) return console.error("Failed to join voice channel.");
    
    try {
        const { track } = await player.play(connection, query, {
            metadata: { channel: connection.channel } // Set channel as metadata for future reference
        });

        console.log(`Started playing ${track.title}`);
    } catch (error) {
        console.error("Error occurred during playback:", error);
    }
}

// Function to test playing a track
async function testPlayback() {
    const channelId = "1120919829075992621"; // Replace CHANNEL_ID with your voice channel ID
    await playTrackInVoiceChannel(channelId, "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
}

// Add event listener for when the bot is ready
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    await loadExtractors(); // Load extractors before proceeding
    testPlayback(); // Call test playback function once bot is ready
});

// Login to Discord with your app's token
client.login(process.env.TOKEN); // Use your bot's token from environment variables
