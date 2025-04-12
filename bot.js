const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();
const data = require('./data.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
  console.log(`🤖 Giriş yapıldı: ${client.user.tag}`);

  const commands = [
    new SlashCommandBuilder()
      .setName('rehber')
      .setDescription('Karakter rehberi göster')
      .addStringOption(option =>
        option.setName('karakter')
          .setDescription('Karakter seç')
          .setRequired(true)
          .addChoices(...Object.keys(data).map(k => ({ name: k, value: k }))))
  ];

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    const appId = (await rest.get(Routes.user())).id;
    const guilds = await client.guilds.fetch();
    for (const [id] of guilds) {
      await rest.put(Routes.applicationGuildCommands(appId, id), { body: commands });
      console.log(`✅ Slash komutu yüklendi: ${id}`);
    }
  } catch (err) {
    console.error('❌ Slash komutu hatası:', err);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'rehber') {
    const karakter = interaction.options.getString('karakter');
    const info = data[karakter];
    const embed = new EmbedBuilder()
      .setTitle(`${karakter} Rehberi`)
      .setColor(0x00ff99)
      .addFields(
        { name: "🛡️ Ekipman", value: Object.entries(info.ekipman).map(([k, v]) => `**${k}:** ${v}`).join('\n') },
        { name: "📊 Statü", value: info.statu.join('\n') },
        { name: "🔥 Efsun", value: Object.entries(info.efsun).map(([k, arr]) => `**${k}:**\n${arr.map(e => `- ${e}`).join('\n')}`).join('\n\n') }
      );
    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
